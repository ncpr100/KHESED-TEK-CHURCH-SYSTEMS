
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Get marketing campaigns
export async function GET() {
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

    const campaigns = await prisma.marketingCampaign.findMany({
      where: {
        churchId: user.churchId
      },
      include: {
        posts: {
          select: { id: true, title: true, status: true }
        },
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching marketing campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Create marketing campaign
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
      name, 
      description, 
      objectives, 
      targetAudience, 
      budget, 
      currency, 
      startDate, 
      endDate, 
      platforms, 
      tags 
    } = await request.json();

    if (!name || !startDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = await prisma.marketingCampaign.create({
      data: {
        name,
        description,
        objectives: Array.isArray(objectives) ? JSON.stringify(objectives) : null,
        targetAudience: targetAudience ? JSON.stringify(targetAudience) : null,
        budget: budget ? parseFloat(budget) : null,
        currency: currency || 'USD',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        platforms: Array.isArray(platforms) ? JSON.stringify(platforms) : JSON.stringify([]),
        tags: Array.isArray(tags) ? JSON.stringify(tags) : null,
        managerId: user.id,
        churchId: user.churchId
      },
      include: {
        posts: {
          select: { id: true, title: true, status: true }
        },
        _count: {
          select: { posts: true }
        }
      }
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
