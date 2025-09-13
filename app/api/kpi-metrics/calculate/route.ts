
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
    const { metricIds } = body;

    // Get KPI metrics to recalculate
    const metrics = await db.kPIMetric.findMany({
      where: {
        churchId,
        ...(metricIds && { id: { in: metricIds } }),
        isActive: true
      }
    });

    const updatedMetrics = [];

    for (const metric of metrics) {
      try {
        const dataSourceConfig = JSON.parse(metric.dataSource);
        let currentValue = 0;
        let previousValue = null;

        // Calculate current value based on data source configuration
        switch (dataSourceConfig.type) {
          case 'count':
            if (dataSourceConfig.model && (db as any)[dataSourceConfig.model]) {
              const model = (db as any)[dataSourceConfig.model];
              const result = await model.count({
                where: {
                  churchId,
                  ...dataSourceConfig.filters
                }
              });
              currentValue = result;
            }
            break;

          case 'sum':
            if (dataSourceConfig.model && dataSourceConfig.field && (db as any)[dataSourceConfig.model]) {
              const model = (db as any)[dataSourceConfig.model];
              const result = await model.aggregate({
                where: {
                  churchId,
                  ...dataSourceConfig.filters
                },
                _sum: {
                  [dataSourceConfig.field]: true
                }
              });
              currentValue = result._sum[dataSourceConfig.field] || 0;
            }
            break;

          case 'average':
            if (dataSourceConfig.model && dataSourceConfig.field && (db as any)[dataSourceConfig.model]) {
              const model = (db as any)[dataSourceConfig.model];
              const result = await model.aggregate({
                where: {
                  churchId,
                  ...dataSourceConfig.filters
                },
                _avg: {
                  [dataSourceConfig.field]: true
                }
              });
              currentValue = result._avg[dataSourceConfig.field] || 0;
            }
            break;

          case 'percentage':
            // Custom percentage calculations would go here
            // For example: (completed tasks / total tasks) * 100
            break;

          default:
            console.warn(`Unsupported metric type: ${dataSourceConfig.type}`);
        }

        // Calculate previous period value for comparison
        if (dataSourceConfig.previousPeriodFilters) {
          // Similar calculation with previous period filters
          // This would be implemented based on the specific requirements
        }

        // Calculate change percentage and trend
        let changePercent = null;
        let trendDirection = null;

        if (previousValue !== null && metric.previousValue !== null) {
          changePercent = previousValue === 0 ? 
            (currentValue > 0 ? 100 : 0) :
            Math.round(((currentValue - metric.previousValue) / metric.previousValue) * 100);

          if (changePercent > 0) {
            trendDirection = 'UP';
          } else if (changePercent < 0) {
            trendDirection = 'DOWN';
          } else {
            trendDirection = 'STABLE';
          }
        }

        // Update the metric
        const updatedMetric = await db.kPIMetric.update({
          where: { id: metric.id },
          data: {
            currentValue,
            previousValue: metric.currentValue, // Previous current becomes previous
            changePercent,
            trendDirection,
            lastCalculated: new Date()
          }
        });

        updatedMetrics.push(updatedMetric);

      } catch (error) {
        console.error(`Error calculating metric ${metric.id}:`, error);
      }
    }

    return NextResponse.json({
      updated: updatedMetrics.length,
      metrics: updatedMetrics
    });

  } catch (error) {
    console.error('KPI calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate KPI metrics' },
      { status: 500 }
    );
  }
}
