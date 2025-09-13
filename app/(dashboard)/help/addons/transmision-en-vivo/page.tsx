
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Video, Users, Settings, Monitor, Wifi, Play, Calendar, Clock } from "lucide-react"

export default function LiveStreamingAddonPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Video className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Addon: Transmisión en Vivo</h1>
          <p className="text-muted-foreground">
            Conecta con tu congregación desde cualquier lugar con streaming profesional
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Descripción General
              </CardTitle>
              <Badge variant="outline">Premium</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              El addon de Transmisión en Vivo permite a las iglesias realizar servicios,
              eventos y reuniones en tiempo real con calidad profesional, llegando a 
              miembros que no pueden asistir físicamente.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Audiencia Ilimitada</h4>
                  <p className="text-sm text-muted-foreground">
                    Hasta 10,000 espectadores simultáneos
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Wifi className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium">Streaming Adaptativo</h4>
                  <p className="text-sm text-muted-foreground">
                    Calidad que se ajusta automáticamente
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Características Principales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Transmisión</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Streaming en HD (1080p)</li>
                  <li>• Audio de alta calidad</li>
                  <li>• Múltiples cámaras</li>
                  <li>• Grabación automática</li>
                  <li>• Chat en vivo</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Gestión</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Programación de eventos</li>
                  <li>• Moderación de comentarios</li>
                  <li>• Analytics de audiencia</li>
                  <li>• Integración con redes sociales</li>
                  <li>• Archivo automático</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Requisitos Técnicos</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Internet: 10 Mbps upload mínimo</li>
                  <li>• Cámara HD o webcam</li>
                  <li>• Micrófono de calidad</li>
                  <li>• PC/Mac con OBS Studio</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Plataformas Soportadas</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• YouTube Live</li>
                  <li>• Facebook Live</li>
                  <li>• Sitio web de la iglesia</li>
                  <li>• App móvil personalizada</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
            <CardDescription>
              Planes diseñados para iglesias de todos los tamaños
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Básico</h4>
                <div className="text-2xl font-bold my-2">$29<span className="text-sm font-normal">/mes</span></div>
                <ul className="text-sm space-y-1">
                  <li>• Hasta 100 espectadores</li>
                  <li>• 1 plataforma</li>
                  <li>• Grabación 30 días</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4 relative">
                <Badge className="absolute -top-2 left-4">Popular</Badge>
                <h4 className="font-medium">Profesional</h4>
                <div className="text-2xl font-bold my-2">$79<span className="text-sm font-normal">/mes</span></div>
                <ul className="text-sm space-y-1">
                  <li>• Hasta 1,000 espectadores</li>
                  <li>• Múltiples plataformas</li>
                  <li>• Analytics avanzados</li>
                  <li>• Soporte prioritario</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium">Enterprise</h4>
                <div className="text-2xl font-bold my-2">$199<span className="text-sm font-normal">/mes</span></div>
                <ul className="text-sm space-y-1">
                  <li>• Espectadores ilimitados</li>
                  <li>• Branding personalizado</li>
                  <li>• Integración completa</li>
                  <li>• Soporte 24/7</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex justify-center pt-6">
          <Button size="lg" className="gap-2">
            <Calendar className="h-4 w-4" />
            Solicitar Demo
          </Button>
        </div>
      </div>
    </div>
  )
}
