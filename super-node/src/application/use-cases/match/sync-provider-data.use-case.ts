/**
 * Use Case — Sync Provider Data
 * Fetches data from an external provider and syncs it into the domain.
 * This is the write-side use case for data ingestion.
 */
import type { MatchRepository } from "@domain/sport/repositories/match-repository";
import type { MarketRepository } from "@domain/sport/repositories/market-repository";
import type {
  DataProvider,
  ProviderMatchData,
} from "@application/ports/data-provider";
import type { EventBus } from "@application/ports/event-bus";
import type { Logger } from "@application/ports/logger";
import { Match } from "@domain/sport/entities/match";
import { Market } from "@domain/sport/entities/market";
import { Score } from "@domain/sport/value-objects/score";
import { MatchStatus, MatchStatusType } from "@domain/sport/value-objects/match-status";
import { Odds } from "@domain/sport/value-objects/odds";
import { type Result, success, failure } from "@shared/types/result";
import { DomainErrors } from "@shared/errors/domain-errors";
import type { SportType } from "@shared/constants";

export interface SyncProviderDataInput {
  sport: SportType;
  providerName: string;
}

export interface SyncProviderDataOutput {
  matchesSynced: number;
  marketsSynced: number;
  errors: string[];
}

export class SyncProviderDataUseCase {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly marketRepository: MarketRepository,
    private readonly providers: Map<string, DataProvider>,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) { }

  async execute(
    input: SyncProviderDataInput,
  ): Promise<Result<SyncProviderDataOutput>> {
    const { sport, providerName } = input;
    const provider = this.providers.get(providerName);

    if (!provider) {
      return failure(
        DomainErrors.validation(`Unknown provider: ${providerName}`),
      );
    }

    const output: SyncProviderDataOutput = {
      matchesSynced: 0,
      marketsSynced: 0,
      errors: [],
    };

    try {
      // ── Fetch from provider ──
      const providerMatches = await provider.fetchLiveMatches(sport);

      this.logger.info("Fetched data from provider", {
        provider: providerName,
        sport,
        matchCount: providerMatches.length,
      });

      // ── Process each match ──
      for (const providerMatch of providerMatches) {
        try {
          await this.processMatch(providerMatch, providerName, sport);
          output.matchesSynced++;

          // ── Sync markets ──
          if (providerMatch.markets) {
            for (const market of providerMatch.markets) {
              await this.processMarket(
                market,
                providerMatch.externalId,
                providerName,
              );
              output.marketsSynced++;
            }
          }
        } catch (error) {
          const msg = `Failed to process match ${providerMatch.externalId}: ${error}`;
          output.errors.push(msg);
          this.logger.warn(msg, { error });
        }
      }

      this.logger.info("Provider sync completed", {
        provider: providerName,
        sport,
        ...output,
      });

      return success(output);
    } catch (error) {
      this.logger.error("Provider sync failed", {
        provider: providerName,
        sport,
        error,
      });
      return failure(
        DomainErrors.externalService(
          providerName,
          "Sync operation failed",
          error,
        ),
      );
    }
  }

  private async processMatch(
    data: ProviderMatchData,
    providerName: string,
    sport: SportType,
  ): Promise<void> {
    const existingResult = await this.matchRepository.findByExternalId(
      data.externalId,
    );

    const status = this.mapStatus(data.status);
    const score = data.score
      ? Score.create(data.score)
      : Score.zero();

    if (existingResult.ok && existingResult.value) {
      // ── Update existing match ──
      const match = existingResult.value;
      match.updateStatus(status);
      match.updateScore(score);

      // Dispatch domain events
      const events = match.clearDomainEvents();
      await this.eventBus.publishMany(events);

      await this.matchRepository.save(match);
    } else {
      // ── Create new match ──
      const match = Match.create({
        id: `${providerName}:${data.externalId}`,
        externalId: data.externalId,
        sport,
        provider: providerName as Match["provider"],
        competition: data.competition,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        startTime: new Date(data.startTime),
        venue: data.venue,
        metadata: data.metadata,
        status: MatchStatus.create(status),
        score,
      });

      await this.matchRepository.save(match);
    }
  }

  private async processMarket(
    data: { externalId: string; name: string; type: string; selections: Array<{ id: string; name: string; back: number; lay: number; isActive: boolean }>; isActive: boolean; metadata?: Record<string, unknown> },
    matchExternalId: string,
    providerName: string,
  ): Promise<void> {
    const market = Market.create({
      id: `${providerName}:${data.externalId}`,
      matchId: `${providerName}:${matchExternalId}`,
      externalId: data.externalId,
      name: data.name,
      type: data.type,
      selections: data.selections.map((s) => ({
        id: s.id,
        name: s.name,
        odds: Odds.create(s.back, s.lay),
        isActive: s.isActive,
      })),
      metadata: data.metadata,
    });

    await this.marketRepository.save(market);
  }

  private mapStatus(raw: string): MatchStatusType {
    const statusMap: Record<string, MatchStatusType> = {
      live: MatchStatusType.LIVE,
      in_play: MatchStatusType.IN_PLAY,
      not_started: MatchStatusType.NOT_STARTED,
      suspended: MatchStatusType.SUSPENDED,
      completed: MatchStatusType.COMPLETED,
      abandoned: MatchStatusType.ABANDONED,
      ball_running: MatchStatusType.BALL_RUNNING,
      postponed: MatchStatusType.POSTPONED,
    };
    return statusMap[raw.toLowerCase()] ?? MatchStatusType.NOT_STARTED;
  }
}
