
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
      category,
      metricType,
      dataSource,
      target,
      color,
      icon,
      unit,
      period,
      isActive
    } = body;

    const kpiMetric = await db.kPIMetric.update({
      where: {
        id: params.id,
        churchId
      },
      data: {
        name,
        description,
        category,
        metricType,
        dataSource,
        target,
        color,
        icon,
        unit,
        period,
        isActive
      }
    });

    return NextResponse.json(kpiMetric);
  } catch (error) {
    console.error('KPI metric update error:', error);
    return NextResponse.json(
      { error: 'Failed to update KPI metric' },
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

    await db.kPIMetric.delete({
      where: {
        id: params.id,
        churchId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('KPI metric deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete KPI metric' },
      { status: 500 }
    );
  }
}
