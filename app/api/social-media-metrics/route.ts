
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Get social media metrics
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const accountId = searchParams.get('accountId');
    const postId = searchParams.get('postId');
    const metricType = searchParams.get('metricType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const periodType = searchParams.get('periodType') || 'DAILY';

    const metrics = await prisma.socialMediaMetrics.findMany({
      where: {
        churchId: user.churchId,
        ...(platform && { platform }),
        ...(accountId && { accountId }),
        ...(postId && { postId }),
        ...(metricType && { metricType }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        }),
        periodType
      },
      include: {
        account: {
          select: {
            platform: true,
            username: true,
            displayName: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching social media metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Create social media metric
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const { 
      accountId, 
      postId, 
      campaignId, 
      platform, 
      metricType, 
      value, 
      date, 
      periodType, 
      metadata 
    } = await request.json();

    if (!accountId || !platform || !metricType || value === undefined || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const metric = await prisma.socialMediaMetrics.create({
      data: {
        accountId,
        postId: postId || null,
        campaignId: campaignId || null,
        platform,
        metricType,
        value: parseFloat(value),
        date: new Date(date),
        periodType: periodType || 'DAILY',
        metadata: metadata ? JSON.stringify(metadata) : null,
        churchId: user.churchId
      },
      include: {
        account: {
          select: {
            platform: true,
            username: true,
            displayName: true
          }
        }
      }
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error creating social media metric:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
