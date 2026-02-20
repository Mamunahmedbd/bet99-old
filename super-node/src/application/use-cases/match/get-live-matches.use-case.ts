/**
 * Use Case — Get Live Matches
 * Orchestrates fetching live matches with caching.
 * This is the canonical use case pattern:
 *   1. Depends only on ports (interfaces)
 *   2. Returns Result<DTO> — never throws
 *   3. Stateless — all state comes from injected dependencies
 */
import type { MatchRepository } from "@domain/sport/repositories";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";
import type { MatchListResponseDTO } from "@application/dtos/match.dto";
import { MatchMapper } from "@application/mappers/match.mapper";
import { type Result, success, failure } from "@shared/types/result";
import { DomainErrors } from "@shared/errors/domain-errors";
import { CACHE_TTL, type SportType } from "@shared/constants";

export interface GetLiveMatchesInput {
  sport?: SportType;
}

export class GetLiveMatchesUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly cache: CacheService,
    private readonly logger: Logger,
  ) { }

  async execute(
    input: GetLiveMatchesInput,
  ): Promise<Result<MatchListResponseDTO>> {
    const { sport } = input;
    const cacheKey = `live_matches:${sport ?? "all"}`;

    try {
      // ── getOrSet with stampede protection ──
      // The factory callback is the ACTUAL data retrieval.
      // If 1,000 users hit at once after cache expiry:
      //   → 999 get stale data instantly
      //   → 1 triggers this factory (coalesced)
      const dto = await this.cache.getOrSet<MatchListResponseDTO>(
        cacheKey,
        async () => {
          const result = await this.matchRepository.findLive(sport);
          if (!result.ok) {
            throw new Error(result.error.message);
          }

          this.logger.info("Fetched live matches from repository", {
            sport,
            count: result.value.length,
          });

          return MatchMapper.toListResponseDTO(result.value, sport);
        },
        CACHE_TTL.LIVE_ODDS,
      );

      return success(dto);
    } catch (error) {
      this.logger.error("Unexpected error in GetLiveMatchesUseCase", {
        error,
      });
      return failure(
        DomainErrors.internal("Failed to fetch live matches", error),
      );
    }
  }
}
