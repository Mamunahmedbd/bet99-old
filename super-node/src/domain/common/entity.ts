/**
 * Base Entity — All domain entities extend this.
 * Provides identity equality and lifecycle timestamps.
 */
export abstract class Entity<TId = string> {
  constructor(
    public readonly id: TId,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) { }

  equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) return false;
    return this.id === other.id;
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }
}
