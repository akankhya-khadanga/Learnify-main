/**
 * Production API Service Layer
 * 
 * Centralized API management with:
 * - Retry logic with exponential backoff
 * - Rate limiting
 * - Request timeout handling
 * - Response caching
 * - Error normalization
 * - Request queuing
 */

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface CacheConfig {
  ttl: number; // milliseconds
  maxSize: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface APIServiceConfig {
  timeout: number;
  retry: RetryConfig;
  cache: CacheConfig;
  rateLimit: RateLimitConfig;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface RequestQueue {
  [key: string]: {
    timestamps: number[];
  };
}

class APIService {
  private config: APIServiceConfig;
  private cache: Map<string, CacheEntry<any>>;
  private requestQueue: RequestQueue;

  constructor(config?: Partial<APIServiceConfig>) {
    this.config = {
      timeout: 30000, // 30 seconds
      retry: {
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      },
      cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
      },
      rateLimit: {
        maxRequests: 10,
        windowMs: 60000, // 1 minute
      },
      ...config,
    };

    this.cache = new Map();
    this.requestQueue = {};

    // Cleanup expired cache entries every minute
    setInterval(() => this.cleanupCache(), 60000);
  }

  /**
   * Make HTTP request with full production features
   */
  async request<T>(
    url: string,
    options: RequestInit = {},
    config?: {
      skipCache?: boolean;
      skipRetry?: boolean;
      skipRateLimit?: boolean;
      cacheKey?: string;
    }
  ): Promise<T> {
    const cacheKey = config?.cacheKey || `${options.method || 'GET'}:${url}`;

    // Check cache first (unless explicitly skipped)
    if (!config?.skipCache) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        console.log(`[API Cache] Hit: ${cacheKey}`);
        return cached;
      }
    }

    // Rate limiting (unless explicitly skipped)
    if (!config?.skipRateLimit) {
      await this.checkRateLimit(url);
    }

    // Execute request with retry logic
    const execute = async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            await response.text().catch(() => null)
          );
        }

        const data = await response.json();
        
        // Cache successful response
        if (!config?.skipCache) {
          this.setCache(cacheKey, data);
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw new APIError('Request timeout', 408);
        }

        throw error;
      }
    };

    // Retry logic (unless explicitly skipped)
    if (config?.skipRetry) {
      return execute();
    }

    return this.retryWithBackoff(execute, url);
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    identifier: string,
    attempt = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const shouldRetry =
        attempt < this.config.retry.maxRetries &&
        this.isRetryableError(error);

      if (!shouldRetry) {
        console.error(`[API] Failed after ${attempt} attempts: ${identifier}`, error);
        throw error;
      }

      const delay = Math.min(
        this.config.retry.initialDelay * Math.pow(this.config.retry.backoffFactor, attempt),
        this.config.retry.maxDelay
      );

      console.warn(`[API] Retry ${attempt + 1}/${this.config.retry.maxRetries} after ${delay}ms: ${identifier}`);

      await this.sleep(delay);
      return this.retryWithBackoff(fn, identifier, attempt + 1);
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (error instanceof APIError) {
      // Retry on server errors and rate limits
      return error.status >= 500 || error.status === 429;
    }

    // Retry on network errors
    return error instanceof TypeError && error.message.includes('fetch');
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(identifier: string): Promise<void> {
    const now = Date.now();
    const queue = this.requestQueue[identifier] || { timestamps: [] };

    // Remove timestamps outside the window
    queue.timestamps = queue.timestamps.filter(
      (ts) => now - ts < this.config.rateLimit.windowMs
    );

    // Check if limit exceeded
    if (queue.timestamps.length >= this.config.rateLimit.maxRequests) {
      const oldestTimestamp = queue.timestamps[0];
      const waitTime = this.config.rateLimit.windowMs - (now - oldestTimestamp);

      console.warn(`[API] Rate limit reached for ${identifier}, waiting ${waitTime}ms`);
      await this.sleep(waitTime);
      return this.checkRateLimit(identifier);
    }

    // Add current request
    queue.timestamps.push(now);
    this.requestQueue[identifier] = queue;
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(key: string, data: T): void {
    const now = Date.now();

    // Enforce max cache size (LRU-like)
    if (this.cache.size >= this.config.cache.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.config.cache.ttl,
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[API Cache] Cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Clear cache (manual or for specific pattern)
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      console.log('[API Cache] Cleared all entries');
      return;
    }

    let cleared = 0;
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        cleared++;
      }
    }

    console.log(`[API Cache] Cleared ${cleared} entries matching "${pattern}"`);
  }

  /**
   * Health check
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      cacheMaxSize: this.config.cache.maxSize,
      rateLimitQueues: Object.keys(this.requestQueue).length,
      config: this.config,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Custom API Error
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Singleton instance
 */
export const apiService = new APIService();

/**
 * Specialized API clients
 */
export const createAPIClient = (config?: Partial<APIServiceConfig>) => {
  return new APIService(config);
};

export type { APIServiceConfig, RetryConfig, CacheConfig, RateLimitConfig };
