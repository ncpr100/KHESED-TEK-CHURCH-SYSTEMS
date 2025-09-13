
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function SubscriptionManual() {
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
          <h1 className="text-3xl font-bold">Manual: Mi Suscripción</h1>
          <p className="text-muted-foreground">Gestión de planes y complementos</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>💳 Mi Suscripción - Manual Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta guía cubre todo lo relacionado con la gestión de su suscripción, planes, complementos y facturación.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">📋 Secciones</h4>
                <p className="text-xl font-bold text-purple-600">5</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold">⏱️ Tiempo</h4>
                <p className="text-xl font-bold text-blue-600">15 min</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold">🎯 Nivel</h4>
                <p className="text-lg font-bold text-green-600">Básico</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold">👤 Rol Mínimo</h4>
                <p className="text-lg font-bold text-orange-600">ADMIN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Plan Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Planes Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📦 Planes Base</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>1.1.</strong> Navegue a <code>Mi Suscripción → Ver Planes</code></p>
                  <p><strong>1.2.</strong> Planes disponibles:</p>
                  <ul className="ml-4 space-y-2 text-muted-foreground">
                    <li>• <strong>🆓 Plan Básico (Gratis):</strong>
                      <br />Hasta 50 miembros, funcionalidades esenciales</li>
                    <li>• <strong>💼 Plan Estándar ($19/mes):</strong>
                      <br />Hasta 200 miembros, comunicaciones masivas</li>
                    <li>• <strong>🚀 Plan Premium ($39/mes):</strong>
                      <br />Hasta 500 miembros, analíticas avanzadas</li>
                    <li>• <strong>⛪ Plan Iglesia Grande ($79/mes):</strong>
                      <br />Miembros ilimitados, soporte prioritario</li>
                  </ul>
                  <p><strong>1.3.</strong> Para cambiar plan:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Haga clic en "🔄 Cambiar Plan"</li>
                    <li>• Seleccione nuevo plan</li>
                    <li>• Configure método de pago</li>
                    <li>• Confirme cambio</li>
                  </ul>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">✨ Características por Plan</h4>
                <div className="text-sm space-y-3">
                  <div>
                    <p className="font-semibold text-gray-600">🆓 BÁSICO</p>
                    <ul className="text-muted-foreground text-xs space-y-1">
                      <li>• Gestión de miembros (50 max)</li>
                      <li>• Eventos básicos</li>
                      <li>• Donaciones simples</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">💼 ESTÁNDAR</p>
                    <ul className="text-muted-foreground text-xs space-y-1">
                      <li>• Todo de Básico + 200 miembros</li>
                      <li>• Comunicaciones masivas</li>
                      <li>• Check-in QR</li>
                      <li>• Reportes estándar</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">🚀 PREMIUM</p>
                    <ul className="text-muted-foreground text-xs space-y-1">
                      <li>• Todo de Estándar + 500 miembros</li>
                      <li>• Analíticas avanzadas</li>
                      <li>• WebRTC Seguridad Infantil</li>
                      <li>• Automatización de visitantes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Add-ons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Complementos Adicionales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔌 Complementos Disponibles</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>2.1.</strong> En Mi Suscripción, haga clic en "🔌 Complementos"</p>
                  <p><strong>2.2.</strong> Opciones disponibles:</p>
                  <ul className="ml-4 space-y-2 text-muted-foreground">
                    <li>• <strong>📱 SMS Premium (+$10/mes):</strong>
                      <br />1000 SMS/mes incluidos, WhatsApp Business</li>
                    <li>• <strong>☁️ Almacenamiento Extra (+$5/mes):</strong>
                      <br />100GB adicionales para archivos</li>
                    <li>• <strong>📊 Analíticas Pro (+$15/mes):</strong>
                      <br />Reportes personalizados, exportación avanzada</li>
                    <li>• <strong>🎥 Streaming Live (+$20/mes):</strong>
                      <br />Transmisión en vivo integrada</li>
                    <li>• <strong>🌐 Dominio Personalizado (+$8/mes):</strong>
                      <br />iglesia.com en lugar de subdominio</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">💰 Gestión de Complementos</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Para activar/desactivar:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"✅ Activar":</strong> Se cobra en próxima factura</li>
                    <li>• <strong>"❌ Desactivar":</strong> Válido hasta fin del período</li>
                    <li>• <strong>"⏰ Programar":</strong> Activar en fecha específica</li>
                  </ul>
                  <p><strong>Facturación de complementos:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Se cobran mensualmente con el plan base</li>
                    <li>• Prorrateados si se activan a mitad de mes</li>
                    <li>• Cancelables en cualquier momento</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Billing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Facturación y Pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">💳 Métodos de Pago</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>3.1.</strong> Vaya a <code>Mi Suscripción → 💳 Facturación</code></p>
                  <p><strong>3.2.</strong> Configure método de pago principal:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Tarjeta de crédito:</strong> Visa, MasterCard, American Express</li>
                    <li>• <strong>PayPal:</strong> Cuenta verificada</li>
                    <li>• <strong>Transferencia bancaria:</strong> Solo planes anuales</li>
                  </ul>
                  <p><strong>3.3.</strong> Configuración de facturación:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Frecuencia:</strong> Mensual o anual (15% descuento)</li>
                    <li>• <strong>Datos fiscales:</strong> RIF/NIT para facturas</li>
                    <li>• <strong>Email de facturación:</strong> Dónde enviar recibos</li>
                  </ul>
                  <p><strong>3.4.</strong> Configure alertas de pago</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📅 Ciclo de Facturación</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Facturación mensual:</strong> Mismo día cada mes</li>
                  <li>• <strong>Descuento anual:</strong> 15% pagando por adelantado</li>
                  <li>• <strong>Período de gracia:</strong> 7 días después de vencimiento</li>
                  <li>• <strong>Suspensión:</strong> Después de 15 días sin pago</li>
                </ul>
                <div className="mt-3 p-2 bg-white rounded border-l-4 border-green-400">
                  <p className="text-xs"><strong>💡 Tip:</strong> Active recordatorios por email 3 días antes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Usage Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Límites de Uso y Monitoreo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">📊 Monitorear Uso</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>4.1.</strong> En Mi Suscripción, vea la sección "📊 Uso Actual"</p>
                  <p><strong>4.2.</strong> Métricas monitoreadas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Miembros registrados:</strong> vs. límite del plan</li>
                    <li>• <strong>Almacenamiento usado:</strong> Archivos y fotos</li>
                    <li>• <strong>Emails enviados:</strong> Este mes</li>
                    <li>• <strong>SMS enviados:</strong> Cantidad y costo</li>
                    <li>• <strong>Usuarios activos:</strong> Con acceso al sistema</li>
                  </ul>
                  <p><strong>4.3.</strong> Alertas automáticas:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Al llegar al 80% del límite</li>
                    <li>• Al llegar al 95% del límite</li>
                    <li>• Cuando se excede el límite</li>
                  </ul>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ Límites Importantes</h4>
                <div className="text-sm space-y-2">
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold">👥 Miembros</p>
                      <p className="text-muted-foreground text-xs">Al exceder el límite se requiere upgrade inmediato</p>
                    </div>
                    <div>
                      <p className="font-semibold">💾 Almacenamiento</p>
                      <p className="text-muted-foreground text-xs">Al llenarse no se pueden subir más archivos</p>
                    </div>
                    <div>
                      <p className="font-semibold">📧 Comunicaciones</p>
                      <p className="text-muted-foreground text-xs">Límites blandos - se cobra el exceso</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              Soporte Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🆘 Niveles de Soporte</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>5.1.</strong> Soporte incluido según plan:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Plan Básico:</strong> Email, 48-72h respuesta</li>
                    <li>• <strong>Plan Estándar:</strong> Email + chat, 24-48h</li>
                    <li>• <strong>Plan Premium:</strong> Soporte prioritario, 12-24h</li>
                    <li>• <strong>Plan Iglesia Grande:</strong> Soporte dedicado, 2-4h</li>
                  </ul>
                  <p><strong>5.2.</strong> Canales de contacto:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>📧 Email:</strong> soporte@khesedtek.com</li>
                    <li>• <strong>💬 WhatsApp:</strong> +57 300 343 5733</li>
                    <li>• <strong>💻 Chat en vivo:</strong> Desde la plataforma</li>
                    <li>• <strong>📞 Teléfono:</strong> Solo planes Premium+</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">📚 Recursos de Autoayuda</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Antes de contactar soporte:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>"📖 Manual Completo":</strong> Guía detallada paso a paso</li>
                    <li>• <strong>"❓ Preguntas Frecuentes":</strong> Soluciones comunes</li>
                    <li>• <strong>"🎥 Videotutoriales":</strong> Demostraciones visuales</li>
                    <li>• <strong>"💡 Guías Interactivas":</strong> Tutoriales paso a paso</li>
                  </ul>
                  <p><strong>Para emergencias:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Use WhatsApp para respuesta más rápida</li>
                    <li>• Indique claramente que es urgente</li>
                    <li>• Proporcione capturas de pantalla</li>
                  </ul>
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
                <h4 className="font-semibold mb-2">💳 Botones de Suscripción</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"📦 Ver Planes":</strong> Comparar opciones</li>
                  <li>• <strong>"🔄 Cambiar Plan":</strong> Upgrade/downgrade</li>
                  <li>• <strong>"💳 Actualizar Pago":</strong> Cambiar tarjeta</li>
                  <li>• <strong>"📊 Ver Uso":</strong> Límites actuales</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔌 Botones de Complementos</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"✅ Activar":</strong> Agregar complemento</li>
                  <li>• <strong>"❌ Desactivar":</strong> Cancelar complemento</li>
                  <li>• <strong>"⏰ Programar":</strong> Activar después</li>
                  <li>• <strong>"📊 Ver Detalles":</strong> Información completa</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🧾 Botones de Facturación</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• <strong>"🧾 Ver Facturas":</strong> Historial completo</li>
                  <li>• <strong>"📥 Descargar PDF":</strong> Factura específica</li>
                  <li>• <strong>"🔄 Reintentar Pago":</strong> Si falló</li>
                  <li>• <strong>"📧 Contactar Soporte":</strong> Ayuda directa</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
