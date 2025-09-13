
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, DollarSign, CreditCard, Smartphone, Building } from 'lucide-react'
import Link from 'next/link'

export default function DonationsHelp() {
  const paymentMethods = [
    {
      icon: Building,
      title: "Transferencia Bancaria",
      description: "Método tradicional y confiable",
      setup: [
        "Configurar cuenta bancaria de la iglesia",
        "Proporcionar número de cuenta y banco",
        "Los donantes transfieren directamente"
      ]
    },
    {
      icon: Smartphone,
      title: "Nequi",
      description: "Popular en Colombia, fácil de usar",
      setup: [
        "Registrar número de teléfono Nequi",
        "Configurar en el sistema",
        "Los miembros pagan desde la app Nequi"
      ]
    },
    {
      icon: CreditCard,
      title: "Tarjeta de Crédito/Débito",
      description: "Requiere add-on premium",
      setup: [
        "Suscribirse al complemento 'Donaciones Online'",
        "Configurar pasarela de pagos",
        "Aceptar tarjetas Visa, MasterCard, etc."
      ]
    }
  ]

  const donationCategories = [
    { name: "Diezmos", description: "Contribución del 10% de los ingresos", example: "Diezmo mensual de Juan Pérez" },
    { name: "Ofrendas", description: "Donaciones voluntarias adicionales", example: "Ofrenda de gratitud por sanidad" },
    { name: "Misiones", description: "Fondos para trabajo misionero", example: "Apoyo a misión en África" },
    { name: "Construcción", description: "Fondos para infraestructura", example: "Ampliación del santuario" },
    { name: "Ayuda Social", description: "Asistencia a necesitados", example: "Apoyo a familias vulnerables" }
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
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Sistema de Donaciones</h1>
            <p className="text-muted-foreground">
              Configure y gestione las donaciones de su iglesia
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Métodos de Pago Disponibles</h2>
        <div className="grid gap-6">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon
            return (
              <Card key={method.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Configuración:</h4>
                  <ul className="space-y-1">
                    {method.setup.map((step, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="mr-2 text-primary">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Donation Categories */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categorías de Donación</h2>
        <Card>
          <CardHeader>
            <CardTitle>Organice las donaciones por propósito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donationCategories.map((category) => (
                <div key={category.name} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <p className="text-xs text-muted-foreground italic">Ejemplo: {category.example}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Registration Process */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Proceso de Registro</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📝 Registro Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                <li><span className="font-bold">1.</span> Ir a sección "Donaciones"</li>
                <li><span className="font-bold">2.</span> Hacer clic en "Nueva Donación"</li>
                <li><span className="font-bold">3.</span> Seleccionar donante de la lista</li>
                <li><span className="font-bold">4.</span> Especificar monto y categoría</li>
                <li><span className="font-bold">5.</span> Elegir método de pago</li>
                <li><span className="font-bold">6.</span> Agregar notas si es necesario</li>
                <li><span className="font-bold">7.</span> Guardar donación</li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>📊 Reportes Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>✅ Reporte mensual de donaciones</li>
                <li>✅ Desglose por categorías</li>
                <li>✅ Estadísticas por método de pago</li>
                <li>✅ Histórico de donantes frecuentes</li>
                <li>✅ Exportación a Excel/PDF</li>
                <li>✅ Gráficos de tendencias</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>💡 Consejos para Maximizar Donaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>💰 <strong>Transparencia:</strong> Comparta reportes financieros con la congregación</p>
              <p>📱 <strong>Facilidad:</strong> Ofrezca múltiples métodos de pago</p>
              <p>🎯 <strong>Propósito:</strong> Sea específico sobre el uso de los fondos</p>
              <p>📧 <strong>Agradecimiento:</strong> Envíe recibos y notas de agradecimiento</p>
              <p>📈 <strong>Seguimiento:</strong> Monitoree tendencias y patrones</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <div className="flex gap-2">
        <Link href="/help/events">
          <Button>
            Siguiente: Gestión de Eventos →
          </Button>
        </Link>
        <Link href="/help/manual/donations">
          <Button variant="outline">
            📖 Ver Manual Detallado
          </Button>
        </Link>
      </div>
    </div>
  )
}
