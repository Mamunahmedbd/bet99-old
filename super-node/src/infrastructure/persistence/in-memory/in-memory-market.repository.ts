/**
 * Infrastructure — In-Memory Market Repository
 */
import type { MarketRepository } from "@domain/sport/repositories/market-repository";
import type { Market } from "@domain/sport/entities/market";
import { type Result, success, failure } from "@shared/types/result";
import { DomainErrors } from "@shared/errors/domain-errors";

export class InMemoryMarketRepository implements MarketRepository {
  private readonly store = new Map<string, Market>();

  async findById(id: string): Promise<Result<Market | null>> {
    try {
      return success(this.store.get(id) ?? null);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to find market", error));
    }
  }

  async findByMatchId(matchId: string): Promise<Result<Market[]>> {
    try {
      const markets = Array.from(this.store.values()).filter(
        (m) => m.matchId === matchId,
      );
      return success(markets);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to find markets by match", error),
      );
    }
  }

  async findByExternalId(externalId: string): Promise<Result<Market | null>> {
    try {
      const market = Array.from(this.store.values()).find(
        (m) => m.externalId === externalId,
      );
      return success(market ?? null);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to find market by external ID", error),
      );
    }
  }

  async save(market: Market): Promise<Result<void>> {
    try {
      this.store.set(market.id, market);
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to save market", error));
    }
  }

  async saveMany(markets: Market[]): Promise<Result<void>> {
    try {
      for (const market of markets) {
        this.store.set(market.id, market);
      }
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to save markets", error));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      this.store.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to remove market", error));
    }
  }

  async removeByMatchId(matchId: string): Promise<Result<void>> {
    try {
      const toRemove = Array.from(this.store.entries())
        .filter(([_, m]) => m.matchId === matchId)
        .map(([k]) => k);
      for (const key of toRemove) {
        this.store.delete(key);
      }
      return success(undefined);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to remove markets by match", error),
      );
    }
  }
}
