/**
 * Exchange Data Provider
 *
 * Production-grade adapter for the Diamond-Proxy exchange API layer.
 * Exposes all 11 endpoints as typed methods with structured logging
 * and graceful error handling.
 *
 * Also implements the DataProvider interface for compatibility with
 * the existing provider infrastructure.
 *
 * API Endpoints:
 * ┌──────────────────────────────────────────────┬────────┬───────────┐
 * │ Endpoint                                     │ Method │ Cache     │
 * ├──────────────────────────────────────────────┼────────┼───────────┤
 * │ /diamond-proxy/sports                        │ GET    │ 1× start  │
 * │ /diamond-proxy/matches?sid={id}              │ GET    │ 1 min     │
 * │ /diamond-proxy/match/odds/{gmid}?sid={sid}   │ GET    │ 1 sec     │
 * │ /diamond-proxy/match/details?sid&gmid        │ GET    │ 1× demand │
 * │ /diamond-proxy/match/tv?eventid&sid           │ GET    │ 1× cache  │
 * │ /diamond-proxy/results?sportsid&gmid         │ GET    │ 1 hour    │
 * │ /diamond-proxy/sidebar                       │ GET    │ 1 day     │
 * │ /diamond-proxy/top-events                    │ GET    │ 1 hour    │
 * │ /diamond-proxy/banner                        │ GET    │ 1 hour    │
 * │ /diamond-proxy/market                        │ POST   │ on-call   │
 * │ /diamond-proxy/virtual/tv?gmid               │ GET    │ 1× cache  │
 * └──────────────────────────────────────────────┴────────┴───────────┘
 */
import type { Logger } from "@application/ports/logger";
import type { SportType } from "@shared/constants";
import type {
  DataProvider,
  ProviderMatchData,
  ProviderMarketData,
} from "@application/ports/data-provider";
import { ExchangeHttpClient } from "./exchange-http-client";
import type { ExchangeClientConfig } from "./exchange-http-client";
import type {
  GetAllSportsResponse,
  GetMatchListResponse,
  GetMatchOddsResponse,
  GetMatchDetailResponse,
  GetScoreTvResponse,
  GetMarketResultsResponse,
  GetSidebarTreeResponse,
  GetTopEventsResponse,
  GetWelcomeBannerResponse,
  PostMarketResponse,
  GetVirtualTvResponse,
  ExchangeSport,
  ExchangeTopEvent,
  ExchangeBannerData,
  ExchangeTreeData,
  ExchangeMarketResult,
  ExchangeMarketDetail,
  ExchangeMatchListData,
  ExchangeMatchDetail,
  ExchangeScoreTvData,
  ExchangePostMarketPayload,
} from "./types";
import { EXCHANGE_SPORT_ID } from "./types";

// ─────────────────────────────────────────────────────────────────
// ── Sport ID Helpers ──
// ─────────────────────────────────────────────────────────────────

const SPORT_ID_MAP: Record<string, number> = {
  cricket: EXCHANGE_SPORT_ID.CRICKET,
  soccer: EXCHANGE_SPORT_ID.FOOTBALL,
  tennis: EXCHANGE_SPORT_ID.TENNIS,
};

function sportTypeToId(sport: SportType): number | undefined {
  return SPORT_ID_MAP[sport];
}

// ─────────────────────────────────────────────────────────────────
// ── Provider Implementation ──
// ─────────────────────────────────────────────────────────────────

export class ExchangeDataProvider implements DataProvider {
  readonly name = "exchange";

  private readonly client: ExchangeHttpClient;
  private readonly logger: Logger;

  constructor(config: ExchangeClientConfig, logger: Logger) {
    this.client = new ExchangeHttpClient(config, logger);
    this.logger = logger.child({ provider: "exchange" });

    this.logger.info("Exchange provider initialized", {
      baseUrl: config.baseUrl,
      requestTimeout: config.requestTimeout,
      postTimeout: config.postTimeout,
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── DataProvider Interface ──
  // ───────────────────────────────────────────────────────────────

  async fetchLiveMatches(sport: SportType): Promise<ProviderMatchData[]> {
    const sid = sportTypeToId(sport);
    if (!sid) return [];

    try {
      const data = await this.getMatchList(sid);
      if (!data) return [];

      const allItems = [
        ...(data.t1 || []),
        ...(data.t2 || []),
      ];

      return allItems.map((item) => ({
        externalId: String(item.gmid),
        sport,
        competition: item.cname,
        homeTeam: item.ename.split(" v ")[0]?.trim() || item.ename,
        awayTeam: item.ename.split(" v ")[1]?.trim() || "Unknown",
        startTime: item.stime,
        status: item.iplay ? "LIVE" : item.status,
        metadata: { provider: "exchange", diamondGmid: item.gmid },
      }));
    } catch (error) {
      this.logger.error("fetchLiveMatches failed", {
        sport,
        error: (error as Error).message,
      });
      return [];
    }
  }

  async fetchMatch(externalId: string): Promise<ProviderMatchData | null> {
    try {
      const sids = [4, 1, 2];
      for (const sid of sids) {
        const details = await this.getMatchDetails(sid, Number(externalId));
        if (details && details.length > 0) {
          const d = details[0];
          return {
            externalId: String(d.gmid),
            sport: (sid === 4 ? "cricket" : sid === 1 ? "soccer" : "tennis") as SportType,
            competition: d.cname,
            homeTeam: d.ename.split(" v ")[0]?.trim() || d.ename,
            awayTeam: d.ename.split(" v ")[1]?.trim() || "Unknown",
            startTime: d.stime,
            status: d.iplay ? "LIVE" : "SCHEDULED",
            metadata: { provider: "exchange", diamondGmid: d.gmid },
          };
        }
      }
      return null;
    } catch (error) {
      this.logger.error("fetchMatch failed", {
        externalId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  async fetchMarkets(matchExternalId: string): Promise<ProviderMarketData[]> {
    try {
      const markets = await this.getMatchOdds(matchExternalId);
      if (!markets) return [];

      return markets.map((m) => ({
        externalId: String(m.mid),
        name: m.mname,
        type: m.gtype,
        selections: m.section.map((s) => {
          const back = s.odds.find((o) => o.oname === "back1");
          const lay = s.odds.find((o) => o.oname === "lay1");
          return {
            id: String(s.sid),
            name: s.nat,
            back: back?.odds ?? 0,
            lay: lay?.odds ?? 0,
            isActive: s.gstatus === "ACTIVE",
          };
        }),
        isActive: m.status === "OPEN",
        metadata: { provider: "exchange", diamondGmid: m.gmid },
      }));
    } catch (error) {
      this.logger.error("fetchMarkets failed", {
        matchExternalId,
        error: (error as Error).message,
      });
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      return await this.client.healthCheck();
    } catch {
      return false;
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── Exchange-Specific API Methods ──
  // ── (Raw diamond-proxy responses, no mapping)
  // ───────────────────────────────────────────────────────────────

  /**
   * GET /diamond-proxy/sports
   * Cache: 1× at startup
   */
  async getAllSports(): Promise<ExchangeSport[]> {
    try {
      const response = await this.client.get<GetAllSportsResponse>(
        "/diamond-proxy/sports",
      );
      if (!response.success || !response.data) return [];

      this.logger.debug("Fetched all sports", {
        total: response.data.length,
      });
      return response.data;
    } catch (error) {
      this.logger.error("getAllSports failed", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * GET /diamond-proxy/matches?sid={sportId}
   * Cache: 1 min
   */
  async getMatchList(sportId: number): Promise<ExchangeMatchListData | null> {
    try {
      const response = await this.client.get<GetMatchListResponse>(
        "/diamond-proxy/matches",
        { sid: sportId },
      );
      if (!response.success || !response.data) return null;

      const t1Count = response.data.t1?.length ?? 0;
      const t2Count = response.data.t2?.length ?? 0;
      this.logger.debug("Fetched match list", {
        sportId,
        t1: t1Count,
        t2: t2Count,
      });
      return response.data;
    } catch (error) {
      this.logger.error("getMatchList failed", {
        sportId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/match/odds/{gmid}?sid={sportId}
   * Cache: 1 sec (demand-driven)
   */
  async getMatchOdds(gmid: string, sportId = 4): Promise<ExchangeMarketDetail[] | null> {
    try {
      const response = await this.client.get<GetMatchOddsResponse>(
        `/diamond-proxy/match/odds/${gmid}`,
        { sid: sportId },
      );
      if (!response.success || !response.data) return null;

      const markets = Array.isArray(response.data) ? response.data : [];
      this.logger.debug("Fetched match odds", {
        gmid,
        sid: sportId,
        marketCount: markets.length,
      });
      return markets;
    } catch (error) {
      this.logger.error("getMatchOdds failed", {
        gmid,
        sid: sportId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/match/details?sid={sid}&gmid={gmid}
   * Cache: 1× on demand
   */
  async getMatchDetails(
    sportId: number,
    gmid: number,
  ): Promise<ExchangeMatchDetail[] | null> {
    try {
      const response = await this.client.get<GetMatchDetailResponse>(
        "/diamond-proxy/match/details",
        { sid: sportId, gmid },
      );
      if (!response.success || !response.data) return null;

      this.logger.debug("Fetched match details", {
        sportId,
        gmid,
        count: response.data.length,
      });
      return response.data;
    } catch (error) {
      this.logger.error("getMatchDetails failed", {
        sportId,
        gmid,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/match/tv?diamondeventid={eventId}&diamondsportsid={sid}
   * Cache: 1× (cached once per unique key)
   */
  async getLiveTvScore(
    eventId: string,
    sportId = 4,
  ): Promise<ExchangeScoreTvData | null> {
    try {
      const response = await this.client.get<GetScoreTvResponse>(
        "/diamond-proxy/match/tv",
        { diamondeventid: eventId, diamondsportsid: sportId },
      );
      if (response.status && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      this.logger.error("getLiveTvScore failed", {
        eventId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/results?sportsid={sid}&gmid={gmid}
   * Cache: 1 hour
   */
  async getResults(
    sportId: number,
    gmid: string,
  ): Promise<ExchangeMarketResult[]> {
    try {
      const response = await this.client.get<GetMarketResultsResponse>(
        "/diamond-proxy/results",
        { sportsid: sportId, gmid },
      );
      if (!response.success || !response.markets) return [];

      this.logger.debug("Fetched results", {
        sportId,
        gmid,
        total: response.total,
      });
      return response.markets;
    } catch (error) {
      this.logger.error("getResults failed", {
        sportId,
        gmid,
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * GET /diamond-proxy/sidebar
   * Cache: 1 day
   */
  async getSidebarTree(): Promise<ExchangeTreeData | null> {
    try {
      const response = await this.client.get<GetSidebarTreeResponse>(
        "/diamond-proxy/sidebar",
      );
      if (!response.success || !response.data) return null;

      const totalSports = response.data.t1?.length ?? 0;
      this.logger.debug("Fetched sidebar tree", { totalSports });
      return response.data;
    } catch (error) {
      this.logger.error("getSidebarTree failed", {
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/top-events
   * Cache: 1 hour
   */
  async getTopEvents(): Promise<ExchangeTopEvent[]> {
    try {
      const response = await this.client.get<GetTopEventsResponse>(
        "/diamond-proxy/top-events",
      );
      if (!response.success || !response.data) return [];

      this.logger.debug("Fetched top events", {
        total: response.data.length,
      });
      return response.data;
    } catch (error) {
      this.logger.error("getTopEvents failed", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * GET /diamond-proxy/banner
   * Cache: 1 hour
   */
  async getBanners(): Promise<ExchangeBannerData | null> {
    try {
      const response = await this.client.get<GetWelcomeBannerResponse>(
        "/diamond-proxy/banner",
      );
      if (!response.status || !response.data) return null;
      return response.data;
    } catch (error) {
      this.logger.error("getBanners failed", {
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * POST /diamond-proxy/market
   * No cache — on demand
   */
  async postPriorityMarket(
    payload: ExchangePostMarketPayload,
  ): Promise<ExchangeTopEvent[] | null> {
    try {
      const response = await this.client.post<PostMarketResponse>(
        "/diamond-proxy/market",
        payload,
      );
      if (!response.success || !response.data) return null;

      this.logger.debug("Posted priority market", {
        gmid: payload.gmid,
        marketName: payload.marketName,
      });
      return response.data;
    } catch (error) {
      this.logger.error("postPriorityMarket failed", {
        gmid: payload.gmid,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * GET /diamond-proxy/virtual/tv?gmid={gmid}
   * Cache: 1× (cached once per unique key)
   */
  async getVirtualTv(gmid: string): Promise<string | null> {
    try {
      const response = await this.client.get<GetVirtualTvResponse>(
        "/diamond-proxy/virtual/tv",
        { gmid },
      );
      if (response.status && response.data) {
        return response.data.tv_url || null;
      }
      return null;
    } catch (error) {
      this.logger.error("getVirtualTv failed", {
        gmid,
        error: (error as Error).message,
      });
      return null;
    }
  }
}
