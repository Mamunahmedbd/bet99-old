/**
 * Use Case — Get Match Detail
 *
 * Fetches a single match with its markets.
 * After successful retrieval, marks the match as "hot" in Redis
 * so the background scheduler polls its odds every 1 second.
 */
import type { MatchRepository } from "@domain/sport/repositories/match-repository";
import type { MarketRepository } from "@domain/sport/repositories/market-repository";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";
import type { MatchDetailResponseDTO } from "@application/dtos/match.dto";
import { MatchMapper } from "@application/mappers/match.mapper";
import { type Result, success, failure } from "@shared/types/result";
import { DomainErrors } from "@shared/errors/domain-errors";
import { CACHE_TTL } from "@shared/constants";

export interface GetMatchDetailInput {
  matchId: string;
}

/** Minimal contract for signaling match interest */
export interface MatchHotMarker {
  markMatchHot(matchId: string): Promise<void>;
}

export class GetMatchDetailUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly marketRepository: MarketRepository,
    private readonly cache: CacheService,
    private readonly hotMarker: MatchHotMarker,
    private readonly logger: Logger,
  ) { }

  async execute(
    input: GetMatchDetailInput,
  ): Promise<Result<MatchDetailResponseDTO>> {
    const { matchId } = input;
    const cacheKey = `match_detail:${matchId}`;

    try {
      // ── Cache check ──
      const cached = await this.cache.get<MatchDetailResponseDTO>(cacheKey);
      if (cached) {
        // Renew hot status even on cache hit — user is still watching
        this.hotMarker.markMatchHot(matchId).catch(() => { });
        return success(cached);
      }

      // ── Fetch match ──
      const matchResult = await this.matchRepository.findById(matchId);
      if (!matchResult.ok) {
        return failure(matchResult.error);
      }
      if (!matchResult.value) {
        return failure(DomainErrors.notFound("Match", matchId));
      }

      // ── Fetch markets ──
      const marketsResult =
        await this.marketRepository.findByMatchId(matchId);
      if (!marketsResult.ok) {
        this.logger.warn("Failed to fetch markets for match", {
          matchId,
          error: marketsResult.error,
        });
        const dto = MatchMapper.toDetailResponseDTO(matchResult.value, []);
        return success(dto);
      }

      const dto = MatchMapper.toDetailResponseDTO(
        matchResult.value,
        marketsResult.value,
      );

      // ── Cache ──
      const ttl = matchResult.value.isLive
        ? CACHE_TTL.MARKET_DATA
        : CACHE_TTL.EVENT_DETAIL;
      await this.cache.set(cacheKey, dto, ttl);

      // ── Mark hot ONLY after successful retrieval ──
      // This ensures only valid match IDs get polled
      this.hotMarker.markMatchHot(matchId).catch(() => { });

      return success(dto);
    } catch (error) {
      this.logger.error("Unexpected error in GetMatchDetailUseCase", {
        error,
        matchId,
      });
      return failure(
        DomainErrors.internal("Failed to fetch match detail", error),
      );
    }
  }
}
