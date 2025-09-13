
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Shield, DollarSign, Receipt } from 'lucide-react'
import Link from 'next/link'

export default function DonacionesOnlineAddon() {
  const features = [
    {
      title: "✅ PSE - Pagos Seguros en Línea",
      description: "Integración directa con todos los bancos colombianos",
      icon: "🏦",
      status: "implemented"
    },
    {
      title: "✅ Nequi",
      description: "Pagos instantáneos desde cuentas Nequi",
      icon: "📱",
      status: "implemented"
    },
    {
      title: "✅ Formularios Públicos",
      description: "Página de donación accesible sin registro previo",
      icon: "🌐",
      status: "implemented"
    },
    {
      title: "✅ Recibos Automáticos",
      description: "Se envían por email inmediatamente después del pago",
      icon: "🧾",
      status: "implemented"
    },
    {
      title: "✅ Dashboard Financiero",
      description: "Reportes detallados integrados con el sistema existente",
      icon: "📊",
      status: "implemented"
    },
    {
      title: "✅ Campañas de Donación",
      description: "Cree campañas públicas con metas y seguimiento",
      icon: "🎯",
      status: "implemented"
    },
    {
      title: "✅ Procesamiento Seguro",
      description: "Webhooks y verificación automática de pagos",
      icon: "🔒",
      status: "implemented"
    },
    {
      title: "🔄 Donaciones Recurrentes",
      description: "Próximamente - donaciones automáticas mensuales",
      icon: "🔄",
      status: "coming-soon"
    }
  ]

  const paymentMethods = [
    {
      type: "PSE - Pagos Seguros en Línea",
      brands: ["Bancolombia", "Davivienda", "BBVA", "Banco de Bogotá", "Todos los bancos"],
      fee: "Comisión bancaria estándar",
      icon: "🏦"
    },
    {
      type: "Nequi",
      brands: ["Pagos desde cuenta Nequi", "Instantáneo"],
      fee: "Sin comisión adicional",
      icon: "📱"
    },
    {
      type: "Daviplata",
      brands: ["Billetera digital Davivienda", "Próximamente"],
      fee: "Comisión preferencial",
      icon: "💳"
    }
  ]

  const benefits = [
    {
      title: "Conveniencia 24/7",
      description: "Los miembros pueden donar en cualquier momento",
      stat: "40% más donaciones"
    },
    {
      title: "Donantes Jóvenes",
      description: "Alcance generaciones que prefieren pagos digitales",
      stat: "65% menores de 35 años"
    },
    {
      title: "Donaciones Internacionales",
      description: "Reciba apoyo de familiares en otros países",
      stat: "15% más ingresos"
    },
    {
      title: "Transparencia Total",
      description: "Reportes automáticos y detallados",
      stat: "100% trazabilidad"
    }
  ]

  const useCases = [
    {
      scenario: "Campañas Especiales",
      description: "Construcción, misiones, ayuda social",
      example: "Meta para proyecto de construcción - Progreso en tiempo real"
    },
    {
      scenario: "Diezmos Regulares",
      description: "Donaciones automáticas mensuales",
      example: "Miembros configuran donaciones automáticas mensuales"
    },
    {
      scenario: "Ofrendas de Servicio",
      description: "Código QR durante el servicio",
      example: "Escanee y done durante la ofrenda sin efectivo"
    },
    {
      scenario: "Emergencias",
      description: "Respuesta rápida a necesidades urgentes",
      example: "Ayuda para familia en crisis - Recaudación inmediata"
    }
  ]

  // Pricing information available on request

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
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Donaciones Online</h1>
            <p className="text-muted-foreground">
              Reciba donaciones con tarjeta de crédito y PayPal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">💰 Más Ingresos</Badge>
          <Badge variant="outline">Complemento Premium</Badge>
        </div>
      </div>

      {/* Info Card */}
      <section className="mb-8">
        <Card className="border-primary shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Donaciones Online</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">Complemento premium para recibir donaciones online</p>
            <div className="bg-primary/10 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-2">Tarifas competitivas por transacción</p>
              <div className="text-sm space-y-1">
                <p>💳 Tarjetas: Comisión preferencial</p>
                <p>🅿️ PayPal: Comisión estándar</p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => alert('Funcionalidad de suscripción será implementada próximamente. Contacte soporte para activar.')}
            >
              💰 Activar Donaciones Online
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Contacte soporte para información detallada de precios
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Funcionalidades Incluidas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Payment Methods */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Métodos de Pago Aceptados</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.type}>
              <CardHeader className="text-center">
                <span className="text-3xl mb-2 block">{method.icon}</span>
                <CardTitle className="text-base">{method.type}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="space-y-2 mb-4">
                  {method.brands.map((brand) => (
                    <Badge key={brand} variant="outline" className="mx-1 text-xs">
                      {brand}
                    </Badge>
                  ))}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <p className="text-sm font-semibold">Comisión:</p>
                  <p className="text-xs text-muted-foreground">{method.fee}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How to Use - NEW SECTION */}
      <section className="mb-8">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <CreditCard className="h-5 w-5" />
              ¡Ya está implementado! Cómo usar las donaciones online
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">Para administradores:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Configure métodos de pago PSE y Nequi en Configuración</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Cree categorías (Diezmos, Ofrendas, Proyectos especiales)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Comparta el enlace público de donaciones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Monitore las donaciones en el dashboard</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-3">Para los donantes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Acceso directo sin registro previo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Selección fácil de montos y categorías</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Pago seguro con PSE o Nequi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Recibo instantáneo por email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Confirmación inmediata del pago</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white border border-blue-300 rounded-lg p-4 mt-4">
              <h5 className="font-semibold text-blue-900 mb-2">🔗 Su enlace de donaciones:</h5>
              <p className="text-sm text-blue-700">
                <code className="bg-blue-100 px-2 py-1 rounded text-xs font-mono">
                  https://khesedtek.app/donate/[ID-DE-SU-IGLESIA]
                </code>
              </p>
              <p className="text-xs text-blue-600 mt-2">
                * Reemplace [ID-DE-SU-IGLESIA] con el ID de su iglesia. Solicite este enlace a soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Benefits */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Beneficios Comprobados</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-2">{benefit.stat}</div>
                <h3 className="font-semibold text-sm mb-2">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Casos de Uso</h2>
        <div className="space-y-4">
          {useCases.map((useCase, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">{useCase.scenario}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{useCase.description}</p>
                    <div className="bg-green-50 p-2 rounded text-xs">
                      <span className="font-semibold">Ejemplo: </span>
                      {useCase.example}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">¿Cómo Funciona?</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                <h4 className="font-semibold text-sm mb-1">Active el Complemento</h4>
                <p className="text-xs text-muted-foreground">Configure su pasarela de pagos</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                <h4 className="font-semibold text-sm mb-1">Comparta el Enlace</h4>
                <p className="text-xs text-muted-foreground">URL o código QR de donaciones</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                <h4 className="font-semibold text-sm mb-1">Reciba Donaciones</h4>
                <p className="text-xs text-muted-foreground">Pagos seguros 24/7</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                <h4 className="font-semibold text-sm mb-1">Recibos Automáticos</h4>
                <p className="text-xs text-muted-foreground">Email con comprobante</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Security */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad y Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-sm mb-2">Certificación PCI DSS</h4>
                <p className="text-xs text-muted-foreground">Máximo estándar de seguridad para pagos</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Receipt className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-sm mb-2">DIAN Compatible</h4>
                <p className="text-xs text-muted-foreground">Recibos válidos para declaración de renta</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-sm mb-2">Datos Protegidos</h4>
                <p className="text-xs text-muted-foreground">Nunca almacenamos información de tarjetas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>❓ Preguntas Frecuentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm">¿Cuándo recibo el dinero?</h4>
                <p className="text-sm text-muted-foreground">Los fondos se transfieren a su cuenta bancaria cada 2-3 días hábiles después de la donación.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">¿Hay límites en las donaciones?</h4>
                <p className="text-sm text-muted-foreground">Existen límites mínimos y máximos por transacción según las regulaciones financieras vigentes.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">¿Qué pasa si hay una devolución?</h4>
                <p className="text-sm text-muted-foreground">Las devoluciones se manejan automáticamente. La comisión se reembolsa también.</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm">¿Los recibos son válidos para DIAN?</h4>
                <p className="text-sm text-muted-foreground">Sí, todos los recibos cumplen con normativas fiscales colombianas y son válidos para deducción de renta.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ROI Calculator */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>📊 Calculadora de Ingresos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">+40%</div>
                  <p className="text-sm">Aumento promedio en donaciones</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">-30%</div>
                  <p className="text-sm">Menos tiempo contando efectivo</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <p className="text-sm">Transparencia en reportes</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  <strong>Resultado:</strong> Las iglesias que usan donaciones online típicamente ven un aumento significativo en sus ingresos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center">
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-bold mb-2">¿Listo para Recibir Más Donaciones?</h3>
            <p className="text-muted-foreground mb-6">
              Únase a las iglesias que han aumentado sus ingresos con donaciones online
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => alert('Funcionalidad de suscripción será implementada próximamente. Contacte soporte para activar.')}
              >
                💳 Activar Donaciones Online
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.open('https://wa.me/573003435733', '_blank')}>
                💬 Consultar por WhatsApp
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Comisiones competitivas del mercado • Configuración incluida • Soporte 24/7
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
