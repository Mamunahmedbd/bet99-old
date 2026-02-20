/**
 * Exchange Polling Scheduler — Multi-Tier + Demand-Driven Odds
 *
 * The heart of the exchange provider's optimization strategy.
 * Orchestrates background polling across 5 tiers with different
 * intervals, plus demand-driven 1-second GMID odds polling with
 * request coalescing to prevent thundering herds.
 *
 * Polling Tiers:
 * ┌──────────────────┬────────────┬──────────────────────────────────────────┐
 * │ Tier             │ Interval   │ Endpoints                                │
 * ├──────────────────┼────────────┼──────────────────────────────────────────┤
 * │ Bootstrap (1×)   │ At startup │ sports                                   │
 * │ On-demand (1×)   │ Per gmid   │ match/details, match/tv, virtual/tv      │
 * │ High Freq (1s)   │ 1 second   │ match/odds/:gmid (hot only)              │
 * │ Medium (1 min)   │ 1 minute   │ matches?sid=                             │
 * │ Hourly           │ 1 hour     │ top-events, banner, results              │
 * │ Daily            │ 1 day      │ sidebar                                  │
 * └──────────────────┴────────────┴──────────────────────────────────────────┘
 *
 * Hot GMID Tracking:
 *   Redis SET "xhot:gmid:{id}" TTL=30s
 *   Renewed on every user hit after successful retrieval.
 *   Redis auto-expires → GMID drops out of polling.
 *
 * Thundering Herd Protection:
 *   RequestCoalescer deduplicates concurrent requests for the
 *   same GMID. First request fetches, all others piggyback.
 */
import { EventEmitter } from "events";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";
import type { ExchangeDataProvider } from "./exchange.provider";

// ─────────────────────────────────────────────────────────────────
// ── Configuration ──
// ─────────────────────────────────────────────────────────────────

export interface ExchangePollConfig {
  /** Match list refresh interval in ms (default: 60_000) */
  matchList: number;
  /** Top events refresh interval in ms (default: 3_600_000) */
  topEvents: number;
  /** Banners refresh interval in ms (default: 3_600_000) */
  banners: number;
  /** Sidebar tree refresh interval in ms (default: 86_400_000) */
  sidebar: number;
  /** Odds polling interval in ms (default: 1_000) */
  odds: number;
  /** How long a GMID stays "hot" in seconds (default: 30) */
  oddsHotTtl: number;
}

export const DEFAULT_POLL_CONFIG: ExchangePollConfig = {
  matchList: 60_000,
  topEvents: 3_600_000,
  banners: 3_600_000,
  sidebar: 86_400_000,
  odds: 1_000,
  oddsHotTtl: 30,
};

// ─────────────────────────────────────────────────────────────────
// ── Constants ──
// ─────────────────────────────────────────────────────────────────

const MAX_CONCURRENCY = 5;

/** Redis key prefix for hot GMID tracking */
const HOT_GMID_PREFIX = "xhot:gmid:";

/** Sport IDs to poll match lists for */
const POLL_SPORT_IDS = [4, 1, 2]; // Cricket, Football, Tennis

/** A hot GMID entry with its sport ID */
export interface HotGmidEntry {
  gmid: string;
  sid: number;
}

// ─────────────────────────────────────────────────────────────────
// ── Cache Key Builders ──
// ─────────────────────────────────────────────────────────────────

export const EXCHANGE_CACHE_KEYS = {
  // ── 1× Bootstrap ──
  allSports: () => "exchange:sports",

  // ── 1× On-demand per gmid (fetched once, cached permanently) ──
  matchDetails: (gmid: string) => `exchange:details:${gmid}`,
  liveTvScore: (gmid: string) => `exchange:tv:${gmid}`,
  virtualTv: (gmid: string) => `exchange:vtv:${gmid}`,

  // ── 1 min ──
  matchList: (sid: number) => `exchange:matches:${sid}`,

  // ── 1 sec (demand) ──
  matchOdds: (gmid: string) => `exchange:odds:${gmid}`,

  // ── 1 hour ──
  topEvents: () => "exchange:top-events",
  banners: () => "exchange:banners",
  results: (sid: number, gmid: string) =>
    `exchange:results:${sid}:${gmid}`,

  // ── 1 day ──
  sidebar: () => "exchange:sidebar",

  // ── Hot GMID tracking ──
  hotGmid: (gmid: string) => `${HOT_GMID_PREFIX}${gmid}`,
  hotGmidPattern: () => `${HOT_GMID_PREFIX}*`,
} as const;

/** Cache TTLs in seconds for each tier */
export const EXCHANGE_CACHE_TTL = {
  SPORTS: 86_400,             // 1 day (fetched 1× at startup)
  MATCH_LIST: 120,            // 2 min (refreshed every 1 min)
  MATCH_ODDS: 2,              // 2 sec (refreshed every 1 sec)
  ON_DEMAND: 86_400,          // 1 day — details, tv, virtual/tv (fetched 1× per gmid)
  TOP_EVENTS: 7_200,          // 2 hour (refreshed every 1 hour)
  BANNERS: 7_200,             // 2 hour (refreshed every 1 hour)
  RESULTS: 3_600,             // 1 hour
  SIDEBAR: 172_800,           // 2 day (refreshed every 1 day)
} as const;

// ─────────────────────────────────────────────────────────────────
// ── Request Coalescer (Thundering Herd Protection) ──
// ─────────────────────────────────────────────────────────────────

/**
 * Deduplicates concurrent requests for the same key.
 * First caller triggers the actual fetch, all subsequent
 * callers get the same promise. Once resolved, the slot
 * is freed for future requests.
 */
export class RequestCoalescer {
  private inFlight = new Map<string, Promise<unknown>>();

  async coalesce<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher().finally(() => {
      this.inFlight.delete(key);
    });

    this.inFlight.set(key, promise);
    return promise;
  }

  /** Number of currently in-flight requests */
  get activeCount(): number {
    return this.inFlight.size;
  }
}

// ─────────────────────────────────────────────────────────────────
// ── Worker Queue Events ──
// ─────────────────────────────────────────────────────────────────

const EVENTS = {
  FETCH_ODDS: "fetch:odds",
  FETCH_COMPLETE: "fetch:complete",
  TICK_COMPLETE: "tick:complete",
} as const;

// ─────────────────────────────────────────────────────────────────
// ── Odds Fetch Worker ──
// ─────────────────────────────────────────────────────────────────

/**
 * Concurrency-controlled worker that processes a queue of hot GMID entries.
 * At most MAX_CONCURRENCY fetches run in parallel at any time.
 * Each fetch goes through the RequestCoalescer to prevent
 * duplicate upstream calls.
 */
class OddsFetchWorker extends EventEmitter {
  private readonly provider: ExchangeDataProvider;
  private readonly cache: CacheService;
  private readonly coalescer: RequestCoalescer;
  private activeCount = 0;
  private queue: HotGmidEntry[] = [];
  private processing = false;

  constructor(
    provider: ExchangeDataProvider,
    cache: CacheService,
    coalescer: RequestCoalescer,
  ) {
    super();
    this.provider = provider;
    this.cache = cache;
    this.coalescer = coalescer;

    this.on(EVENTS.FETCH_ODDS, (entries: HotGmidEntry[]) => {
      this.enqueue(entries);
    });
  }

  private enqueue(entries: HotGmidEntry[]): void {
    this.queue.push(...entries);
    this.drain();
  }

  private drain(): void {
    if (this.processing && this.queue.length === 0 && this.activeCount === 0) {
      this.processing = false;
      this.emit(EVENTS.TICK_COMPLETE);
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeCount < MAX_CONCURRENCY) {
      const entry = this.queue.shift()!;
      this.activeCount++;

      this.fetchOdds(entry.gmid, entry.sid)
        .then((success) => {
          this.emit(EVENTS.FETCH_COMPLETE, { gmid: entry.gmid, success });
        })
        .catch(() => {
          this.emit(EVENTS.FETCH_COMPLETE, { gmid: entry.gmid, success: false });
        })
        .finally(() => {
          this.activeCount--;
          this.drain();
        });
    }

    if (this.queue.length === 0 && this.activeCount === 0) {
      this.processing = false;
      this.emit(EVENTS.TICK_COMPLETE);
    }
  }

  private async fetchOdds(gmid: string, sid: number): Promise<boolean> {
    try {
      const data = await this.coalescer.coalesce(
        `odds:${gmid}`,
        () => this.provider.getMatchOdds(gmid, sid),
      );

      if (data && data.length > 0) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.matchOdds(gmid),
          data,
          EXCHANGE_CACHE_TTL.MATCH_ODDS,
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  getStats(): { active: number; queued: number; processing: boolean } {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      processing: this.processing,
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// ── Exchange Polling Scheduler ──
// ─────────────────────────────────────────────────────────────────

export class ExchangePollingScheduler {
  private readonly logger: Logger;
  private readonly cache: CacheService;
  private readonly provider: ExchangeDataProvider;
  private readonly config: ExchangePollConfig;
  private readonly worker: OddsFetchWorker;
  private readonly coalescer: RequestCoalescer;

  private started = false;
  private oddsPollingActive = false;

  // Timer handles
  private oddsTimer?: ReturnType<typeof setInterval>;
  private matchListTimer?: ReturnType<typeof setInterval>;
  private topEventsTimer?: ReturnType<typeof setInterval>;
  private bannersTimer?: ReturnType<typeof setInterval>;
  private sidebarTimer?: ReturnType<typeof setInterval>;

  constructor(
    provider: ExchangeDataProvider,
    cache: CacheService,
    logger: Logger,
    config?: Partial<ExchangePollConfig>,
  ) {
    this.provider = provider;
    this.cache = cache;
    this.logger = logger.child({ service: "ExchangePollingScheduler" });
    this.config = { ...DEFAULT_POLL_CONFIG, ...config };
    this.coalescer = new RequestCoalescer();

    // Create the worker
    this.worker = new OddsFetchWorker(provider, cache, this.coalescer);

    // Listen for worker events
    this.worker.on(EVENTS.FETCH_COMPLETE, ({ gmid, success }) => {
      this.logger.debug("Odds fetch complete", { gmid, success });
    });

    this.worker.on(EVENTS.TICK_COMPLETE, () => {
      this.logger.debug("Odds polling tick complete", this.worker.getStats());
      this.oddsPollingActive = false;
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── Hot GMID Tracking ──
  // ───────────────────────────────────────────────────────────────

  /**
   * Mark a GMID as "hot" — starts/renews 1-second polling for it.
   * Stores {gmid, sid} so background poller knows which sport ID to use.
   * Sets Redis key with configurable TTL (default: 30s).
   */
  async markGmidHot(gmid: string, sid = 4): Promise<void> {
    const key = EXCHANGE_CACHE_KEYS.hotGmid(gmid);
    await this.cache.set(key, { gmid, sid, ts: Date.now() }, this.config.oddsHotTtl);
  }

  /**
   * Get all currently hot GMID entries with their sport IDs.
   */
  async getHotGmids(): Promise<HotGmidEntry[]> {
    const keys = await this.cache.keys(EXCHANGE_CACHE_KEYS.hotGmidPattern());
    const entries: HotGmidEntry[] = [];

    for (const key of keys) {
      const raw = await this.cache.get(key);
      const gmid = key.replace(HOT_GMID_PREFIX, "");

      if (raw && typeof raw === "object" && "sid" in (raw as Record<string, unknown>)) {
        entries.push({ gmid, sid: (raw as { sid: number }).sid });
      } else {
        // Fallback for legacy entries stored without sid
        entries.push({ gmid, sid: 4 });
      }
    }
    return entries;
  }

  /**
   * Request-coalesced odds fetch for a specific GMID.
   * If the same GMID is being fetched concurrently, piggybacks
   * on the existing request instead of making a new one.
   */
  async getCoalescedOdds(gmid: string, sid = 4): Promise<unknown> {
    return this.coalescer.coalesce(`odds:${gmid}`, async () => {
      const data = await this.provider.getMatchOdds(gmid, sid);
      if (data && data.length > 0) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.matchOdds(gmid),
          data,
          EXCHANGE_CACHE_TTL.MATCH_ODDS,
        );
      }
      return data;
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── Lifecycle ──
  // ───────────────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    this.logger.info("Starting exchange polling scheduler", {
      config: this.config,
      maxConcurrency: MAX_CONCURRENCY,
      sportIds: POLL_SPORT_IDS,
    });

    // ── 1× Bootstrap ──
    await this.bootstrapOnce();

    // ── 1 sec: Hot GMID odds polling ──
    this.oddsTimer = setInterval(
      () => this.pollHotGmidOdds(),
      this.config.odds,
    );

    // ── 1 min: Match lists ──
    this.matchListTimer = setInterval(
      () => this.pollMatchLists(),
      this.config.matchList,
    );

    // ── 1 hour: Top events + banners ──
    this.topEventsTimer = setInterval(
      () => this.pollTopEvents(),
      this.config.topEvents,
    );
    this.bannersTimer = setInterval(
      () => this.pollBanners(),
      this.config.banners,
    );

    // ── 1 day: Sidebar ──
    this.sidebarTimer = setInterval(
      () => this.pollSidebar(),
      this.config.sidebar,
    );

    this.logger.info("Exchange polling scheduler started ✅");
  }

  async stop(): Promise<void> {
    if (!this.started) return;

    if (this.oddsTimer) clearInterval(this.oddsTimer);
    if (this.matchListTimer) clearInterval(this.matchListTimer);
    if (this.topEventsTimer) clearInterval(this.topEventsTimer);
    if (this.bannersTimer) clearInterval(this.bannersTimer);
    if (this.sidebarTimer) clearInterval(this.sidebarTimer);

    this.worker.removeAllListeners();
    this.started = false;
    this.logger.info("Exchange polling scheduler stopped");
  }

  getStats(): {
    started: boolean;
    oddsPollingActive: boolean;
    coalescerActive: number;
    worker: { active: number; queued: number; processing: boolean };
  } {
    return {
      started: this.started,
      oddsPollingActive: this.oddsPollingActive,
      coalescerActive: this.coalescer.activeCount,
      worker: this.worker.getStats(),
    };
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1× Bootstrap ──
  // ───────────────────────────────────────────────────────────────

  private async bootstrapOnce(): Promise<void> {
    // Fetch and cache all sports
    try {
      const sports = await this.provider.getAllSports();
      if (sports.length > 0) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.allSports(),
          sports,
          EXCHANGE_CACHE_TTL.SPORTS,
        );
        this.logger.info("Bootstrap: cached sports", {
          count: sports.length,
        });
      }
    } catch (error) {
      this.logger.error("Bootstrap: sports fetch failed", {
        error: (error as Error).message,
      });
    }

    // Fetch initial match lists for all sports
    await this.pollMatchLists();

    // Fetch initial top events + banners + sidebar
    await Promise.allSettled([
      this.pollTopEvents(),
      this.pollBanners(),
      this.pollSidebar(),
    ]);
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1 min: Match Lists ──
  // ───────────────────────────────────────────────────────────────

  private async pollMatchLists(): Promise<void> {
    for (const sid of POLL_SPORT_IDS) {
      try {
        const data = await this.provider.getMatchList(sid);
        if (data) {
          await this.cache.set(
            EXCHANGE_CACHE_KEYS.matchList(sid),
            data,
            EXCHANGE_CACHE_TTL.MATCH_LIST,
          );
          this.logger.debug("Polled match list", {
            sid,
            t1: data.t1?.length ?? 0,
            t2: data.t2?.length ?? 0,
          });
        }
      } catch (error) {
        this.logger.error("Match list poll failed", {
          sid,
          error: (error as Error).message,
        });
      }
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1 hour: Top Events ──
  // ───────────────────────────────────────────────────────────────

  private async pollTopEvents(): Promise<void> {
    try {
      const events = await this.provider.getTopEvents();
      if (events.length > 0) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.topEvents(),
          events,
          EXCHANGE_CACHE_TTL.TOP_EVENTS,
        );
        this.logger.debug("Polled top events", { count: events.length });
      }
    } catch (error) {
      this.logger.error("Top events poll failed", {
        error: (error as Error).message,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1 hour: Banners ──
  // ───────────────────────────────────────────────────────────────

  private async pollBanners(): Promise<void> {
    try {
      const banners = await this.provider.getBanners();
      if (banners) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.banners(),
          banners,
          EXCHANGE_CACHE_TTL.BANNERS,
        );
        this.logger.debug("Polled banners");
      }
    } catch (error) {
      this.logger.error("Banners poll failed", {
        error: (error as Error).message,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1 day: Sidebar Tree ──
  // ───────────────────────────────────────────────────────────────

  private async pollSidebar(): Promise<void> {
    try {
      const tree = await this.provider.getSidebarTree();
      if (tree) {
        await this.cache.set(
          EXCHANGE_CACHE_KEYS.sidebar(),
          tree,
          EXCHANGE_CACHE_TTL.SIDEBAR,
        );
        this.logger.debug("Polled sidebar tree");
      }
    } catch (error) {
      this.logger.error("Sidebar poll failed", {
        error: (error as Error).message,
      });
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── 1 sec: Hot GMID Odds Polling ──
  // ───────────────────────────────────────────────────────────────

  private async pollHotGmidOdds(): Promise<void> {
    // Skip if previous tick is still processing
    if (this.oddsPollingActive) {
      this.logger.debug("Previous odds tick still processing, skipping");
      return;
    }

    try {
      const hotEntries = await this.getHotGmids();
      if (hotEntries.length === 0) return;

      this.oddsPollingActive = true;

      this.logger.debug("Dispatching odds fetch", {
        count: hotEntries.length,
        entries: hotEntries,
      });

      // Dispatch to worker — it handles concurrency
      this.worker.emit(EVENTS.FETCH_ODDS, hotEntries);
    } catch (error) {
      this.oddsPollingActive = false;
      this.logger.error("Odds polling tick failed", {
        error: (error as Error).message,
      });
    }
  }
}
