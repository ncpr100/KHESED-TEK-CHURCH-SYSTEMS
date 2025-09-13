
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Publish social media post
export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    // Get the post
    const post = await prisma.socialMediaPost.findUnique({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.status === 'PUBLISHED') {
      return NextResponse.json({ error: 'Post already published' }, { status: 400 });
    }

    // Get connected accounts
    const accountIds = JSON.parse(post.accountIds || '[]');
    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        id: { in: accountIds },
        churchId: user.churchId,
        isActive: true
      }
    });

    if (accounts.length === 0) {
      return NextResponse.json({ error: 'No active accounts found' }, { status: 400 });
    }

    // Here you would integrate with actual social media APIs
    // For now, we'll simulate the publishing process
    const postIds: { [key: string]: string } = {};
    
    for (const account of accounts) {
      // Simulate API call to each platform
      const platformPostId = `${account.platform.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      postIds[account.id] = platformPostId;
      
      // TODO: Implement actual API calls:
      // - Facebook Graph API
      // - Twitter API v2
      // - Instagram Basic Display API
      // - LinkedIn API
    }

    // Update post status
    const updatedPost = await prisma.socialMediaPost.update({
      where: { id: params.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        postIds: JSON.stringify(postIds)
      }
    });

    return NextResponse.json({ 
      message: 'Post published successfully',
      post: updatedPost,
      platformPostIds: postIds 
    });
  } catch (error) {
    console.error('Error publishing social media post:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
