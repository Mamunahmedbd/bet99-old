/**
 * Infrastructure — In-Memory Cache Service
 *
 * Implements the CacheService port with two stampede-prevention strategies:
 *
 * 1. REQUEST COALESCING (anti-thundering-herd)
 *    When 1,000 users hit the same cache key at the exact same ms after
 *    expiry, only ONE factory call executes. All others receive the same
 *    in-flight Promise.
 *
 * 2. STALE-WHILE-REVALIDATE
 *    Expired entries aren't deleted immediately — they're served as "stale"
 *    while a single background refresh runs. Users never wait for a cold
 *    fetch during normal operation.
 *
 * Timeline:
 *   |--- fresh (ttl) ---|--- stale grace (ttl * STALE_MULTIPLIER) ---|--- gone ---|
 *   Serve instantly ✅    Serve stale + bg refresh 🔄                   Factory ⏳
 */
import type { CacheService } from "@application/ports/cache-service";
import { CACHE_TTL } from "@shared/constants";

/** How long stale data is kept beyond the fresh TTL (multiplier) */
const STALE_MULTIPLIER = 2;

interface CacheEntry<T> {
  value: T;
  /** When the entry is no longer "fresh" — stale serving begins */
  freshUntil: number;
  /** When the entry is too old to serve even as stale */
  staleUntil: number;
}

export class InMemoryCacheService implements CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * In-flight factory promises keyed by cache key.
   * This is the core of request coalescing — if a factory is already
   * running for a key, subsequent callers share the same Promise.
   */
  private inflight = new Map<string, Promise<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Completely expired — purge
    if (Date.now() > entry.staleUntil) {
      this.store.delete(key);
      return null;
    }

    // Still within stale window — return value (caller decides if refresh needed)
    return entry.value as T;
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = CACHE_TTL.DEFAULT,
  ): Promise<void> {
    const now = Date.now();
    const ttlMs = ttlSeconds * 1000;

    this.store.set(key, {
      value,
      freshUntil: now + ttlMs,
      staleUntil: now + ttlMs * STALE_MULTIPLIER,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    this.inflight.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  async flush(): Promise<void> {
    this.store.clear();
    this.inflight.clear();
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(
      `^${pattern.replace(/\*/g, ".*").replace(/\?/g, ".")}$`,
    );
    return Array.from(this.store.keys()).filter((k) => regex.test(k));
  }

  /**
   * Get-or-set with stampede protection.
   *
   * Scenario: 1,000 users hit at the exact moment cache expires.
   *
   * WITHOUT protection:
   *   → 1,000 simultaneous Diamond API calls → provider overwhelmed
   *
   * WITH coalescing + stale-while-revalidate:
   *   → 999 users get stale data instantly (< 1ms)
   *   → 1 user triggers the refresh (shared Promise)
   *   → Next cycle: everyone gets fresh data
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.DEFAULT,
  ): Promise<T> {
    const entry = this.store.get(key);
    const now = Date.now();

    // ── Case 1: Fresh cache — serve immediately ──
    if (entry && now <= entry.freshUntil) {
      return entry.value as T;
    }

    // ── Case 2: Stale cache — serve stale + background refresh ──
    if (entry && now <= entry.staleUntil) {
      // Kick off ONE background refresh (coalesced)
      this.refreshInBackground(key, factory, ttlSeconds);
      return entry.value as T;
    }

    // ── Case 3: No cache at all — must wait for factory ──
    // But coalesce: if another caller is already fetching, share their Promise
    return this.coalesce<T>(key, factory, ttlSeconds);
  }

  /**
   * Request coalescing — ensures only ONE factory call per key at a time.
   * All concurrent callers for the same key share the same Promise.
   */
  private async coalesce<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number,
  ): Promise<T> {
    // If there's already an in-flight request, piggyback on it
    const existing = this.inflight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    // We're the first — create the factory Promise
    const promise = factory()
      .then(async (value) => {
        await this.set(key, value, ttlSeconds);
        return value;
      })
      .finally(() => {
        // Clean up in-flight tracker
        this.inflight.delete(key);
      });

    this.inflight.set(key, promise);
    return promise;
  }

  /**
   * Background refresh — non-blocking, fire-and-forget.
   * Uses coalesce() internally so duplicate bg refreshes are impossible.
   */
  private refreshInBackground<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number,
  ): void {
    // Don't await — this runs in the background
    this.coalesce(key, factory, ttlSeconds).catch(() => {
      // Swallow errors — stale data is already being served.
      // The next getOrSet call will retry.
    });
  }
}
