

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Calendar, Users } from 'lucide-react'

interface DonationStatsData {
  overview: {
    allTime: { total: number; amount: number }
    thisMonth: { total: number; amount: number }
    thisYear: { total: number; amount: number }
    thisWeek: { total: number; amount: number }
  }
  byCategory: Array<{
    categoryName: string
    amount: number
    count: number
  }>
  byPaymentMethod: Array<{
    paymentMethodName: string
    amount: number
    count: number
  }>
  topDonors: Array<{
    memberName: string
    amount: number
    donationsCount: number
  }>
}

export function DonationStats() {
  const [stats, setStats] = useState<DonationStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/donations/stats')
      if (!response.ok) throw new Error('Error fetching stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Error al cargar las estadísticas</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.overview.thisWeek.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.thisWeek.total} donaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.overview.thisMonth.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.thisMonth.total} donaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Año</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.overview.thisYear.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.thisYear.total} donaciones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Histórico</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.overview.allTime.amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.overview.allTime.total} donaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Por categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Categoría (Este Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byCategory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay datos disponibles</p>
              ) : (
                stats.byCategory.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.categoryName}</p>
                      <p className="text-sm text-muted-foreground">{item.count} donaciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Por método de pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Por Método de Pago (Este Mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byPaymentMethod.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay datos disponibles</p>
              ) : (
                stats.byPaymentMethod.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.paymentMethodName}</p>
                      <p className="text-sm text-muted-foreground">{item.count} donaciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top donantes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Donantes (Este Año)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topDonors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No hay datos disponibles</p>
              ) : (
                stats.topDonors.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.memberName}</p>
                      <p className="text-sm text-muted-foreground">{item.donationsCount} donaciones</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

