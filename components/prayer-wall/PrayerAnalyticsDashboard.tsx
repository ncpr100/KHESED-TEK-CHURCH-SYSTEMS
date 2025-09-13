
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  MessageSquare,
  Clock,
  Calendar,
  Target,
  Zap,
  Eye,
  CheckCircle,
  XCircle,
  Send,
  Phone,
  Mail,
  Download,
  RefreshCw,
  Filter,
  PieChart,
  Activity
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PrayerAnalytics {
  overview: {
    totalRequests: number
    approvedRequests: number
    rejectedRequests: number
    pendingRequests: number
    totalContacts: number
    activeContacts: number
    totalResponses: number
    avgResponseTime: number
  }
  trends: {
    requestsOverTime: Array<{
      date: string
      requests: number
      approvals: number
      rejections: number
    }>
    contactGrowth: Array<{
      date: string
      newContacts: number
      totalContacts: number
    }>
    responseMetrics: Array<{
      date: string
      responsesSent: number
      deliveryRate: number
      responseRate: number
    }>
  }
  categories: Array<{
    id: string
    name: string
    requestCount: number
    approvalRate: number
    avgResponseTime: number
    color?: string
  }>
  demographics: {
    ageGroups: Array<{ range: string; count: number }>
    contactMethods: Array<{ method: string; count: number; preference: number }>
    locations: Array<{ location: string; count: number }>
  }
  engagement: {
    repeatRequesters: number
    avgRequestsPerContact: number
    mostActiveHours: Array<{ hour: number; count: number }>
    mostActiveDays: Array<{ day: string; count: number }>
    responseEngagement: {
      totalResponses: number
      readRate: number
      replyRate: number
      unsubscribeRate: number
    }
  }
  templates: Array<{
    id: string
    name: string
    usageCount: number
    successRate: number
    avgResponseTime: number
    category?: string
  }>
}

interface AnalyticsFilters {
  dateRange: string
  category: string
  status: string
  contactMethod: string
}

interface PrayerAnalyticsDashboardProps {
  onExport?: (data: any) => void
}

export function PrayerAnalyticsDashboard({ onExport }: PrayerAnalyticsDashboardProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [analytics, setAnalytics] = useState<PrayerAnalytics>({
    overview: {
      totalRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0,
      totalContacts: 0,
      activeContacts: 0,
      totalResponses: 0,
      avgResponseTime: 0
    },
    trends: {
      requestsOverTime: [],
      contactGrowth: [],
      responseMetrics: []
    },
    categories: [],
    demographics: {
      ageGroups: [],
      contactMethods: [],
      locations: []
    },
    engagement: {
      repeatRequesters: 0,
      avgRequestsPerContact: 0,
      mostActiveHours: [],
      mostActiveDays: [],
      responseEngagement: {
        totalResponses: 0,
        readRate: 0,
        replyRate: 0,
        unsubscribeRate: 0
      }
    },
    templates: []
  })
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: '30',
    category: 'all',
    status: 'all',
    contactMethod: 'all'
  })
  
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadAnalytics()
    }
  }, [session, filters])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        days: filters.dateRange,
        category: filters.category,
        status: filters.status,
        contactMethod: filters.contactMethod
      })

      const response = await fetch(`/api/prayer-analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics || analytics)
      } else {
        toast.error('Error al cargar los análisis')
      }
    } catch (error) {
      toast.error('Error al cargar los análisis')
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({
        days: filters.dateRange,
        category: filters.category,
        status: filters.status,
        contactMethod: filters.contactMethod,
        format: 'csv'
      })

      const response = await fetch(`/api/prayer-analytics/export?${params}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analisis-oraciones-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Análisis exportado correctamente')
        onExport?.(analytics)
      } else {
        toast.error('Error al exportar los análisis')
      }
    } catch (error) {
      toast.error('Error al exportar los análisis')
    } finally {
      setExporting(false)
    }
  }

  const getDateRangeLabel = (days: string) => {
    switch (days) {
      case '7': return 'Últimos 7 días'
      case '30': return 'Últimos 30 días'
      case '90': return 'Últimos 90 días'
      case '365': return 'Último año'
      default: return 'Personalizado'
    }
  }

  const calculateTrend = (data: Array<{ date: string; [key: string]: any }>, field: string) => {
    if (data.length < 2) return 0
    
    const recent = data.slice(-7).reduce((sum, item) => sum + (item[field] || 0), 0)
    const previous = data.slice(-14, -7).reduce((sum, item) => sum + (item[field] || 0), 0)
    
    if (previous === 0) return recent > 0 ? 100 : 0
    return ((recent - previous) / previous) * 100
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend, format }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{format ? format(value) : value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {typeof trend === 'number' && (
              <div className="flex items-center gap-1 mt-2">
                {getTrendIcon(trend)}
                <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}% vs período anterior
                </span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  const ProgressBar = ({ value, max, color = 'bg-blue-600' }: { value: number; max: number; color?: string }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análisis de Peticiones de Oración</h2>
          <p className="text-gray-600">
            Insights y métricas detalladas del ministerio de oración
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadAnalytics}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={exportAnalytics}
            disabled={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Análisis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Período</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 días</SelectItem>
                  <SelectItem value="30">Últimos 30 días</SelectItem>
                  <SelectItem value="90">Últimos 90 días</SelectItem>
                  <SelectItem value="365">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {analytics.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Método de contacto</label>
              <Select
                value={filters.contactMethod}
                onValueChange={(value) => setFilters(prev => ({ ...prev, contactMethod: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="w-4 h-4 mr-2" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Activity className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Target className="w-4 h-4 mr-2" />
            Rendimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Peticiones"
              value={analytics.overview.totalRequests}
              subtitle={`En los ${getDateRangeLabel(filters.dateRange).toLowerCase()}`}
              icon={Heart}
              color="text-red-600"
              trend={calculateTrend(analytics.trends.requestsOverTime, 'requests')}
            />
            <StatCard
              title="Peticiones Aprobadas"
              value={analytics.overview.approvedRequests}
              subtitle={`${analytics.overview.totalRequests > 0 ? Math.round((analytics.overview.approvedRequests / analytics.overview.totalRequests) * 100) : 0}% del total`}
              icon={CheckCircle}
              color="text-green-600"
              trend={calculateTrend(analytics.trends.requestsOverTime, 'approvals')}
            />
            <StatCard
              title="Total de Contactos"
              value={analytics.overview.totalContacts}
              subtitle={`${analytics.overview.activeContacts} activos`}
              icon={Users}
              color="text-blue-600"
              trend={calculateTrend(analytics.trends.contactGrowth, 'newContacts')}
            />
            <StatCard
              title="Tiempo de Respuesta"
              value={analytics.overview.avgResponseTime}
              subtitle="Promedio en horas"
              icon={Clock}
              color="text-orange-600"
              format={(value: number) => `${value.toFixed(1)}h`}
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pendientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">{analytics.overview.pendingRequests}</p>
                  <p className="text-sm text-gray-600">Requieren atención</p>
                  <ProgressBar 
                    value={analytics.overview.pendingRequests} 
                    max={analytics.overview.totalRequests}
                    color="bg-yellow-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Aprobadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{analytics.overview.approvedRequests}</p>
                  <p className="text-sm text-gray-600">
                    {analytics.overview.totalRequests > 0 
                      ? Math.round((analytics.overview.approvedRequests / analytics.overview.totalRequests) * 100)
                      : 0}% del total
                  </p>
                  <ProgressBar 
                    value={analytics.overview.approvedRequests} 
                    max={analytics.overview.totalRequests}
                    color="bg-green-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Rechazadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{analytics.overview.rejectedRequests}</p>
                  <p className="text-sm text-gray-600">
                    {analytics.overview.totalRequests > 0 
                      ? Math.round((analytics.overview.rejectedRequests / analytics.overview.totalRequests) * 100)
                      : 0}% del total
                  </p>
                  <ProgressBar 
                    value={analytics.overview.rejectedRequests} 
                    max={analytics.overview.totalRequests}
                    color="bg-red-600"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métodos de Contacto Preferidos</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.demographics.contactMethods.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.demographics.contactMethods.map(method => (
                      <div key={method.method} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.method === 'email' && <Mail className="w-4 h-4 text-blue-600" />}
                          {method.method === 'sms' && <Phone className="w-4 h-4 text-green-600" />}
                          {method.method === 'whatsapp' && <MessageSquare className="w-4 h-4 text-purple-600" />}
                          <span className="capitalize">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{method.count}</span>
                          <p className="text-xs text-gray-500">{method.preference}% preferencia</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement de Respuestas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Respuestas enviadas</span>
                    <span className="font-medium">{analytics.engagement.responseEngagement.totalResponses}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de lectura</span>
                    <span className="font-medium text-blue-600">{analytics.engagement.responseEngagement.readRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de respuesta</span>
                    <span className="font-medium text-green-600">{analytics.engagement.responseEngagement.replyRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tasa de baja</span>
                    <span className="font-medium text-red-600">{analytics.engagement.responseEngagement.unsubscribeRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias de Peticiones en el Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.trends.requestsOverTime.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay datos suficientes para mostrar tendencias</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.trends.requestsOverTime.reduce((sum, item) => sum + item.requests, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total de peticiones</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {analytics.trends.requestsOverTime.reduce((sum, item) => sum + item.approvals, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total aprobadas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-red-600">
                        {analytics.trends.requestsOverTime.reduce((sum, item) => sum + item.rejections, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total rechazadas</p>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-500 py-4">
                    Gráfico de tendencias se implementará con biblioteca de charts
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crecimiento de Contactos</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.trends.contactGrowth.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos de crecimiento</p>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.trends.contactGrowth.reduce((sum, item) => sum + item.newContacts, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Nuevos contactos en el período</p>
                    </div>
                    <div className="text-center text-gray-500">
                      Gráfico de crecimiento pendiente
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.trends.responseMetrics.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay métricas de respuesta</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.trends.responseMetrics.slice(-5).map((metric, index) => (
                      <div key={metric.date} className="flex items-center justify-between">
                        <span className="text-sm">
                          {format(new Date(metric.date), 'dd/MM', { locale: es })}
                        </span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">{metric.responsesSent} enviadas</span>
                          <span className="text-green-600">{metric.deliveryRate}% entregadas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6">
            {analytics.categories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <PieChart className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No hay datos de categorías disponibles</p>
                </CardContent>
              </Card>
            ) : (
              analytics.categories.map(category => (
                <Card key={category.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color || '#3b82f6' }}
                        />
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant="outline">{category.requestCount} peticiones</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tasa de aprobación</p>
                        <p className="text-lg font-bold text-green-600">{category.approvalRate}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{category.requestCount}</p>
                        <p className="text-sm text-gray-600">Peticiones</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{category.approvalRate}%</p>
                        <p className="text-sm text-gray-600">Aprobación</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-600">{category.avgResponseTime.toFixed(1)}h</p>
                        <p className="text-sm text-gray-600">Resp. promedio</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <ProgressBar 
                        value={category.requestCount} 
                        max={Math.max(...analytics.categories.map(c => c.requestCount))}
                        color={category.color ? `bg-[${category.color}]` : 'bg-blue-600'}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Solicitantes Recurrentes"
              value={analytics.engagement.repeatRequesters}
              subtitle="Contactos con >1 petición"
              icon={Users}
              color="text-purple-600"
            />
            <StatCard
              title="Promedio por Contacto"
              value={analytics.engagement.avgRequestsPerContact}
              subtitle="Peticiones por persona"
              icon={Heart}
              color="text-red-600"
              format={(value: number) => value.toFixed(1)}
            />
            <StatCard
              title="Tasa de Lectura"
              value={analytics.engagement.responseEngagement.readRate}
              subtitle="De respuestas enviadas"
              icon={Eye}
              color="text-blue-600"
              format={(value: number) => `${value}%`}
            />
            <StatCard
              title="Tasa de Respuesta"
              value={analytics.engagement.responseEngagement.replyRate}
              subtitle="Respuestas recibidas"
              icon={MessageSquare}
              color="text-green-600"
              format={(value: number) => `${value}%`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Horas Más Activas</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.engagement.mostActiveHours.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos de actividad horaria</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.engagement.mostActiveHours.slice(0, 5).map(hour => (
                      <div key={hour.hour} className="flex items-center justify-between">
                        <span>{hour.hour}:00 - {hour.hour + 1}:00</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{hour.count}</span>
                          <ProgressBar 
                            value={hour.count} 
                            max={Math.max(...analytics.engagement.mostActiveHours.map(h => h.count))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Días Más Activos</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.engagement.mostActiveDays.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos de actividad diaria</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.engagement.mostActiveDays.map(day => (
                      <div key={day.day} className="flex items-center justify-between">
                        <span className="capitalize">{day.day}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{day.count}</span>
                          <ProgressBar 
                            value={day.count} 
                            max={Math.max(...analytics.engagement.mostActiveDays.map(d => d.count))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas Más Efectivas</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.templates.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos de plantillas</p>
                ) : (
                  <div className="space-y-4">
                    {analytics.templates.slice(0, 5).map((template, index) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-gray-600">{template.category || 'General'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">{template.successRate}%</p>
                          <p className="text-sm text-gray-600">{template.usageCount} usos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{analytics.overview.avgResponseTime.toFixed(1)}h</p>
                    <p className="text-sm text-gray-600">Tiempo promedio de respuesta</p>
                    <ProgressBar 
                      value={24 - analytics.overview.avgResponseTime} 
                      max={24}
                      color="bg-blue-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Meta: menos de 2 horas</p>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {analytics.overview.totalRequests > 0 
                        ? Math.round((analytics.overview.approvedRequests / analytics.overview.totalRequests) * 100)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-600">Tasa de aprobación general</p>
                    <ProgressBar 
                      value={analytics.overview.approvedRequests} 
                      max={analytics.overview.totalRequests}
                      color="bg-green-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Meta: más del 80%</p>
                  </div>

                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {analytics.engagement.responseEngagement.readRate}%
                    </p>
                    <p className="text-sm text-gray-600">Tasa de lectura de respuestas</p>
                    <ProgressBar 
                      value={analytics.engagement.responseEngagement.readRate} 
                      max={100}
                      color="bg-purple-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">Meta: más del 70%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
