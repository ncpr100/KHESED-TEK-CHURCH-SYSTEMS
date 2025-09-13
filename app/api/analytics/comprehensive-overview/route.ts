

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30'; // days
    const churchId = session.user.churchId;

    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Comprehensive data fetching for enhanced analytics
    const [
      memberStats,
      donationStats,
      eventStats,
      communicationStats,
      volunteerStats,
      prayerRequestStats,
      checkInStats,
      followUpStats,
      socialMediaStats,
      automationStats
    ] = await Promise.all([
      // Enhanced Member Analytics
      Promise.all([
        db.member.aggregate({
          where: { churchId, isActive: true },
          _count: { id: true }
        }),
        db.member.findMany({
          where: { 
            churchId, 
            isActive: true,
            createdAt: { gte: startDate, lte: endDate }
          },
          select: { createdAt: true }
        })
      ]),
      
      // Enhanced Donation Analytics
      Promise.all([
        db.donation.aggregate({
          where: { 
            churchId,
            donationDate: { gte: startDate, lte: endDate },
            status: 'COMPLETADA'
          },
          _sum: { amount: true },
          _count: { id: true },
          _avg: { amount: true }
        }),
        db.donationCategory.findMany({
          where: { churchId },
          include: {
            donations: {
              where: {
                donationDate: { gte: startDate, lte: endDate },
                status: 'COMPLETADA'
              }
            }
          }
        })
      ]),

      // Enhanced Event Analytics
      Promise.all([
        db.event.aggregate({
          where: { 
            churchId,
            startDate: { gte: startDate, lte: endDate }
          },
          _count: { id: true }
        }),
        db.event.findMany({
          where: { 
            churchId,
            startDate: { gte: startDate, lte: endDate }
          },
          include: {
            resourceReservations: true
          }
        })
      ]),

      // Enhanced Communication Analytics
      Promise.all([
        db.communication.aggregate({
          where: { 
            churchId,
            sentAt: { gte: startDate, lte: endDate }
          },
          _count: { id: true },
          _sum: { recipients: true }
        }),
        db.communicationTemplate.aggregate({
          where: { churchId, isActive: true },
          _count: { id: true }
        })
      ]),

      // Enhanced Volunteer Analytics  
      Promise.all([
        db.volunteer.aggregate({
          where: { churchId, isActive: true },
          _count: { id: true }
        }),
        db.volunteerAssignment.aggregate({
          where: { 
            churchId,
            date: { gte: startDate, lte: endDate },
            status: { in: ['CONFIRMADO', 'COMPLETADO'] }
          },
          _count: { id: true }
        })
      ]),

      // Prayer Request Analytics
      Promise.all([
        db.prayerRequest.aggregate({
          where: { 
            churchId,
            createdAt: { gte: startDate, lte: endDate }
          },
          _count: { id: true }
        }),
        // Count prayer responses by counting responses in prayer requests
        Promise.resolve({ _count: { id: 0 } }) // Placeholder for now
      ]),

      // Check-In Analytics (using correct field name)
      db.checkIn.aggregate({
        where: { 
          churchId,
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      }),

      // Follow-Up Analytics (placeholder - may not exist in schema)
      Promise.resolve({ _count: { id: 0 } }),

      // Social Media Analytics
      db.socialMediaPost.aggregate({
        where: { 
          churchId,
          createdAt: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      }),

      // Automation Analytics
      db.automationRule.aggregate({
        where: { churchId, isActive: true },
        _count: { id: true }
      })
    ]);

    // Process member growth
    const memberGrowth = memberStats[1].length;

    // Process donation categories
    const donationByCategory = donationStats[1].map((category: any) => ({
      category: category.name,
      amount: category.donations.reduce((sum: number, d: any) => sum + d.amount, 0),
      count: category.donations.length
    }));

    // Process event utilization
    const eventUtilization = {
      totalEvents: eventStats[0]._count.id,
      resourcesBooked: eventStats[1].reduce((sum: number, e: any) => sum + e.resourceReservations.length, 0),
      averageResourcesPerEvent: eventStats[1].length > 0 ? 
        eventStats[1].reduce((sum: number, e: any) => sum + e.resourceReservations.length, 0) / eventStats[1].length : 0
    };

    // Comprehensive overview response
    const comprehensiveOverview = {
      period: parseInt(period),
      lastUpdated: new Date().toISOString(),
      
      // Core Ministry Metrics
      membership: {
        total: memberStats[0]._count.id,
        newMembers: memberGrowth,
        growth: memberStats[0]._count.id > 0 ? (memberGrowth / memberStats[0]._count.id) * 100 : 0
      },

      donations: {
        total: donationStats[0]._sum.amount || 0,
        count: donationStats[0]._count.id,
        average: donationStats[0]._avg.amount || 0,
        byCategory: donationByCategory,
        uniqueDonors: donationStats[0]._count.id // Simplified - could enhance with unique donor count
      },

      events: {
        total: eventStats[0]._count.id,
        resourceUtilization: eventUtilization,
        averageResourcesPerEvent: Math.round(eventUtilization.averageResourcesPerEvent * 100) / 100
      },

      communications: {
        messagesSent: communicationStats[0]._count.id,
        totalRecipients: communicationStats[0]._sum.recipients || 0,
        templatesAvailable: communicationStats[1]._count.id,
        averageRecipientsPerMessage: communicationStats[0]._count.id > 0 ? 
          (communicationStats[0]._sum.recipients || 0) / communicationStats[0]._count.id : 0
      },

      volunteers: {
        total: volunteerStats[0]._count.id,
        activeAssignments: volunteerStats[1]._count.id,
        participationRate: volunteerStats[0]._count.id > 0 ? 
          (volunteerStats[1]._count.id / volunteerStats[0]._count.id) * 100 : 0
      },

      prayerMinistry: {
        requestsReceived: prayerRequestStats[0]._count.id,
        responsesGiven: prayerRequestStats[1]._count.id,
        responseRate: prayerRequestStats[0]._count.id > 0 ?
          (prayerRequestStats[1]._count.id / prayerRequestStats[0]._count.id) * 100 : 0
      },

      engagement: {
        checkIns: checkInStats._count.id,
        followUps: followUpStats._count.id,
        socialMediaPosts: socialMediaStats._count.id,
        activeAutomations: automationStats._count.id
      },

      // Calculated Insights
      insights: {
        memberEngagement: {
          checkInRate: memberStats[0]._count.id > 0 ? 
            (checkInStats._count.id / memberStats[0]._count.id) * 100 : 0,
          communicationReach: memberStats[0]._count.id > 0 ?
            ((communicationStats[0]._sum.recipients || 0) / memberStats[0]._count.id) * 100 : 0
        },
        ministryEffectiveness: {
          prayerEngagement: prayerRequestStats[0]._count.id + prayerRequestStats[1]._count.id,
          volunteerUtilization: volunteerStats[0]._count.id > 0 ? 
            (volunteerStats[1]._count.id / volunteerStats[0]._count.id) * 100 : 0,
          eventParticipation: eventStats[0]._count.id > 0 ? 
            (checkInStats._count.id / eventStats[0]._count.id) : 0
        }
      }
    };

    return NextResponse.json(comprehensiveOverview);

  } catch (error) {
    console.error('Comprehensive analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comprehensive analytics' },
      { status: 500 }
    );
  }
}

