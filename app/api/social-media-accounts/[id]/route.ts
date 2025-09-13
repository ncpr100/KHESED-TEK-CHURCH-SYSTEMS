
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Update social media account
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const { isActive, accessToken, refreshToken, tokenExpiresAt, accountData } = await request.json();

    const account = await prisma.socialMediaAccount.update({
      where: {
        id: params.id,
        churchId: user.churchId
      },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(tokenExpiresAt && { tokenExpiresAt: new Date(tokenExpiresAt) }),
        ...(accountData && { accountData: JSON.stringify(accountData) }),
        lastSync: new Date()
      },
      select: {
        id: true,
        platform: true,
        username: true,
        displayName: true,
        isActive: true,
        lastSync: true,
        updatedAt: true
      }
    });

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error updating social media account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Delete social media account
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    await prisma.socialMediaAccount.delete({
      where: {
        id: params.id,
        churchId: user.churchId
      }
    });

    return NextResponse.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error deleting social media account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
