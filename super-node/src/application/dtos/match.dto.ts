/**
 * DTOs — Match Data Transfer Objects
 * Used at application/presentation boundary.
 * Decouples domain shape from API response shape.
 */
import type { SportType, ProviderType } from "@shared/constants";

// ── Response DTOs ──

export interface MatchResponseDTO {
  id: string;
  externalId: string;
  sport: SportType;
  provider: ProviderType;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  status: string;
  score: {
    home: number;
    away: number;
    innings?: number;
    overs?: string;
    sets?: number[];
    period?: string;
  };
  venue?: string;
  isLive: boolean;
  metadata?: Record<string, unknown>;
}

export interface MatchListResponseDTO {
  matches: MatchResponseDTO[];
  total: number;
  sport?: SportType;
  timestamp: string;
}

export interface MarketResponseDTO {
  id: string;
  matchId: string;
  externalId: string;
  name: string;
  type: string;
  selections: Array<{
    id: string;
    name: string;
    odds: { back: number; lay: number };
    isActive: boolean;
  }>;
  isActive: boolean;
  isSuspended: boolean;
}

export interface MatchDetailResponseDTO {
  match: MatchResponseDTO;
  markets: MarketResponseDTO[];
}

// ── Query DTOs ──

export interface GetMatchesQueryDTO {
  sport?: SportType;
  competition?: string;
  liveOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface GetMatchByIdQueryDTO {
  id: string;
}
