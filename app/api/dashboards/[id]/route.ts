
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = session.user.churchId;
    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const dashboard = await db.analyticsDashboard.findFirst({
      where: {
        id: params.id,
        churchId
      },
      include: {
        widgets: {
          where: { isVisible: true },
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = session.user.churchId;
    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      layout,
      isDefault,
      isPublic,
      userRole
    } = body;

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.analyticsDashboard.updateMany({
        where: { churchId, isDefault: true, id: { not: params.id } },
        data: { isDefault: false }
      });
    }

    const dashboard = await db.analyticsDashboard.update({
      where: {
        id: params.id,
        churchId
      },
      data: {
        name,
        description,
        layout: JSON.stringify(layout),
        isDefault: isDefault || false,
        isPublic: isPublic || false,
        userRole
      },
      include: {
        widgets: {
          where: { isVisible: true },
          orderBy: { position: 'asc' }
        }
      }
    });

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Dashboard update error:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const churchId = session.user.churchId;
    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    await db.analyticsDashboard.delete({
      where: {
        id: params.id,
        churchId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dashboard deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    );
  }
}
