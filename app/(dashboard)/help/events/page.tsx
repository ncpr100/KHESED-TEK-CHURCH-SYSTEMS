
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Users, QrCode, Clock } from 'lucide-react'
import Link from 'next/link'

export default function EventsHelp() {
  const eventTypes = [
    { type: "Servicio Regular", icon: "⛪", description: "Servicios dominicales y semanales", frequency: "Semanal" },
    { type: "Evento Especial", icon: "🎉", description: "Conferencias, conciertos, celebraciones", frequency: "Ocasional" },
    { type: "Retiro Espiritual", icon: "🙏", description: "Retiros de fin de semana o días", frequency: "Mensual/Trimestral" },
    { type: "Actividad Juvenil", icon: "🎸", description: "Eventos para jóvenes y adolescentes", frequency: "Semanal" },
    { type: "Reunión de Oración", icon: "🕊️", description: "Encuentros de oración y adoración", frequency: "Semanal" },
    { type: "Estudio Bíblico", icon: "📖", description: "Clases y estudios grupales", frequency: "Semanal" }
  ]

  const eventFeatures = [
    {
      icon: Calendar,
      title: "Programación Inteligente",
      description: "Sistema de calendario integrado",
      features: [
        "Vista de calendario mensual",
        "Eventos recurrentes automáticos",
        "Recordatorios por email y SMS",
        "Sincronización con Google Calendar"
      ]
    },
    {
      icon: Users,
      title: "Gestión de Asistentes",
      description: "Control completo de participantes",
      features: [
        "Registro online de asistentes",
        "Límites de capacidad",
        "Lista de espera automática",
        "Comunicación directa con registrados"
      ]
    },
    {
      icon: QrCode,
      title: "Check-in Digital",
      description: "Sistema de entrada moderno",
      features: [
        "Códigos QR únicos por evento",
        "Check-in desde móviles",
        "Registro de asistencia automático",
        "Reportes de asistencia en tiempo real"
      ]
    }
  ]

  const stepByStep = [
    { step: 1, action: "Crear Evento", details: "Título, fecha, hora, ubicación" },
    { step: 2, action: "Configurar Detalles", details: "Descripción, capacidad, tipo" },
    { step: 3, action: "Habilitar Registro", details: "Permitir inscripciones online" },
    { step: 4, action: "Promocionar", details: "Enviar invitaciones y anuncios" },
    { step: 5, action: "Gestionar Asistencia", details: "Check-in el día del evento" },
    { step: 6, action: "Generar Reportes", details: "Analizar asistencia y feedback" }
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
          <Calendar className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Eventos</h1>
            <p className="text-muted-foreground">
              Cree y administre eventos de su iglesia de manera profesional
            </p>
          </div>
        </div>
      </div>

      {/* Event Types */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tipos de Eventos Comunes</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventTypes.map((event) => (
            <Card key={event.type} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl mb-2">{event.icon}</div>
                <h3 className="font-semibold mb-1">{event.type}</h3>
                <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {event.frequency}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Event Features */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Funcionalidades Principales</h2>
        <div className="grid gap-6">
          {eventFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {feature.features.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="mr-2 text-green-600">✓</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Step by Step Process */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Proceso Paso a Paso</h2>
        <Card>
          <CardHeader>
            <CardTitle>Cómo crear y gestionar un evento exitoso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stepByStep.map((step) => (
                <div key={step.step} className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-semibold">{step.action}</h4>
                    <p className="text-sm text-muted-foreground">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>💡 Consejos para el Éxito</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>📅 <strong>Planifique con anticipación:</strong> Cree eventos con al menos 2 semanas de anticipación</p>
                <p>📱 <strong>Promocione activamente:</strong> Use todas las herramientas de comunicación disponibles</p>
                <p>🎯 <strong>Sea específico:</strong> Proporcione detalles claros sobre qué esperar</p>
                <p>⏰ <strong>Confirme asistencia:</strong> Envíe recordatorios 24-48 horas antes</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Métricas Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>👥 <strong>Tasa de asistencia:</strong> % de registrados que asisten</p>
                <p>📈 <strong>Crecimiento:</strong> Comparar asistencia mes a mes</p>
                <p>⭐ <strong>Satisfacción:</strong> Feedback post-evento</p>
                <p>🔄 <strong>Retención:</strong> Miembros que regresan a eventos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Next Steps */}
      <div className="flex gap-2">
        <Link href="/help/communications">
          <Button>
            Siguiente: Comunicaciones →
          </Button>
        </Link>
        <Link href="/help/manual/events">
          <Button variant="outline">
            📖 Ver Manual Detallado
          </Button>
        </Link>
      </div>
    </div>
  )
}
