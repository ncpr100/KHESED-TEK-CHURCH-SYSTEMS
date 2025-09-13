
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, Upload, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function MembersHelp() {
  const memberOptions = [
    {
      icon: Upload,
      title: "Importar desde Excel/CSV",
      description: "Método recomendado para iglesias con listas existentes",
      time: "10-30 min",
      steps: [
        "Descargar plantilla de Excel",
        "Completar datos de miembros",
        "Subir archivo al sistema",
        "Revisar y confirmar importación"
      ]
    },
    {
      icon: UserPlus,
      title: "Agregar Manualmente",
      description: "Ideal para iglesias pequeñas o miembros nuevos",
      time: "2-5 min por miembro",
      steps: [
        "Hacer clic en 'Nuevo Miembro'",
        "Completar formulario",
        "Guardar información",
        "Asignar a grupos/ministerios"
      ]
    }
  ]

  const memberFields = [
    { field: "Nombre Completo", required: true, description: "Nombre y apellidos del miembro" },
    { field: "Email", required: true, description: "Correo electrónico (debe ser único)" },
    { field: "Teléfono", required: true, description: "Número de teléfono con código de país" },
    { field: "Fecha de Nacimiento", required: false, description: "Para calcular edad y estadísticas" },
    { field: "Dirección", required: false, description: "Dirección completa del miembro" },
    { field: "Estado Civil", required: false, description: "Soltero, Casado, Divorciado, Viudo" },
    { field: "Fecha de Bautismo", required: false, description: "Fecha de bautismo en la iglesia" },
    { field: "Ministerio", required: false, description: "Ministerio o servicio donde participa" }
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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Gestión de Miembros</h1>
            <p className="text-muted-foreground">
              Aprenda a importar y administrar su congregación
            </p>
          </div>
        </div>
      </div>

      {/* Import Options */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Opciones para Agregar Miembros</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {memberOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Card key={option.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mt-2 inline-block">
                        ⏱️ {option.time}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2">Pasos a seguir:</h4>
                  <ol className="space-y-1">
                    {option.steps.map((step, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="mr-2 text-primary font-bold">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Member Fields Reference */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Campos de Información</h2>
        <Card>
          <CardHeader>
            <CardTitle>Información que puede registrar de cada miembro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memberFields.map((field) => (
                <div key={field.field} className="flex items-start justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.field}</span>
                    {field.required && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        Obligatorio
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground text-right max-w-md">
                    {field.description}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tips */}
      <section className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>💡 Consejos Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>✅ <strong>Emails únicos:</strong> Cada miembro debe tener un email diferente</p>
              <p>✅ <strong>Formato de teléfono:</strong> Use +57 seguido del número sin espacios</p>
              <p>✅ <strong>Fechas:</strong> Use formato DD/MM/AAAA (ejemplo: 15/08/1990)</p>
              <p>✅ <strong>Respaldo:</strong> Guarde una copia de sus datos antes de importar</p>
              <p>⚠️ <strong>Duplicados:</strong> El sistema rechazará emails o teléfonos duplicados</p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Next Steps */}
      <div className="flex gap-2">
        <Link href="/help/donations">
          <Button>
            Siguiente: Sistema de Donaciones →
          </Button>
        </Link>
        <Link href="/help/manual/members">
          <Button variant="outline">
            📖 Ver Manual Detallado
          </Button>
        </Link>
      </div>
    </div>
  )
}
