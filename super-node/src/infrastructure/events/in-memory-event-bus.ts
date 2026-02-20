/**
 * Infrastructure — In-Memory Event Bus
 * Simple pub/sub implementation for domain events.
 * For production, swap with Redis Pub/Sub or a message broker adapter.
 */
import type { DomainEvent } from "@domain/common";
import type { EventBus, EventHandler } from "@application/ports/event-bus";
import type { Logger } from "@application/ports/logger";

export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ service: "EventBus" });
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName);
    if (!handlers || handlers.size === 0) {
      this.logger.debug("No handlers for event", {
        eventName: event.eventName,
      });
      return;
    }

    this.logger.debug("Publishing domain event", {
      eventName: event.eventName,
      aggregateId: event.aggregateId,
      handlerCount: handlers.size,
    });

    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error("Event handler failed", {
          eventName: event.eventName,
          error,
        });
      }
    });

    await Promise.allSettled(promises);
  }

  async publishMany(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    this.handlers.get(eventName)!.add(handler);
    this.logger.debug("Subscribed to event", { eventName });
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventName);
    if (handlers) {
      handlers.delete(handler);
    }
  }
}
