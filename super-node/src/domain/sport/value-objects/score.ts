/**
 * Value Object — Score
 * Represents the current live score for a match.
 */
import { ValueObject } from "@domain/common";

interface ScoreProps {
  readonly home: number;
  readonly away: number;
  readonly innings?: number;
  readonly overs?: string;
  readonly sets?: number[];
  readonly period?: string;
}

export class Score extends ValueObject<ScoreProps> {
  get home(): number {
    return this.props.home;
  }
  get away(): number {
    return this.props.away;
  }
  get innings(): number | undefined {
    return this.props.innings;
  }
  get overs(): string | undefined {
    return this.props.overs;
  }
  get sets(): number[] | undefined {
    return this.props.sets;
  }
  get period(): string | undefined {
    return this.props.period;
  }

  get summary(): string {
    return `${this.home} - ${this.away}`;
  }

  static create(props: ScoreProps): Score {
    return new Score(props);
  }

  static zero(): Score {
    return new Score({ home: 0, away: 0 });
  }
}
