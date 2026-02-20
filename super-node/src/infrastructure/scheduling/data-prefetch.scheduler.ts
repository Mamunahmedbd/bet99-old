/**
 * Infrastructure — Demand-Driven Data Prefetch Scheduler
 *
 * Uses an EventEmitter-based worker queue to fetch odds for
 * hot matches with controlled concurrency — never overwhelming
 * the upstream provider.
 *
 * Architecture:
 *
 *   ┌──────────────┐   emit("fetch")    ┌──────────────────────┐
 *   │  1s Timer     │ ────────────────▶  │  OddsFetchWorker     │
 *   │  (scheduler)  │                    │                      │
 *   └──────────────┘                    │  Concurrency: 5      │
 *                                        │  Queue: [...matchIds] │
 *                                        │                      │
 *                                        │  Worker 1 → match A  │
 *                                        │  Worker 2 → match B  │
 *                                        │  Worker 3 → match C  │
 *                                        │  Worker 4 → (idle)   │
 *                                        │  Worker 5 → (idle)   │
 *                                        │                      │
 *                                        │  Match D queued...   │
 *                                        │  Worker 1 finishes   │
 *                                        │  Worker 1 → match D  │
 *                                        └──────────────────────┘
 *
 * Hot match tracking:
 *   Redis SET "hot:match:{id}" TTL=30s
 *   Renewed on every user hit after successful retrieval.
 *   Redis auto-expires → match drops out of polling.
 */
import { EventEmitter } from "events";
import type { DataProvider } from "@application/ports/data-provider";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";
import type { SportType } from "@shared/constants";
import { CACHE_TTL, POLL_INTERVAL } from "@shared/constants";

// ─────────────────────────────────────────────────────────────────
// ── Constants ──
// ─────────────────────────────────────────────────────────────────

/** How long a match stays "hot" after the last user access (seconds) */
const HOT_MATCH_TTL = 30;

/** Redis key prefix for hot match tracking */
const HOT_KEY_PREFIX = "hot:match:";

/**
 * Max concurrent odds fetches at once.
 * Prevents overwhelming the upstream provider.
 *
 * With 5 workers and 1s interval:
 *   - Up to 5 matches fetched per second without queuing
 *   - 6-10 matches: 5 start immediately, rest queue for ~200ms
 *   - 50 matches: processes in 10 batches of 5 = ~2 seconds
 */
const MAX_CONCURRENCY = 5;

const PREFETCH_SPORTS: SportType[] = ["cricket", "soccer", "tennis"];

// ─────────────────────────────────────────────────────────────────
// ── Cache Key Builders ──
// ─────────────────────────────────────────────────────────────────

export const PREFETCH_KEYS = {
  matchList: (sport: SportType) => `prefetch:matches:${sport}`,
  matchOdds: (gmid: string) => `prefetch:odds:${gmid}`,
  hotMatch: (matchId: string) => `${HOT_KEY_PREFIX}${matchId}`,
  hotMatchPattern: () => `${HOT_KEY_PREFIX}*`,
  liveMatches: (sport: SportType) => `live_matches:${sport}`,
} as const;

// ─────────────────────────────────────────────────────────────────
// ── Worker Queue Events ──
// ─────────────────────────────────────────────────────────────────

const EVENTS = {
  /** Emitted when new match IDs are ready to be fetched */
  FETCH_ODDS: "fetch:odds",
  /** Emitted when a single match fetch completes (success or fail) */
  FETCH_COMPLETE: "fetch:complete",
  /** Emitted when an entire polling tick finishes */
  TICK_COMPLETE: "tick:complete",
} as const;

// ─────────────────────────────────────────────────────────────────
// ── Odds Fetch Worker ──
// ─────────────────────────────────────────────────────────────────

/**
 * Concurrency-controlled worker that processes a queue of match IDs.
 * At most MAX_CONCURRENCY fetches run in parallel at any time.
 *
 * Uses EventEmitter so the scheduler is decoupled from the
 * fetching logic — easy to extend, monitor, or swap strategies.
 */
class OddsFetchWorker extends EventEmitter {
  private readonly cache: CacheService;
  private readonly providers: Map<string, DataProvider>;
  private activeCount = 0;
  private queue: string[] = [];
  private processing = false;

  constructor(
    providers: Map<string, DataProvider>,
    cache: CacheService,
    _logger: Logger,
  ) {
    super();
    this.providers = providers;
    this.cache = cache;

    // Listen for new fetch requests
    this.on(EVENTS.FETCH_ODDS, (matchIds: string[]) => {
      this.enqueue(matchIds);
    });
  }

  /**
   * Add match IDs to the queue and start draining.
   */
  private enqueue(matchIds: string[]): void {
    this.queue.push(...matchIds);
    this.drain();
  }

  /**
   * Process the queue respecting MAX_CONCURRENCY.
   * Each completed fetch triggers the next one in queue.
   */
  private drain(): void {
    if (this.processing && this.queue.length === 0 && this.activeCount === 0) {
      // All done — signal tick complete
      this.processing = false;
      this.emit(EVENTS.TICK_COMPLETE);
      return;
    }

    this.processing = true;

    // Start workers up to the concurrency limit
    while (this.queue.length > 0 && this.activeCount < MAX_CONCURRENCY) {
      const matchId = this.queue.shift()!;
      this.activeCount++;

      this.fetchOdds(matchId)
        .then((success) => {
          this.emit(EVENTS.FETCH_COMPLETE, { matchId, success });
        })
        .catch(() => {
          this.emit(EVENTS.FETCH_COMPLETE, { matchId, success: false });
        })
        .finally(() => {
          this.activeCount--;
          this.drain(); // Pull next from queue
        });
    }

    // If queue is empty and nothing is active, we're done
    if (this.queue.length === 0 && this.activeCount === 0) {
      this.processing = false;
      this.emit(EVENTS.TICK_COMPLETE);
    }
  }

  /**
   * Fetch odds for a single match from the first provider that returns data.
   */
  private async fetchOdds(matchId: string): Promise<boolean> {
    for (const [, provider] of this.providers) {
      try {
        const markets = await provider.fetchMarkets(matchId);
        if (markets.length > 0) {
          await this.cache.set(
            PREFETCH_KEYS.matchOdds(matchId),
            markets,
            CACHE_TTL.LIVE_ODDS * 3,
          );
          return true;
        }
      } catch {
        // Try next provider
      }
    }
    return false;
  }

  /**
   * Current worker stats for monitoring.
   */
  getStats(): { active: number; queued: number; processing: boolean } {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      processing: this.processing,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// ── Scheduler ──
// ─────────────────────────────────────────────────────────────────

export class DataPrefetchScheduler {
  private readonly logger: Logger;
  private readonly cache: CacheService;
  private readonly providers: Map<string, DataProvider>;
  private readonly worker: OddsFetchWorker;
  private started = false;

  private oddsTimer?: ReturnType<typeof setInterval>;
  private oddsPollingActive = false;

  constructor(
    providers: Map<string, DataProvider>,
    cache: CacheService,
    logger: Logger,
  ) {
    this.providers = providers;
    this.cache = cache;
    this.logger = logger.child({ service: "PrefetchScheduler" });

    // ── Create the worker ──
    this.worker = new OddsFetchWorker(providers, cache, logger);

    // ── Listen for worker events ──
    this.worker.on(EVENTS.FETCH_COMPLETE, ({ matchId, success }) => {
      this.logger.debug("Odds fetch complete", { matchId, success });
    });

    this.worker.on(EVENTS.TICK_COMPLETE, () => {
      const stats = this.worker.getStats();
      this.logger.debug("Polling tick complete", stats);
      this.oddsPollingActive = false;
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── Hot Match Tracking ──
  // ───────────────────────────────────────────────────────────────

  /**
   * Mark a match as "hot" after successful data retrieval.
   * Sets Redis key with 30s TTL. Subsequent calls renew the TTL.
   *
   * Call ONLY after you've confirmed the match ID is valid
   * (successful API response with real data).
   */
  async markMatchHot(matchId: string): Promise<void> {
    const key = PREFETCH_KEYS.hotMatch(matchId);
    await this.cache.set(key, Date.now(), HOT_MATCH_TTL);
  }

  /**
   * Get all currently hot match IDs from Redis.
   */
  async getHotMatchIds(): Promise<string[]> {
    const keys = await this.cache.keys(PREFETCH_KEYS.hotMatchPattern());
    return keys.map((k) => k.replace(HOT_KEY_PREFIX, ""));
  }

  // ───────────────────────────────────────────────────────────────
  // ── Lifecycle ──
  // ───────────────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    this.logger.info("Starting prefetch scheduler", {
      providers: Array.from(this.providers.keys()),
      sports: PREFETCH_SPORTS,
      hotMatchTtl: `${HOT_MATCH_TTL}s`,
      maxConcurrency: MAX_CONCURRENCY,
    });

    // ── Initial match list fetch ──
    await this.prefetchAllMatchLists();

    // ── Odds polling (every 1s, only hot matches, worker-controlled) ──
    this.oddsTimer = setInterval(
      () => this.pollHotMatchOdds(),
      POLL_INTERVAL.LIVE_ODDS,
    );

    this.logger.info("Prefetch scheduler started ✅");
  }

  async stop(): Promise<void> {
    if (!this.started) return;

    if (this.oddsTimer) clearInterval(this.oddsTimer);

    this.worker.removeAllListeners();
    this.started = false;
    this.logger.info("Prefetch scheduler stopped");
  }

  /**
   * Get current scheduler and worker stats.
   */
  getStats(): {
    started: boolean;
    hotMatchCount: number;
    worker: { active: number; queued: number; processing: boolean };
  } {
    return {
      started: this.started,
      hotMatchCount: 0, // async — use getHotMatchIds() for actual count
      worker: this.worker.getStats(),
    };
  }

  // ───────────────────────────────────────────────────────────────
  // ── Match List Prefetch ──
  // ───────────────────────────────────────────────────────────────

  private async prefetchAllMatchLists(): Promise<void> {
    for (const sport of PREFETCH_SPORTS) {
      try {
        await this.prefetchMatchList(sport);
      } catch (error) {
        this.logger.error("Match list prefetch failed", {
          sport,
          error: (error as Error).message,
        });
      }
    }
  }

  private async prefetchMatchList(sport: SportType): Promise<void> {
    const allMatches = [];

    for (const [name, provider] of this.providers) {
      try {
        const matches = await provider.fetchLiveMatches(sport);
        allMatches.push(...matches);
      } catch (error) {
        this.logger.error("Provider match list fetch failed", {
          provider: name,
          sport,
          error: (error as Error).message,
        });
      }
    }

    const cacheTtl = Math.ceil((POLL_INTERVAL.MATCH_LIST / 1000) * 2);
    await this.cache.set(
      PREFETCH_KEYS.liveMatches(sport),
      allMatches,
      cacheTtl,
    );

    this.logger.debug("Match list cached", {
      sport,
      count: allMatches.length,
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── Odds Polling via Worker Queue ──
  // ───────────────────────────────────────────────────────────────

  /**
   * Every 1 second:
   *   1. Read hot match IDs from Redis
   *   2. If none → skip
   *   3. Emit FETCH_ODDS event → worker picks them up
   *   4. Worker processes with controlled concurrency (max 5 at a time)
   *   5. When all done → TICK_COMPLETE event fires
   */
  private async pollHotMatchOdds(): Promise<void> {
    // If previous tick is still processing, skip
    if (this.oddsPollingActive) {
      this.logger.debug("Previous tick still processing, skipping");
      return;
    }

    try {
      const hotIds = await this.getHotMatchIds();

      if (hotIds.length === 0) return;

      this.oddsPollingActive = true;

      this.logger.debug("Dispatching odds fetch to worker", {
        count: hotIds.length,
        matchIds: hotIds,
      });

      // Dispatch to worker — it handles concurrency
      this.worker.emit(EVENTS.FETCH_ODDS, hotIds);
    } catch (error) {
      this.oddsPollingActive = false;
      this.logger.error("Odds polling tick failed", {
        error: (error as Error).message,
      });
    }
  }
}
