
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

    const churchId = session.user.churchId;
    if (!churchId) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    const dashboards = await db.analyticsDashboard.findMany({
      where: {
        churchId,
        OR: [
          { isPublic: true },
          { createdBy: session.user.id },
          { userRole: session.user.role }
        ]
      },
      include: {
        widgets: {
          where: { isVisible: true },
          orderBy: [
            { position: 'asc' }
          ]
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Dashboards fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!name || !layout) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await db.analyticsDashboard.updateMany({
        where: { churchId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const dashboard = await db.analyticsDashboard.create({
      data: {
        name,
        description,
        layout: JSON.stringify(layout),
        isDefault: isDefault || false,
        isPublic: isPublic || false,
        userRole,
        createdBy: session.user.id,
        churchId
      },
      include: {
        widgets: true
      }
    });

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error('Dashboard creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  }
}
