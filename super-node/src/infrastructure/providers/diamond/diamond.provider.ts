/**
 * Diamond Data Provider
 *
 * Production-grade adapter implementing the DataProvider port for
 * the Diamond Sports API (TurnkeyXGaming).
 *
 * Features:
 * - Implements DataProvider interface (Clean Architecture port)
 * - Dual-URL "first response wins" HTTP pattern via DiamondHttpClient
 * - Response mapping via DiamondMapper (raw → canonical types)
 * - Structured logging with child logger context
 * - Sport-specific endpoints with Diamond sport ID resolution
 * - Virtual/custom match filtering
 * - Comprehensive error handling with graceful degradation
 *
 * Supported Sports:
 *   Cricket  (Diamond ID: 4)
 *   Football (Diamond ID: 1)
 *   Tennis   (Diamond ID: 2)
 *
 * API Endpoints Used:
 * ┌──────────────────────────────────────────────┬────────┬──────────┐
 * │ Endpoint                                     │ Method │ Polling  │
 * ├──────────────────────────────────────────────┼────────┼──────────┤
 * │ /sports/allSportid                           │ GET    │ 1x start │
 * │ /sports/esid?sid={id}                        │ GET    │ 1 min    │
 * │ /sports/esid/{gmid}                          │ GET    │ 1 sec    │
 * │ /sports/getDetailsData?sid={id}&gmid={gmid}  │ GET    │ 1x       │
 * │ /sports/betfairscorecardandtv                │ GET    │ on-call  │
 * │ /sports/posted-market-result                 │ GET    │ on-call  │
 * │ /sports/tree                                 │ GET    │ 1 day    │
 * │ /sports/topevents                            │ GET    │ 1 hour   │
 * │ /sports/welcomebanner                        │ GET    │ 1 hour   │
 * │ /sports/post-market                          │ POST   │ on-call  │
 * │ /sports/virtual/tvurl?gmid={gmid}            │ GET    │ on-call  │
 * └──────────────────────────────────────────────┴────────┴──────────┘
 */
import type { Logger } from "@application/ports/logger";
import type { SportType } from "@shared/constants";
import type {
  DataProvider,
  ProviderMatchData,
  ProviderMarketData,
} from "@application/ports/data-provider";
import { DiamondHttpClient } from "./diamond-http-client";
import type { DiamondClientConfig } from "./diamond-http-client";
import {
  mapMatchListResponse,
  mapMarketDetail,
  mapMatchDetail,
  sportTypeToId,
} from "./diamond-mapper";
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
  PostMarketPayload,
  PostMarketResponse,
  GetVirtualTvResponse,
  DiamondSport,
  DiamondTopEvent,
  DiamondBannerData,
  DiamondTreeData,
  DiamondMarketResult,
} from "./types";

// ─────────────────────────────────────────────────────────────────
// ── Provider Implementation ──
// ─────────────────────────────────────────────────────────────────

export class DiamondDataProvider implements DataProvider {
  readonly name = "diamond";

  private readonly client: DiamondHttpClient;
  private readonly logger: Logger;

  constructor(config: DiamondClientConfig, logger: Logger) {
    this.client = new DiamondHttpClient(config, logger);
    this.logger = logger.child({ provider: "diamond" });

    if (!config.apiKey) {
      this.logger.warn(
        "Diamond API key not configured — requests will fail",
      );
    }

    this.logger.info("Diamond provider initialized", {
      primaryUrl: config.baseUrl,
      secondaryUrl: config.secondaryUrl,
      timeout: config.requestTimeout,
      postTimeout: config.postTimeout,
    });
  }

  // ───────────────────────────────────────────────────────────────
  // ── DataProvider Interface Implementation ──
  // ───────────────────────────────────────────────────────────────

  /**
   * Fetch all live/upcoming matches for a specific sport.
   * Uses: GET /sports/esid?sid={sportId}
   * Polling: Every 1 minute
   */
  async fetchLiveMatches(sport: SportType): Promise<ProviderMatchData[]> {
    const sportId = sportTypeToId(sport);
    if (!sportId) {
      this.logger.warn("Unsupported sport for Diamond provider", {
        sport,
      });
      return [];
    }

    try {
      const response = await this.client.get<GetMatchListResponse>(
        `/sports/esid?sid=${sportId}`,
      );

      if (!response.success || !response.data) {
        this.logger.warn("Diamond returned unsuccessful match list", {
          sport,
          msg: response.msg,
        });
        return [];
      }

      const matches = mapMatchListResponse(response.data);

      this.logger.debug("Fetched live matches", {
        sport,
        sportId,
        total: matches.length,
      });

      return matches;
    } catch (error) {
      this.logger.error("Failed to fetch live matches", {
        sport,
        sportId,
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Fetch detailed data for a specific match.
   * Uses: GET /sports/getDetailsData?sid={sportId}&gmid={gmid}
   * Polling: 1x (on demand)
   */
  async fetchMatch(
    externalId: string,
    sportId?: number,
  ): Promise<ProviderMatchData | null> {
    try {
      // If sportId not provided, try all supported sports
      const sids = sportId ? [sportId] : [4, 1, 2];

      for (const sid of sids) {
        try {
          const response = await this.client.get<GetMatchDetailResponse>(
            `/sports/getDetailsData?sid=${sid}&gmid=${externalId}`,
          );

          if (
            response.success &&
            response.data &&
            response.data.length > 0
          ) {
            const detail = response.data[0];
            const mapped = mapMatchDetail(detail);

            if (mapped) {
              this.logger.debug("Fetched match detail", {
                externalId,
                sportId: sid,
                ename: detail.ename,
              });
              return mapped;
            }
          }
        } catch {
          // Try next sport ID
          continue;
        }
      }

      this.logger.debug("Match not found", { externalId });
      return null;
    } catch (error) {
      this.logger.error("Failed to fetch match", {
        externalId,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Fetch all markets (odds/fancy/bookmaker) for a match.
   * Uses: GET /sports/esid/{gmid}
   * Polling: Every 1 second (high-frequency endpoint)
   */
  async fetchMarkets(matchExternalId: string): Promise<ProviderMarketData[]> {
    try {
      const response = await this.client.get<GetMatchOddsResponse>(
        `/sports/esid/${matchExternalId}`,
      );

      if (!response.success || !response.data) {
        this.logger.debug("No markets returned", {
          gmid: matchExternalId,
        });
        return [];
      }

      const markets = Array.isArray(response.data)
        ? response.data
        : [];

      const mapped = markets.map(mapMarketDetail);

      this.logger.debug("Fetched markets", {
        gmid: matchExternalId,
        total: mapped.length,
        types: mapped.map((m) => m.type),
      });

      return mapped;
    } catch (error) {
      this.logger.error("Failed to fetch markets", {
        gmid: matchExternalId,
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Health check — verifies Diamond API is reachable.
   */
  async healthCheck(): Promise<boolean> {
    try {
      const healthy = await this.client.healthCheck();
      this.logger.debug("Health check result", { healthy });
      return healthy;
    } catch {
      return false;
    }
  }

  // ───────────────────────────────────────────────────────────────
  // ── Extended Diamond-Specific API Methods ──
  // ── (Beyond the DataProvider interface)
  // ───────────────────────────────────────────────────────────────

  /**
   * Get all available sports.
   * Uses: GET /sports/allSportid
   * Polling: 1x at startup
   */
  async getAllSports(): Promise<DiamondSport[]> {
    try {
      const response = await this.client.get<GetAllSportsResponse>(
        "/sports/allSportid",
      );

      if (!response.success || !response.data) return [];

      this.logger.debug("Fetched all sports", {
        total: response.data.length,
        active: response.data.filter((s) => s.active).length,
      });

      return response.data;
    } catch (error) {
      this.logger.error("Failed to get all sports", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get live TV and scorecard URLs for a match.
   * Uses: GET /sports/betfairscorecardandtv
   * Polling: On user call
   */
  async getScoreAndTv(
    gmid: string,
    sportId = 4,
  ): Promise<{ scoreUrl: string | null; tvUrl: string | null } | null> {
    try {
      const response = await this.client.get<GetScoreTvResponse>(
        `/sports/betfairscorecardandtv?diamondeventid=${gmid}&diamondsportsid=${sportId}`,
      );

      if (response.status && response.data) {
        return {
          scoreUrl: response.data.diamond_score_one || null,
          tvUrl: response.data.diamond_tv_one || null,
        };
      }

      return null;
    } catch (error) {
      this.logger.error("Failed to get score/TV", {
        gmid,
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Get settled market results for a match.
   * Uses: GET /sports/posted-market-result
   * Polling: On demand
   */
  async getMarketResults(
    sportId: number,
    gmid: string,
  ): Promise<DiamondMarketResult[]> {
    try {
      const response = await this.client.get<GetMarketResultsResponse>(
        `/sports/posted-market-result?sportsid=${sportId}&gmid=${gmid}`,
      );

      if (!response.success || !response.markets) return [];

      this.logger.debug("Fetched market results", {
        gmid,
        total: response.total,
        settled: response.markets.filter((m) => m.status === "SETTLE")
          .length,
      });

      return response.markets;
    } catch (error) {
      this.logger.error("Failed to get market results", {
        gmid,
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get the full sidebar navigation tree.
   * Uses: GET /sports/tree
   * Polling: Every 1 day
   */
  async getSidebarTree(): Promise<DiamondTreeData | null> {
    try {
      const response =
        await this.client.get<GetSidebarTreeResponse>("/sports/tree");

      if (!response.success || !response.data) return null;

      const totalSports = response.data.t1?.length ?? 0;
      this.logger.debug("Fetched sidebar tree", { totalSports });

      return response.data;
    } catch (error) {
      this.logger.error("Failed to get sidebar tree", {
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Get top/promoted events.
   * Uses: GET /sports/topevents
   * Polling: Every 1 hour
   */
  async getTopEvents(): Promise<DiamondTopEvent[]> {
    try {
      const response = await this.client.get<GetTopEventsResponse>(
        "/sports/topevents",
      );

      if (!response.success || !response.data) return [];

      this.logger.debug("Fetched top events", {
        total: response.data.length,
      });

      return response.data;
    } catch (error) {
      this.logger.error("Failed to get top events", {
        error: (error as Error).message,
      });
      return [];
    }
  }

  /**
   * Get welcome/promotional banners.
   * Uses: GET /sports/welcomebanner
   * Polling: Every 1 hour
   */
  async getWelcomeBanners(): Promise<DiamondBannerData | null> {
    try {
      const response = await this.client.get<GetWelcomeBannerResponse>(
        "/sports/welcomebanner",
      );

      if (!response.status || !response.data) return null;

      return response.data;
    } catch (error) {
      this.logger.error("Failed to get welcome banners", {
        error: (error as Error).message,
      });
      return null;
    }
  }

  /**
   * Post a priority market.
   * Uses: POST /sports/post-market
   */
  async postPriorityMarket(payload: PostMarketPayload): Promise<boolean> {
    try {
      const response = await this.client.post<PostMarketResponse>(
        "/sports/post-market",
        payload,
      );

      const success = response.success;
      this.logger.debug("Posted priority market", {
        gmid: payload.gmid,
        marketName: payload.marketName,
        success,
      });

      return success;
    } catch (error) {
      this.logger.error("Failed to post priority market", {
        gmid: payload.gmid,
        error: (error as Error).message,
      });
      return false;
    }
  }

  /**
   * Get virtual cricket stream TV URL.
   * Uses: GET /sports/virtual/tvurl?gmid={gmid}
   * Polling: On user call
   */
  async getVirtualTvUrl(gmid: string): Promise<string | null> {
    try {
      const response = await this.client.get<GetVirtualTvResponse>(
        `/sports/virtual/tvurl?gmid=${gmid}`,
      );

      if (response.status && response.data) {
        return response.data.tv_url || null;
      }

      return null;
    } catch (error) {
      this.logger.error("Failed to get virtual TV URL", {
        gmid,
        error: (error as Error).message,
      });
      return null;
    }
  }
}
