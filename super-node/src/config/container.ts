/**
 * Dependency Injection Container
 * Wires all layers together — this is the composition root.
 * Only this file and index.ts know about concrete implementations.
 *
 * All other layers depend only on interfaces (ports).
 */
import type { AppConfig } from "./env";
import type { Logger } from "@application/ports/logger";
import type { CacheService } from "@application/ports/cache-service";
import type { EventBus } from "@application/ports/event-bus";
import type { DataProvider } from "@application/ports/data-provider";
import type { MatchRepository } from "@domain/sport/repositories/match-repository";
import type { MarketRepository } from "@domain/sport/repositories/market-repository";

// ── Infrastructure Implementations ──
import { createPinoLogger } from "@infrastructure/logging/pino-logger";
import {
  RedisCacheService,
  createRedisConnection,
} from "@infrastructure/cache/redis-cache.service";
import { InMemoryCacheService } from "@infrastructure/cache/in-memory-cache.service";
import { InMemoryMatchRepository } from "@infrastructure/persistence/in-memory/in-memory-match.repository";
import { InMemoryMarketRepository } from "@infrastructure/persistence/in-memory/in-memory-market.repository";
import { InMemoryEventBus } from "@infrastructure/events/in-memory-event-bus";
import { BetfairDataProvider } from "@infrastructure/providers/betfair/betfair.provider";
import { SportradarDataProvider } from "@infrastructure/providers/sportradar/sportradar.provider";
import { DiamondDataProvider } from "@infrastructure/providers/diamond/diamond.provider";

// ── Scheduling ──
import { DataPrefetchScheduler } from "@infrastructure/scheduling/data-prefetch.scheduler";
import { ExchangeDataProvider } from "@infrastructure/providers/exchange/exchange.provider";
import { ExchangePollingScheduler } from "@infrastructure/providers/exchange/exchange-polling.scheduler";

// ── Use Cases ──
import { GetLiveMatchesUseCase } from "@application/use-cases/match/get-live-matches.use-case";
import { GetMatchDetailUseCase } from "@application/use-cases/match/get-match-detail.use-case";
import { SyncProviderDataUseCase } from "@application/use-cases/match/sync-provider-data.use-case";

/**
 * Application Container — holds all wired dependencies.
 */
export interface AppContainer {
  // ── Infrastructure ──
  logger: Logger;
  cache: CacheService;
  eventBus: EventBus;

  // ── Repositories ──
  matchRepository: MatchRepository;
  marketRepository: MarketRepository;

  // ── Providers ──
  providers: Map<string, DataProvider>;

  // ── Exchange ──
  exchangeProvider?: ExchangeDataProvider;
  exchangeScheduler?: ExchangePollingScheduler;

  // ── Scheduling ──
  prefetchScheduler: DataPrefetchScheduler;

  // ── Use Cases ──
  getLiveMatchesUseCase: GetLiveMatchesUseCase;
  getMatchDetailUseCase: GetMatchDetailUseCase;
  syncProviderDataUseCase: SyncProviderDataUseCase;

  // ── Lifecycle ──
  shutdown: () => Promise<void>;
}

export async function createContainer(
  config: AppConfig,
): Promise<AppContainer> {
  // ── 1. Logger ──
  const logger = createPinoLogger("super-node");

  // ── 2. Cache ──
  let cache: CacheService;
  let redisCleanup: (() => Promise<void>) | undefined;

  if (config.redis.enabled) {
    const redis = createRedisConnection(config.redis.url, logger);
    await redis.connect();
    cache = new RedisCacheService(redis, logger);
    redisCleanup = async () => {
      await redis.quit();
    };
    logger.info("Redis cache connected", { url: config.redis.url });
  } else {
    cache = new InMemoryCacheService();
    logger.info("Using in-memory cache (Redis disabled)");
  }

  // ── 3. Event Bus ──
  const eventBus = new InMemoryEventBus(logger);

  // ── 4. Repositories ──
  const matchRepository = new InMemoryMatchRepository();
  const marketRepository = new InMemoryMarketRepository();

  // ── 5. Providers ──
  const providers = new Map<string, DataProvider>();

  if (config.betfair.enabled) {
    const betfair = new BetfairDataProvider(
      config.betfair.baseUrl,
      logger,
    );
    providers.set("betfair", betfair);
    logger.info("Betfair provider registered");
  }

  if (config.sportradar.enabled) {
    const sportradar = new SportradarDataProvider(
      config.sportradar.baseUrl,
      config.sportradar.apiKey,
      logger,
    );
    providers.set("sportradar", sportradar);
    logger.info("Sportradar provider registered");
  }

  if (config.diamond.enabled) {
    const diamond = new DiamondDataProvider(
      {
        baseUrl: config.diamond.baseUrl,
        secondaryUrl: config.diamond.secondaryUrl,
        apiKey: config.diamond.apiKey,
        requestTimeout: config.diamond.requestTimeout,
        postTimeout: config.diamond.postTimeout,
      },
      logger,
    );
    providers.set("diamond", diamond);
    logger.info("Diamond provider registered", {
      primaryUrl: config.diamond.baseUrl,
      secondaryUrl: config.diamond.secondaryUrl,
    });
  }

  // ── Exchange Provider ──
  let exchangeProvider: ExchangeDataProvider | undefined;
  let exchangeScheduler: ExchangePollingScheduler | undefined;

  if (config.exchange.enabled) {
    exchangeProvider = new ExchangeDataProvider(
      {
        baseUrl: config.exchange.baseUrl,
        apiKey: config.exchange.apiKey,
        requestTimeout: config.exchange.requestTimeout,
        postTimeout: config.exchange.postTimeout,
      },
      logger,
    );
    providers.set("exchange", exchangeProvider);

    exchangeScheduler = new ExchangePollingScheduler(
      exchangeProvider,
      cache,
      logger,
      config.exchange.pollIntervals,
    );

    logger.info("Exchange provider registered", {
      baseUrl: config.exchange.baseUrl,
      pollIntervals: config.exchange.pollIntervals,
    });
  }

  // ── 6. Background Prefetch Scheduler ──
  // Created before use cases because it acts as the MatchInterestTracker
  const prefetchScheduler = new DataPrefetchScheduler(
    providers,
    cache,
    logger,
  );

  // ── 7. Use Cases ──
  const getLiveMatchesUseCase = new GetLiveMatchesUseCase(
    matchRepository,
    cache,
    logger,
  );

  const getMatchDetailUseCase = new GetMatchDetailUseCase(
    matchRepository,
    marketRepository,
    cache,
    prefetchScheduler, // implements MatchHotMarker via markMatchHot()
    logger,
  );

  const syncProviderDataUseCase = new SyncProviderDataUseCase(
    matchRepository,
    marketRepository,
    providers,
    eventBus,
    logger,
  );

  // Start prefetch if polling is enabled and providers exist
  if (config.polling.enabled && providers.size > 0) {
    await prefetchScheduler.start();
    logger.info("Background prefetch scheduler started", {
      providerCount: providers.size,
    });
  }

  // Start exchange polling scheduler
  if (exchangeScheduler) {
    await exchangeScheduler.start();
    logger.info("Exchange polling scheduler started");
  }

  // ── Shutdown hook ──
  const shutdown = async () => {
    logger.info("Shutting down...");
    await prefetchScheduler.stop();
    if (exchangeScheduler) await exchangeScheduler.stop();
    if (redisCleanup) await redisCleanup();
    logger.info("Shutdown complete");
  };

  return {
    logger,
    cache,
    eventBus,
    matchRepository,
    marketRepository,
    providers,
    exchangeProvider,
    exchangeScheduler,
    prefetchScheduler,
    getLiveMatchesUseCase,
    getMatchDetailUseCase,
    syncProviderDataUseCase,
    shutdown,
  };
}
