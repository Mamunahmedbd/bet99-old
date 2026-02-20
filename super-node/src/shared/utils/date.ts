/**
 * Date utilities — Pure functions, no side effects.
 */

export function nowISO(): string {
  return new Date().toISOString();
}

export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

export function isExpired(expiresAt: Date | string): boolean {
  const expiry =
    typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() < Date.now();
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export function addMinutes(date: Date, minutes: number): Date {
  return addSeconds(date, minutes * 60);
}

export function formatDateForLog(date: Date = new Date()): string {
  return date.toISOString().replace("T", " ").replace("Z", "");
}
