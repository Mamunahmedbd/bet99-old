/**
 * Domain Event — Represents something that happened in the domain.
 * Immutable, timestamped, and carries event-specific data.
 */
export interface DomainEvent {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly payload: Record<string, unknown>;
}

export function createDomainEvent(
  eventName: string,
  aggregateId: string,
  payload: Record<string, unknown> = {},
): DomainEvent {
  return {
    eventName,
    occurredAt: new Date(),
    aggregateId,
    payload,
  };
}
