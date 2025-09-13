
import { PrismaClient } from '@prisma/client';

// Database connection with optimizations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Optimized query helpers
export const optimizedQueries = {
  // Get social media accounts with minimal data
  getSocialMediaAccountsMinimal: async (churchId: string) => {
    return prisma.socialMediaAccount.findMany({
      where: {
        churchId,
        isActive: true
      },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        isActive: true,
        lastSync: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Get posts with pagination
  getSocialMediaPostsPaginated: async (
    churchId: string,
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; campaignId?: string }
  ) => {
    const skip = (page - 1) * limit;
    
    const where = {
      churchId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.campaignId && { campaignId: filters.campaignId })
    };

    const [posts, total] = await Promise.all([
      prisma.socialMediaPost.findMany({
        where,
        include: {
          campaign: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.socialMediaPost.count({ where })
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get campaign stats efficiently
  getCampaignStats: async (churchId: string) => {
    const campaigns = await prisma.marketingCampaign.findMany({
      where: { churchId },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });

    const stats = campaigns.reduce((acc, campaign) => {
      acc.total += 1;
      acc.statuses[campaign.status] = (acc.statuses[campaign.status] || 0) + 1;
      acc.totalBudget += campaign.budget || 0;
      acc.totalPosts += campaign._count?.posts || 0;
      
      if (campaign.platforms) {
        const platforms = JSON.parse(campaign.platforms);
        platforms.forEach((platform: string) => {
          acc.platforms[platform] = (acc.platforms[platform] || 0) + 1;
        });
      }
      
      return acc;
    }, {
      total: 0,
      statuses: {} as Record<string, number>,
      platforms: {} as Record<string, number>,
      totalBudget: 0,
      totalPosts: 0
    });

    return { campaigns, stats };
  },

  // Get metrics with aggregation
  getMetricsAggregated: async (
    churchId: string,
    filters: {
      platform?: string;
      accountId?: string;
      startDate?: Date;
      endDate?: Date;
      metricType?: string;
    }
  ) => {
    const where = {
      churchId,
      ...(filters.platform && { platform: filters.platform }),
      ...(filters.accountId && { accountId: filters.accountId }),
      ...(filters.metricType && { metricType: filters.metricType }),
      ...(filters.startDate && filters.endDate && {
        date: {
          gte: filters.startDate,
          lte: filters.endDate
        }
      })
    };

    // Get raw metrics and account info in one query
    const metrics = await prisma.socialMediaMetrics.findMany({
      where,
      include: {
        account: {
          select: {
            platform: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 1000 // Limit to prevent memory issues
    });

    return metrics;
  }
};

// Database cleanup utilities
export const dbCleanup = {
  // Clean up old metrics data (keep last 6 months)
  cleanupOldMetrics: async () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const deleted = await prisma.socialMediaMetrics.deleteMany({
      where: {
        date: {
          lt: sixMonthsAgo
        }
      }
    });

    return deleted.count;
  },

  // Clean up orphaned posts
  cleanupOrphanedPosts: async () => {
    const deleted = await prisma.socialMediaPost.deleteMany({
      where: {
        AND: [
          { status: 'DRAFT' },
          { 
            createdAt: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days old
            }
          }
        ]
      }
    });

    return deleted.count;
  }
};

// Connection management
export const closeDbConnection = async () => {
  await prisma.$disconnect();
};

// Health check
export const checkDbHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
