
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '90'; // days
    const granularity = searchParams.get('granularity') || 'week'; // day, week, month
    const churchId = session.user.churchId;

    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(period));

    // Generate date intervals based on granularity
    const intervals: { start: Date; end: Date; label: string }[] = [];
    const current = new Date(startDate);
    
    while (current < endDate) {
      const intervalEnd = new Date(current);
      let label = '';
      
      if (granularity === 'day') {
        intervalEnd.setDate(current.getDate() + 1);
        label = current.toISOString().split('T')[0];
      } else if (granularity === 'week') {
        intervalEnd.setDate(current.getDate() + 7);
        label = `Week of ${current.toISOString().split('T')[0]}`;
      } else { // month
        intervalEnd.setMonth(current.getMonth() + 1);
        label = current.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      }
      
      intervals.push({
        start: new Date(current),
        end: intervalEnd > endDate ? endDate : intervalEnd,
        label
      });
      
      current.setTime(intervalEnd.getTime());
    }

    // Fetch trend data for each interval
    const trends = await Promise.all(intervals.map(async (interval) => {
      const [donations, events, communications, checkIns] = await Promise.all([
        db.donation.aggregate({
          where: {
            churchId,
            donationDate: { gte: interval.start, lt: interval.end },
            status: 'COMPLETADA'
          },
          _sum: { amount: true },
          _count: { id: true }
        }),
        
        db.event.aggregate({
          where: {
            churchId,
            startDate: { gte: interval.start, lt: interval.end }
          },
          _count: { id: true }
        }),
        
        db.communication.aggregate({
          where: {
            churchId,
            sentAt: { gte: interval.start, lt: interval.end }
          },
          _count: { id: true }
        }),
        
        db.checkIn.aggregate({
          where: {
            churchId,
            createdAt: { gte: interval.start, lt: interval.end }
          },
          _count: { id: true }
        })
      ]);

      return {
        period: interval.label,
        start: interval.start.toISOString(),
        end: interval.end.toISOString(),
        donations: {
          amount: donations._sum.amount || 0,
          count: donations._count.id
        },
        events: events._count.id,
        communications: communications._count.id,
        attendance: checkIns._count.id
      };
    }));

    return NextResponse.json({
      period: parseInt(period),
      granularity,
      trends
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics trends' },
      { status: 500 }
    );
  }
}
