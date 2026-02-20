/**
 * Infrastructure — Redis Cache Service
 * Implements the CacheService port using ioredis.
 */
import Redis from "ioredis";
import type { CacheService } from "@application/ports/cache-service";
import type { Logger } from "@application/ports/logger";
import { CACHE_TTL } from "@shared/constants";

export class RedisCacheService implements CacheService {
  private readonly redis: Redis;
  private readonly logger: Logger;
  private readonly prefix: string;

  constructor(redis: Redis, logger: Logger, prefix = "sn:") {
    this.redis = redis;
    this.logger = logger.child({ service: "RedisCacheService" });
    this.prefix = prefix;
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(this.key(key));
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn("Cache get failed", { key, error });
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttlSeconds: number = CACHE_TTL.DEFAULT,
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(this.key(key), ttlSeconds, serialized);
    } catch (error) {
      this.logger.warn("Cache set failed", { key, error });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(this.key(key));
    } catch (error) {
      this.logger.warn("Cache del failed", { key, error });
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.key(key));
      return result === 1;
    } catch {
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn("Cache flush failed", { error });
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.redis.keys(this.key(pattern));
      return keys.map((k) => k.replace(this.prefix, ""));
    } catch {
      return [];
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = CACHE_TTL.DEFAULT,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

/**
 * Factory — creates a Redis connection.
 */
export function createRedisConnection(
  url?: string,
  logger?: Logger,
): Redis {
  const redis = new Redis(url ?? process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 200, 5000);
      return delay;
    },
    lazyConnect: true,
  });

  redis.on("connect", () => {
    logger?.info("Redis connected");
  });

  redis.on("error", (err) => {
    logger?.error("Redis connection error", { error: err.message });
  });

  return redis;
}
