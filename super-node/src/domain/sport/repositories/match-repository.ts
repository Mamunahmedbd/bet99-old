/**
 * Repository Port — Match Repository
 * Domain layer defines the interface; infrastructure implements it.
 * This is the core of Dependency Inversion.
 */
import type { Match } from "../entities/match";
import type { SportType } from "@shared/constants";
import type { Result } from "@shared/types/result";

export interface MatchRepository {
  /** Find a match by its internal ID */
  findById(id: string): Promise<Result<Match | null>>;

  /** Find a match by external provider ID */
  findByExternalId(externalId: string): Promise<Result<Match | null>>;

  /** Get all live matches, optionally filtered by sport */
  findLive(sport?: SportType): Promise<Result<Match[]>>;

  /** Get all matches for a sport */
  findBySport(sport: SportType): Promise<Result<Match[]>>;

  /** Get matches by competition/event */
  findByCompetition(competition: string): Promise<Result<Match[]>>;

  /** Save or update a match */
  save(match: Match): Promise<Result<void>>;

  /** Bulk save/update */
  saveMany(matches: Match[]): Promise<Result<void>>;

  /** Remove a match */
  remove(id: string): Promise<Result<void>>;

  /** Get total count of active matches */
  countActive(): Promise<Result<number>>;
}
