/**
 * Value Object — MatchStatus
 * Encapsulates match lifecycle status transitions.
 */
import { ValueObject } from "@domain/common";

export enum MatchStatusType {
  NOT_STARTED = "not_started",
  LIVE = "live",
  IN_PLAY = "in_play",
  BALL_RUNNING = "ball_running",
  SUSPENDED = "suspended",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
  POSTPONED = "postponed",
}

interface MatchStatusProps {
  readonly status: MatchStatusType;
  readonly reason?: string;
}

export class MatchStatus extends ValueObject<MatchStatusProps> {
  get status(): MatchStatusType {
    return this.props.status;
  }
  get reason(): string | undefined {
    return this.props.reason;
  }

  get isLive(): boolean {
    return [
      MatchStatusType.LIVE,
      MatchStatusType.IN_PLAY,
      MatchStatusType.BALL_RUNNING,
    ].includes(this.props.status);
  }

  get isActive(): boolean {
    return ![
      MatchStatusType.COMPLETED,
      MatchStatusType.ABANDONED,
      MatchStatusType.POSTPONED,
    ].includes(this.props.status);
  }

  get isSuspended(): boolean {
    return this.props.status === MatchStatusType.SUSPENDED;
  }

  get isBettable(): boolean {
    return this.isLive && !this.isSuspended;
  }

  static create(
    status: MatchStatusType,
    reason?: string,
  ): MatchStatus {
    return new MatchStatus({ status, reason });
  }

  static live(): MatchStatus {
    return new MatchStatus({ status: MatchStatusType.LIVE });
  }

  static notStarted(): MatchStatus {
    return new MatchStatus({ status: MatchStatusType.NOT_STARTED });
  }
}
