/**
 * Presentation — Exchange Routes
 *
 * ElysiaJS route definitions for all 11 Exchange API endpoints.
 * Controllers are thin — they check cache first, then delegate
 * to the exchange provider, and manage hot GMID activation.
 *
 * Route Summary:
 * ┌───────────────────────────────────────────────┬──────────────────────┐
 * │ Route                                         │ Cache Strategy       │
 * ├───────────────────────────────────────────────┼──────────────────────┤
 * │ GET  /exchange/sports                         │ From cache (1×)      │
 * │ GET  /exchange/matches                        │ From cache (1 min)   │
 * │ GET  /exchange/odds/:gmid?sid=                │ Coalesced + hot GMID │
 * │ GET  /exchange/match/details?gmid=             │ 1× on-demand (gmid)  │
 * │ GET  /exchange/match/tv?gmid=                  │ 1× on-demand (gmid)  │
 * │ GET  /exchange/results                        │ Cache 1 hour         │
 * │ GET  /exchange/sidebar                        │ From cache (1 day)   │
 * │ GET  /exchange/top-events                     │ From cache (1 hour)  │
 * │ GET  /exchange/banner                         │ From cache (1 hour)  │
 * │ POST /exchange/market                         │ Pass-through         │
 * │ GET  /exchange/virtual/tv?gmid=                │ 1× on-demand (gmid)  │
 * └───────────────────────────────────────────────┴──────────────────────┘
 */
import { Elysia, t } from "elysia";
import type { ExchangeDataProvider } from "@infrastructure/providers/exchange/exchange.provider";
import type { ExchangePollingScheduler } from "@infrastructure/providers/exchange/exchange-polling.scheduler";
import {
  EXCHANGE_CACHE_KEYS,
  EXCHANGE_CACHE_TTL,
} from "@infrastructure/providers/exchange/exchange-polling.scheduler";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";

interface ExchangeRouteDeps {
  provider: ExchangeDataProvider;
  scheduler: ExchangePollingScheduler;
  cache: CacheService;
  logger: Logger;
}

export function exchangeRoutes(deps: ExchangeRouteDeps) {
  const { provider, scheduler, cache, logger } = deps;
  const log = logger.child({ routes: "exchange" });

  return new Elysia({ prefix: "/exchange" })

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/sports ──
    // ── Served from cache. Populated at startup (1×).
    // ──────────────────────────────────────────────────────────
    .get(
      "/sports",
      async ({ set }) => {
        try {
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.allSports());
          if (cached) {
            return { success: true, data: cached };
          }

          // Cache miss — fetch and cache
          const data = await provider.getAllSports();
          if (data.length > 0) {
            await cache.set(
              EXCHANGE_CACHE_KEYS.allSports(),
              data,
              EXCHANGE_CACHE_TTL.SPORTS,
            );
          }
          return { success: true, data };
        } catch (error) {
          set.status = 500;
          log.error("GET /sports failed", { error: (error as Error).message });
          return { success: false, error: "Failed to fetch sports" };
        }
      },
      {
        detail: {
          summary: "Get All Sports",
          description: "Returns all available sports. Cached at startup.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/matches?sid= ──
    // ── Served from cache. Refreshed every 1 min.
    // ──────────────────────────────────────────────────────────
    .get(
      "/matches",
      async ({ query, set }) => {
        const sid = Number(query.sid);
        if (!sid || Number.isNaN(sid)) {
          set.status = 400;
          return { success: false, error: "Missing or invalid sid parameter" };
        }

        try {
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.matchList(sid));
          if (cached) {
            return { success: true, data: cached };
          }

          // Cache miss — fetch and cache
          const data = await provider.getMatchList(sid);
          if (data) {
            await cache.set(
              EXCHANGE_CACHE_KEYS.matchList(sid),
              data,
              EXCHANGE_CACHE_TTL.MATCH_LIST,
            );
          }
          return { success: true, data: data ?? { t1: [], t2: [] } };
        } catch (error) {
          set.status = 500;
          log.error("GET /matches failed", { sid, error: (error as Error).message });
          return { success: false, error: "Failed to fetch matches" };
        }
      },
      {
        query: t.Object({
          sid: t.String(),
        }),
        detail: {
          summary: "Get Match List",
          description: "Returns matches for a sport ID. Cached for 1 minute.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/odds/:gmid?sid= ──
    // ── THE CRITICAL PATH: coalesced fetch + hot GMID activation.
    // ── 1. Check cache → if HIT, return + renew hot TTL
    // ── 2. If MISS → coalesced fetch (thundering herd safe)
    // ── 3. Cache result, mark GMID hot (30s TTL)
    // ──────────────────────────────────────────────────────────
    .get(
      "/odds/:gmid",
      async ({ params, query, set }) => {
        const { gmid } = params;
        const sid = Number(query.sid || 4);

        try {
          // 1. Check cache first
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.matchOdds(gmid));
          if (cached) {
            // Renew hot TTL on cache hit (store sid for background polling)
            await scheduler.markGmidHot(gmid, sid);
            return { success: true, data: cached };
          }

          // 2. Cache miss — coalesced fetch (thundering herd safe)
          const data = await scheduler.getCoalescedOdds(gmid, sid);

          // 3. Mark GMID hot (starts 1s polling for 30s)
          await scheduler.markGmidHot(gmid, sid);

          return {
            success: true,
            data: data ?? [],
          };
        } catch (error) {
          set.status = 500;
          log.error("GET /odds/:gmid failed", {
            gmid,
            sid,
            error: (error as Error).message,
          });
          return { success: false, error: "Failed to fetch odds" };
        }
      },
      {
        params: t.Object({
          gmid: t.String(),
        }),
        query: t.Object({
          sid: t.Optional(t.String()),
        }),
        detail: {
          summary: "Get Match Odds (Demand-Driven)",
          description:
            "Returns live odds for a GMID with sport ID. Activates 1-second polling for 30 seconds. " +
            "Request coalescing prevents thundering herd on uncached GMIDs.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/match/details?gmid=&sid= ──
    // ── 1× on-demand per gmid. sid passed upstream but cache key = gmid.
    // ──────────────────────────────────────────────────────────
    .get(
      "/match/details",
      async ({ query, set }) => {
        const gmid = query.gmid;
        const sid = Number(query.sid || 4);
        if (!gmid) {
          set.status = 400;
          return { success: false, error: "Missing gmid" };
        }

        try {
          // Cache key is gmid-only (1× on-demand)
          const cacheKey = EXCHANGE_CACHE_KEYS.matchDetails(gmid);
          const cached = await cache.get(cacheKey);
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getMatchDetails(sid, Number(gmid));
          if (data) {
            await cache.set(cacheKey, data, EXCHANGE_CACHE_TTL.ON_DEMAND);
          }
          return { success: true, data: data ?? [] };
        } catch (error) {
          set.status = 500;
          log.error("GET /match/details failed", {
            gmid,
            sid,
            error: (error as Error).message,
          });
          return { success: false, error: "Failed to fetch match details" };
        }
      },
      {
        query: t.Object({
          gmid: t.String(),
          sid: t.Optional(t.String()),
        }),
        detail: {
          summary: "Get Match Details (GTV)",
          description: "Returns match details. Cached once per gmid (never refreshed).",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/match/tv?gmid=&sid= ──
    // ── 1× on-demand per gmid (sid passed upstream only).
    // ──────────────────────────────────────────────────────────
    .get(
      "/match/tv",
      async ({ query, set }) => {
        const gmid = query.gmid;
        const sid = Number(query.sid || 4);
        if (!gmid) {
          set.status = 400;
          return { success: false, error: "Missing gmid" };
        }

        try {
          // Cache key is gmid-only (1× on-demand)
          const cacheKey = EXCHANGE_CACHE_KEYS.liveTvScore(gmid);
          const cached = await cache.get(cacheKey);
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getLiveTvScore(gmid, sid);
          if (data) {
            await cache.set(cacheKey, data, EXCHANGE_CACHE_TTL.ON_DEMAND);
          }
          return { success: true, data: data ?? null };
        } catch (error) {
          set.status = 500;
          log.error("GET /match/tv failed", {
            gmid,
            error: (error as Error).message,
          });
          return { success: false, error: "Failed to fetch TV score" };
        }
      },
      {
        query: t.Object({
          gmid: t.String(),
          sid: t.Optional(t.String()),
        }),
        detail: {
          summary: "Get Live TV & Score URLs",
          description: "Returns TV and score URLs. Cached once per gmid (never refreshed).",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/results?sportsid=&gmid= ──
    // ── Cached for 1 hour
    // ──────────────────────────────────────────────────────────
    .get(
      "/results",
      async ({ query, set }) => {
        const sportsid = Number(query.sportsid);
        const gmid = query.gmid;
        if (!sportsid || !gmid || Number.isNaN(sportsid)) {
          set.status = 400;
          return { success: false, error: "Missing sportsid or gmid" };
        }

        try {
          const cacheKey = EXCHANGE_CACHE_KEYS.results(sportsid, gmid);
          const cached = await cache.get(cacheKey);
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getResults(sportsid, gmid);
          if (data.length > 0) {
            await cache.set(cacheKey, data, EXCHANGE_CACHE_TTL.RESULTS);
          }
          return { success: true, data };
        } catch (error) {
          set.status = 500;
          log.error("GET /results failed", {
            sportsid,
            gmid,
            error: (error as Error).message,
          });
          return { success: false, error: "Failed to fetch results" };
        }
      },
      {
        query: t.Object({
          sportsid: t.String(),
          gmid: t.String(),
        }),
        detail: {
          summary: "Get Match Results",
          description: "Returns settled market results. Cached for 1 hour.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/sidebar ──
    // ── Served from cache. Refreshed every 1 day.
    // ──────────────────────────────────────────────────────────
    .get(
      "/sidebar",
      async ({ set }) => {
        try {
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.sidebar());
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getSidebarTree();
          if (data) {
            await cache.set(
              EXCHANGE_CACHE_KEYS.sidebar(),
              data,
              EXCHANGE_CACHE_TTL.SIDEBAR,
            );
          }
          return { success: true, data: data ?? null };
        } catch (error) {
          set.status = 500;
          log.error("GET /sidebar failed", { error: (error as Error).message });
          return { success: false, error: "Failed to fetch sidebar" };
        }
      },
      {
        detail: {
          summary: "Get Sidebar Tree",
          description: "Returns sidebar navigation tree. Cached for 1 day.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/top-events ──
    // ── Served from cache. Refreshed every 1 hour.
    // ──────────────────────────────────────────────────────────
    .get(
      "/top-events",
      async ({ set }) => {
        try {
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.topEvents());
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getTopEvents();
          if (data.length > 0) {
            await cache.set(
              EXCHANGE_CACHE_KEYS.topEvents(),
              data,
              EXCHANGE_CACHE_TTL.TOP_EVENTS,
            );
          }
          return { success: true, data };
        } catch (error) {
          set.status = 500;
          log.error("GET /top-events failed", { error: (error as Error).message });
          return { success: false, error: "Failed to fetch top events" };
        }
      },
      {
        detail: {
          summary: "Get Top Events",
          description: "Returns promoted events. Cached for 1 hour.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/banner ──
    // ── Served from cache. Refreshed every 1 hour.
    // ──────────────────────────────────────────────────────────
    .get(
      "/banner",
      async ({ set }) => {
        try {
          const cached = await cache.get(EXCHANGE_CACHE_KEYS.banners());
          if (cached) {
            return { success: true, data: cached };
          }

          const data = await provider.getBanners();
          if (data) {
            await cache.set(
              EXCHANGE_CACHE_KEYS.banners(),
              data,
              EXCHANGE_CACHE_TTL.BANNERS,
            );
          }
          return { success: true, data: data ?? null };
        } catch (error) {
          set.status = 500;
          log.error("GET /banner failed", { error: (error as Error).message });
          return { success: false, error: "Failed to fetch banners" };
        }
      },
      {
        detail: {
          summary: "Get Welcome Banners",
          description: "Returns desktop/mobile banner URLs. Cached for 1 hour.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── POST /exchange/market ──
    // ── Pass-through to diamond-proxy. No caching.
    // ──────────────────────────────────────────────────────────
    .post(
      "/market",
      async ({ body, set }) => {
        try {
          const result = await provider.postPriorityMarket(body);
          return { success: !!result, data: result };
        } catch (error) {
          set.status = 500;
          log.error("POST /market failed", { error: (error as Error).message });
          return { success: false, error: "Failed to post market" };
        }
      },
      {
        body: t.Object({
          sportsid: t.Number(),
          gmid: t.String(),
          marketName: t.String(),
          mname: t.String(),
          gtype: t.String(),
        }),
        detail: {
          summary: "Post Priority Market",
          description: "Creates a priority market. No caching.",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/virtual/tv?gmid= ──
    // ── 1× on-demand per gmid (never refreshed).
    // ──────────────────────────────────────────────────────────
    .get(
      "/virtual/tv",
      async ({ query, set }) => {
        const gmid = query.gmid;
        if (!gmid) {
          set.status = 400;
          return { success: false, error: "Missing gmid" };
        }

        try {
          const cacheKey = EXCHANGE_CACHE_KEYS.virtualTv(gmid);
          const cached = await cache.get(cacheKey);
          if (cached) {
            return { success: true, data: cached };
          }

          const tvUrl = await provider.getVirtualTv(gmid);
          if (tvUrl) {
            await cache.set(cacheKey, { tv_url: tvUrl }, EXCHANGE_CACHE_TTL.ON_DEMAND);
          }
          return { success: true, data: tvUrl ? { tv_url: tvUrl } : null };
        } catch (error) {
          set.status = 500;
          log.error("GET /virtual/tv failed", {
            gmid,
            error: (error as Error).message,
          });
          return { success: false, error: "Failed to fetch virtual TV" };
        }
      },
      {
        query: t.Object({
          gmid: t.String(),
        }),
        detail: {
          summary: "Get Virtual Cricket TV URL",
          description: "Returns virtual cricket stream URL. Cached once per gmid (never refreshed).",
          tags: ["Exchange"],
        },
      },
    )

    // ──────────────────────────────────────────────────────────
    // ── GET /exchange/stats ──
    // ── Returns polling scheduler stats for monitoring.
    // ──────────────────────────────────────────────────────────
    .get(
      "/stats",
      async () => {
        const stats = scheduler.getStats();
        const hotGmids = await scheduler.getHotGmids();
        return {
          success: true,
          data: {
            ...stats,
            hotGmids,
            hotGmidCount: hotGmids.length,
          },
        };
      },
      {
        detail: {
          summary: "Exchange Scheduler Stats",
          description:
            "Returns polling scheduler status, worker stats, and active hot GMIDs.",
          tags: ["Exchange", "System"],
        },
      },
    );
}
