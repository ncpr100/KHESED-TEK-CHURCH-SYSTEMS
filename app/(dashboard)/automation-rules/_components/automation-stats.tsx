
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Target
} from 'lucide-react'

interface AutomationStatsData {
  totalRules: number
  activeRules: number
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  executionsToday: number
  mostUsedTrigger: string
  averageExecutionTime: number
}

export function AutomationStats() {
  const [stats, setStats] = useState<AutomationStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // For now, we'll use mock data since we need to create the stats API
      // TODO: Create /api/automation-rules/stats endpoint
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStats({
        totalRules: 8,
        activeRules: 6,
        totalExecutions: 247,
        successfulExecutions: 231,
        failedExecutions: 16,
        executionsToday: 23,
        mostUsedTrigger: 'MEMBER_JOINED',
        averageExecutionTime: 1.2
      })
    } catch (error) {
      console.error('Error fetching automation stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSuccessRate = () => {
    if (!stats || stats.totalExecutions === 0) return 0
    return ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)
  }

  const getTriggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      'MEMBER_JOINED': 'Nuevo Miembro',
      'DONATION_RECEIVED': 'Donación Recibida',
      'EVENT_CREATED': 'Evento Creado',
      'BIRTHDAY': 'Cumpleaños',
      'ANNIVERSARY': 'Aniversario'
    }
    return labels[trigger] || trigger
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error al cargar estadísticas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Rules */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Reglas Totales
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRules}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeRules} activas
          </p>
        </CardContent>
      </Card>

      {/* Executions Today */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ejecuciones Hoy
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.executionsToday}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalExecutions} total
          </p>
        </CardContent>
      </Card>

      {/* Success Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tasa de Éxito
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getSuccessRate()}%</div>
          <p className="text-xs text-muted-foreground">
            {stats.failedExecutions} fallaron
          </p>
        </CardContent>
      </Card>

      {/* Average Execution Time */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tiempo Promedio
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageExecutionTime}s</div>
          <p className="text-xs text-muted-foreground">
            por ejecución
          </p>
        </CardContent>
      </Card>

      {/* Most Used Trigger */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Trigger Más Utilizado</CardTitle>
          <CardDescription>
            El evento que más automatizaciones dispara
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {getTriggerLabel(stats.mostUsedTrigger)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Usado en {Math.round(stats.activeRules * 0.6)} reglas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Estado del Sistema</CardTitle>
          <CardDescription>
            Resumen del rendimiento de automatización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Reglas Activas</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded">
                  <div 
                    className="h-full bg-green-500 rounded" 
                    style={{ width: `${(stats.activeRules / stats.totalRules) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {stats.activeRules}/{stats.totalRules}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Éxito de Ejecución</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded">
                  <div 
                    className="h-full bg-blue-500 rounded" 
                    style={{ width: `${getSuccessRate()}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {getSuccessRate()}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
