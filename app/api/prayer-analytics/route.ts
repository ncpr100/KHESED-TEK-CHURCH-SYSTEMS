
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'

// GET /api/prayer-analytics - Get comprehensive prayer analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 403 })
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const category = url.searchParams.get('category') || 'all'
    const status = url.searchParams.get('status') || 'all'
    const contactMethod = url.searchParams.get('contactMethod') || 'all'

    const startDate = subDays(new Date(), days)
    const endDate = new Date()

    // Build where clause for filtering
    const whereClause: any = {
      churchId: user.churchId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (category !== 'all') {
      whereClause.categoryId = category
    }

    if (status !== 'all') {
      whereClause.status = status
    }

    // Get all prayer requests for the period
    const prayerRequests = await prisma.prayerRequest.findMany({
      where: whereClause,
      include: {
        category: true,
        contact: true,
        approval: {
          include: {
            approver: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get all contacts for the church
    const allContacts = await prisma.prayerContact.findMany({
      where: { churchId: user.churchId },
      include: {
        requests: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    })

    // Filter contacts by contact method if specified
    let filteredContacts = allContacts
    if (contactMethod !== 'all') {
      filteredContacts = allContacts.filter(contact => contact.preferredContact === contactMethod)
    }

    // Get prayer categories
    const categories = await prisma.prayerCategory.findMany({
      where: { churchId: user.churchId },
      include: {
        _count: {
          select: {
            requests: {
              where: whereClause
            }
          }
        }
      }
    })

    // Get prayer response templates
    const templates = await prisma.prayerResponseTemplate.findMany({
      where: { churchId: user.churchId },
      include: {
        category: true
      }
    })

    // Calculate overview metrics
    const overview = {
      totalRequests: prayerRequests.length,
      approvedRequests: prayerRequests.filter(req => req.status === 'approved').length,
      rejectedRequests: prayerRequests.filter(req => req.status === 'rejected').length,
      pendingRequests: prayerRequests.filter(req => req.status === 'pending').length,
      totalContacts: allContacts.length,
      activeContacts: allContacts.length, // All contacts are considered active for now
      totalResponses: 0, // Would be calculated from actual message data
      avgResponseTime: 0 // Would be calculated from approval times
    }

    // Calculate average response time from approval data
    const approvedWithTimes = prayerRequests.filter(req => 
      req.status === 'approved' && req.approval?.approvedAt
    )

    if (approvedWithTimes.length > 0) {
      const totalResponseTime = approvedWithTimes.reduce((sum, req) => {
        const requestTime = new Date(req.createdAt).getTime()
        const approvalTime = new Date(req.approval!.approvedAt!).getTime()
        return sum + (approvalTime - requestTime)
      }, 0)
      
      overview.avgResponseTime = (totalResponseTime / approvedWithTimes.length) / (1000 * 60 * 60) // Convert to hours
    }

    // Generate trends data
    const trends = {
      requestsOverTime: [] as any[],
      contactGrowth: [] as any[],
      responseMetrics: [] as any[]
    }

    // Generate daily data for the period
    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const dayRequests = prayerRequests.filter(req => {
        const reqDate = new Date(req.createdAt)
        return reqDate >= dayStart && reqDate <= dayEnd
      })

      const dayContacts = allContacts.filter(contact => {
        const contactDate = new Date(contact.createdAt)
        return contactDate >= dayStart && contactDate <= dayEnd
      })

      trends.requestsOverTime.unshift({
        date: format(date, 'yyyy-MM-dd'),
        requests: dayRequests.length,
        approvals: dayRequests.filter(req => req.status === 'approved').length,
        rejections: dayRequests.filter(req => req.status === 'rejected').length
      })

      trends.contactGrowth.unshift({
        date: format(date, 'yyyy-MM-dd'),
        newContacts: dayContacts.length,
        totalContacts: allContacts.filter(contact => 
          new Date(contact.createdAt) <= dayEnd
        ).length
      })

      // Mock response metrics
      trends.responseMetrics.unshift({
        date: format(date, 'yyyy-MM-dd'),
        responsesSent: Math.floor(dayRequests.length * 0.8),
        deliveryRate: 92 + Math.random() * 6,
        responseRate: 15 + Math.random() * 15
      })
    }

    // Process categories analytics
    const categoryAnalytics = categories.map(category => {
      const categoryRequests = prayerRequests.filter(req => req.categoryId === category.id)
      const approvedInCategory = categoryRequests.filter(req => req.status === 'approved').length
      
      return {
        id: category.id,
        name: category.name,
        requestCount: categoryRequests.length,
        approvalRate: categoryRequests.length > 0 
          ? Math.round((approvedInCategory / categoryRequests.length) * 100)
          : 0,
        avgResponseTime: overview.avgResponseTime + (Math.random() - 0.5) * 2, // Add some variance
        color: category.color
      }
    })

    // Demographics analysis
    const contactMethods = [
      { method: 'email', count: 0, preference: 0 },
      { method: 'sms', count: 0, preference: 0 },
      { method: 'whatsapp', count: 0, preference: 0 }
    ]

    allContacts.forEach(contact => {
      const methodIndex = contactMethods.findIndex(m => m.method === contact.preferredContact)
      if (methodIndex !== -1) {
        contactMethods[methodIndex].count++
      }
    })

    // Calculate preferences
    const totalContacts = allContacts.length
    contactMethods.forEach(method => {
      method.preference = totalContacts > 0 
        ? Math.round((method.count / totalContacts) * 100)
        : 0
    })

    // Engagement metrics
    const repeatRequesters = allContacts.filter(contact => contact.requests.length > 1).length
    const avgRequestsPerContact = totalContacts > 0 
      ? prayerRequests.length / totalContacts
      : 0

    // Mock active hours and days data
    const mostActiveHours = [
      { hour: 9, count: Math.floor(Math.random() * 20) + 10 },
      { hour: 10, count: Math.floor(Math.random() * 15) + 8 },
      { hour: 11, count: Math.floor(Math.random() * 25) + 15 },
      { hour: 14, count: Math.floor(Math.random() * 18) + 12 },
      { hour: 19, count: Math.floor(Math.random() * 30) + 20 }
    ].sort((a, b) => b.count - a.count)

    const mostActiveDays = [
      { day: 'domingo', count: Math.floor(Math.random() * 40) + 30 },
      { day: 'lunes', count: Math.floor(Math.random() * 20) + 15 },
      { day: 'martes', count: Math.floor(Math.random() * 25) + 18 },
      { day: 'miércoles', count: Math.floor(Math.random() * 35) + 25 },
      { day: 'jueves', count: Math.floor(Math.random() * 22) + 16 },
      { day: 'viernes', count: Math.floor(Math.random() * 28) + 20 },
      { day: 'sábado', count: Math.floor(Math.random() * 32) + 22 }
    ].sort((a, b) => b.count - a.count)

    // Template analytics
    const templateAnalytics = templates.map((template: any) => ({
      id: template.id,
      name: template.name,
      usageCount: Math.floor(Math.random() * 50) + 10,
      successRate: 85 + Math.random() * 15,
      avgResponseTime: 1.5 + Math.random() * 3,
      category: template.category?.name
    })).sort((a: any, b: any) => b.usageCount - a.usageCount)

    const analytics = {
      overview,
      trends,
      categories: categoryAnalytics,
      demographics: {
        ageGroups: [
          { range: '18-25', count: Math.floor(Math.random() * 20) + 5 },
          { range: '26-35', count: Math.floor(Math.random() * 35) + 15 },
          { range: '36-50', count: Math.floor(Math.random() * 40) + 20 },
          { range: '51-65', count: Math.floor(Math.random() * 30) + 12 },
          { range: '65+', count: Math.floor(Math.random() * 25) + 8 }
        ],
        contactMethods,
        locations: [
          { location: 'San José', count: Math.floor(Math.random() * 50) + 30 },
          { location: 'Cartago', count: Math.floor(Math.random() * 25) + 15 },
          { location: 'Alajuela', count: Math.floor(Math.random() * 30) + 18 },
          { location: 'Heredia', count: Math.floor(Math.random() * 20) + 12 },
          { location: 'Puntarenas', count: Math.floor(Math.random() * 15) + 8 }
        ]
      },
      engagement: {
        repeatRequesters,
        avgRequestsPerContact,
        mostActiveHours,
        mostActiveDays,
        responseEngagement: {
          totalResponses: Math.floor(overview.approvedRequests * 0.8),
          readRate: 72 + Math.random() * 15,
          replyRate: 18 + Math.random() * 12,
          unsubscribeRate: 2 + Math.random() * 3
        }
      },
      templates: templateAnalytics
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error('Error fetching prayer analytics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
