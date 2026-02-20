/**
 * Guard utilities — Runtime type safety.
 */

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && value > 0 && Number.isFinite(value);
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

export function ensureDefined<T>(
  value: T | undefined | null,
  name: string,
): T {
  if (!isDefined(value)) {
    throw new Error(`Expected '${name}' to be defined, got ${value}`);
  }
  return value;
}
