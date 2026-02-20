/**
 * Infrastructure — In-Memory Match Repository
 * Initial implementation using Map storage.
 * Swap to database implementation by implementing the same port.
 */
import type { MatchRepository } from "@domain/sport/repositories/match-repository";
import type { Match } from "@domain/sport/entities/match";
import type { SportType } from "@shared/constants";
import { type Result, success, failure } from "@shared/types/result";
import { DomainErrors } from "@shared/errors/domain-errors";

export class InMemoryMatchRepository implements MatchRepository {
  private readonly store = new Map<string, Match>();

  async findById(id: string): Promise<Result<Match | null>> {
    try {
      return success(this.store.get(id) ?? null);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to find match by ID", error));
    }
  }

  async findByExternalId(externalId: string): Promise<Result<Match | null>> {
    try {
      const match = Array.from(this.store.values()).find(
        (m) => m.externalId === externalId,
      );
      return success(match ?? null);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to find match by external ID", error),
      );
    }
  }

  async findLive(sport?: SportType): Promise<Result<Match[]>> {
    try {
      const matches = Array.from(this.store.values()).filter((m) => {
        const isLive = m.isLive;
        const matchesSport = !sport || m.sport === sport;
        return isLive && matchesSport;
      });
      return success(matches);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to find live matches", error),
      );
    }
  }

  async findBySport(sport: SportType): Promise<Result<Match[]>> {
    try {
      const matches = Array.from(this.store.values()).filter(
        (m) => m.sport === sport,
      );
      return success(matches);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to find matches by sport", error),
      );
    }
  }

  async findByCompetition(competition: string): Promise<Result<Match[]>> {
    try {
      const matches = Array.from(this.store.values()).filter(
        (m) => m.competition === competition,
      );
      return success(matches);
    } catch (error) {
      return failure(
        DomainErrors.internal(
          "Failed to find matches by competition",
          error,
        ),
      );
    }
  }

  async save(match: Match): Promise<Result<void>> {
    try {
      this.store.set(match.id, match);
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to save match", error));
    }
  }

  async saveMany(matches: Match[]): Promise<Result<void>> {
    try {
      for (const match of matches) {
        this.store.set(match.id, match);
      }
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to save matches", error));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      this.store.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(DomainErrors.internal("Failed to remove match", error));
    }
  }

  async countActive(): Promise<Result<number>> {
    try {
      const count = Array.from(this.store.values()).filter(
        (m) => m.status.isActive,
      ).length;
      return success(count);
    } catch (error) {
      return failure(
        DomainErrors.internal("Failed to count active matches", error),
      );
    }
  }
}
