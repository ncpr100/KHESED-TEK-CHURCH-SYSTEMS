
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface PlatformAnalytics {
  overview: {
    churches: { total: number; active: number; inactive: number }
    users: { total: number; active: number; inactive: number }
    members: number
    donations: { total: number; count: number }
  }
  growth: {
    monthly: Array<{ month: string; count: number }>
    donations: Array<{ month: string; total: number; count: number }>
  }
  rankings: {
    topChurches: Array<{
      id: string
      name: string
      members: number
      users: number
      donations: number
    }>
  }
  distribution: {
    usersByRole: Record<string, number>
  }
  recentActivity: Array<{
    id: string
    title: string
    message: string
    type: string
    church?: string
    createdAt: string
  }>
}

export default function PlatformAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/platform/analytics?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/platform/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analíticas Detalladas</h1>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Cargando analíticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/platform/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analíticas Detalladas</h1>
            <p className="text-gray-600">Análisis profundo de la plataforma Kḥesed-tek</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
            <option value="365">Último año</option>
          </select>
          
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Tasa de Crecimiento</p>
                <p className="text-3xl font-bold text-blue-900">
                  {analytics.growth.monthly.length > 1 ? (
                    `+${Math.round(
                      ((analytics.growth.monthly[analytics.growth.monthly.length - 1]?.count || 0) / 
                       (analytics.growth.monthly[analytics.growth.monthly.length - 2]?.count || 1) - 1) * 100
                    )}%`
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Retención de Usuarios</p>
                <p className="text-3xl font-bold text-green-900">
                  {Math.round((analytics.overview.users.active / analytics.overview.users.total) * 100)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Iglesias Activas</p>
                <p className="text-3xl font-bold text-purple-900">
                  {Math.round((analytics.overview.churches.active / analytics.overview.churches.total) * 100)}%
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Promedio Donación</p>
                <p className="text-3xl font-bold text-yellow-900">
                  ${Math.round((analytics.overview.donations.total / analytics.overview.donations.count) || 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="growth">Crecimiento</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Crecimiento de Iglesias por Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.growth.monthly.slice(-6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">
                        {new Date(item.month).toLocaleDateString('es-ES', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ 
                              width: `${(item.count / Math.max(...analytics.growth.monthly.map(m => m.count))) * 100}%` 
                            }}
                          />
                        </div>
                        <Badge variant="secondary">+{item.count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Evolución de Donaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.growth.donations.slice(-6).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">
                        {new Date(item.month).toLocaleDateString('es-ES', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${parseInt(String(item.total || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{item.count} donaciones</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Distribución de Usuarios por Rol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.distribution.usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{role.replace('_', ' ')}</span>
                        <p className="text-sm text-gray-500">
                          {Math.round((count / analytics.overview.users.total) * 100)}% del total
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{count}</p>
                        <p className="text-sm text-gray-500">usuarios</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Iglesias por Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.rankings.topChurches.map((church, index) => (
                    <div key={church.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{church.name}</p>
                          <p className="text-sm text-gray-500">{church.members} miembros</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ${church.donations.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">donaciones</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600">
                    {Math.round((analytics.overview.users.active / analytics.overview.users.total) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Usuarios activos vs total</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promedio Miembros/Iglesia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600">
                    {Math.round(analytics.overview.members / analytics.overview.churches.active)}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Miembros por iglesia activa</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasa de Retención</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600">
                    {Math.round((analytics.overview.churches.active / analytics.overview.churches.total) * 100)}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">Iglesias que permanecen activas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <h4 className="font-semibold text-blue-900">Crecimiento Sostenido</h4>
                  <p className="text-sm text-blue-800">
                    La plataforma mantiene un crecimiento constante de iglesias mes a mes.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded">
                  <h4 className="font-semibold text-green-900">Alta Retención</h4>
                  <p className="text-sm text-green-800">
                    {Math.round((analytics.overview.users.active / analytics.overview.users.total) * 100)}% de usuarios permanecen activos.
                  </p>
                </div>
                
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h4 className="font-semibold text-yellow-900">Oportunidad de Mejora</h4>
                  <p className="text-sm text-yellow-800">
                    Algunas iglesias podrían beneficiarse de más funciones de engagement.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">🎯 Estrategia de Crecimiento</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Enfocar esfuerzos en iglesias medianas (50-200 miembros) para maximizar el crecimiento.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">💡 Funcionalidades Nuevas</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Implementar más herramientas de engagement para iglesias con baja actividad.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold">🔄 Retención</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Desarrollar programa de onboarding mejorado para nuevas iglesias.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
