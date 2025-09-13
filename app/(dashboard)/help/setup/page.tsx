
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings, Clock } from 'lucide-react'
import Link from 'next/link'

export default function SetupHelp() {
  const setupSteps = [
    {
      step: 1,
      title: "Crear Cuenta y Verificar Email",
      time: "2 min",
      description: "Regístrese en la plataforma y verifique su correo electrónico",
      details: [
        "Vaya a la página de registro",
        "Complete el formulario con información de su iglesia",
        "Revise su email y haga clic en el enlace de verificación"
      ]
    },
    {
      step: 2,
      title: "Configuración Básica de la Iglesia",
      time: "5 min",
      description: "Complete la información básica de su iglesia",
      details: [
        "Nombre oficial de la iglesia",
        "Dirección completa",
        "Información de contacto",
        "Logo de la iglesia (opcional)"
      ]
    },
    {
      step: 3,
      title: "Seleccionar Plan de Suscripción",
      time: "3 min",
      description: "Elija el plan que mejor se adapte a su iglesia",
      details: [
        "Plan BÁSICO",
        "Plan PROFESIONAL",
        "Plan ENTERPRISE"
      ]
    },
    {
      step: 4,
      title: "Configurar Método de Pago",
      time: "5 min",
      description: "Agregue su información de facturación",
      details: [
        "Tarjeta de crédito/débito",
        "Transferencia bancaria",
        "Nequi (opcional)"
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
          <Settings className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Configuración Inicial</h1>
            <p className="text-muted-foreground">
              Configure su iglesia en Kḥesed-tek paso a paso
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Tiempo estimado: 15 minutos
        </div>
      </div>

      {/* Setup Steps */}
      <div className="space-y-6">
        {setupSteps.map((step) => (
          <Card key={step.step}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {step.step}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  ⏱️ {step.time}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {step.details.map((detail, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary">•</span>
                    <span className="text-sm">{detail}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Next Steps */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>🎉 ¡Listo para Comenzar!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Una vez completados estos pasos, podrá empezar a usar todas las funciones de Kḥesed-tek.
            </p>
            <div className="flex gap-2">
              <Link href="/help/members">
                <Button>
                  Siguiente: Gestión de Miembros →
                </Button>
              </Link>
              <Link href="/help/manual/getting-started">
                <Button variant="outline">
                  📖 Ver Manual Detallado
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
