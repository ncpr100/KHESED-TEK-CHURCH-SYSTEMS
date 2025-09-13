
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, Zap, Users, BarChart3, Settings, Star, ArrowRight, CheckCircle } from "lucide-react"

export default function WhatsNewAugust2025Page() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Novedades - Agosto 2025</h1>
          <p className="text-muted-foreground">
            Las últimas mejoras y características añadidas al sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Major Features */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Características Principales
              </CardTitle>
              <Badge variant="default">Nuevo</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Dashboard de Análisis Avanzado</h4>
                  <p className="text-sm text-muted-foreground">
                    Nuevo dashboard con métricas de visitantes, engagement scores, y 
                    análisis de automatización para mejorar el seguimiento pastoral.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Sistema de Website Builder</h4>
                  <p className="text-sm text-muted-foreground">
                    Creación automática de sitios web para iglesias con templates 
                    profesionales y sistema de solicitudes integrado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Platform Super Admin</h4>
                  <p className="text-sm text-muted-foreground">
                    Dashboard completo para administradores de plataforma con 
                    estadísticas globales, gestión de usuarios y monitoreo del sistema.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Mejoras y Optimizaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Rendimiento</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Carga de dashboard 40% más rápida</li>
                  <li>• Optimización de consultas de base de datos</li>
                  <li>• Cache inteligente de analytics</li>
                  <li>• Mejoras en la interfaz móvil</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Experiencia de Usuario</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Navegación mejorada en el dashboard</li>
                  <li>• Tooltips informativos</li>
                  <li>• Feedback visual mejorado</li>
                  <li>• Shortcuts de teclado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Nuevas Métricas de Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Visitor Analytics</h4>
                <p className="text-xs text-muted-foreground">
                  Análisis detallado de visitantes primerizos vs. recurrentes
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <h4 className="font-medium">Automation Success</h4>
                <p className="text-xs text-muted-foreground">
                  Tasas de éxito de flujos de automatización
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Engagement Scores</h4>
                <p className="text-xs text-muted-foreground">
                  Puntuaciones de participación e interacción
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bug Fixes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Correcciones y Estabilidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Resuelto problema de navegación después del login</li>
              <li>• Corregidos errores de carga en analytics</li>
              <li>• Mejorada sincronización de datos</li>
              <li>• Estabilidad general del sistema</li>
              <li>• Compatibilidad mejorada con diferentes navegadores</li>
            </ul>
          </CardContent>
        </Card>

        {/* Coming Next */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Próximamente</CardTitle>
            <CardDescription className="text-blue-600">
              Características planificadas para septiembre 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">App móvil nativa</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Integración con WhatsApp Business</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Analytics predictivos con IA</span>
              </div>
              <div className="flex items-center gap-2 text-blue-700">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">Gestión avanzada de voluntarios</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <div className="text-center pt-6">
          <Button variant="outline" className="gap-2">
            <Star className="h-4 w-4" />
            ¿Sugerencias? Contáctanos
          </Button>
        </div>
      </div>
    </div>
  )
}
