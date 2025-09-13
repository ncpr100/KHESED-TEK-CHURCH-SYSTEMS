

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

const CHURCH_KPI_TEMPLATES = [
  // Membership & Growth KPIs
  {
    name: "Total de Miembros Activos",
    description: "Número total de miembros activos en la iglesia",
    category: "MEMBERSHIP",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "member",
      filters: { isActive: true }
    }),
    color: "blue",
    icon: "users",
    unit: "miembros",
    period: "MONTHLY",
    target: 500
  },
  {
    name: "Nuevos Miembros",
    description: "Miembros que se unieron en el período actual",
    category: "GROWTH",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "member",
      filters: {
        isActive: true,
        createdAt: { gte: "PERIOD_START" }
      }
    }),
    color: "green",
    icon: "user-plus",
    unit: "nuevos",
    period: "MONTHLY",
    target: 10
  },

  // Financial KPIs
  {
    name: "Donaciones Totales",
    description: "Total de donaciones recibidas en el período",
    category: "FINANCIAL",
    metricType: "SUM",
    dataSource: JSON.stringify({
      type: "sum",
      model: "donation",
      field: "amount",
      filters: {
        status: "COMPLETADA",
        donationDate: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "green",
    icon: "dollar-sign",
    unit: "$",
    period: "MONTHLY",
    target: 50000
  },
  {
    name: "Donación Promedio",
    description: "Promedio de donación por transacción",
    category: "FINANCIAL",
    metricType: "AVERAGE",
    dataSource: JSON.stringify({
      type: "average",
      model: "donation",
      field: "amount",
      filters: {
        status: "COMPLETADA",
        donationDate: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "emerald",
    icon: "trending-up",
    unit: "$ promedio",
    period: "MONTHLY",
    target: 2500
  },

  // Ministry Engagement KPIs
  {
    name: "Eventos Realizados",
    description: "Número de eventos organizados en el período",
    category: "MINISTRY",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "event",
      filters: {
        startDate: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "purple",
    icon: "calendar",
    unit: "eventos",
    period: "MONTHLY",
    target: 12
  },
  {
    name: "Asistencias Registradas",
    description: "Total de check-ins realizados",
    category: "ENGAGEMENT",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "checkIn",
      filters: {
        checkInTime: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "blue",
    icon: "user-check",
    unit: "asistencias",
    period: "MONTHLY",
    target: 800
  },

  // Volunteer & Service KPIs
  {
    name: "Voluntarios Activos",
    description: "Número de voluntarios que han servido",
    category: "VOLUNTEERS",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "volunteer",
      filters: { isActive: true }
    }),
    color: "red",
    icon: "heart",
    unit: "voluntarios",
    period: "MONTHLY",
    target: 50
  },
  {
    name: "Asignaciones de Voluntarios",
    description: "Asignaciones completadas por voluntarios",
    category: "VOLUNTEERS",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "volunteerAssignment",
      filters: {
        status: { in: ["CONFIRMADO", "COMPLETADO"] },
        date: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "orange",
    icon: "briefcase",
    unit: "asignaciones",
    period: "MONTHLY",
    target: 100
  },

  // Communication & Outreach KPIs
  {
    name: "Comunicaciones Enviadas",
    description: "Total de mensajes enviados a la congregación",
    category: "COMMUNICATION",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "communication",
      filters: {
        sentAt: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "cyan",
    icon: "message-square",
    unit: "mensajes",
    period: "MONTHLY",
    target: 25
  },
  {
    name: "Alcance de Comunicación",
    description: "Total de personas alcanzadas por comunicaciones",
    category: "COMMUNICATION",
    metricType: "SUM",
    dataSource: JSON.stringify({
      type: "sum",
      model: "communication",
      field: "recipients",
      filters: {
        sentAt: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "indigo",
    icon: "users",
    unit: "personas",
    period: "MONTHLY",
    target: 2000
  },

  // Prayer Ministry KPIs
  {
    name: "Peticiones de Oración",
    description: "Peticiones de oración recibidas",
    category: "PRAYER",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "prayerRequest",
      filters: {
        createdAt: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "violet",
    icon: "heart",
    unit: "peticiones",
    period: "MONTHLY",
    target: 30
  },
  {
    name: "Respuestas de Oración",
    description: "Respuestas/testimonios de oración reportados",
    category: "PRAYER",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "prayerResponse",
      filters: {
        createdAt: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "pink",
    icon: "star",
    unit: "respuestas",
    period: "MONTHLY",
    target: 15
  },

  // Follow-up & Care KPIs
  {
    name: "Seguimientos Realizados",
    description: "Seguimientos pastorales completados",
    category: "PASTORAL_CARE",
    metricType: "COUNT",
    dataSource: JSON.stringify({
      type: "count",
      model: "followUp",
      filters: {
        createdAt: { gte: "PERIOD_START", lte: "PERIOD_END" }
      }
    }),
    color: "teal",
    icon: "phone",
    unit: "seguimientos",
    period: "MONTHLY",
    target: 20
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    let templates = CHURCH_KPI_TEMPLATES;
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    return NextResponse.json({
      templates: templates,
      categories: [
        { value: 'MEMBERSHIP', label: 'Membresía', count: templates.filter(t => t.category === 'MEMBERSHIP').length },
        { value: 'GROWTH', label: 'Crecimiento', count: templates.filter(t => t.category === 'GROWTH').length },
        { value: 'FINANCIAL', label: 'Finanzas', count: templates.filter(t => t.category === 'FINANCIAL').length },
        { value: 'MINISTRY', label: 'Ministerio', count: templates.filter(t => t.category === 'MINISTRY').length },
        { value: 'ENGAGEMENT', label: 'Participación', count: templates.filter(t => t.category === 'ENGAGEMENT').length },
        { value: 'VOLUNTEERS', label: 'Voluntarios', count: templates.filter(t => t.category === 'VOLUNTEERS').length },
        { value: 'COMMUNICATION', label: 'Comunicación', count: templates.filter(t => t.category === 'COMMUNICATION').length },
        { value: 'PRAYER', label: 'Oración', count: templates.filter(t => t.category === 'PRAYER').length },
        { value: 'PASTORAL_CARE', label: 'Cuidado Pastoral', count: templates.filter(t => t.category === 'PASTORAL_CARE').length }
      ]
    });

  } catch (error) {
    console.error('KPI templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KPI templates' },
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
    const { templateIds } = body; // Array of template indices to create

    if (!Array.isArray(templateIds)) {
      return NextResponse.json({ error: 'templateIds must be an array' }, { status: 400 });
    }

    // Import db and create KPIs from templates
    const { db } = await import('@/lib/db');
    const createdKPIs = [];

    for (const templateId of templateIds) {
      const template = CHURCH_KPI_TEMPLATES[templateId];
      if (!template) continue;

      try {
        const kpiMetric = await db.kPIMetric.create({
          data: {
            ...template,
            churchId,
            isActive: true,
            currentValue: 0,
            lastCalculated: new Date()
          }
        });
        createdKPIs.push(kpiMetric);
      } catch (error) {
        console.error(`Error creating KPI from template ${templateId}:`, error);
      }
    }

    return NextResponse.json({
      created: createdKPIs.length,
      kpiMetrics: createdKPIs
    }, { status: 201 });

  } catch (error) {
    console.error('KPI template creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create KPIs from templates' },
      { status: 500 }
    );
  }
}

