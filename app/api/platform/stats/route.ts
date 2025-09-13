
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Obtener estadísticas generales de la plataforma (SUPER_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado - Se requiere rol SUPER_ADMIN' },
        { status: 403 }
      )
    }

    // Calculate date ranges
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch comprehensive platform statistics
    const [
      totalChurches,
      activeChurches,
      totalUsers,
      activeUsers,
      newChurchesThisMonth,
      newUsersThisMonth,
      websiteRequests,
      completedWebsiteRequests,
      totalWebsiteRevenue
    ] = await Promise.all([
      // Total churches
      prisma.church.count(),
      
      // Active churches (with at least one active user)
      prisma.church.count({
        where: {
          isActive: true,
          users: {
            some: {
              isActive: true
            }
          }
        }
      }),
      
      // Total users
      prisma.user.count(),
      
      // Active users (logged in within last 30 days or created within last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          OR: [
            {
              createdAt: {
                gte: thirtyDaysAgo
              }
            },
            {
              updatedAt: {
                gte: thirtyDaysAgo
              }
            }
          ]
        }
      }),
      
      // New churches this month
      prisma.church.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // New users this month
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),
      
      // Website requests by status
      prisma.websiteRequest.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }).catch(() => []), // Gracefully handle if table doesn't exist
      
      // Completed website requests
      prisma.websiteRequest.findMany({
        where: {
          status: 'completed',
          completedAt: {
            not: null
          }
        },
        select: {
          finalPrice: true,
          estimatedPrice: true,
          completedAt: true,
          createdAt: true
        }
      }).catch(() => []),
      
      // Total website revenue
      prisma.websiteRequest.aggregate({
        _sum: {
          finalPrice: true,
          estimatedPrice: true
        },
        where: {
          status: 'completed'
        }
      }).catch(() => ({ _sum: { finalPrice: null, estimatedPrice: null } }))
    ])

    // Process website request statistics
    const websiteStats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0,
      totalRevenue: 0,
      avgCompletionTime: 0
    }

    // Count requests by status
    websiteRequests.forEach(group => {
      const status = group.status.toLowerCase().replace('_', '')
      if (status === 'pending') websiteStats.pending = group._count.status
      if (status === 'inprogress') websiteStats.inProgress = group._count.status
      if (status === 'completed') websiteStats.completed = group._count.status
      if (status === 'rejected') websiteStats.rejected = group._count.status
    })

    // Calculate revenue and average completion time
    if (completedWebsiteRequests.length > 0) {
      let totalRevenue = 0
      let totalCompletionDays = 0

      completedWebsiteRequests.forEach(request => {
        const revenue = request.finalPrice || request.estimatedPrice || 0
        totalRevenue += revenue

        if (request.completedAt && request.createdAt) {
          const completionTime = new Date(request.completedAt).getTime() - new Date(request.createdAt).getTime()
          const days = completionTime / (1000 * 60 * 60 * 24)
          totalCompletionDays += days
        }
      })

      websiteStats.totalRevenue = totalRevenue
      websiteStats.avgCompletionTime = Math.round((totalCompletionDays / completedWebsiteRequests.length) * 10) / 10
    } else {
      // Use aggregate result if available
      websiteStats.totalRevenue = (totalWebsiteRevenue._sum.finalPrice || 0) + (totalWebsiteRevenue._sum.estimatedPrice || 0)
    }

    // Calculate system health metrics (mock data - would come from monitoring system)
    const systemHealth = {
      uptime: 99.7,
      responseTime: Math.floor(Math.random() * 100) + 200, // 200-300ms
      errorRate: Math.round((Math.random() * 0.1) * 100) / 100 // 0-0.1%
    }

    // Calculate growth metrics
    const churchGrowthRate = totalChurches > 0 ? Math.round((newChurchesThisMonth / totalChurches) * 100 * 10) / 10 : 0
    const userGrowthRate = totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100 * 10) / 10 : 0
    const adoptionRate = totalChurches > 0 ? Math.round((activeChurches / totalChurches) * 100 * 10) / 10 : 0

    const stats = {
      totalChurches,
      activeChurches,
      totalUsers,
      activeUsers,
      newChurchesThisMonth,
      newUsersThisMonth,
      websiteRequests: websiteStats,
      systemHealth,
      growth: {
        churchGrowthRate,
        userGrowthRate,
        adoptionRate
      },
      summary: {
        totalRevenue: websiteStats.totalRevenue,
        avgProjectValue: websiteStats.completed > 0 ? Math.round(websiteStats.totalRevenue / websiteStats.completed) : 0,
        activeProjects: websiteStats.pending + websiteStats.inProgress,
        completionRate: (websiteStats.pending + websiteStats.inProgress + websiteStats.completed) > 0 
          ? Math.round((websiteStats.completed / (websiteStats.pending + websiteStats.inProgress + websiteStats.completed)) * 100 * 10) / 10
          : 0
      }
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Error fetching platform statistics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
