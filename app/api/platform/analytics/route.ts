
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // días

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Estadísticas generales de la plataforma
    const [
      totalChurches,
      activeChurches,
      totalUsers,
      activeUsers,
      totalMembers,
      totalDonations,
      recentActivity
    ] = await Promise.all([
      // Total de iglesias
      db.church.count(),
      
      // Iglesias activas
      db.church.count({ where: { isActive: true } }),
      
      // Total de usuarios
      db.user.count(),
      
      // Usuarios activos
      db.user.count({ where: { isActive: true } }),
      
      // Total de miembros
      db.member.count(),
      
      // Estadísticas de donaciones
      db.donation.aggregate({
        _sum: { amount: true },
        _count: true
      }),
      
      // Actividad reciente
      db.notification.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          church: {
            select: { name: true }
          }
        }
      })
    ])

    // Crecimiento de iglesias por mes (último año) - Fixed with Prisma
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
    
    const recentChurches = await db.church.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    // Group by month manually
    const monthlyGrowth = recentChurches.reduce((acc: any, church) => {
      const monthKey = church.createdAt.toISOString().slice(0, 7) // YYYY-MM
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {})

    const monthlyGrowthArray = Object.entries(monthlyGrowth).map(([month, count]) => ({
      month,
      count: count as number
    })).sort((a, b) => a.month.localeCompare(b.month))

    // Top 5 iglesias por miembros
    const topChurchesByMembers = await db.church.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            members: true,
            users: true,
            donations: true
          }
        }
      },
      orderBy: {
        members: { _count: 'desc' }
      },
      take: 5
    })

    // Donaciones por mes - Fixed with Prisma
    const recentDonations = await db.donation.findMany({
      where: {
        donationDate: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        donationDate: true,
        amount: true
      }
    })

    // Group donations by month manually
    const donationsByMonth = recentDonations.reduce((acc: any, donation) => {
      const monthKey = donation.donationDate.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, count: 0 }
      }
      acc[monthKey].total += Number(donation.amount)
      acc[monthKey].count += 1
      return acc
    }, {})

    const monthlyDonationsArray = Object.entries(donationsByMonth).map(([month, data]: [string, any]) => ({
      month,
      total: data.total,
      count: data.count
    })).sort((a, b) => a.month.localeCompare(b.month))

    // Distribución de usuarios por rol
    const usersByRole = await db.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: true
    })

    return NextResponse.json({
      overview: {
        churches: {
          total: totalChurches,
          active: activeChurches,
          inactive: totalChurches - activeChurches
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers
        },
        members: totalMembers,
        donations: {
          total: totalDonations._sum.amount || 0,
          count: totalDonations._count
        }
      },
      growth: {
        monthly: monthlyGrowthArray,
        donations: monthlyDonationsArray
      },
      rankings: {
        topChurches: topChurchesByMembers.map(church => ({
          id: church.id,
          name: church.name,
          members: church._count.members,
          users: church._count.users,
          donations: church._count.donations
        }))
      },
      distribution: {
        usersByRole: usersByRole.reduce((acc, curr) => {
          acc[curr.role] = curr._count
          return acc
        }, {} as Record<string, number>)
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        title: activity.title,
        message: activity.message,
        type: activity.type,
        church: activity.church?.name,
        createdAt: activity.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching platform analytics:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
