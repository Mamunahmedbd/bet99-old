/**
 * Mapper — Match Mapper
 * Transforms between domain entities and DTOs.
 * Single Responsibility: only does shape conversion.
 */
import type { Match } from "@domain/sport/entities/match";
import type { Market } from "@domain/sport/entities/market";
import type {
  MatchResponseDTO,
  MatchListResponseDTO,
  MarketResponseDTO,
  MatchDetailResponseDTO,
} from "../dtos/match.dto";

export class MatchMapper {
  static toResponseDTO(match: Match): MatchResponseDTO {
    return {
      id: match.id,
      externalId: match.externalId,
      sport: match.sport,
      provider: match.provider,
      competition: match.competition,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      startTime: match.startTime.toISOString(),
      status: match.status.status,
      score: match.score.toJSON(),
      venue: match.venue,
      isLive: match.isLive,
      metadata: match.metadata,
    };
  }

  static toListResponseDTO(
    matches: Match[],
    sport?: string,
  ): MatchListResponseDTO {
    return {
      matches: matches.map(MatchMapper.toResponseDTO),
      total: matches.length,
      sport: sport as MatchListResponseDTO["sport"],
      timestamp: new Date().toISOString(),
    };
  }

  static toMarketResponseDTO(market: Market): MarketResponseDTO {
    return {
      id: market.id,
      matchId: market.matchId,
      externalId: market.externalId,
      name: market.name,
      type: market.type,
      selections: market.selections.map((s) => ({
        id: s.id,
        name: s.name,
        odds: { back: s.odds.back, lay: s.odds.lay },
        isActive: s.isActive,
      })),
      isActive: market.isActive,
      isSuspended: market.isSuspended,
    };
  }

  static toDetailResponseDTO(
    match: Match,
    markets: Market[],
  ): MatchDetailResponseDTO {
    return {
      match: MatchMapper.toResponseDTO(match),
      markets: markets.map(MatchMapper.toMarketResponseDTO),
    };
  }
}
