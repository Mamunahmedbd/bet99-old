/**
 * Entity — Market
 * Represents a betting market within a match (e.g., Match Odds, Over/Under).
 * Contains selections with their current odds.
 */
import { Entity } from "@domain/common";
import { Odds } from "../value-objects/odds";

export interface SelectionData {
  readonly id: string;
  readonly name: string;
  readonly odds: Odds;
  readonly isActive: boolean;
}

export interface MarketProps {
  id: string;
  matchId: string;
  externalId: string;
  name: string;
  type: string;
  selections: SelectionData[];
  isActive: boolean;
  isSuspended: boolean;
  metadata?: Record<string, unknown>;
}

export class Market extends Entity<string> {
  public readonly matchId: string;
  public readonly externalId: string;
  public readonly name: string;
  public readonly type: string;
  public readonly metadata?: Record<string, unknown>;

  private _selections: SelectionData[];
  private _isActive: boolean;
  private _isSuspended: boolean;

  constructor(props: MarketProps) {
    super(props.id);
    this.matchId = props.matchId;
    this.externalId = props.externalId;
    this.name = props.name;
    this.type = props.type;
    this.metadata = props.metadata;
    this._selections = [...props.selections];
    this._isActive = props.isActive;
    this._isSuspended = props.isSuspended;
  }

  // ── Getters ──

  get selections(): ReadonlyArray<SelectionData> {
    return this._selections;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get isSuspended(): boolean {
    return this._isSuspended;
  }

  get isBettable(): boolean {
    return this._isActive && !this._isSuspended;
  }

  // ── Behaviors ──

  updateSelections(selections: SelectionData[]): void {
    this._selections = [...selections];
    this.touch();
  }

  updateOddsForSelection(selectionId: string, odds: Odds): void {
    this._selections = this._selections.map((s) =>
      s.id === selectionId ? { ...s, odds } : s,
    );
    this.touch();
  }

  suspend(): void {
    this._isSuspended = true;
    this.touch();
  }

  resume(): void {
    this._isSuspended = false;
    this.touch();
  }

  deactivate(): void {
    this._isActive = false;
    this.touch();
  }

  // ── Factory ──

  static create(
    props: Omit<MarketProps, "isActive" | "isSuspended"> &
      Partial<Pick<MarketProps, "isActive" | "isSuspended">>,
  ): Market {
    return new Market({
      ...props,
      isActive: props.isActive ?? true,
      isSuspended: props.isSuspended ?? false,
    });
  }

  // ── Serialization ──

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      matchId: this.matchId,
      externalId: this.externalId,
      name: this.name,
      type: this.type,
      selections: this._selections.map((s) => ({
        id: s.id,
        name: s.name,
        odds: { back: s.odds.back, lay: s.odds.lay },
        isActive: s.isActive,
      })),
      isActive: this._isActive,
      isSuspended: this._isSuspended,
      metadata: this.metadata,
    };
  }
}
