
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

// GET /api/prayer-analytics/export - Export prayer analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { church: true }
    })

    if (!user?.churchId) {
      return NextResponse.json({ error: 'Usuario sin iglesia asignada' }, { status: 403 })
    }

    // Check permissions
    if (!['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'LIDER'].includes(user.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') || '30')
    const category = url.searchParams.get('category') || 'all'
    const status = url.searchParams.get('status') || 'all'
    const contactMethod = url.searchParams.get('contactMethod') || 'all'
    const format_type = url.searchParams.get('format') || 'csv'

    const startDate = subDays(new Date(), days)
    const endDate = new Date()

    // Build where clause for filtering
    const whereClause: any = {
      churchId: user.churchId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (category !== 'all') {
      whereClause.categoryId = category
    }

    if (status !== 'all') {
      whereClause.status = status
    }

    // Get prayer requests for export
    const prayerRequests = await prisma.prayerRequest.findMany({
      where: whereClause,
      include: {
        category: true,
        contact: true,
        approval: {
          include: {
            approver: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Filter by contact method if specified
    let filteredRequests = prayerRequests
    if (contactMethod !== 'all') {
      filteredRequests = prayerRequests.filter(req => 
        req.contact?.preferredContact === contactMethod
      )
    }

    if (format_type === 'csv') {
      // Generate CSV export
      const headers = [
        'ID',
        'Fecha Creación',
        'Estado',
        'Prioridad',
        'Categoría',
        'Contacto',
        'Email',
        'Teléfono',
        'Método Preferido',
        'Es Anónimo',
        'Mensaje',
        'Fecha Aprobación',
        'Aprobado Por',
        'Notas de Aprobación'
      ]

      const rows = filteredRequests.map(req => [
        req.id,
        format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        req.status,
        req.priority || 'normal',
        req.category?.name || 'Sin categoría',
        req.contact?.fullName || 'Usuario anónimo',
        req.contact?.email || '',
        req.contact?.phone || '',
        req.contact?.preferredContact || 'email',
        req.isAnonymous ? 'Sí' : 'No',
        `"${(req.message || '').replace(/"/g, '""')}"`, // Escape quotes for CSV
        req.approval?.approvedAt ? format(new Date(req.approval.approvedAt), 'yyyy-MM-dd HH:mm:ss') : '',
        req.approval?.approver?.name || '',
        req.approval?.notes ? `"${req.approval.notes.replace(/"/g, '""')}"` : ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      // Add BOM for proper UTF-8 encoding in Excel
      const bom = '\ufeff'
      const csvWithBom = bom + csvContent

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="analisis-oraciones-${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      })
    } else {
      // Return JSON format
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          period: `${days} días`,
          filters: {
            category: category === 'all' ? 'Todas' : category,
            status: status === 'all' ? 'Todos' : status,
            contactMethod: contactMethod === 'all' ? 'Todos' : contactMethod
          },
          church: user.church?.name || 'Iglesia',
          exportedBy: user.name || 'Usuario'
        },
        summary: {
          totalRequests: filteredRequests.length,
          approvedRequests: filteredRequests.filter(req => req.status === 'approved').length,
          rejectedRequests: filteredRequests.filter(req => req.status === 'rejected').length,
          pendingRequests: filteredRequests.filter(req => req.status === 'pending').length,
          uniqueContacts: new Set(filteredRequests.map(req => req.contactId)).size
        },
        requests: filteredRequests.map(req => ({
          id: req.id,
          createdAt: req.createdAt,
          status: req.status,
          priority: req.priority || 'normal',
          category: req.category?.name || 'Sin categoría',
          contact: {
            name: req.contact?.fullName || 'Usuario anónimo',
            email: req.contact?.email || null,
            phone: req.contact?.phone || null,
            preferredContact: req.contact?.preferredContact || 'email'
          },
          isAnonymous: req.isAnonymous,
          message: req.message,
          approval: req.approval ? {
            approvedAt: req.approval.approvedAt,
            approvedBy: req.approval.approver?.name,
            notes: req.approval.notes
          } : null
        }))
      }

      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="analisis-oraciones-${format(new Date(), 'yyyy-MM-dd')}.json"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting prayer analytics:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
