
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Globe, Clock, CheckCircle, AlertCircle, Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WebsiteRequestDialog } from '@/components/website-requests/website-request-dialog'
import { toast } from 'sonner'

interface WebsiteRequest {
  id: string
  churchName: string
  requestType: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  submittedAt: string
  estimatedCompletion?: string
  estimatedPrice?: number
  description: string
  adminNotes?: string
}

interface ExistingWebsite {
  id: string
  name: string
  slug: string
  isPublished: boolean
  createdAt: string
  pages: number
  funnels: number
}

export default function WebsiteRequestsPage() {
  const { data: session } = useSession() || {}
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requests, setRequests] = useState<WebsiteRequest[]>([])
  const [existingWebsite, setExistingWebsite] = useState<ExistingWebsite | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch existing website requests
      const requestsResponse = await fetch('/api/website-requests')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
      }

      // Check if church already has a website
      const websitesResponse = await fetch('/api/websites')
      if (websitesResponse.ok) {
        const websitesData = await websitesResponse.json()
        if (websitesData.length > 0) {
          setExistingWebsite(websitesData[0]) // Use first website
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar la información')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestSubmitted = () => {
    setShowRequestDialog(false)
    fetchData() // Refresh data
    toast.success('Solicitud enviada exitosamente')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'in_progress':
        return 'En Progreso'
      case 'completed':
        return 'Completado'
      case 'rejected':
        return 'Rechazado'
      default:
        return status
    }
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'outline'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">🌐 Solicitudes de Sitio Web</h1>
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">🌐 Solicitudes de Sitio Web</h1>
          <p className="text-muted-foreground">
            Solicita sitios web profesionales creados por nuestros expertos
          </p>
        </div>
        {!existingWebsite && (
          <Button onClick={() => setShowRequestDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Sitio Web
          </Button>
        )}
      </div>

      {/* Existing Website Alert */}
      {existingWebsite && (
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            Ya tienes un sitio web: <strong>{existingWebsite.name}</strong> ({existingWebsite.isPublished ? 'Publicado' : 'Borrador'}).
            Puedes solicitar actualizaciones o sitios adicionales usando el botón "Solicitar Mejoras".
          </AlertDescription>
        </Alert>
      )}

      {/* Service Information */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitio Web Completo</CardTitle>
            <Globe className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$599 - $899</div>
            <p className="text-xs text-muted-foreground">
              Sitio web profesional completo con múltiples páginas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Landing Page</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$199 - $399</div>
            <p className="text-xs text-muted-foreground">
              Página única para campañas o eventos específicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo de Entrega</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">5-10 días</div>
            <p className="text-xs text-muted-foreground">
              Desde la confirmación del proyecto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setShowRequestDialog(true)}
          size="lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          {existingWebsite ? 'Solicitar Mejoras' : 'Solicitar Sitio Web'}
        </Button>
        
        {existingWebsite && (
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.open(`/website-preview/${existingWebsite.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Mi Sitio Actual
          </Button>
        )}
      </div>

      {/* Current Requests */}
      {requests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mis Solicitudes</CardTitle>
            <CardDescription>
              Seguimiento del estado de tus solicitudes de sitios web
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <h4 className="font-semibold">{request.requestType}</h4>
                        <Badge variant={getStatusVariant(request.status)}>
                          {getStatusLabel(request.status)}
                        </Badge>
                        {request.priority === 'high' && (
                          <Badge variant="destructive">Alta Prioridad</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.description}
                      </p>
                      {request.adminNotes && (
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          <p className="text-blue-800"><strong>Notas del equipo:</strong> {request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Enviado: {new Date(request.submittedAt).toLocaleDateString('es-ES')}</p>
                      {request.estimatedCompletion && (
                        <p>Est. entrega: {new Date(request.estimatedCompletion).toLocaleDateString('es-ES')}</p>
                      )}
                      {request.estimatedPrice && (
                        <p className="font-semibold text-green-600">${request.estimatedPrice}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contactar Equipo
                    </Button>
                    {request.status === 'completed' && (
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Sitio Completado
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {requests.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes solicitudes pendientes</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Solicita un sitio web profesional creado por nuestros expertos. Nos encargamos de todo el diseño y desarrollo técnico.
            </p>
            <Button onClick={() => setShowRequestDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Hacer Primera Solicitud
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Service Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>¿Por qué nuestro servicio profesional?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 text-green-600">✅ Diseño Profesional</h4>
              <p className="text-sm text-muted-foreground">
                Sitios web diseñados por expertos específicamente para iglesias, con mejores prácticas de UX/UI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">🚀 Optimización Técnica</h4>
              <p className="text-sm text-muted-foreground">
                SEO optimizado, velocidad de carga rápida y compatibilidad móvil garantizada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-purple-600">⚡ Entrega Rápida</h4>
              <p className="text-sm text-muted-foreground">
                Tu sitio estará listo en 5-10 días laborales, sin complicaciones técnicas de tu parte.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">🎯 Enfoque Ministerial</h4>
              <p className="text-sm text-muted-foreground">
                Funcionalidades específicas para iglesias: donaciones, eventos, sermones y más.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Dialog */}
      <WebsiteRequestDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        onRequestSubmitted={handleRequestSubmitted}
        existingWebsite={existingWebsite}
      />
    </div>
  )
}
