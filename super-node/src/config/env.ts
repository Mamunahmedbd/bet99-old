/**
 * Configuration — Environment Variables
 * Single source of truth for all environment configuration.
 * Validates at startup — fail fast on missing config.
 */

export interface AppConfig {
  // ── Server ──
  readonly port: number;
  readonly host: string;
  readonly env: "development" | "production" | "test";

  // ── Redis ──
  readonly redis: {
    readonly url: string;
    readonly enabled: boolean;
  };

  // ── Providers ──
  readonly betfair: {
    readonly baseUrl: string;
    readonly enabled: boolean;
  };

  readonly sportradar: {
    readonly baseUrl: string;
    readonly apiKey: string;
    readonly enabled: boolean;
  };

  readonly diamond: {
    readonly baseUrl: string;
    readonly secondaryUrl: string;
    readonly apiKey: string;
    readonly requestTimeout: number;
    readonly postTimeout: number;
    readonly enabled: boolean;
  };

  // ── Exchange Provider ──
  readonly exchange: {
    readonly baseUrl: string;
    readonly apiKey: string;
    readonly requestTimeout: number;
    readonly postTimeout: number;
    readonly enabled: boolean;
    readonly pollIntervals: {
      readonly matchList: number;
      readonly topEvents: number;
      readonly banners: number;
      readonly sidebar: number;
      readonly odds: number;
      readonly oddsHotTtl: number;
    };
  };

  // ── Polling ──
  readonly polling: {
    readonly enabled: boolean;
    readonly intervalMs: number;
  };

  // ── Logging ──
  readonly logLevel: string;
}

export function loadConfig(): AppConfig {
  const env = (process.env.NODE_ENV ?? "development") as AppConfig["env"];

  return {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
    env,

    redis: {
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
      enabled: process.env.REDIS_ENABLED !== "false",
    },

    betfair: {
      baseUrl: process.env.BETFAIR_BASE_URL ?? "http://localhost:8080",
      enabled: process.env.BETFAIR_ENABLED === "true",
    },

    sportradar: {
      baseUrl: process.env.SPORTRADAR_BASE_URL ?? "https://api.sportradar.com",
      apiKey: process.env.SPORTRADAR_API_KEY ?? "",
      enabled: process.env.SPORTRADAR_ENABLED === "true",
    },

    diamond: {
      baseUrl: process.env.DIAMOND_BASE_URL ?? "http://cloud.turnkeyxgaming.com:8086",
      secondaryUrl: process.env.DIAMOND_SECONDARY_BASE_URL ?? "http://local.turnkeyxgaming.com:8086",
      apiKey: process.env.DIAMOND_API_KEY ?? "",
      requestTimeout: Number(process.env.DIAMOND_REQUEST_TIMEOUT ?? 2000),
      postTimeout: Number(process.env.DIAMOND_POST_TIMEOUT ?? 4000),
      enabled: process.env.DIAMOND_ENABLED === "true",
    },

    exchange: {
      baseUrl: process.env.EXCHANGE_BASE_URL ?? "http://localhost:8086",
      apiKey: process.env.EXCHANGE_API_KEY ?? "",
      requestTimeout: Number(process.env.EXCHANGE_REQUEST_TIMEOUT ?? 3000),
      postTimeout: Number(process.env.EXCHANGE_POST_TIMEOUT ?? 5000),
      enabled: process.env.EXCHANGE_ENABLED === "true",
      pollIntervals: {
        matchList: Number(process.env.EXCHANGE_POLL_MATCH_LIST ?? 60_000),
        topEvents: Number(process.env.EXCHANGE_POLL_TOP_EVENTS ?? 3_600_000),
        banners: Number(process.env.EXCHANGE_POLL_BANNERS ?? 3_600_000),
        sidebar: Number(process.env.EXCHANGE_POLL_SIDEBAR ?? 86_400_000),
        odds: Number(process.env.EXCHANGE_POLL_ODDS ?? 1_000),
        oddsHotTtl: Number(process.env.EXCHANGE_ODDS_HOT_TTL ?? 30),
      },
    },

    polling: {
      enabled: process.env.POLLING_ENABLED !== "false",
      intervalMs: Number(process.env.POLLING_INTERVAL_MS ?? 5000),
    },

    logLevel: process.env.LOG_LEVEL ?? (env === "production" ? "info" : "debug"),
  };
}
