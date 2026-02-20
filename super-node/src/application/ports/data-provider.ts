/**
 * Port — Data Provider
 * Generic interface for external data providers (Betfair, Sportradar, etc.)
 * Adapters in infrastructure implement this for each provider.
 */
import type { SportType } from "@shared/constants";

export interface ProviderMatchData {
  externalId: string;
  sport: SportType;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
  venue?: string;
  score?: {
    home: number;
    away: number;
    innings?: number;
    overs?: string;
    sets?: number[];
    period?: string;
  };
  odds?: Record<
    string,
    {
      back: number;
      lay: number;
    }
  >;
  markets?: ProviderMarketData[];
  metadata?: Record<string, unknown>;
}

export interface ProviderMarketData {
  externalId: string;
  name: string;
  type: string;
  selections: Array<{
    id: string;
    name: string;
    back: number;
    lay: number;
    isActive: boolean;
  }>;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface DataProvider {
  readonly name: string;

  /** Fetch all live matches for a sport */
  fetchLiveMatches(sport: SportType): Promise<ProviderMatchData[]>;

  /** Fetch specific match data */
  fetchMatch(externalId: string): Promise<ProviderMatchData | null>;

  /** Fetch markets for a match */
  fetchMarkets(matchExternalId: string): Promise<ProviderMarketData[]>;

  /** Health check for the provider */
  healthCheck(): Promise<boolean>;
}
