
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Get social media posts
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
    const status = searchParams.get('status');
    const campaignId = searchParams.get('campaignId');

    const posts = await prisma.socialMediaPost.findMany({
      where: {
        churchId: user.churchId,
        ...(status && { status }),
        ...(campaignId && { campaignId })
      },
      include: {
        campaign: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching social media posts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Create social media post
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
      title, 
      content, 
      mediaUrls, 
      platforms, 
      accountIds, 
      scheduledAt, 
      hashtags, 
      mentions, 
      campaignId 
    } = await request.json();

    if (!content || !platforms || !accountIds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        title,
        content,
        mediaUrls: Array.isArray(mediaUrls) ? JSON.stringify(mediaUrls) : null,
        platforms: Array.isArray(platforms) ? JSON.stringify(platforms) : platforms,
        accountIds: Array.isArray(accountIds) ? JSON.stringify(accountIds) : accountIds,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        hashtags: Array.isArray(hashtags) ? JSON.stringify(hashtags) : null,
        mentions: Array.isArray(mentions) ? JSON.stringify(mentions) : null,
        campaignId: campaignId || null,
        authorId: user.id,
        churchId: user.churchId
      },
      include: {
        campaign: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating social media post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
