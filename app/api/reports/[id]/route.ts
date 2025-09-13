
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

    const report = await db.customReport.findFirst({
      where: {
        id: params.id,
        churchId
      },
      include: {
        schedules: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
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
      reportType,
      config,
      filters,
      columns,
      groupBy,
      sortBy,
      chartType,
      isPublic,
      isTemplate
    } = body;

    const report = await db.customReport.update({
      where: {
        id: params.id,
        churchId
      },
      data: {
        name,
        description,
        reportType,
        config: JSON.stringify(config),
        filters: filters ? JSON.stringify(filters) : null,
        columns: JSON.stringify(columns),
        groupBy: groupBy ? JSON.stringify(groupBy) : null,
        sortBy: sortBy ? JSON.stringify(sortBy) : null,
        chartType,
        isPublic: isPublic || false,
        isTemplate: isTemplate || false
      },
      include: {
        schedules: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json(report);
  } catch (error) {
    console.error('Report update error:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
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

    await db.customReport.delete({
      where: {
        id: params.id,
        churchId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
