/**
 * Repository Port — Event Repository
 */
import type { SportEvent } from "../entities/sport-event";
import type { SportType } from "@shared/constants";
import type { Result } from "@shared/types/result";

export interface EventRepository {
  findById(id: string): Promise<Result<SportEvent | null>>;
  findBySport(sport: SportType): Promise<Result<SportEvent[]>>;
  findActive(): Promise<Result<SportEvent[]>>;
  save(event: SportEvent): Promise<Result<void>>;
  saveMany(events: SportEvent[]): Promise<Result<void>>;
  remove(id: string): Promise<Result<void>>;
}
