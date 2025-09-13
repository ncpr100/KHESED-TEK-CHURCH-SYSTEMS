
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Activity,
  Plus,
  ArrowRight,
  Eye,
  FileText,
  CreditCard,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface PlatformStats {
  totalChurches: number
  activeChurches: number
  totalUsers: number
  activeUsers: number
  websiteRequests: {
    pending: number
    inProgress: number
    completed: number
    rejected: number
    totalRevenue: number
    avgCompletionTime: number
  }
  systemHealth: {
    uptime: number
    responseTime: number
    errorRate: number
  }
}

interface RecentActivity {
  id: string
  type: 'church_created' | 'website_request' | 'user_registered' | 'website_completed'
  description: string
  timestamp: string
  churchName?: string
  status?: string
}

export default function PlatformDashboard() {
  const { data: session } = useSession() || {}
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [websiteRequests, setWebsiteRequests] = useState<any[]>([])
  const [invoiceAlerts, setInvoiceAlerts] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch platform statistics
      const [statsResponse, websiteServicesResponse, invoiceAlertsResponse] = await Promise.all([
        fetch('/api/platform/stats'),
        fetch('/api/platform/website-services'),
        fetch('/api/platform/invoices/alerts')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      if (websiteServicesResponse.ok) {
        const websiteData = await websiteServicesResponse.json()
        setWebsiteRequests(websiteData.requests || [])
      }

      if (invoiceAlertsResponse.ok) {
        const alertsData = await invoiceAlertsResponse.json()
        setInvoiceAlerts(alertsData)
        
        // Generate mock recent activity (would come from audit logs in production)
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'website_request',
            description: 'Nueva solicitud de sitio web recibida',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
            churchName: 'Iglesia Nueva Vida',
            status: 'pending'
          },
          {
            id: '2',
            type: 'website_completed',
            description: 'Sitio web completado y entregado',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            churchName: 'Centro Cristiano Esperanza',
            status: 'completed'
          },
          {
            id: '3',
            type: 'church_created',
            description: 'Nueva iglesia registrada en la plataforma',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
            churchName: 'Iglesia Monte Sión',
            status: 'active'
          }
        ]
        setRecentActivity(mockActivity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Mock stats for development (replace with real API data)
  const mockStats: PlatformStats = stats || {
    totalChurches: 147,
    activeChurches: 132,
    totalUsers: 2456,
    activeUsers: 1834,
    websiteRequests: {
      pending: 12,
      inProgress: 8,
      completed: 156,
      rejected: 3,
      totalRevenue: 87650,
      avgCompletionTime: 7.2
    },
    systemHealth: {
      uptime: 99.7,
      responseTime: 245,
      errorRate: 0.03
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />
      case 'in_progress': return <Activity className="h-4 w-4 text-blue-500" />
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'church_created': return <Building2 className="h-4 w-4 text-blue-500" />
      case 'website_request': return <Globe className="h-4 w-4 text-purple-500" />
      case 'user_registered': return <Users className="h-4 w-4 text-green-500" />
      case 'website_completed': return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Acceso Denegado</h3>
          <p className="text-muted-foreground">Se requiere rol SUPER_ADMIN</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">🚀 Platform Dashboard</h1>
          <p className="text-muted-foreground">
            Centro de control para administración de la plataforma Kḥesed-tek
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/platform/website-services/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto Web
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="websites">Servicios Web</TabsTrigger>
          <TabsTrigger value="churches">Iglesias</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Iglesias Activas</CardTitle>
                <Building2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mockStats.activeChurches}</div>
                <p className="text-xs text-muted-foreground">
                  de {mockStats.totalChurches} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  de {mockStats.totalUsers} totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Sitios Web</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ${mockStats.websiteRequests.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mockStats.websiteRequests.completed} proyectos completados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {mockStats.websiteRequests.avgCompletionTime} días
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrega de sitios web
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Alerts Section */}
          {invoiceAlerts && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Facturas Vencidas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{invoiceAlerts.summary?.overdue || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Requieren atención inmediata
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Vencer</CardTitle>
                  <Calendar className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{invoiceAlerts.summary?.dueSoon || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Próximos 7 días
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                  <CreditCard className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{invoiceAlerts.summary?.totalPending || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Facturas enviadas
                  </p>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pruebas Expirando</CardTitle>
                  <Clock className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{invoiceAlerts.summary?.trialsExpiring || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Próximos 7 días
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quick Actions for Invoice Management */}
          {invoiceAlerts && (invoiceAlerts.summary?.overdue > 0 || invoiceAlerts.summary?.dueSoon > 0) && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <FileText className="h-5 w-5" />
                  Acciones Rápidas - Facturación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {invoiceAlerts.summary?.overdue > 0 && (
                    <Link href="/platform/invoices?status=OVERDUE">
                      <Button size="sm" variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Ver Facturas Vencidas ({invoiceAlerts.summary.overdue})
                      </Button>
                    </Link>
                  )}
                  {invoiceAlerts.summary?.dueSoon > 0 && (
                    <Link href="/platform/invoices?status=SENT">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Facturas por Vencer ({invoiceAlerts.summary.dueSoon})
                      </Button>
                    </Link>
                  )}
                  <Link href="/platform/invoices">
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-1" />
                      Gestión Completa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Website Services Status */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Estado de Solicitudes Web
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Pendientes</span>
                    </div>
                    <Badge variant="secondary">{mockStats.websiteRequests.pending}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span>En Progreso</span>
                    </div>
                    <Badge variant="default">{mockStats.websiteRequests.inProgress}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completados</span>
                    </div>
                    <Badge variant="outline">{mockStats.websiteRequests.completed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span>Rechazados</span>
                    </div>
                    <Badge variant="destructive">{mockStats.websiteRequests.rejected}</Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href="/platform/website-services">
                    <Button className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos los Proyectos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        {activity.churchName && (
                          <p className="text-sm text-muted-foreground">
                            {activity.churchName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString('es-ES')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Website Services Tab */}
        <TabsContent value="websites" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gestión de Servicios Web</h3>
            <Link href="/platform/website-services">
              <Button>
                <ArrowRight className="h-4 w-4 mr-2" />
                Ir a Servicios Web
              </Button>
            </Link>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Solicitudes Pendientes</CardTitle>
                <CardDescription>Requieren atención inmediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {mockStats.websiteRequests.pending}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">En Desarrollo</CardTitle>
                <CardDescription>Proyectos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockStats.websiteRequests.inProgress}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Este Mes</CardTitle>
                <CardDescription>Proyectos completados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">12</div>
                <p className="text-sm text-green-600 mt-1">+$18,450 revenue</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Churches Tab */}
        <TabsContent value="churches" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-800">Iglesias Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockStats.totalChurches}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockStats.activeChurches} activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">Usuarios Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {mockStats.totalUsers}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockStats.activeUsers} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Tasa de Adopción</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">89%</div>
                <p className="text-sm text-muted-foreground">
                  Iglesias con usuarios activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-orange-800">Crecimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">+12%</div>
                <p className="text-sm text-muted-foreground">
                  Nuevas iglesias este mes
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Uptime del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {mockStats.systemHealth.uptime}%
                </div>
                <p className="text-sm text-green-600">Excelente estabilidad</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tiempo de Respuesta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockStats.systemHealth.responseTime}ms
                </div>
                <p className="text-sm text-blue-600">Promedio últimas 24h</p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Tasa de Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {mockStats.systemHealth.errorRate}%
                </div>
                <p className="text-sm text-yellow-600">Dentro de límites normales</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

