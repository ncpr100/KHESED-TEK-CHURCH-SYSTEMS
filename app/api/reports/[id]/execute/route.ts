
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
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
    const { format = 'JSON', parameters } = body;

    // Get the report configuration
    const report = await db.customReport.findFirst({
      where: {
        id: params.id,
        churchId
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Create execution record
    const execution = await db.reportExecution.create({
      data: {
        reportId: params.id,
        status: 'RUNNING',
        format,
        parameters: parameters ? JSON.stringify(parameters) : null,
        executedBy: session.user.id,
        churchId
      }
    });

    try {
      const startTime = Date.now();

      // Parse report configuration
      const config = JSON.parse(report.config);
      const filters = report.filters ? JSON.parse(report.filters) : {};
      const columns = JSON.parse(report.columns);

      // Execute report based on type
      let data: any[] = [];
      let query: any = { where: { churchId } };

      // Apply filters
      if (filters.dateFrom || filters.dateTo) {
        const dateField = filters.dateField || 'createdAt';
        query.where[dateField] = {};
        if (filters.dateFrom) query.where[dateField].gte = new Date(filters.dateFrom);
        if (filters.dateTo) query.where[dateField].lte = new Date(filters.dateTo);
      }

      // Execute query based on report type
      switch (report.reportType) {
        case 'FINANCIAL':
          data = await db.donation.findMany({
            ...query,
            include: {
              member: true,
              category: true,
              paymentMethod: true
            },
            orderBy: { donationDate: 'desc' }
          });
          break;

        case 'MEMBER':
          data = await db.member.findMany({
            ...query,
            include: {
              ministry: true,
              user: true
            },
            orderBy: { createdAt: 'desc' }
          });
          break;

        case 'EVENT':
          data = await db.event.findMany({
            ...query,
            include: {
              checkIns: true,
              childrenCheckIns: true,
              resourceReservations: {
                include: { resource: true }
              }
            },
            orderBy: { startDate: 'desc' }
          });
          break;

        case 'COMMUNICATION':
          data = await db.communication.findMany({
            ...query,
            orderBy: { createdAt: 'desc' }
          });
          break;

        default:
          // Custom query execution would go here
          data = [];
      }

      // Apply column filtering
      const filteredData = data.map(item => {
        const filteredItem: any = {};
        columns.forEach((col: string) => {
          if (col.includes('.')) {
            // Handle nested properties
            const parts = col.split('.');
            let value = item;
            parts.forEach(part => {
              value = value?.[part];
            });
            filteredItem[col] = value;
          } else {
            filteredItem[col] = item[col];
          }
        });
        return filteredItem;
      });

      const executionTime = Date.now() - startTime;

      // Update execution with results
      const completedExecution = await db.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          rowCount: filteredData.length,
          executionTime,
          completedAt: new Date()
        }
      });

      // Update report last run info
      await db.customReport.update({
        where: { id: params.id },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 }
        }
      });

      return NextResponse.json({
        execution: completedExecution,
        data: filteredData,
        rowCount: filteredData.length,
        executionTime
      });

    } catch (error) {
      // Update execution with error
      await db.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      });

      throw error;
    }

  } catch (error) {
    console.error('Report execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute report' },
      { status: 500 }
    );
  }
}
