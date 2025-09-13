
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Clock, Users, Star } from 'lucide-react'
import Link from 'next/link'

export default function VideosHelp() {
  const videoSeries = [
    {
      title: "🚀 Primeros Pasos",
      description: "Serie completa para comenzar con Kḥesed-tek",
      videos: 6,
      totalTime: "45 min",
      level: "Principiante",
      popular: true
    },
    {
      title: "👥 Gestión Avanzada de Miembros", 
      description: "Técnicas avanzadas para administrar su congregación",
      videos: 4,
      totalTime: "32 min",
      level: "Intermedio",
      popular: false
    },
    {
      title: "💰 Donaciones y Finanzas",
      description: "Configuración completa del sistema financiero",
      videos: 5,
      totalTime: "38 min", 
      level: "Principiante",
      popular: true
    },
    {
      title: "📅 Eventos Exitosos",
      description: "Cómo organizar y promocionar eventos efectivamente",
      videos: 3,
      totalTime: "28 min",
      level: "Intermedio", 
      popular: false
    }
  ]

  const featuredVideos = [
    {
      title: "Configuración Inicial Completa",
      duration: "8:30",
      views: "2.8k",
      category: "Primeros Pasos",
      description: "Aprenda a configurar su iglesia desde cero en menos de 15 minutos",
      thumbnail: "🎥"
    },
    {
      title: "Importar Miembros desde Excel",
      duration: "12:15", 
      views: "1.9k",
      category: "Miembros",
      description: "Guía paso a paso para importar su lista existente de miembros",
      thumbnail: "📊"
    },
    {
      title: "Configurar Donaciones con Nequi",
      duration: "9:45",
      views: "1.2k", 
      category: "Finanzas",
      description: "Integre Nequi como método de pago para donaciones digitales",
      thumbnail: "💳"
    },
    {
      title: "Crear y Promocionar Eventos",
      duration: "11:20",
      views: "987",
      category: "Eventos", 
      description: "Desde la creación hasta el check-in con códigos QR",
      thumbnail: "🎪"
    },
    {
      title: "Comunicaciones Masivas Efectivas",
      duration: "7:10",
      views: "1.5k",
      category: "Comunicaciones",
      description: "Mejores prácticas para emails y mensajes que generen acción",
      thumbnail: "📧"
    },
    {
      title: "Reportes y Analytics",
      duration: "15:30", 
      views: "756",
      category: "Analytics",
      description: "Interprete las métricas de su iglesia para tomar mejores decisiones",
      thumbnail: "📈"
    }
  ]

  const tutorials = [
    {
      category: "Configuración Rápida",
      videos: [
        "Registro y primer acceso (3:15)",
        "Configurar información básica (5:20)",
        "Seleccionar plan adecuado (4:10)",
        "Configurar métodos de pago (6:30)"
      ]
    },
    {
      category: "Gestión Diaria", 
      videos: [
        "Agregar miembros nuevos (4:45)",
        "Registrar donaciones (3:30)",
        "Crear eventos rápidos (5:15)",
        "Enviar comunicaciones (6:20)"
      ]
    },
    {
      category: "Funciones Avanzadas",
      videos: [
        "Automatizaciones inteligentes (12:45)",
        "Reportes personalizados (18:20)",
        "Integraciones externas (15:10)",
        "Gestión de permisos (8:30)"
      ]
    }
  ]

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/help">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Ayuda
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <Play className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Videotutoriales</h1>
            <p className="text-muted-foreground">
              Aprenda Kḥesed-tek de forma visual y práctica
            </p>
          </div>
        </div>
      </div>

      {/* Video Series */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Series de Videos</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {videoSeries.map((series) => (
            <Card key={series.title} className="relative">
              {series.popular && (
                <div className="absolute -top-2 right-2">
                  <Badge className="bg-orange-100 text-orange-800">🔥 Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{series.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{series.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      {series.videos} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {series.totalTime}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {series.level}
                  </Badge>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => alert('Los videotutoriales serán implementados próximamente. Por ahora consulte el manual escrito.')}
                >
                  ▶️ Ver Serie Completa
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Videos */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Videos Destacados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredVideos.map((video) => (
            <Card key={video.title} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <span className="text-4xl">{video.thumbnail}</span>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{video.category}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {video.views}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
                  <Button 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => alert('Los videotutoriales serán implementados próximamente. Consulte el manual para información detallada.')}
                  >
                    ▶️ Reproducir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Tutorials */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tutoriales por Categoría</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {tutorials.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="text-base">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.videos.map((video, index) => (
                    <li key={index} className="flex items-start">
                      <Play className="h-3 w-3 mt-1 mr-2 text-primary flex-shrink-0" />
                      <span className="text-sm">{video}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Learning Path */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Ruta de Aprendizaje Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
                <div>
                  <h4 className="font-semibold">Configuración Inicial (15 min)</h4>
                  <p className="text-sm text-muted-foreground">Comience con los videos de "Primeros Pasos" para configurar su iglesia correctamente.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
                <div>
                  <h4 className="font-semibold">Gestión de Miembros (20 min)</h4>
                  <p className="text-sm text-muted-foreground">Aprenda a importar y gestionar su congregación de manera eficiente.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
                <div>
                  <h4 className="font-semibold">Donaciones y Eventos (25 min)</h4>
                  <p className="text-sm text-muted-foreground">Configure el sistema financiero y cree sus primeros eventos.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">4</div>
                <div>
                  <h4 className="font-semibold">Comunicaciones y Analytics (30 min)</h4>
                  <p className="text-sm text-muted-foreground">Domine las herramientas de comunicación y aprenda a interpretar los reportes.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Support */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>¿No encuentra lo que busca?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Si necesita un tutorial específico o tiene dudas sobre algún proceso, contáctenos y crearemos el contenido que necesita.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.open('https://wa.me/573003435733', '_blank')}>
                📱 WhatsApp
              </Button>
              <Link href="/help/support/ticket">
                <Button variant="outline">
                  🎫 Solicitar Tutorial
                </Button>
              </Link>
              <Link href="/help/manual/complete">
                <Button variant="outline">
                  📖 Ver Manual Escrito
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Back to Help */}
      <div className="text-center">
        <Link href="/help">
          <Button variant="outline">
            ← Volver al Centro de Ayuda
          </Button>
        </Link>
      </div>
    </div>
  )
}
