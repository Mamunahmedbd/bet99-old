/**
 * Application-wide constants.
 * Single source of truth for magic numbers and strings.
 */

// ── Cache TTLs (seconds) ──
export const CACHE_TTL = {
  LIVE_ODDS: 1,
  MATCH_LIST: 10,
  MARKET_DATA: 5,
  SCORE_DATA: 3,
  SPORT_LIST: 300,
  EVENT_DETAIL: 30,
  DEFAULT: 60,
} as const;

// ── Polling Intervals (milliseconds) ──
export const POLL_INTERVAL = {
  LIVE_ODDS: 1_000,
  SCORES: 2_000,
  MATCH_LIST: 50_000,
  HEARTBEAT: 30_000,
} as const;

// ── Data Provider Identifiers ──
export const PROVIDER = {
  BETFAIR: "betfair",
  SPORTRADAR: "sportradar",
  DIAMOND: "diamond",
  EXCHANGE: "exchange",
  CUSTOM: "custom",
} as const;

// ── Sports ──
export const SPORT = {
  CRICKET: "cricket",
  SOCCER: "soccer",
  TENNIS: "tennis",
} as const;

// ── HTTP ──
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
  BAD_GATEWAY: 502,
  TIMEOUT: 504,
} as const;

export type SportType = (typeof SPORT)[keyof typeof SPORT];
export type ProviderType = (typeof PROVIDER)[keyof typeof PROVIDER];
