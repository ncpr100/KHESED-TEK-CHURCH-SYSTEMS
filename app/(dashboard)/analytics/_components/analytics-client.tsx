
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Calendar, 
  MessageSquare, Share2, UserCheck, Loader2, RefreshCw,
  BarChart3, PieChart as PieChartIcon, Activity, ExternalLink,
  FileText, Download, Heart, Phone, Zap, FileSpreadsheet,
  Database, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AnalyticsOverview {
  period: number;
  members: { total: number; growth: number };
  donations: { total: number; count: number; average: number; growth: number };
  events: { total: number; growth: number };
  communications: { total: number; growth: number };
  socialMedia: { posts: number; growth: number };
  volunteers: { total: number; growth: number };
  comprehensive?: any; // Allow comprehensive data to be added dynamically
}

interface TrendData {
  period: string;
  start: string;
  end: string;
  donations: { amount: number; count: number };
  events: number;
  communications: number;
  attendance: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<{ trends: TrendData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [granularity, setGranularity] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateReport, setShowCreateReport] = useState(false);

  const fetchAnalyticsData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(!showLoader);
    setError(null);

    try {
      const [overviewRes, trendsRes, comprehensiveRes] = await Promise.all([
        fetch(`/api/analytics/overview?period=${period}`, {
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/analytics/trends?period=${period}&granularity=${granularity}`, {
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch(`/api/analytics/comprehensive-overview?period=${period}`, {
          headers: { 'Content-Type': 'application/json' }
        })
      ]);

      if (!overviewRes.ok || !trendsRes.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const [overviewData, trendsData, comprehensiveData] = await Promise.all([
        overviewRes.json(),
        trendsRes.json(),
        comprehensiveRes.ok ? comprehensiveRes.json() : null
      ]);

      setOverview(overviewData);
      setTrends(trendsData);
      
      // Enhance overview with comprehensive data if available
      if (comprehensiveData) {
        setOverview(prev => prev ? ({
          ...prev,
          comprehensive: comprehensiveData
        }) : null);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Error al cargar los datos analíticos. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAnalyticsData();
    }
  }, [session, period, granularity]);

  // Export Utilities
  const convertToCSV = (data: any) => {
    const headers = ['Métrica', 'Valor', 'Crecimiento', 'Período']
    const rows = []
    
    if (overview) {
      rows.push(['Miembros Totales', overview.members.total, `${overview.members.growth}%`, `${period} días`])
      rows.push(['Donaciones Totales', formatCurrency(overview.donations.total), `${overview.donations.growth}%`, `${period} días`])
      rows.push(['Promedio Donación', formatCurrency(overview.donations.average), '', `${period} días`])
      rows.push(['Eventos Realizados', overview.events.total, `${overview.events.growth}%`, `${period} días`])
      rows.push(['Comunicaciones Enviadas', overview.communications.total, `${overview.communications.growth}%`, `${period} días`])
      rows.push(['Voluntarios Activos', overview.volunteers.total, `${overview.volunteers.growth}%`, `${period} días`])
      rows.push(['Publicaciones Sociales', overview.socialMedia.posts, `${overview.socialMedia.growth}%`, `${period} días`])
      
      if (overview.comprehensive) {
        rows.push(['Peticiones de Oración', overview.comprehensive.prayerMinistry.requestsReceived, '', `${period} días`])
        rows.push(['Check-ins Registrados', overview.comprehensive.engagement.checkIns, '', `${period} días`])
        rows.push(['Seguimientos Realizados', overview.comprehensive.engagement.followUps, '', `${period} días`])
      }
    }
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    return csvContent
  }

  const convertToExcelData = () => {
    const data = {
      worksheets: [
        {
          name: 'Métricas Principales',
          data: overview ? [
            ['Métrica', 'Valor Actual', 'Crecimiento (%)', 'Período'],
            ['Miembros Activos', overview.members.total, overview.members.growth, `${period} días`],
            ['Donaciones Totales', overview.donations.total, overview.donations.growth, `${period} días`],
            ['Promedio por Donación', overview.donations.average, '', `${period} días`],
            ['Total Donaciones', overview.donations.count, '', `${period} días`],
            ['Eventos Realizados', overview.events.total, overview.events.growth, `${period} días`],
            ['Comunicaciones', overview.communications.total, overview.communications.growth, `${period} días`],
            ['Voluntarios Activos', overview.volunteers.total, overview.volunteers.growth, `${period} días`],
            ['Publicaciones Sociales', overview.socialMedia.posts, overview.socialMedia.growth, `${period} días`]
          ] : []
        },
        {
          name: 'Tendencias',
          data: trends?.trends ? [
            ['Período', 'Donaciones (Monto)', 'Donaciones (Cantidad)', 'Eventos', 'Comunicaciones', 'Asistencia'],
            ...trends.trends.map(trend => [
              trend.period,
              trend.donations.amount,
              trend.donations.count,
              trend.events,
              trend.communications,
              trend.attendance
            ])
          ] : []
        }
      ]
    }

    if (overview?.comprehensive) {
      data.worksheets.push({
        name: 'Métricas Avanzadas',
        data: [
          ['Categoría', 'Métrica', 'Valor', 'Detalles'],
          ['Oración', 'Peticiones Recibidas', overview.comprehensive.prayerMinistry.requestsReceived, ''],
          ['Oración', 'Respuestas Dadas', overview.comprehensive.prayerMinistry.responsesGiven, ''],
          ['Oración', 'Tasa de Respuesta', `${overview.comprehensive.prayerMinistry.responseRate}%`, ''],
          ['Participación', 'Check-ins', overview.comprehensive.engagement.checkIns, ''],
          ['Participación', 'Seguimientos', overview.comprehensive.engagement.followUps, ''],
          ['Participación', 'Automatizaciones Activas', overview.comprehensive.engagement.activeAutomations, ''],
          ['Membresía', 'Nuevos Miembros', overview.comprehensive.membership.newMembers, `${period} días`],
          ['Comunicación', 'Total Destinatarios', overview.comprehensive.communications.totalRecipients, ''],
          ['Comunicación', 'Promedio por Mensaje', Math.round(overview.comprehensive.communications.averageRecipientsPerMessage), '']
        ]
      })
    }

    return data
  }

  // Button Handlers
  const handleExportReport = async (format: 'json' | 'csv' | 'excel') => {
    try {
      toast.info(`🔄 Preparando reporte en formato ${format.toUpperCase()}...`)
      
      const timestamp = new Date().toISOString().split('T')[0]
      const baseFilename = `reporte-analitico-${timestamp}`
      
      const reportData = {
        title: `Reporte Analítico - ${new Date().toLocaleDateString('es-ES')}`,
        period: period,
        metrics: overview,
        trends: trends,
        generatedBy: session?.user?.name || 'Usuario',
        createdAt: new Date().toISOString(),
        exportFormat: format,
        church: session?.user?.church?.name || 'Iglesia'
      }

      let content: string | ArrayBuffer
      let mimeType: string
      let filename: string

      switch (format) {
        case 'json':
          content = JSON.stringify(reportData, null, 2)
          mimeType = 'application/json'
          filename = `${baseFilename}.json`
          break

        case 'csv':
          content = convertToCSV(reportData)
          mimeType = 'text/csv;charset=utf-8;'
          filename = `${baseFilename}.csv`
          break

        case 'excel':
          // For Excel, we'll create a simple tab-separated format that Excel can import
          const excelData = convertToExcelData()
          const sheets = excelData.worksheets.map(sheet => {
            const sheetContent = sheet.data.map(row => row.join('\t')).join('\n')
            return `=== ${sheet.name} ===\n${sheetContent}\n\n`
          }).join('')
          
          content = `Reporte Analítico - ${reportData.title}\nGenerado: ${reportData.createdAt}\nPeríodo: ${period} días\nIglesia: ${reportData.church}\n\n${sheets}`
          mimeType = 'application/vnd.ms-excel'
          filename = `${baseFilename}.xls`
          break

        default:
          throw new Error('Formato no soportado')
      }

      // Simulate processing time
      setTimeout(() => {
        const dataBlob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        const formatLabels = {
          json: 'JSON (API integración)',
          csv: 'CSV (Google Sheets listo)',
          excel: 'Excel (múltiples hojas)'
        }
        
        toast.success(`📊 Reporte ${formatLabels[format]} descargado exitosamente`)
      }, 1500)
      
    } catch (error) {
      console.error('Error creating report:', error)
      toast.error('Error al crear el reporte personalizado')
    }
  }

  const handleViewDashboard = () => {
    toast.info('🚀 Navegando a Perspectivas Pastorales...')
    router.push('/business-intelligence')
  }

  const handleUpdateKPIs = async () => {
    try {
      toast.info('⏳ Actualizando KPIs y métricas...')
      
      // Trigger KPI calculation
      const response = await fetch('/api/kpi-metrics/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshAll: true })
      })

      if (response.ok) {
        // Refresh current data
        await fetchAnalyticsData(false)
        toast.success('✅ KPIs actualizados exitosamente')
      } else {
        throw new Error('Failed to update KPIs')
      }
    } catch (error) {
      console.error('Error updating KPIs:', error)
      toast.error('Error al actualizar KPIs. Se ha refrescado la información actual.')
      // Fallback to just refreshing current data
      await fetchAnalyticsData(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth > 0;
    const icon = isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 text-xs ${colorClass}`}>
        {icon}
        {Math.abs(growth)}%
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando analíticas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() => fetchAnalyticsData()}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas Ministeriales</h1>
          <p className="text-gray-600 mt-2">
            Métricas operacionales y perspectivas basadas en datos para la gestión diaria de tu ministerio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAnalyticsData(false)}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="insights">Perspectivas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Miembros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.members.total}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Miembros activos</span>
                    {formatGrowth(overview.members.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Donaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(overview.donations.total)}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{overview.donations.count} donaciones</span>
                    {formatGrowth(overview.donations.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.events.total}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Eventos realizados</span>
                    {formatGrowth(overview.events.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                    Comunicaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.communications.total}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Mensajes enviados</span>
                    {formatGrowth(overview.communications.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-pink-600" />
                    Redes Sociales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.socialMedia.posts}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Publicaciones creadas</span>
                    {formatGrowth(overview.socialMedia.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-teal-600" />
                    Voluntarios
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview.volunteers.total}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Voluntarios activos</span>
                    {formatGrowth(overview.volunteers.growth)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-indigo-600" />
                    Donación Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(overview.donations.average)}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Por donación</span>
                    <Badge variant="secondary" className="text-xs">
                      {period} días
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Participación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overview.communications.total + overview.socialMedia.posts}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Interacciones totales</span>
                    <Badge variant="outline" className="text-xs">
                      Alta
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Analytics Cards - Only show if comprehensive data is available */}
              {overview.comprehensive && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        Ministerio de Oración
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overview.comprehensive.prayerMinistry.requestsReceived}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Peticiones recibidas</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(overview.comprehensive.prayerMinistry.responseRate)}% respondidas
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        Asistencia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overview.comprehensive.engagement.checkIns}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Check-ins registrados</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(overview.comprehensive.insights.memberEngagement.checkInRate)}% miembros
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Seguimientos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overview.comprehensive.engagement.followUps}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Seguimientos realizados</span>
                        <Badge variant="secondary" className="text-xs">
                          Cuidado pastoral
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-600" />
                        Automatizaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {overview.comprehensive.engagement.activeAutomations}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Reglas activas</span>
                        <Badge variant="outline" className="text-xs">
                          Optimizando
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {trends && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Tendencias de Donaciones
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={granularity} onValueChange={setGranularity}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Diario</SelectItem>
                        <SelectItem value="week">Semanal</SelectItem>
                        <SelectItem value="month">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Monto']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="donations.amount" 
                        stroke="#0088FE" 
                        fill="#0088FE" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Resumen de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="events" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        name="Eventos"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="communications" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        name="Comunicaciones"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attendance" 
                        stroke="#FF8042" 
                        strokeWidth={2}
                        name="Asistencia"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Perspectivas Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Las donaciones muestran una tendencia al alza</strong> con un incremento del {overview?.donations.growth}% 
                    comparado al período anterior. Considera lanzar una campaña especial para mantener el impulso.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <strong>La participación de los miembros es sólida</strong> con {overview?.communications.total} comunicaciones 
                    enviadas en los últimos {period} días. Mantén esta estrategia de comunicación consistente.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    <strong>La participación en eventos está {overview && overview.events.growth > 0 ? 'creciendo' : 'estable'}</strong>. 
                    Considera diversificar los tipos de eventos para atraer diferentes demografías.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Multi-Format Export Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Export Format Features */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <FileSpreadsheet className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-green-800">Excel (.xlsx)</div>
                        <div className="text-sm text-green-700 space-y-1">
                          <div>• Múltiples hojas de trabajo</div>
                          <div>• Tablas de datos organizadas</div>
                          <div>• Importación directa a Excel</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <Database className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-orange-800">CSV (.csv)</div>
                        <div className="text-sm text-orange-700 space-y-1">
                          <div>• Listo para Google Sheets</div>
                          <div>• Compatibilidad universal</div>
                          <div>• Importación fácil de datos</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Download className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-800">JSON (.json)</div>
                        <div className="text-sm text-blue-700 space-y-1">
                          <div>• Estructura de datos completa</div>
                          <div>• Integración con APIs</div>
                          <div>• Amigable para desarrolladores</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 text-center">
                      Los reportes se generan en tiempo real con datos actuales y están listos para uso inmediato en tu plataforma de análisis preferida
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between" 
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Crear Reporte Personalizado
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64">
                    <DropdownMenuItem 
                      onClick={() => handleExportReport('excel')}
                      className="flex items-center p-3"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium">Excel (.xlsx)</div>
                        <div className="text-xs text-gray-500">Múltiples hojas • Tablas organizadas</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExportReport('csv')}
                      className="flex items-center p-3"
                    >
                      <Database className="h-4 w-4 mr-3 text-orange-600" />
                      <div className="flex-1">
                        <div className="font-medium">CSV (.csv)</div>
                        <div className="text-xs text-gray-500">Google Sheets listo • Compatible universal</div>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExportReport('json')}
                      className="flex items-center p-3"
                    >
                      <Download className="h-4 w-4 mr-3 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-medium">JSON (.json)</div>
                        <div className="text-xs text-gray-500">Estructura completa • Integración API</div>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleViewDashboard}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Perspectivas Pastorales
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleUpdateKPIs}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Actualizar KPIs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
