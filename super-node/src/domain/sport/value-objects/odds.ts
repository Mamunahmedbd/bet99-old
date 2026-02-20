/**
 * Value Object — Odds
 * Represents a set of odds for a selection (back/lay).
 */
import { ValueObject } from "@domain/common";

interface OddsProps {
  readonly back: number;
  readonly lay: number;
  readonly lastUpdated: Date;
}

export class Odds extends ValueObject<OddsProps> {
  get back(): number {
    return this.props.back;
  }
  get lay(): number {
    return this.props.lay;
  }
  get lastUpdated(): Date {
    return this.props.lastUpdated;
  }

  get spread(): number {
    return Math.abs(this.props.lay - this.props.back);
  }

  get isValid(): boolean {
    return this.props.back > 0 && this.props.lay > 0;
  }

  static create(back: number, lay: number): Odds {
    return new Odds({ back, lay, lastUpdated: new Date() });
  }

  static empty(): Odds {
    return new Odds({ back: 0, lay: 0, lastUpdated: new Date() });
  }
}
