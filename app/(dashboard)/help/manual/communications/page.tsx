
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function CommunicationsManual() {
  return (
    <div className="container mx-auto p-6">
      <Link href="/help/manual/complete">
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Manual
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manual: Comunicaciones</h1>
          <p className="text-muted-foreground">Herramientas de comunicación efectiva</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>📧 Sistema de Comunicaciones - Manual Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta guía cubre todas las herramientas para comunicarse efectivamente con su congregación, desde emails individuales hasta campañas masivas.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold">📋 Secciones</h4>
                <p className="text-xl font-bold text-blue-600">7</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold">⏱️ Tiempo</h4>
                <p className="text-xl font-bold text-green-600">18 min</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">🎯 Nivel</h4>
                <p className="text-lg font-bold text-purple-600">Básico</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold">👤 Rol Mínimo</h4>
                <p className="text-lg font-bold text-orange-600">LIDER</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Email Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Plantillas de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📝 Crear Plantillas</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>1.1.</strong> Navegue a <code>Comunicaciones → 📝 Plantillas</code></p>
                  <p><strong>1.2.</strong> Haga clic en "➕ Nueva Plantilla"</p>
                  <p><strong>1.3.</strong> Complete la información:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Nombre de plantilla:</strong> Identificación interna</li>
                    <li>• <strong>Asunto del email:</strong> Línea de asunto</li>
                    <li>• <strong>Categoría:</strong> Tipo de comunicación</li>
                    <li>• <strong>Contenido:</strong> Cuerpo del mensaje</li>
                  </ul>
                  <p><strong>1.4.</strong> Use variables dinámicas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <code>[NOMBRE]</code> - Nombre del destinatario</li>
                    <li>• <code>[IGLESIA]</code> - Nombre de la iglesia</li>
                    <li>• <code>[FECHA]</code> - Fecha actual</li>
                    <li>• <code>[EVENTO]</code> - Nombre del evento</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Plantillas Predefinidas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>🎉 Bienvenida:</strong> Nuevos miembros</li>
                  <li>• <strong>📅 Recordatorio Evento:</strong> Próximos servicios</li>
                  <li>• <strong>🎂 Cumpleaños:</strong> Felicitaciones personales</li>
                  <li>• <strong>💰 Agradecimiento:</strong> Por donaciones</li>
                  <li>• <strong>🙏 Oración:</strong> Peticiones especiales</li>
                  <li>• <strong>📢 Anuncios:</strong> Noticias de la iglesia</li>
                  <li>• <strong>🎪 Invitación Evento:</strong> Eventos especiales</li>
                </ul>
                <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-400">
                  <p className="text-xs"><strong>💡 Tip:</strong> Personalice las plantillas con el tono de su iglesia</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Mass Communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Comunicación Masiva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📢 Envío Masivo</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>2.1.</strong> Haga clic en "📧 Nuevo Mensaje"</p>
                  <p><strong>2.2.</strong> Seleccione destinatarios:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"Todos los Miembros":</strong> Congregación completa</li>
                    <li>• <strong>"Por Ministerio":</strong> Grupo específico</li>
                    <li>• <strong>"Por Edad":</strong> Jóvenes, adultos, niños</li>
                    <li>• <strong>"Líderes":</strong> Personal ministerial</li>
                    <li>• <strong>"Custom":</strong> Selección manual</li>
                  </ul>
                  <p><strong>2.3.</strong> Escoja plantilla o escriba mensaje</p>
                  <p><strong>2.4.</strong> Configure opciones de envío:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Envío inmediato o programado</li>
                    <li>• Seguimiento de apertura</li>
                    <li>• Permitir respuestas</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">⏰ Programación Avanzada</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Para programar envíos:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"⏰ Programar Envío":</strong> Fecha y hora específica</li>
                    <li>• <strong>"🔄 Recurrente":</strong> Mensajes repetitivos</li>
                    <li>• <strong>"📅 Basado en Eventos":</strong> Antes/después de servicios</li>
                  </ul>
                  <p><strong>Opciones de recurrencia:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Semanal (ej: recordatorio dominical)</li>
                    <li>• Mensual (ej: newsletter)</li>
                    <li>• En fechas especiales (ej: cumpleaños)</li>
                    <li>• Eventos específicos (ej: pre-servicio)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: SMS and WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              SMS y WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📱 Configuración SMS</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>3.1.</strong> Vaya a <code>Comunicaciones → ⚙️ Configuración</code></p>
                  <p><strong>3.2.</strong> En la sección SMS/WhatsApp:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Active el servicio SMS</li>
                    <li>• Configure API de WhatsApp Business</li>
                    <li>• Establezca límites diarios</li>
                    <li>• Configure plantillas pre-aprobadas</li>
                  </ul>
                  <p><strong>3.3.</strong> Para envío masivo de SMS:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Seleccione grupo de destinatarios</li>
                    <li>• Escriba mensaje (máximo 160 caracteres)</li>
                    <li>• Revise costo estimado</li>
                    <li>• Confirme envío</li>
                  </ul>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💚 WhatsApp Business</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Funcionalidades especiales:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Mensajes automáticos:</strong> Respuestas predefinidas</li>
                    <li>• <strong>Estados de entrega:</strong> Enviado, entregado, leído</li>
                    <li>• <strong>Multimedia:</strong> Enviar imágenes, documentos</li>
                    <li>• <strong>Grupos:</strong> Crear grupos por ministerio</li>
                  </ul>
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-green-400">
                    <p className="text-xs"><strong>📞 Costo:</strong> SMS tiene costo por mensaje, WhatsApp Business es más económico</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Notification System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Sistema de Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔔 Configurar Notificaciones</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>4.1.</strong> Vaya a <code>Configuración → 🔔 Notificaciones</code></p>
                  <p><strong>4.2.</strong> Tipos de notificaciones automáticas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Nuevos Miembros:</strong> Bienvenida automática</li>
                    <li>• <strong>Cumpleaños:</strong> Felicitaciones automáticas</li>
                    <li>• <strong>Eventos Próximos:</strong> Recordatorios antes del evento</li>
                    <li>• <strong>Donaciones:</strong> Agradecimientos automáticos</li>
                    <li>• <strong>Asistencia:</strong> Seguimiento a ausentes</li>
                  </ul>
                  <p><strong>4.3.</strong> Configure cuándo enviar:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Inmediatamente después del evento</li>
                    <li>• X horas/días antes</li>
                    <li>• En horarios específicos</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📮 Bandeja de Entrada</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Gestionar notificaciones recibidas:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"📥 Bandeja de Entrada":</strong> Mensajes recibidos</li>
                    <li>• <strong>"✉️ No Leídos":</strong> Filtrar pendientes</li>
                    <li>• <strong>"📧 Responder":</strong> Contestar directamente</li>
                    <li>• <strong>"🗑️ Archivar":</strong> Organizar mensajes</li>
                  </ul>
                  <p><strong>Métodos de entrega disponibles:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Email estándar</li>
                    <li>• SMS/Mensaje de texto</li>
                    <li>• WhatsApp</li>
                    <li>• Notificación push (app móvil)</li>
                    <li>• Llamada telefónica automática</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Campaign Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              Gestión de Campañas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🎯 Crear Campañas</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>5.1.</strong> En Comunicaciones, haga clic en "📈 Campañas"</p>
                  <p><strong>5.2.</strong> Haga clic en "➕ Nueva Campaña"</p>
                  <p><strong>5.3.</strong> Configure la campaña:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Nombre de campaña:</strong> Ej: "Bienvenida 2025"</li>
                    <li>• <strong>Objetivo:</strong> Meta de la campaña</li>
                    <li>• <strong>Duración:</strong> Fecha inicio y fin</li>
                    <li>• <strong>Público objetivo:</strong> Segmento específico</li>
                  </ul>
                  <p><strong>5.4.</strong> Agregue secuencia de mensajes:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Mensaje inicial inmediato</li>
                    <li>• Seguimiento a los 3 días</li>
                    <li>• Recordatorio final a la semana</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📊 Seguimiento de Resultados</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Métricas de campaña:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Tasa de entrega:</strong> % entregados exitosamente</li>
                    <li>• <strong>Tasa de apertura:</strong> % que abrió el email</li>
                    <li>• <strong>Tasa de clic:</strong> % que hizo clic en enlaces</li>
                    <li>• <strong>Respuestas:</strong> Número de interacciones</li>
                    <li>• <strong>Conversiones:</strong> Acciones completadas</li>
                  </ul>
                  <p><strong>Optimización automática:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>A/B Testing:</strong> Probar diferentes versiones</li>
                    <li>• <strong>Horario óptimo:</strong> Mejor hora de envío</li>
                    <li>• <strong>Frecuencia:</strong> Evitar sobre-comunicación</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Integration Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              Integraciones y Automatización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔗 Integraciones Disponibles</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>6.1.</strong> Conecte con plataformas externas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Mailchimp:</strong> Sincronización de listas</li>
                    <li>• <strong>Telegram:</strong> Canales de iglesia</li>
                    <li>• <strong>Facebook:</strong> Publicaciones automáticas</li>
                    <li>• <strong>YouTube:</strong> Notificaciones de streaming</li>
                  </ul>
                  <p><strong>6.2.</strong> Para activar integraciones:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Vaya a Configuración → Integraciones</li>
                    <li>• Haga clic en "🔗 Conectar [Plataforma]"</li>
                    <li>• Autentique con sus credenciales</li>
                    <li>• Configure sincronización automática</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🤖 Automatización</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Triggers automáticos disponibles:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Nuevo miembro:</strong> Serie de bienvenida</li>
                    <li>• <strong>Primera visita:</strong> Seguimiento automático</li>
                    <li>• <strong>Cumpleaños:</strong> Felicitaciones personalizadas</li>
                    <li>• <strong>Ausencia:</strong> Mensaje de seguimiento pastoral</li>
                    <li>• <strong>Donación:</strong> Agradecimiento inmediato</li>
                  </ul>
                  <p><strong>Para configurar:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"🤖 Reglas de Automatización"</strong></li>
                    <li>• Seleccione trigger</li>
                    <li>• Configure acción (email, SMS, etc.)</li>
                    <li>• Establezca condiciones</li>
                    <li>• Active la regla</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Analytics and Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
              Analíticas y Reportes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📈 Métricas de Comunicación</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>7.1.</strong> Acceda a <code>Analíticas → Comunicaciones</code></p>
                  <p><strong>7.2.</strong> Reportes disponibles:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Engagement por Mensaje:</strong> Apertura y clics</li>
                    <li>• <strong>Preferencias de Canal:</strong> Email vs SMS vs WhatsApp</li>
                    <li>• <strong>Horarios Óptimos:</strong> Mejor momento para enviar</li>
                    <li>• <strong>Respuesta por Grupo:</strong> Cuál ministerio responde más</li>
                    <li>• <strong>Evolución Temporal:</strong> Mejora de engagement</li>
                  </ul>
                  <p><strong>7.3.</strong> Use la data para optimizar:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Horarios de mejor respuesta</li>
                    <li>• Tipos de mensaje más efectivos</li>
                    <li>• Frecuencia óptima de comunicación</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 KPIs Clave</h4>
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">📧 Tasa de Apertura</p>
                      <p className="text-muted-foreground">25-35% es bueno</p>
                    </div>
                    <div>
                      <p className="font-semibold">👆 Tasa de Clic</p>
                      <p className="text-muted-foreground">2-5% es bueno</p>
                    </div>
                    <div>
                      <p className="font-semibold">📱 Entrega SMS</p>
                      <p className="text-muted-foreground">95%+ esperado</p>
                    </div>
                    <div>
                      <p className="font-semibold">💬 Respuestas</p>
                      <p className="text-muted-foreground">Interacción directa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Referencia Rápida de Botones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📧 Botones de Email</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"📧 Nuevo Mensaje":</strong> Crear comunicación</li>
                  <li>• <strong>"📝 Plantillas":</strong> Gestionar plantillas</li>
                  <li>• <strong>"📈 Campañas":</strong> Marketing automation</li>
                  <li>• <strong>"📊 Estadísticas":</strong> Ver métricas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">📱 Botones de SMS/WhatsApp</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"📱 Enviar SMS":</strong> Mensaje de texto masivo</li>
                  <li>• <strong>"💚 WhatsApp":</strong> Envío por WhatsApp</li>
                  <li>• <strong>"👥 Grupos":</strong> Gestionar grupos de chat</li>
                  <li>• <strong>"⚙️ Configurar":</strong> APIs y límites</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔔 Botones de Notificaciones</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"📥 Bandeja de Entrada":</strong> Mensajes recibidos</li>
                  <li>• <strong>"🔔 Configurar":</strong> Notificaciones automáticas</li>
                  <li>• <strong>"🤖 Automatización":</strong> Reglas inteligentes</li>
                  <li>• <strong>"📊 Métricas de Entrega":</strong> Rendimiento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
