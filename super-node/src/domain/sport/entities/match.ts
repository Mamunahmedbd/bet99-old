/**
 * Entity — Match (Aggregate Root)
 * Central domain entity representing a sports match.
 * Owns its markets, scores, and status lifecycle.
 */
import { AggregateRoot, createDomainEvent } from "@domain/common";
import type { SportType, ProviderType } from "@shared/constants";
import { MatchStatus, MatchStatusType } from "../value-objects/match-status";
import { Score } from "../value-objects/score";

export interface MatchProps {
  id: string;
  externalId: string;
  sport: SportType;
  provider: ProviderType;
  competition: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  status: MatchStatus;
  score: Score;
  venue?: string;
  metadata?: Record<string, unknown>;
}

export class Match extends AggregateRoot<string> {
  public readonly externalId: string;
  public readonly sport: SportType;
  public readonly provider: ProviderType;
  public readonly competition: string;
  public readonly homeTeam: string;
  public readonly awayTeam: string;
  public readonly startTime: Date;
  public readonly venue?: string;
  public readonly metadata?: Record<string, unknown>;

  private _status: MatchStatus;
  private _score: Score;

  constructor(props: MatchProps) {
    super(props.id);
    this.externalId = props.externalId;
    this.sport = props.sport;
    this.provider = props.provider;
    this.competition = props.competition;
    this.homeTeam = props.homeTeam;
    this.awayTeam = props.awayTeam;
    this.startTime = props.startTime;
    this.venue = props.venue;
    this.metadata = props.metadata;
    this._status = props.status;
    this._score = props.score;
  }

  // ── Getters ──

  get status(): MatchStatus {
    return this._status;
  }

  get score(): Score {
    return this._score;
  }

  get displayName(): string {
    return `${this.homeTeam} vs ${this.awayTeam}`;
  }

  get isLive(): boolean {
    return this._status.isLive;
  }

  // ── Domain Behaviors ──

  updateStatus(newStatus: MatchStatusType, reason?: string): void {
    const oldStatus = this._status.status;
    this._status = MatchStatus.create(newStatus, reason);
    this.touch();

    this.addDomainEvent(
      createDomainEvent("MatchStatusChanged", this.id, {
        from: oldStatus,
        to: newStatus,
        reason,
      }),
    );
  }

  updateScore(score: Score): void {
    this._score = score;
    this.touch();

    this.addDomainEvent(
      createDomainEvent("MatchScoreUpdated", this.id, {
        home: score.home,
        away: score.away,
      }),
    );
  }

  suspend(reason: string): void {
    this.updateStatus(MatchStatusType.SUSPENDED, reason);
  }

  goLive(): void {
    this.updateStatus(MatchStatusType.LIVE);
  }

  complete(): void {
    this.updateStatus(MatchStatusType.COMPLETED);
  }

  // ── Factory ──

  static create(props: Omit<MatchProps, "status" | "score"> & Partial<Pick<MatchProps, "status" | "score">>): Match {
    return new Match({
      ...props,
      status: props.status ?? MatchStatus.notStarted(),
      score: props.score ?? Score.zero(),
    });
  }

  // ── Serialization ──

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      externalId: this.externalId,
      sport: this.sport,
      provider: this.provider,
      competition: this.competition,
      homeTeam: this.homeTeam,
      awayTeam: this.awayTeam,
      startTime: this.startTime.toISOString(),
      status: this.status.status,
      score: this.score.toJSON(),
      venue: this.venue,
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
