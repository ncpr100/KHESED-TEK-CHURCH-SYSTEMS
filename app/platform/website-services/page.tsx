
'use client'

import { useState } from 'react'
import { Plus, Globe, Users, Settings, Eye, Edit, Clock, CheckCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'

export default function WebsiteServicesPage() {
  const [activeTab, setActiveTab] = useState('requests')

  // Button handler functions
  const handleViewDetails = (requestId: string) => {
    console.log('Viewing details for request:', requestId)
    // TODO: Navigate to request details page or open details modal
    alert(`Funcionalidad "Ver Detalles" para solicitud ${requestId}`)
  }

  const handleStartProject = (requestId: string, churchName: string) => {
    console.log('Starting project for request:', requestId)
    // TODO: Initialize project creation workflow
    alert(`Iniciando proyecto para ${churchName} (ID: ${requestId})`)
  }

  const handleContactClient = (requestId: string, email: string) => {
    console.log('Contacting client for request:', requestId)
    // TODO: Open email client or contact modal
    window.open(`mailto:${email}?subject=Sobre su solicitud de sitio web&body=Estimado cliente, nos ponemos en contacto sobre su solicitud de sitio web...`)
  }

  const handleEditWebsite = (websiteId: string) => {
    console.log('Editing website:', websiteId)
    // TODO: Navigate to website builder/editor
    alert(`Funcionalidad "Editar Sitio" para website ${websiteId}`)
  }

  const handlePreviewWebsite = (websiteUrl: string) => {
    console.log('Previewing website:', websiteUrl)
    // TODO: Open website preview in new tab
    window.open(`/preview/${websiteUrl}`, '_blank')
  }

  const handleWebsiteSettings = (websiteId: string) => {
    console.log('Website settings:', websiteId)
    // TODO: Navigate to website settings page
    alert(`Funcionalidad "Configuración" para website ${websiteId}`)
  }

  // Mock data - will be replaced with real API calls
  const pendingRequests = [
    {
      id: '1',
      churchName: 'Iglesia Nueva Vida',
      contactEmail: 'pastor@nuevavida.org',
      requestType: 'Complete Website',
      priority: 'high',
      submittedAt: '2025-08-27T10:00:00Z',
      status: 'pending',
      description: 'Necesitamos un sitio web completo con secciones de servicios, eventos y donaciones.'
    },
    {
      id: '2', 
      churchName: 'Centro Cristiano Esperanza',
      contactEmail: 'admin@esperanza.org',
      requestType: 'Landing Page',
      priority: 'medium',
      submittedAt: '2025-08-26T15:30:00Z',
      status: 'in_progress',
      description: 'Landing page para campaña navideña con formulario de registro.'
    }
  ]

  const activeWebsites = [
    {
      id: '1',
      churchName: 'Iglesia Monte Sion',
      websiteName: 'Monte Sión Official',
      url: 'monte-sion-oficial',
      status: 'published',
      theme: 'modern',
      lastUpdated: '2025-08-25T14:00:00Z',
      pages: 5,
      funnels: 2
    }
  ]

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/platform/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">🌐 Servicios de Sitios Web</h1>
            <p className="text-muted-foreground">
              Centro de administración profesional para crear y gestionar sitios web de iglesias
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/platform/website-services/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Sitio Web
            </Button>
          </Link>
          <Link href="/platform/website-services/templates">
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Gestionar Plantillas
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingRequests.filter(r => r.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pendingRequests.filter(r => r.status === 'in_progress').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sitios en construcción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sitios Activos</CardTitle>
            <Globe className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeWebsites.length}</div>
            <p className="text-xs text-muted-foreground">
              Sitios publicados y funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Este Mes</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">$2,850</div>
            <p className="text-xs text-muted-foreground">
              Servicios web completados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">Solicitudes de Iglesias</TabsTrigger>
          <TabsTrigger value="active">Sitios Activos</TabsTrigger>
          <TabsTrigger value="templates">Biblioteca de Plantillas</TabsTrigger>
        </TabsList>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Solicitudes Pendientes</h3>
            <Badge variant="secondary">{pendingRequests.length} solicitudes</Badge>
          </div>
          
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{request.churchName}</CardTitle>
                        <Badge 
                          variant={request.status === 'pending' ? 'destructive' : 'default'}
                        >
                          {request.status === 'pending' ? 'Pendiente' : 'En Progreso'}
                        </Badge>
                        <Badge 
                          variant={request.priority === 'high' ? 'destructive' : 'secondary'}
                        >
                          {request.priority === 'high' ? 'Alta Prioridad' : 'Prioridad Media'}
                        </Badge>
                      </div>
                      <CardDescription>{request.contactEmail}</CardDescription>
                      <p className="text-sm">{request.description}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Tipo: {request.requestType}</p>
                      <p>Enviado: {new Date(request.submittedAt).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleViewDetails(request.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleStartProject(request.id, request.churchName)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Comenzar Proyecto
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleContactClient(request.id, request.contactEmail)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Contactar Cliente
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Websites Tab */}
        <TabsContent value="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Sitios Web Activos</h3>
            <Badge variant="secondary">{activeWebsites.length} sitios</Badge>
          </div>

          <div className="space-y-4">
            {activeWebsites.map((website) => (
              <Card key={website.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{website.websiteName}</CardTitle>
                        <Badge variant="default">Publicado</Badge>
                      </div>
                      <CardDescription>
                        {website.churchName} • /{website.url}
                      </CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{website.pages} páginas</span>
                        <span>{website.funnels} funnels</span>
                        <span>Tema: {website.theme}</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Actualizado: {new Date(website.lastUpdated).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleEditWebsite(website.id)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Sitio
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreviewWebsite(website.url)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Vista Previa
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleWebsiteSettings(website.id)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configuración
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Biblioteca de Plantillas</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Gestiona plantillas profesionales pre-diseñadas para diferentes tipos de iglesias.
            </p>
            <Link href="/platform/website-services/templates">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gestionar Plantillas
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
