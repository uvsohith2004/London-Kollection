import { Redis } from "@upstash/redis"
import { logger } from "@/core/utils/logger"

export interface Cache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  increment(key: string): Promise<number>
  getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T>
  invalidatePattern(pattern: string): Promise<void>
}

class UpstashRedisCache implements Cache {
  private redis: Redis | null = null

  constructor() {
    try {
      // It uses process.env.UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN by default
      // if no arguments are passed.
      this.redis = Redis.fromEnv()
    } catch (err) {
      logger.warn("Redis client could not be initialized from environment variables.", { error: err })
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    try {
      return await this.redis.get<T>(key)
    } catch (err) {
      logger.error(`Cache GET error for key: ${key}`, err)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return
    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, { ex: ttlSeconds })
      } else {
        await this.redis.set(key, value)
      }
    } catch (err) {
      logger.error(`Cache SET error for key: ${key}`, err)
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.del(key)
    } catch (err) {
      logger.error(`Cache DELETE error for key: ${key}`, err)
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false
    try {
      const count = await this.redis.exists(key)
      return count > 0
    } catch (err) {
      logger.error(`Cache EXISTS error for key: ${key}`, err)
      return false
    }
  }

  async increment(key: string): Promise<number> {
    if (!this.redis) return 0
    try {
      return await this.redis.incr(key)
    } catch (err) {
      logger.error(`Cache INCR error for key: ${key}`, err)
      return 0
    }
  }

  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const data = await fetcher()
    if (data !== null && data !== undefined) {
      await this.set(key, data, ttlSeconds)
    }
    return data
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) return
    try {
      let cursor: string | number = 0
      do {
        const result = await this.redis.scan(cursor, { match: pattern, count: 100 })
        cursor = result[0] as string | number
        const keys = result[1] as string[]
        if (keys.length > 0) {
          await this.redis.del(...keys)
        }
      } while (cursor !== 0 && cursor !== "0")
    } catch (err) {
      logger.error(`Cache INVALIDATE_PATTERN error for pattern: ${pattern}`, err)
    }
  }
}

export const cache: Cache = new UpstashRedisCache()

// Centralized cache keys
export const CacheKeys = {
  product: (id: string) => `product:${id}`,
  category: (id: string) => `category:${id}`,
  catalogSearch: (query: string) => `search:${query}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  trending: (limit: number) => `products:trending:${limit}`,
  newArrivals: (limit: number) => `products:newArrivals:${limit}`,
  productSearch: (hash: string) => `products:search:${hash}`,
}
