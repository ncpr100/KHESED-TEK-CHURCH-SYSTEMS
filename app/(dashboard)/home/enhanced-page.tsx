'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnhancedAnalyticsWidget } from '@/components/dashboard/enhanced-analytics-widget'
import { SmartSearch } from '@/components/search/smart-search'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { EnhancedNotificationCenter } from '@/components/notifications/enhanced-notification-center'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  Bell, 
  Settings,
  Search,
  BarChart3,
  Activity,
  Zap,
  Shield,
  Download,
  RefreshCw
} from 'lucide-react'

interface EnhancedDashboardProps {
  churchId: string
  userId: string
  userRole: string
}

export function EnhancedDashboard({ churchId, userId, userRole }: EnhancedDashboardProps) {
  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Mejorado
          </h1>
          <p className="text-muted-foreground">
            Panel de control con funcionalidades avanzadas y análisis en tiempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Smart Search */}
          <SmartSearch 
            churchId={churchId} 
            className="w-96"
            placeholder="Buscar en toda la plataforma..."
          />
          
          {/* Enhanced Notifications */}
          <EnhancedNotificationCenter 
            userId={userId} 
            churchId={churchId}
          />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Settings */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado del Sistema</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Operacional</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Funciones Nuevas</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    6 Mejoras
                  </Badge>
                </div>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seguridad</p>
                <div className="flex items-center gap-2 mt-1">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Protegido</span>
                </div>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rendimiento</p>
                <div className="flex items-center gap-2 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold">Optimizado</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Widget */}
      <EnhancedAnalyticsWidget 
        churchId={churchId}
        refreshInterval={300000} // 5 minutes
      />

      {/* Enhanced Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smart Search Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Inteligente
            </CardTitle>
            <CardDescription>
              Sistema de búsqueda avanzada con filtros y resultados en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Búsqueda global</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Filtros avanzados</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Historial de búsquedas</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sugerencias automáticas</span>
                <Badge variant="success">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Enhancements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Optimizaciones de Rendimiento
            </CardTitle>
            <CardDescription>
              Sistema de caché avanzado y optimizaciones de velocidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Caché inteligente</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Carga lazy de componentes</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Precarga de datos</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Compresión de assets</span>
                <Badge variant="success">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad Mejorada
            </CardTitle>
            <CardDescription>
              Funciones de seguridad avanzadas y protección de datos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Autenticación 2FA</span>
                <Badge variant="outline">Disponible</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Validación avanzada</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auditoría de sesiones</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Encriptación mejorada</span>
                <Badge variant="success">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* UI/UX Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Mejoras de Interfaz
            </CardTitle>
            <CardDescription>
              Nuevas funcionalidades de interfaz y experiencia de usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Temas personalizados</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificaciones en tiempo real</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Widgets interactivos</span>
                <Badge variant="success">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diseño responsivo mejorado</span>
                <Badge variant="success">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Centro de Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Accesos directos a las funciones más importantes del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-xs">Gestión de Miembros</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <DollarSign className="h-6 w-6" />
              <span className="text-xs">Donaciones</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xs">Eventos</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">Reportes</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Bell className="h-6 w-6" />
              <span className="text-xs">Comunicaciones</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span className="text-xs">Exportar Datos</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhancement Summary */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Zap className="h-5 w-5" />
            Resumen de Mejoras Implementadas
          </CardTitle>
          <CardDescription>
            Nuevas funcionalidades agregadas al sistema Khesed-Tek
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">🚀 Rendimiento</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Sistema de caché inteligente multi-nivel</li>
                <li>• Precarga automática de datos frecuentes</li>
                <li>• Optimización de consultas a la base de datos</li>
                <li>• Compresión y minificación de recursos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🎨 Experiencia de Usuario</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Búsqueda inteligente con filtros avanzados</li>
                <li>• Notificaciones en tiempo real</li>
                <li>• Temas personalizables (claro/oscuro/iglesia)</li>
                <li>• Dashboard con widgets interactivos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🔐 Seguridad</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Autenticación de dos factores (2FA)</li>
                <li>• Validación mejorada de datos</li>
                <li>• Auditoría de sesiones de usuario</li>
                <li>• Encriptación avanzada de datos sensibles</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">📊 Analíticas</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Métricas en tiempo real con auto-actualización</li>
                <li>• Exportación avanzada de reportes</li>
                <li>• Análisis predictivo de tendencias</li>
                <li>• Dashboard personalizable por rol</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}