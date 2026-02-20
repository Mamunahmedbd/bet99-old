/**
 * Infrastructure — Betfair Data Provider Adapter
 * Implements the DataProvider port for the Betfair API.
 * This is a skeleton — fill in the actual API endpoints.
 */
import type {
  DataProvider,
  ProviderMatchData,
  ProviderMarketData,
} from "@application/ports/data-provider";
import type { Logger } from "@application/ports/logger";
import { HttpClient } from "@infrastructure/http/http-client";
import type { SportType } from "@shared/constants";

export class BetfairDataProvider implements DataProvider {
  readonly name = "betfair";
  private readonly client: HttpClient;
  private readonly logger: Logger;

  constructor(baseUrl: string, logger: Logger) {
    this.client = new HttpClient(
      {
        baseUrl,
        timeout: 15_000,
        retries: 3,
      },
      logger,
    );
    this.logger = logger.child({ provider: "betfair" });
  }

  async fetchLiveMatches(sport: SportType): Promise<ProviderMatchData[]> {
    try {
      const data = await this.client.get<ProviderMatchData[]>(
        `/api/live/${sport}`,
      );
      this.logger.debug("Fetched live matches from Betfair", {
        sport,
        count: data.length,
      });
      return data;
    } catch (error) {
      this.logger.error("Failed to fetch live matches from Betfair", {
        sport,
        error,
      });
      return [];
    }
  }

  async fetchMatch(externalId: string): Promise<ProviderMatchData | null> {
    try {
      return await this.client.get<ProviderMatchData>(
        `/api/match/${externalId}`,
      );
    } catch (error) {
      this.logger.error("Failed to fetch match from Betfair", {
        externalId,
        error,
      });
      return null;
    }
  }

  async fetchMarkets(matchExternalId: string): Promise<ProviderMarketData[]> {
    try {
      return await this.client.get<ProviderMarketData[]>(
        `/api/markets/${matchExternalId}`,
      );
    } catch (error) {
      this.logger.error("Failed to fetch markets from Betfair", {
        matchExternalId,
        error,
      });
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/api/health");
      return true;
    } catch {
      return false;
    }
  }
}
