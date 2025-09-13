
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Ticket, Clock, MessageCircle, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function SupportTicket() {
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: '',
    description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Funcionalidad de tickets será implementada próximamente. Por favor use WhatsApp o email para soporte inmediato.')
  }

  const supportChannels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Respuesta rápida y personal",
      availability: "Lun-Vie 8AM-8PM",
      responseTime: "< 1 hora",
      action: () => window.open('https://wa.me/573003435733', '_blank')
    },
    {
      icon: Mail,
      title: "Email",
      description: "Para consultas detalladas",
      availability: "24/7",
      responseTime: "24-48 horas",
      action: () => window.location.href = 'mailto:soporte@khesedtek.com'
    },
    {
      icon: MessageCircle,
      title: "Chat en Vivo",
      description: "Soporte inmediato online",
      availability: "Lun-Vie 8AM-6PM",
      responseTime: "Inmediato",
      action: () => alert('Chat en vivo será implementado próximamente')
    }
  ]

  const commonIssues = [
    {
      title: "No puedo importar miembros desde Excel",
      solution: "Verifique que esté usando nuestra plantilla oficial y que no haya emails duplicados",
      link: "/help/members"
    },
    {
      title: "Error al configurar métodos de pago",
      solution: "Asegúrese de que la información bancaria esté completa y sea correcta",
      link: "/help/donations"
    },
    {
      title: "Los emails no se están enviando",
      solution: "Revise la configuración de comunicaciones y verifique que los emails sean válidos",
      link: "/help/communications"
    },
    {
      title: "No aparecen los eventos en el calendario",
      solution: "Verifique que los eventos estén publicados y que las fechas sean correctas",
      link: "/help/events"
    }
  ]

  const priorityLevels = [
    { value: "low", label: "Baja - Pregunta general", color: "text-green-600" },
    { value: "normal", label: "Normal - Problema no crítico", color: "text-blue-600" },
    { value: "high", label: "Alta - Afecta funcionalidad", color: "text-orange-600" },
    { value: "urgent", label: "Urgente - Sistema no funciona", color: "text-red-600" }
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
          <Ticket className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Soporte Técnico</h1>
            <p className="text-muted-foreground">
              Obtenga ayuda personalizada de nuestro equipo de soporte
            </p>
          </div>
        </div>
      </div>

      {/* Support Channels */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Canales de Soporte Disponibles</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {supportChannels.map((channel) => {
            const IconComponent = channel.icon
            return (
              <Card key={channel.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={channel.action}>
                <CardHeader className="text-center">
                  <IconComponent className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">{channel.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Disponible:</span>
                      <span>{channel.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Respuesta:</span>
                      <span className="font-medium">{channel.responseTime}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" onClick={channel.action}>
                    Contactar por {channel.title}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Common Issues */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Problemas Comunes y Soluciones</h2>
        <Card>
          <CardHeader>
            <CardTitle>¿Su problema está aquí? Solución rápida:</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-sm">{issue.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{issue.solution}</p>
                  <Link href={issue.link}>
                    <Button size="sm" variant="outline">
                      Ver Guía Detallada →
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Ticket Form */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Ticket de Soporte</h2>
        <Card>
          <CardHeader>
            <CardTitle>Describa su problema o consulta</CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete el formulario con la mayor cantidad de detalles posible para un soporte más eficiente.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Asunto *</label>
                <Input
                  placeholder="Resuma su problema en una línea"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría *</label>
                  <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Error técnico</SelectItem>
                      <SelectItem value="billing">Facturación</SelectItem>
                      <SelectItem value="usage">Duda sobre uso</SelectItem>
                      <SelectItem value="feature">Solicitud de función</SelectItem>
                      <SelectItem value="import">Problemas de importación</SelectItem>
                      <SelectItem value="integration">Integraciones</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Prioridad *</label>
                  <Select onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción Detallada *</label>
                <Textarea
                  placeholder="Describa su problema con el mayor detalle posible:&#10;- ¿Qué estaba tratando de hacer?&#10;- ¿Qué pasó exactamente?&#10;- ¿Hay algún mensaje de error?&#10;- ¿Cuándo comenzó el problema?"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">💡 Consejos para un soporte más rápido:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Sea específico sobre los pasos que siguió</li>
                  <li>• Incluya capturas de pantalla si es posible</li>
                  <li>• Mencione el navegador que está usando</li>
                  <li>• Indique si el problema es recurrente</li>
                </ul>
              </div>

              <Button type="submit" className="w-full">
                🎫 Crear Ticket de Soporte
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Response Times */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempos de Respuesta Esperados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">&lt; 1h</div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">&lt; 4h</div>
                <div className="text-sm text-muted-foreground">Tickets Urgentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">&lt; 24h</div>
                <div className="text-sm text-muted-foreground">Tickets Normales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">&lt; 48h</div>
                <div className="text-sm text-muted-foreground">Consultas Email</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Info */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📞 Contacto Directo</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>WhatsApp:</strong> +57 300 KHESED (543733)</p>
                  <p><strong>Email:</strong> soporte@khesedtek.com</p>
                  <p><strong>Horario:</strong> Lun-Vie 8AM-8PM (Colombia)</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🏢 Información Empresarial</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Empresa:</strong> Kḥesed-tek Systems</p>
                  <p><strong>Ubicación:</strong> Bogotá, Colombia</p>
                  <p><strong>Web:</strong> https://khesedtek.com</p>
                </div>
              </div>
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
