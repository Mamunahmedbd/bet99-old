/**
 * Entity — Event
 * Represents a sports event / competition containing multiple matches.
 */
import { Entity } from "@domain/common";
import type { SportType } from "@shared/constants";

export interface EventProps {
  id: string;
  externalId: string;
  sport: SportType;
  name: string;
  competition: string;
  country?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  matchCount: number;
  metadata?: Record<string, unknown>;
}

export class SportEvent extends Entity<string> {
  public readonly externalId: string;
  public readonly sport: SportType;
  public readonly name: string;
  public readonly competition: string;
  public readonly country?: string;
  public readonly startDate: Date;
  public readonly endDate?: Date;
  public readonly metadata?: Record<string, unknown>;

  private _isActive: boolean;
  private _matchCount: number;

  constructor(props: EventProps) {
    super(props.id);
    this.externalId = props.externalId;
    this.sport = props.sport;
    this.name = props.name;
    this.competition = props.competition;
    this.country = props.country;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.metadata = props.metadata;
    this._isActive = props.isActive;
    this._matchCount = props.matchCount;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get matchCount(): number {
    return this._matchCount;
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  updateMatchCount(count: number): void {
    this._matchCount = count;
    this.touch();
  }

  static create(
    props: Omit<EventProps, "isActive" | "matchCount"> &
      Partial<Pick<EventProps, "isActive" | "matchCount">>,
  ): SportEvent {
    return new SportEvent({
      ...props,
      isActive: props.isActive ?? true,
      matchCount: props.matchCount ?? 0,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      externalId: this.externalId,
      sport: this.sport,
      name: this.name,
      competition: this.competition,
      country: this.country,
      startDate: this.startDate.toISOString(),
      endDate: this.endDate?.toISOString(),
      isActive: this._isActive,
      matchCount: this._matchCount,
      metadata: this.metadata,
    };
  }
}
