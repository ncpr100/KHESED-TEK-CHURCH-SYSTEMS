
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function EventsManual() {
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
          <h1 className="text-3xl font-bold">Manual: Gestión de Eventos</h1>
          <p className="text-muted-foreground">Crear y administrar eventos exitosos</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Gestión de Eventos - Manual Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta guía cubre todas las funcionalidades para crear, gestionar y hacer seguimiento de eventos y servicios de su iglesia.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold">📋 Secciones</h4>
                <p className="text-xl font-bold text-blue-600">7</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold">⏱️ Tiempo</h4>
                <p className="text-xl font-bold text-green-600">30 min</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">🎯 Nivel</h4>
                <p className="text-lg font-bold text-purple-600">Intermedio</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold">👤 Rol Mínimo</h4>
                <p className="text-lg font-bold text-orange-600">LIDER</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Creating Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Crear Nuevos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">➕ Proceso de Creación</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>1.1.</strong> Navegue a <code>Eventos → ➕ Nuevo Evento</code></p>
                  <p><strong>1.2.</strong> Complete la información básica:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Nombre del evento:</strong> Título descriptivo</li>
                    <li>• <strong>Descripción:</strong> Detalles y propósito</li>
                    <li>• <strong>Fecha y hora:</strong> Inicio y fin</li>
                    <li>• <strong>Ubicación:</strong> Dirección o salón</li>
                    <li>• <strong>Capacidad máxima:</strong> Límite de asistentes</li>
                  </ul>
                  <p><strong>1.3.</strong> Configure opciones avanzadas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Registro requerido (Sí/No)</li>
                    <li>• Check-in con QR</li>
                    <li>• Notificaciones automáticas</li>
                    <li>• Requiere aprobación</li>
                  </ul>
                  <p><strong>1.4.</strong> Haga clic en "💾 Crear Evento"</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Tipos de Eventos</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Servicios Regulares:</strong> Cultos dominicales, estudios bíblicos</li>
                  <li>• <strong>Eventos Especiales:</strong> Conferencias, retiros, celebraciones</li>
                  <li>• <strong>Reuniones Ministeriales:</strong> Juntas, capacitaciones</li>
                  <li>• <strong>Actividades Sociales:</strong> Cenas, picnics, deportes</li>
                  <li>• <strong>Eventos Externos:</strong> Evangelismo, visitas</li>
                </ul>
                <div className="mt-3 p-2 bg-white rounded border-l-4 border-blue-400">
                  <p className="text-xs"><strong>💡 Tip:</strong> Use plantillas para eventos recurrentes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Event Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Sistema de Registro de Asistentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📝 Configurar Registro</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>2.1.</strong> Al crear evento, active "Registro Requerido"</p>
                  <p><strong>2.2.</strong> Configure campos del formulario:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Obligatorios:</strong> Nombre, email, teléfono</li>
                    <li>• <strong>Opcionales:</strong> Edad, alergias, notas especiales</li>
                    <li>• <strong>Custom:</strong> Preguntas específicas del evento</li>
                  </ul>
                  <p><strong>2.3.</strong> Establezca límites:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Capacidad máxima</li>
                    <li>• Fecha límite de registro</li>
                    <li>• Restricciones de edad</li>
                  </ul>
                  <p><strong>2.4.</strong> Active notificaciones automáticas</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">👥 Gestionar Registros</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Desde la página del evento:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"👁️ Ver Registrados":</strong> Lista completa</li>
                    <li>• <strong>"➕ Registro Manual":</strong> Agregar directamente</li>
                    <li>• <strong>"📧 Comunicar":</strong> Enviar mensaje a registrados</li>
                    <li>• <strong>"📊 Exportar Lista":</strong> Descargar Excel/CSV</li>
                    <li>• <strong>"✅ Aprobar Pendientes":</strong> Si requiere aprobación</li>
                    <li>• <strong>"❌ Cancelar Registro":</strong> Remover asistente</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: QR Check-in System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Sistema de Check-in con Código QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📱 Configuración de QR</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>3.1.</strong> En el evento, active "Check-in con QR"</p>
                  <p><strong>3.2.</strong> El sistema genera automáticamente:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Código QR único por evento</li>
                    <li>• URL de check-in directo</li>
                    <li>• Dashboard de control en tiempo real</li>
                  </ul>
                  <p><strong>3.3.</strong> Imprima o proyecte el código QR</p>
                  <p><strong>3.4.</strong> Los asistentes escanean para registrar entrada</p>
                  <p><strong>3.5.</strong> Monitor la asistencia en tiempo real</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📲 Instrucciones para Asistentes</h4>
                <div className="text-sm space-y-2">
                  <p><strong>Para registrar asistencia:</strong></p>
                  <ol className="ml-4 space-y-1 text-muted-foreground">
                    <li>1. Abra la cámara de su teléfono</li>
                    <li>2. Apunte al código QR del evento</li>
                    <li>3. Toque la notificación que aparece</li>
                    <li>4. Complete información si es primera vez</li>
                    <li>5. Confirme su asistencia</li>
                  </ol>
                  <div className="mt-3 p-2 bg-white rounded border-l-4 border-green-400">
                    <p className="text-xs"><strong>✨ Automático:</strong> Miembros existentes se registran instantáneamente</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Event Types and Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Tipos de Eventos y Plantillas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📋 Plantillas Predefinidas</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>4.1.</strong> Al crear evento, seleccione plantilla:</p>
                  <ul className="ml-4 space-y-2 text-muted-foreground">
                    <li>• <strong>⛪ Servicio Dominical:</strong>
                      <br />Horario típico, check-in activado, capacidad estándar</li>
                    <li>• <strong>📖 Estudio Bíblico:</strong>
                      <br />Grupo pequeño, registro opcional, materiales</li>
                    <li>• <strong>🎉 Evento Especial:</strong>
                      <br />Capacidad grande, registro requerido, promoción</li>
                    <li>• <strong>👥 Reunión Ministerial:</strong>
                      <br />Privado, solo invitados, sin check-in público</li>
                    <li>• <strong>🍽️ Actividad Social:</strong>
                      <br />Familiar, comida, confirmación necesaria</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">🛠️ Personalizar Plantillas</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Para modificar plantillas:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"⚙️ Configurar Plantillas":</strong> Desde página de eventos</li>
                    <li>• <strong>Modificar campos:</strong> Agregar/quitar información</li>
                    <li>• <strong>Establecer valores por defecto:</strong> Duración, ubicación</li>
                    <li>• <strong>Guardar plantilla custom:</strong> Para uso futuro</li>
                  </ul>
                  <p><strong>Plantillas incluyen:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Configuración de check-in</li>
                    <li>• Campos de registro</li>
                    <li>• Notificaciones predefinidas</li>
                    <li>• Configuración de capacidad</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Event Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              Gestión y Seguimiento de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📊 Dashboard de Eventos</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Desde la página principal de eventos:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"📅 Calendario":</strong> Vista mensual/semanal</li>
                    <li>• <strong>"📋 Lista":</strong> Todos los eventos próximos</li>
                    <li>• <strong>"📊 Estadísticas":</strong> Métricas de asistencia</li>
                    <li>• <strong>"🔍 Buscar":</strong> Filtrar por fecha/tipo</li>
                  </ul>
                  <p><strong>Para cada evento individual:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"👁️ Ver Detalles":</strong> Información completa</li>
                    <li>• <strong>"✏️ Editar":</strong> Modificar configuración</li>
                    <li>• <strong>"👥 Ver Asistentes":</strong> Lista de registrados</li>
                    <li>• <strong>"📱 QR Check-in":</strong> Activar registro</li>
                    <li>• <strong>"📧 Comunicar":</strong> Mensaje a asistentes</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">⚡ Acciones Rápidas</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Botones de acción rápida:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"🚀 Evento Rápido":</strong> Crear servicio dominical automático</li>
                    <li>• <strong>"📂 Duplicar Evento":</strong> Copiar configuración existente</li>
                    <li>• <strong>"📅 Serie de Eventos":</strong> Crear eventos recurrentes</li>
                    <li>• <strong>"📊 Reporte Rápido":</strong> Estadísticas instantáneas</li>
                  </ul>
                  <p><strong>Estados de eventos:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>🟢 Activo:</strong> Registros abiertos</li>
                    <li>• <strong>🟡 En Curso:</strong> Evento sucediendo</li>
                    <li>• <strong>🔴 Finalizado:</strong> Completado</li>
                    <li>• <strong>⚫ Cancelado:</strong> No realizado</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Advanced Check-in Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              🆕 Funciones Avanzadas de Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔐 Seguridad Infantil</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>6.1.</strong> Para eventos con niños, active "Seguridad Infantil"</p>
                  <p><strong>6.2.</strong> Funcionalidades incluidas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>WebRTC Biométrico:</strong> Verificación de identidad</li>
                    <li>• <strong>PIN de Recogida:</strong> Código seguro para padres</li>
                    <li>• <strong>Alergias y Emergencias:</strong> Información médica</li>
                    <li>• <strong>Contactos Autorizados:</strong> Quién puede recoger</li>
                  </ul>
                  <p><strong>6.3.</strong> Proceso de check-in seguro:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Padre/madre registra al niño</li>
                    <li>• Sistema genera PIN único</li>
                    <li>• Se imprime etiqueta de identificación</li>
                    <li>• Mismo PIN requerido para recogida</li>
                  </ul>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🚨 Protocolo de Emergencia</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Contacto inmediato:</strong> Notificación automática a padres</li>
                  <li>• <strong>Información médica:</strong> Alergias y medicamentos</li>
                  <li>• <strong>Contactos secundarios:</strong> Familiares autorizados</li>
                  <li>• <strong>Log de actividad:</strong> Registro de todos los movimientos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Reports and Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
              Reportes y Análisis de Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📈 Reportes Disponibles</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>7.1.</strong> Acceda a <code>Analíticas → Eventos</code></p>
                  <p><strong>7.2.</strong> Tipos de reportes:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Asistencia por Evento:</strong> Números específicos</li>
                    <li>• <strong>Tendencias de Asistencia:</strong> Crecimiento/decline</li>
                    <li>• <strong>Participación por Miembro:</strong> Frecuencia individual</li>
                    <li>• <strong>Eventos más Populares:</strong> Ranking por asistencia</li>
                    <li>• <strong>Análisis Demográfico:</strong> Edad, género, ubicación</li>
                  </ul>
                  <p><strong>7.3.</strong> Use filtros para períodos específicos</p>
                  <p><strong>7.4.</strong> Exporte en múltiples formatos</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📊 Métricas Clave</h4>
                <div className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">📅 Eventos Totales</p>
                      <p className="text-muted-foreground">Este mes</p>
                    </div>
                    <div>
                      <p className="font-semibold">👥 Asistencia Promedio</p>
                      <p className="text-muted-foreground">Por evento</p>
                    </div>
                    <div>
                      <p className="font-semibold">📈 Tendencia</p>
                      <p className="text-muted-foreground">Crecimiento %</p>
                    </div>
                    <div>
                      <p className="font-semibold">🎯 Cumplimiento</p>
                      <p className="text-muted-foreground">vs. Capacidad</p>
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
                <h4 className="font-semibold mb-2">📅 Botones Principales</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"➕ Nuevo Evento":</strong> Crear evento desde cero</li>
                  <li>• <strong>"🚀 Evento Rápido":</strong> Servicio dominical automático</li>
                  <li>• <strong>"📊 Estadísticas":</strong> Ver analíticas generales</li>
                  <li>• <strong>"📅 Vista Calendario":</strong> Cambiar a calendario</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🛠️ Botones de Gestión</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"👁️ Ver Detalles":</strong> Información completa</li>
                  <li>• <strong>"✏️ Editar":</strong> Modificar evento</li>
                  <li>• <strong>"📂 Duplicar":</strong> Copiar configuración</li>
                  <li>• <strong>"❌ Cancelar":</strong> Cancelar evento</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">👥 Botones de Asistentes</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"👥 Ver Registrados":</strong> Lista de asistentes</li>
                  <li>• <strong>"➕ Registro Manual":</strong> Agregar directamente</li>
                  <li>• <strong>"📧 Comunicar":</strong> Mensaje a grupo</li>
                  <li>• <strong>"📊 Exportar":</strong> Descargar lista</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
