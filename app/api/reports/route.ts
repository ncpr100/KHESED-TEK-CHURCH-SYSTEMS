
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

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type');
    const isTemplate = searchParams.get('template') === 'true';

    const reports = await db.customReport.findMany({
      where: {
        churchId,
        ...(reportType && { reportType }),
        ...(isTemplate !== undefined && { isTemplate })
      },
      include: {
        schedules: {
          where: { isActive: true }
        },
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
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

    // Validate required fields
    if (!name || !reportType || !config || !columns) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const report = await db.customReport.create({
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
        isTemplate: isTemplate || false,
        createdBy: session.user.id,
        churchId
      },
      include: {
        schedules: true,
        executions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
