
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
    const category = searchParams.get('category');
    const period = searchParams.get('period');

    const kpiMetrics = await db.kPIMetric.findMany({
      where: {
        churchId,
        isActive: true,
        ...(category && { category }),
        ...(period && { period })
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(kpiMetrics);
  } catch (error) {
    console.error('KPI metrics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI metrics' },
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
      category,
      metricType,
      dataSource,
      target,
      color,
      icon,
      unit,
      period
    } = body;

    // Validate required fields
    if (!name || !category || !metricType || !dataSource) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate initial value based on data source
    let currentValue = 0;
    try {
      // This would be expanded to handle different data source types
      const dataSourceConfig = JSON.parse(dataSource);
      
      // Example: Simple count query
      if (dataSourceConfig.type === 'count' && dataSourceConfig.model) {
        const model = (db as any)[dataSourceConfig.model];
        if (model) {
          const result = await model.count({
            where: { 
              churchId,
              ...dataSourceConfig.filters
            }
          });
          currentValue = result;
        }
      }
    } catch (error) {
      console.warn('Could not calculate initial KPI value:', error);
    }

    const kpiMetric = await db.kPIMetric.create({
      data: {
        name,
        description,
        category,
        metricType,
        dataSource,
        target,
        currentValue,
        color: color || 'blue',
        icon,
        unit,
        period: period || 'MONTHLY',
        churchId
      }
    });

    return NextResponse.json(kpiMetric, { status: 201 });
  } catch (error) {
    console.error('KPI metric creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create KPI metric' },
      { status: 500 }
    );
  }
}
