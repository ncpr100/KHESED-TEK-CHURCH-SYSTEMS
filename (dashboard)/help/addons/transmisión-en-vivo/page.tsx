
'use client'

import { ArrowLeft, Video, Wifi, Settings, PlayCircle, Users, Smartphone, Computer, Headphones, Signal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function TransmisionEnVivoPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/help/addons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Video className="h-8 w-8 text-red-500" />
            Transmisión en Vivo
          </h1>
          <p className="text-muted-foreground">
            Sistema completo para transmitir servicios y eventos en tiempo real
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          Add-on Profesional
        </Badge>
      </div>

      {/* Características principales */}
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5" />
              Características Principales
            </CardTitle>
            <CardDescription>
              Herramientas completas para transmisión en vivo profesional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4 text-green-500" />
                  <span>Streaming HD hasta 4K</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Audiencia ilimitada</span>
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-purple-500" />
                  <span>Multi-plataforma</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Computer className="h-4 w-4 text-orange-500" />
                  <span>Grabación automática</span>
                </div>
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-pink-500" />
                  <span>Audio profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <span>Control total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">1. Configurar Hardware</h4>
              <p className="text-sm text-muted-foreground">
                Conecta tu cámara, micrófonos y equipos de audio profesional
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">2. Configurar Streaming</h4>
              <p className="text-sm text-muted-foreground">
                Define calidad, plataformas de destino y configuración de red
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">3. Probar Conexión</h4>
              <p className="text-sm text-muted-foreground">
                Realiza pruebas de conectividad y calidad antes del evento
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plataformas compatibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Plataformas Compatibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="font-semibold text-red-600">YouTube</div>
                <div className="text-xs text-muted-foreground">Live Streaming</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">Facebook</div>
                <div className="text-xs text-muted-foreground">Live Video</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-600">Twitch</div>
                <div className="text-xs text-muted-foreground">Broadcasting</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-600">Personalizado</div>
                <div className="text-xs text-muted-foreground">RTMP Server</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="flex-1">
          <PlayCircle className="h-4 w-4 mr-2" />
          Iniciar Configuración
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          <Video className="h-4 w-4 mr-2" />
          Ver Tutorial
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/help">
            Volver al Centro de Ayuda
          </Link>
        </Button>
      </div>
    </div>
  )
}
