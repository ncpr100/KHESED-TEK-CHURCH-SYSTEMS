
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Get social media accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { church: true }
    });

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const accounts = await prisma.socialMediaAccount.findMany({
      where: {
        churchId: user.churchId,
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

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Create/Connect social media account
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { church: true }
    });

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const { platform, accountId, username, displayName, accessToken, refreshToken, tokenExpiresAt, accountData } = await request.json();

    if (!platform || !accountId || !accessToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if account already exists
    const existingAccount = await prisma.socialMediaAccount.findUnique({
      where: {
        platform_accountId_churchId: {
          platform,
          accountId,
          churchId: user.churchId
        }
      }
    });

    if (existingAccount) {
      return NextResponse.json({ error: 'Account already connected' }, { status: 409 });
    }

    const account = await prisma.socialMediaAccount.create({
      data: {
        platform,
        accountId,
        username,
        displayName,
        accessToken, // Should be encrypted in production
        refreshToken, // Should be encrypted in production
        tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
        accountData: accountData ? JSON.stringify(accountData) : null,
        churchId: user.churchId,
        connectedBy: user.id,
        lastSync: new Date()
      },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        isActive: true,
        lastSync: true,
        createdAt: true
      }
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error creating social media account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
