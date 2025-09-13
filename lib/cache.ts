
// Simple in-memory cache for API responses
class Cache {
  private store: Map<string, { data: any; expiry: number }>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL);
    this.store.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const item = this.store.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiry) {
        this.store.delete(key);
      }
    }
  }

  // Get cache stats
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Create singleton cache instance
export const cache = new Cache();

// Cleanup expired entries every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    cache.cleanup();
  }, 600000);
}

// Cache key generators
export const cacheKeys = {
  socialMediaAccounts: (churchId: string) => `sma:${churchId}`,
  socialMediaPosts: (churchId: string, filters?: string) => `smp:${churchId}:${filters || 'all'}`,
  marketingCampaigns: (churchId: string) => `mc:${churchId}`,
  socialMediaMetrics: (churchId: string, params: string) => `smm:${churchId}:${params}`,
};

// Utility function for cached API calls
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // If not in cache, fetch and cache
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

// Cache invalidation helpers
export const invalidateCache = {
  socialMediaAccounts: (churchId: string) => {
    cache.delete(cacheKeys.socialMediaAccounts(churchId));
  },
  socialMediaPosts: (churchId: string) => {
    // Invalidate all post-related cache entries for this church
    const stats = cache.getStats();
    const keysToDelete = stats.keys.filter(key => 
      key.startsWith(`smp:${churchId}:`)
    );
    keysToDelete.forEach(key => cache.delete(key));
  },
  marketingCampaigns: (churchId: string) => {
    cache.delete(cacheKeys.marketingCampaigns(churchId));
  },
  socialMediaMetrics: (churchId: string) => {
    // Invalidate all metrics cache entries for this church
    const stats = cache.getStats();
    const keysToDelete = stats.keys.filter(key => 
      key.startsWith(`smm:${churchId}:`)
    );
    keysToDelete.forEach(key => cache.delete(key));
  },
};
