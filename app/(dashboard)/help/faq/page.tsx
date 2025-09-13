
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function FAQHelp() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqCategories = [
    {
      category: "🚀 Primeros Pasos",
      questions: [
        {
          q: "¿Cómo registro mi iglesia por primera vez?",
          a: "Vaya a khesedtek.com, haga clic en 'Comenzar Prueba Gratis', complete el formulario de registro con la información de su iglesia, verifique su email y siga el asistente de configuración inicial."
        },
        {
          q: "¿Qué plan necesita mi iglesia?",
          a: "Ofrecemos Plan BÁSICO, Plan PROFESIONAL y Plan ENTERPRISE. Cada plan está diseñado para diferentes tamaños de congregación. Recomendamos PROFESIONAL para la mayoría de iglesias por sus funciones avanzadas."
        },
        {
          q: "¿Cómo importo mis miembros existentes?",
          a: "Vaya a Miembros → Importar CSV, descargue la plantilla, complete sus datos, y suba el archivo. El sistema validará la información y le mostrará un resumen antes de confirmar la importación."
        },
        {
          q: "¿Puedo invitar a otros líderes de mi iglesia?",
          a: "Sí, vaya a Configuración → Permisos → Usuarios, haga clic en 'Nuevo Usuario', complete el formulario y seleccione el rol apropiado (PASTOR, LIDER, TESORERO, etc.)."
        }
      ]
    },
    {
      category: "👥 Gestión de Miembros",
      questions: [
        {
          q: "¿Puedo tener miembros duplicados?",
          a: "No, el sistema no permite emails o teléfonos duplicados. Si intenta importar datos duplicados, el sistema los identificará y le permitirá decidir qué hacer con ellos."
        },
        {
          q: "¿Cómo organizo los miembros por ministerios?",
          a: "Al agregar o editar un miembro, puede asignarle un ministerio en el campo correspondiente. También puede crear ministerios personalizados desde la configuración."
        },
        {
          q: "¿Qué información puedo guardar de cada miembro?",
          a: "Nombre, email, teléfono (obligatorios), fecha de nacimiento, dirección, estado civil, fecha de bautismo, ministerio, y notas adicionales."
        },
        {
          q: "¿Cómo busco un miembro específico?",
          a: "Use la barra de búsqueda en la página de Miembros. Puede buscar por nombre, email, o teléfono. También puede filtrar por estado (activo, inactivo, visitante)."
        }
      ]
    },
    {
      category: "💰 Donaciones y Finanzas",
      questions: [
        {
          q: "¿Qué métodos de pago puedo aceptar?",
          a: "Efectivo (registro manual), transferencia bancaria, Nequi. Las tarjetas de crédito requieren el complemento 'Donaciones Online'."
        },
        {
          q: "¿Cómo configuro Nequi para donaciones?",
          a: "Vaya a Donaciones → Configuración, active Nequi, e ingrese el número de teléfono Nequi de la iglesia. Los miembros podrán donar directamente desde la app Nequi."
        },
        {
          q: "¿Puedo crear categorías personalizadas de donaciones?",
          a: "Sí, además de las predefinidas (Diezmos, Ofrendas, Misiones, Construcción), puede crear categorías personalizadas desde la configuración de donaciones."
        },
        {
          q: "¿Cómo genero reportes financieros?",
          a: "Vaya a Donaciones → Reportes. Puede generar reportes por período, categoría, método de pago, y exportarlos en PDF o Excel."
        }
      ]
    },
    {
      category: "📅 Eventos",
      questions: [
        {
          q: "¿Cómo creo eventos recurrentes?",
          a: "Al crear un evento, active la opción 'Evento recurrente' y configure la frecuencia (semanal, mensual, etc.). El sistema creará automáticamente las fechas futuras."
        },
        {
          q: "¿Qué es el check-in con código QR?",
          a: "Cada evento genera un código QR único. Los miembros pueden escanearlo con su teléfono para registrar su asistencia automáticamente, facilitando el control de asistencia."
        },
        {
          q: "¿Puedo limitar la capacidad de un evento?",
          a: "Sí, especifique la capacidad máxima al crear el evento. Una vez alcanzada, el sistema puede crear una lista de espera automáticamente."
        },
        {
          q: "¿Cómo promociono un evento?",
          a: "Desde el evento, puede enviar invitaciones por email, crear posts para redes sociales, y generar material promocional automáticamente."
        }
      ]
    },
    {
      category: "📢 Comunicaciones",
      questions: [
        {
          q: "¿Cuál es la diferencia entre email y SMS?",
          a: "Emails son gratuitos e incluidos en todos los planes, ideales para mensajes largos. SMS requiere el complemento 'SMS Masivos', ideal para mensajes urgentes y cortos."
        },
        {
          q: "¿Puedo programar mensajes para envío futuro?",
          a: "Sí, al crear una comunicación, puede seleccionar 'Programar para' y elegir fecha y hora específicas. El sistema enviará automáticamente en el momento programado."
        },
        {
          q: "¿Cómo veo si los miembros leen mis emails?",
          a: "El sistema proporciona estadísticas de apertura, clics en enlaces, y tasa de respuesta para cada comunicación enviada."
        },
        {
          q: "¿Puedo personalizar los mensajes?",
          a: "Sí, use variables como {nombre}, {evento}, {fecha} en sus plantillas. El sistema las reemplazará automáticamente con la información específica de cada miembro."
        }
      ]
    },
    {
      category: "💳 Facturación y Suscripciones",
      questions: [
        {
          q: "¿Puedo cambiar de plan en cualquier momento?",
          a: "Sí, puede cambiar su plan cuando guste. Los cambios se efectúan al inicio del siguiente ciclo de facturación. No perderá datos al cambiar de plan."
        },
        {
          q: "¿Qué pasa si no pago a tiempo?",
          a: "Recibirá recordatorios automáticos. Después de 7 días de retraso, el servicio se suspende temporalmente. Tiene 30 días para regularizar antes de que se eliminen los datos."
        },
        {
          q: "¿Hay descuentos disponibles?",
          a: "Sí, ofrecemos descuento por pago anual (2 meses gratis), descuentos para iglesias sin ánimo de lucro registradas, y precios especiales para múltiples iglesias."
        },
        {
          q: "¿Cómo cancelo mi suscripción?",
          a: "Vaya a Configuración → Facturación → Cancelar Suscripción. Sus datos se conservan por 90 días para permitir reactivación."
        }
      ]
    },
    {
      category: "🔧 Soporte Técnico",
      questions: [
        {
          q: "¿Qué horarios de soporte tienen?",
          a: "Chat en vivo: Lun-Vie 8AM-6PM. WhatsApp: Lun-Vie 8AM-8PM. Email: 24/7 con respuesta en 24-48 horas. Teléfono: Solo plan Enterprise."
        },
        {
          q: "¿Funciona en dispositivos móviles?",
          a: "Sí, Kḥesed-tek es completamente responsive y funciona perfectamente en teléfonos, tablets y computadores."
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Sí, usamos encriptación SSL, respaldos automáticos diarios, y cumplimos estándares internacionales de seguridad (GDPR, Habeas Data Colombia)."
        },
        {
          q: "¿Puedo hacer respaldo de mis datos?",
          a: "Sí, puede exportar todos sus datos en formato Excel/CSV desde cada módulo. También ofrecemos respaldos automáticos incluidos en todos los planes."
        }
      ]
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(item =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const totalQuestions = faqCategories.reduce((acc, category) => acc + category.questions.length, 0)

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
          <HelpCircle className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Preguntas Frecuentes</h1>
            <p className="text-muted-foreground">
              Encuentre respuestas rápidas a las preguntas más comunes
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalQuestions} preguntas organizadas en {faqCategories.length} categorías
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar en preguntas frecuentes..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-6">
        {(searchTerm ? filteredFAQs : faqCategories).map((category, categoryIndex) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.questions.map((item, index) => {
                  const globalIndex = categoryIndex * 100 + index // Create unique index
                  const isOpen = openItems.includes(globalIndex)
                  
                  return (
                    <div key={index} className="border rounded-lg">
                      <button
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        onClick={() => toggleItem(globalIndex)}
                      >
                        <span className="font-medium pr-4">{item.q}</span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-muted-foreground">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {searchTerm && filteredFAQs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No encontramos resultados</h3>
            <p className="text-muted-foreground mb-4">
              No hay preguntas que coincidan con "{searchTerm}"
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setSearchTerm('')}>
                Ver Todas las Preguntas
              </Button>
              <Link href="/help/support/ticket">
                <Button variant="outline">
                  Hacer Nueva Pregunta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Support */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>¿No encontró su respuesta?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Si su pregunta no está aquí, nuestro equipo de soporte está listo para ayudarle personalmente.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => window.open('https://wa.me/573003435733', '_blank')}>
                📱 WhatsApp
              </Button>
              <Link href="/help/support/ticket">
                <Button variant="outline">
                  🎫 Crear Ticket
                </Button>
              </Link>
              <Button variant="outline" onClick={() => alert('Chat en vivo será implementado próximamente')}>
                💬 Chat en Vivo
              </Button>
              <Button variant="outline" onClick={() => window.location.href = 'mailto:soporte@khesedtek.com'}>
                📧 Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recursos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/help/manual/complete">
                <Button variant="outline" className="w-full justify-start">
                  📖 Manual Completo
                </Button>
              </Link>
              <Link href="/help/videos">
                <Button variant="outline" className="w-full justify-start">
                  🎥 Videotutoriales
                </Button>
              </Link>
              <Link href="/help">
                <Button variant="outline" className="w-full justify-start">
                  🏠 Centro de Ayuda
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
