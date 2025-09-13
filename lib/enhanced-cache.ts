/**
 * Enhanced Caching System for Khesed-Tek Church Management
 * Provides multi-level caching with automatic invalidation and performance optimization
 */

import React, { useState, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  version: number
}

interface CacheOptions {
  ttl?: number // Time to live in seconds
  tags?: string[] // Cache tags for invalidation
  version?: number // Version for data validation
}

class EnhancedCache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map()
  private readonly defaultTTL = 300 // 5 minutes
  private readonly maxMemoryEntries = 1000
  private hitCount = 0
  private missCount = 0

  /**
   * Set cache entry with advanced options
   */
  async set<T>(
    key: string, 
    data: T, 
    options: CacheOptions = {}
  ): Promise<void> {
    const { ttl = this.defaultTTL, tags = [], version = 1 } = options
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      tags,
      version
    }

    // Memory cache
    this.memoryCache.set(key, entry)
    
    // Prevent memory overflow
    if (this.memoryCache.size > this.maxMemoryEntries) {
      this.evictOldEntries()
    }

    // Persistent cache (localStorage for client-side, Redis would be ideal for server-side)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry))
      } catch (error) {
        console.warn('Failed to set localStorage cache:', error)
      }
    }
  }

  /**
   * Get cache entry with automatic expiration check
   */
  async get<T>(key: string, fallback?: () => Promise<T>): Promise<T | null> {
    // Check memory cache first
    let entry = this.memoryCache.get(key)
    
    // If not in memory, check localStorage
    if (!entry && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`cache_${key}`)
        if (stored) {
          entry = JSON.parse(stored)
          // Restore to memory cache
          if (entry) {
            this.memoryCache.set(key, entry)
          }
        }
      } catch (error) {
        console.warn('Failed to get localStorage cache:', error)
      }
    }

    // Check if entry exists and is valid
    if (entry && this.isValidEntry(entry)) {
      this.hitCount++
      return entry.data as T
    }

    // Cache miss - remove expired entry
    if (entry) {
      this.delete(key)
    }
    
    this.missCount++

    // Execute fallback if provided
    if (fallback) {
      try {
        const data = await fallback()
        await this.set(key, data)
        return data
      } catch (error) {
        console.error('Cache fallback failed:', error)
        return null
      }
    }

    return null
  }

  /**
   * Delete specific cache entry
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache_${key}`)
    }
  }

  /**
   * Clear cache by tags
   */
  async invalidateByTag(tag: string): Promise<void> {
    const keysToDelete: string[] = []
    
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        keysToDelete.push(key)
      }
    }
    
    for (const key of keysToDelete) {
      await this.delete(key)
    }

    // Clean localStorage entries by tag
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache_')) {
          try {
            const entry = JSON.parse(localStorage.getItem(key) || '{}')
            if (entry.tags?.includes(tag)) {
              keysToRemove.push(key)
            }
          } catch (error) {
            // Invalid entry, remove it
            keysToRemove.push(key)
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear()
    
    if (typeof window !== 'undefined') {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.hitCount + this.missCount
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0
    
    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryEntries: this.memoryCache.size,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Preload common data into cache
   */
  async preloadChurchData(churchId: string): Promise<void> {
    const preloadTasks = [
      this.preloadMembers(churchId),
      this.preloadEvents(churchId),
      this.preloadDonationStats(churchId),
      this.preloadUserPermissions(churchId)
    ]

    await Promise.allSettled(preloadTasks)
  }

  /**
   * Smart cache warming based on usage patterns
   */
  async warmCache(churchId: string, userId: string): Promise<void> {
    // Get user's recent activity patterns
    const userActivity = await this.getUserActivity(userId)
    
    // Preload based on patterns
    const warmupTasks: Promise<void>[] = []
    
    if (userActivity.frequentlyAccessedMembers?.length > 0) {
      warmupTasks.push(this.preloadMemberDetails(userActivity.frequentlyAccessedMembers))
    }
    
    if (userActivity.recentReports?.length > 0) {
      warmupTasks.push(this.preloadReportData(churchId, userActivity.recentReports))
    }
    
    await Promise.allSettled(warmupTasks)
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry(entry: CacheEntry<any>): boolean {
    const now = Date.now()
    return (now - entry.timestamp) < entry.ttl
  }

  /**
   * Evict old entries when memory limit is reached
   */
  private evictOldEntries(): void {
    const entries = Array.from(this.memoryCache.entries())
    const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove oldest 20% of entries
    const entriesToRemove = Math.floor(sortedEntries.length * 0.2)
    for (let i = 0; i < entriesToRemove; i++) {
      this.memoryCache.delete(sortedEntries[i][0])
    }
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let size = 0
    for (const entry of this.memoryCache.values()) {
      size += JSON.stringify(entry).length * 2 // Rough estimate
    }
    return Math.round(size / 1024) // KB
  }

  /**
   * Preload members data
   */
  private async preloadMembers(churchId: string): Promise<void> {
    try {
      const response = await fetch(`/api/members/summary?churchId=${churchId}`)
      if (response.ok) {
        const data = await response.json()
        await this.set(`members_summary_${churchId}`, data, {
          ttl: 600, // 10 minutes
          tags: ['members', `church_${churchId}`]
        })
      }
    } catch (error) {
      console.warn('Failed to preload members:', error)
    }
  }

  /**
   * Preload events data
   */
  private async preloadEvents(churchId: string): Promise<void> {
    try {
      const response = await fetch(`/api/events/upcoming?churchId=${churchId}`)
      if (response.ok) {
        const data = await response.json()
        await this.set(`events_upcoming_${churchId}`, data, {
          ttl: 300, // 5 minutes
          tags: ['events', `church_${churchId}`]
        })
      }
    } catch (error) {
      console.warn('Failed to preload events:', error)
    }
  }

  /**
   * Preload donation statistics
   */
  private async preloadDonationStats(churchId: string): Promise<void> {
    try {
      const response = await fetch(`/api/donations/stats?churchId=${churchId}`)
      if (response.ok) {
        const data = await response.json()
        await this.set(`donation_stats_${churchId}`, data, {
          ttl: 900, // 15 minutes
          tags: ['donations', `church_${churchId}`]
        })
      }
    } catch (error) {
      console.warn('Failed to preload donation stats:', error)
    }
  }

  /**
   * Preload user permissions
   */
  private async preloadUserPermissions(churchId: string): Promise<void> {
    try {
      const response = await fetch(`/api/users/permissions?churchId=${churchId}`)
      if (response.ok) {
        const data = await response.json()
        await this.set(`user_permissions_${churchId}`, data, {
          ttl: 1800, // 30 minutes
          tags: ['permissions', `church_${churchId}`]
        })
      }
    } catch (error) {
      console.warn('Failed to preload user permissions:', error)
    }
  }

  /**
   * Get user activity patterns (mock implementation)
   */
  private async getUserActivity(userId: string): Promise<any> {
    // In a real implementation, this would fetch from analytics
    return {
      frequentlyAccessedMembers: [],
      recentReports: [],
      commonSearches: []
    }
  }

  /**
   * Preload member details
   */
  private async preloadMemberDetails(memberIds: string[]): Promise<void> {
    // Implementation would batch load member details
  }

  /**
   * Preload report data
   */
  private async preloadReportData(churchId: string, reportTypes: string[]): Promise<void> {
    // Implementation would preload common reports
  }
}

// Singleton instance
export const enhancedCache = new EnhancedCache()

/**
 * Higher-order function for caching API responses
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator: (...args: Parameters<T>) => string
    ttl?: number
    tags?: string[]
  }
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = options.keyGenerator(...args)
    
    const cachedResult = await enhancedCache.get(cacheKey)
    if (cachedResult !== null) {
      return cachedResult
    }
    
    const result = await fn(...args)
    await enhancedCache.set(cacheKey, result, {
      ttl: options.ttl,
      tags: options.tags
    })
    
    return result
  }) as T
}

/**
 * React hook for cached data
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const cachedData = await enhancedCache.get(key, fetcher)
        
        if (mounted) {
          setData(cachedData)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'))
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [key])

  const refetch = async () => {
    await enhancedCache.delete(key)
    setLoading(true)
    
    try {
      const freshData = await fetcher()
      await enhancedCache.set(key, freshData, options)
      setData(freshData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, refetch }
}

export default enhancedCache