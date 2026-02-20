/**
 * Repository Port — Market Repository
 */
import type { Market } from "../entities/market";
import type { Result } from "@shared/types/result";

export interface MarketRepository {
  findById(id: string): Promise<Result<Market | null>>;
  findByMatchId(matchId: string): Promise<Result<Market[]>>;
  findByExternalId(externalId: string): Promise<Result<Market | null>>;
  save(market: Market): Promise<Result<void>>;
  saveMany(markets: Market[]): Promise<Result<void>>;
  remove(id: string): Promise<Result<void>>;
  removeByMatchId(matchId: string): Promise<Result<void>>;
}
