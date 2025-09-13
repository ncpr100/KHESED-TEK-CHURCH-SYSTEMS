
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, MessageSquare, Bell, Users } from 'lucide-react'
import Link from 'next/link'

export default function CommunicationsHelp() {
  const communicationTypes = [
    {
      icon: Mail,
      title: "Email Masivo",
      description: "Enviar emails a toda la congregación",
      features: ["Plantillas prediseñadas", "Programación de envío", "Estadísticas de apertura", "Personalización"],
      useCase: "Anuncios importantes, invitaciones a eventos, comunicados oficiales"
    },
    {
      icon: MessageSquare,
      title: "SMS (Premium)",
      description: "Mensajes de texto directos",
      features: ["1000 SMS incluidos/mes", "Envío inmediato", "Confirmación de entrega", "Mensajes cortos"],
      useCase: "Recordatorios urgentes, confirmaciones, alertas importantes"
    },
    {
      icon: Bell,
      title: "Notificaciones Push",
      description: "Notificaciones en la app móvil",
      features: ["Entrega instantánea", "Sin costo adicional", "Segmentación por grupos", "Rich media"],
      useCase: "Recordatorios de eventos, nuevas publicaciones, actualizaciones"
    }
  ]

  const messageTemplates = [
    {
      name: "Bienvenida Nuevo Miembro",
      type: "Email",
      subject: "¡Bienvenido(a) a {iglesia}!",
      preview: "Nos complace darte la bienvenida a nuestra familia espiritual..."
    },
    {
      name: "Recordatorio de Evento",
      type: "Email/SMS",
      subject: "Recordatorio: {evento} - {fecha}",
      preview: "No olvides que mañana tenemos {evento} a las {hora}..."
    },
    {
      name: "Invitación Especial",
      type: "Email",
      subject: "Invitación especial a {evento}",
      preview: "Tienes una invitación especial para participar en..."
    },
    {
      name: "Cambio de Horario",
      type: "SMS",
      subject: "Cambio importante",
      preview: "AVISO: El servicio del {fecha} cambia a las {nueva_hora}..."
    }
  ]

  const bestPractices = [
    {
      category: "Contenido",
      tips: [
        "Use un asunto claro y llamativo",
        "Mantenga mensajes concisos y directos",
        "Incluya llamada a la acción específica",
        "Use un tono cálido pero profesional"
      ]
    },
    {
      category: "Timing",
      tips: [
        "Envíe emails martes a jueves (mejores días)",
        "Horario óptimo: 10AM - 2PM",
        "Evite enviar domingo temprano o tarde en la noche",
        "Planifique con 24-48h de anticipación"
      ]
    },
    {
      category: "Segmentación",
      tips: [
        "Segmente por grupos de edad cuando sea relevante",
        "Considere intereses específicos (juventud, matrimonios)",
        "Respete preferencias de comunicación",
        "Use listas personalizadas para eventos específicos"
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
          <MessageSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Comunicaciones</h1>
            <p className="text-muted-foreground">
              Mantenga a su congregación informada y conectada
            </p>
          </div>
        </div>
      </div>

      {/* Communication Types */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tipos de Comunicación</h2>
        <div className="grid gap-6">
          {communicationTypes.map((type) => {
            const IconComponent = type.icon
            return (
              <Card key={type.title}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{type.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Características:</h4>
                      <ul className="space-y-1">
                        {type.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <span className="mr-2 text-green-600">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Ideal para:</h4>
                      <p className="text-sm text-muted-foreground">{type.useCase}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Message Templates */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Plantillas de Mensajes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {messageTemplates.map((template) => (
            <Card key={template.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {template.type}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-semibold">Asunto:</span>
                    <p className="text-sm italic">{template.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">Vista previa:</span>
                    <p className="text-xs text-muted-foreground">{template.preview}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Process Steps */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Proceso de Envío</h2>
        <Card>
          <CardHeader>
            <CardTitle>Pasos para enviar una comunicación efectiva</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📝 Preparación</h4>
                <ol className="space-y-2 text-sm">
                  <li><span className="font-bold">1.</span> Definir objetivo del mensaje</li>
                  <li><span className="font-bold">2.</span> Seleccionar audiencia objetivo</li>
                  <li><span className="font-bold">3.</span> Elegir tipo de comunicación</li>
                  <li><span className="font-bold">4.</span> Redactar mensaje o usar plantilla</li>
                </ol>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🚀 Envío</h4>
                <ol className="space-y-2 text-sm">
                  <li><span className="font-bold">5.</span> Revisar contenido y destinatarios</li>
                  <li><span className="font-bold">6.</span> Programar fecha y hora (opcional)</li>
                  <li><span className="font-bold">7.</span> Enviar o programar envío</li>
                  <li><span className="font-bold">8.</span> Monitorear estadísticas</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mejores Prácticas</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {bestPractices.map((practice) => (
            <Card key={practice.category}>
              <CardHeader>
                <CardTitle className="text-base">{practice.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {practice.tips.map((tip, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="mr-2 text-primary">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Analytics */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>📊 Métricas de Comunicación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">78%</div>
                <div className="text-sm text-muted-foreground">Tasa de apertura emails</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">23%</div>
                <div className="text-sm text-muted-foreground">Clics en enlaces</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Entrega SMS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1.2k</div>
                <div className="text-sm text-muted-foreground">Mensajes enviados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <div className="flex gap-2">
        <Link href="/help/subscription">
          <Button>
            Siguiente: Mi Suscripción →
          </Button>
        </Link>
        <Link href="/help/manual/communications">
          <Button variant="outline">
            📖 Ver Manual Detallado
          </Button>
        </Link>
      </div>
    </div>
  )
}
