/**
 * Infrastructure — Sportradar Data Provider Adapter
 * Implements the DataProvider port for Sportradar API.
 */
import type {
  DataProvider,
  ProviderMatchData,
  ProviderMarketData,
} from "@application/ports/data-provider";
import type { Logger } from "@application/ports/logger";
import { HttpClient } from "@infrastructure/http/http-client";
import type { SportType } from "@shared/constants";

export class SportradarDataProvider implements DataProvider {
  readonly name = "sportradar";
  private readonly client: HttpClient;
  private readonly logger: Logger;

  constructor(baseUrl: string, apiKey: string, logger: Logger) {
    this.client = new HttpClient(
      {
        baseUrl,
        timeout: 15_000,
        retries: 3,
        headers: { "x-api-key": apiKey },
      },
      logger,
    );
    this.logger = logger.child({ provider: "sportradar" });
  }

  async fetchLiveMatches(sport: SportType): Promise<ProviderMatchData[]> {
    try {
      const data = await this.client.get<ProviderMatchData[]>(
        `/v1/live/${sport}/matches`,
      );
      this.logger.debug("Fetched live matches from Sportradar", {
        sport,
        count: data.length,
      });
      return data;
    } catch (error) {
      this.logger.error("Failed to fetch live matches from Sportradar", {
        sport,
        error,
      });
      return [];
    }
  }

  async fetchMatch(externalId: string): Promise<ProviderMatchData | null> {
    try {
      return await this.client.get<ProviderMatchData>(
        `/v1/match/${externalId}`,
      );
    } catch (error) {
      this.logger.error("Failed to fetch match from Sportradar", {
        externalId,
        error,
      });
      return null;
    }
  }

  async fetchMarkets(
    matchExternalId: string,
  ): Promise<ProviderMarketData[]> {
    try {
      return await this.client.get<ProviderMarketData[]>(
        `/v1/match/${matchExternalId}/markets`,
      );
    } catch (error) {
      this.logger.error("Failed to fetch markets from Sportradar", {
        matchExternalId,
        error,
      });
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get("/v1/health");
      return true;
    } catch {
      return false;
    }
  }
}
