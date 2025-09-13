'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar,
  Activity,
  Target,
  Award,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  totalMembers: number
  memberGrowth: number
  totalDonations: number
  donationGrowth: number
  upcomingEvents: number
  attendanceRate: number
  engagementScore: number
  volunteerHours: number
}

interface AnalyticsWidgetProps {
  churchId: string
  refreshInterval?: number
}

export function EnhancedAnalyticsWidget({ 
  churchId, 
  refreshInterval = 300000 // 5 minutes default
}: AnalyticsWidgetProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/enhanced-overview?churchId=${churchId}`)
      if (response.ok) {
        const result = await response.json()
        setData(result)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [churchId, refreshInterval])

  if (loading && !data) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando analíticas...</span>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const metrics = [
    {
      title: 'Miembros Totales',
      value: data.totalMembers.toLocaleString(),
      growth: data.memberGrowth,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Donaciones del Mes',
      value: `$${data.totalDonations.toLocaleString()}`,
      growth: data.donationGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Próximos Eventos',
      value: data.upcomingEvents.toString(),
      growth: null,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Tasa de Asistencia',
      value: `${data.attendanceRate}%`,
      growth: null,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Nivel de Compromiso',
      value: `${data.engagementScore}/100`,
      growth: null,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Horas de Voluntariado',
      value: data.volunteerHours.toLocaleString(),
      growth: null,
      icon: Award,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analíticas Avanzadas</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Actualizado: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "p-2 rounded-lg",
                    metric.bgColor
                  )}>
                    <Icon className={cn("h-5 w-5", metric.color)} />
                  </div>
                  {metric.growth !== null && (
                    <div className="flex items-center gap-1">
                      {metric.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "text-sm font-medium",
                        metric.growth > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {Math.abs(metric.growth)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}