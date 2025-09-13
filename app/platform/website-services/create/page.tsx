
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Globe, Palette, Layout, Settings } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const churchTemplates = [
  {
    id: 'traditional',
    name: 'Iglesia Tradicional',
    description: 'Diseño clásico y elegante para iglesias establecidas',
    preview: '/templates/traditional.jpg',
    features: ['Página de inicio', 'Servicios', 'Historia', 'Donaciones', 'Contacto'],
    price: 599
  },
  {
    id: 'modern',
    name: 'Iglesia Moderna',
    description: 'Diseño contemporáneo con elementos interactivos',
    preview: '/templates/modern.jpg',
    features: ['Página de inicio', 'Servicios en vivo', 'Eventos', 'Ministerios', 'Blog', 'Donaciones'],
    price: 799
  },
  {
    id: 'community',
    name: 'Iglesia Comunitaria',
    description: 'Enfocado en comunidad e interacción social',
    preview: '/templates/community.jpg',
    features: ['Página de inicio', 'Grupos pequeños', 'Eventos comunitarios', 'Galería', 'Voluntariado'],
    price: 699
  },
  {
    id: 'youth',
    name: 'Iglesia Joven',
    description: 'Diseño vibrante y dinámico para iglesias jóvenes',
    preview: '/templates/youth.jpg',
    features: ['Página de inicio', 'Música', 'Eventos juveniles', 'Social media', 'Live streaming'],
    price: 899
  }
]

const colorSchemes = [
  { name: 'Azul Tradicional', primary: '#1E40AF', secondary: '#64748B', accent: '#3B82F6' },
  { name: 'Púrpura Espiritual', primary: '#7C3AED', secondary: '#6B7280', accent: '#A855F7' },
  { name: 'Verde Esperanza', primary: '#059669', secondary: '#4B5563', accent: '#10B981' },
  { name: 'Rojo Pasión', primary: '#DC2626', secondary: '#6B7280', accent: '#EF4444' },
  { name: 'Dorado Divino', primary: '#D97706', secondary: '#6B7280', accent: '#F59E0B' },
  { name: 'Teal Serenidad', primary: '#0D9488', secondary: '#64748B', accent: '#14B8A6' }
]

export default function CreateWebsitePage() {
  const [currentStep, setCurrentStep] = useState('template')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedColors, setSelectedColors] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    churchName: '',
    contactEmail: '',
    websiteName: '',
    slug: '',
    description: '',
    phone: '',
    address: '',
    specialRequests: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate slug from website name
      ...(field === 'websiteName' && {
        slug: value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '')
      })
    }))
  }

  const handleCreateWebsite = async () => {
    if (!selectedTemplate) {
      toast.error('Por favor selecciona una plantilla')
      return
    }

    if (!formData.churchName || !formData.contactEmail || !formData.websiteName) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setLoading(true)

    try {
      const selectedTemplateData = churchTemplates.find(t => t.id === selectedTemplate)
      const selectedColorScheme = colorSchemes[selectedColors]

      const response = await fetch('/api/platform/website-services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          template: selectedTemplate,
          templateName: selectedTemplateData?.name,
          primaryColor: selectedColorScheme.primary,
          secondaryColor: selectedColorScheme.secondary,
          accentColor: selectedColorScheme.accent,
          colorSchemeName: selectedColorScheme.name,
          estimatedPrice: selectedTemplateData?.price || 599
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el proyecto de sitio web')
      }

      const project = await response.json()
      
      toast.success('Proyecto de sitio web creado exitosamente')
      
      // Redirect to project details or back to main page
      window.location.href = '/platform/website-services'
      
    } catch (error: any) {
      console.error('Error creating website project:', error)
      toast.error(error.message || 'Error al crear el proyecto de sitio web')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/platform/website-services">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">🚀 Crear Sitio Web Profesional</h1>
          <p className="text-muted-foreground">
            Herramientas avanzadas para crear sitios web de iglesias de clase empresarial
          </p>
        </div>
      </div>

      <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="template">Plantilla</TabsTrigger>
          <TabsTrigger value="design">Diseño</TabsTrigger>
          <TabsTrigger value="content">Contenido</TabsTrigger>
          <TabsTrigger value="review">Revisión</TabsTrigger>
        </TabsList>

        {/* Template Selection */}
        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Seleccionar Plantilla Base
              </CardTitle>
              <CardDescription>
                Elige una plantilla profesional pre-diseñada para el tipo de iglesia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {churchTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription>{template.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">${template.price}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                          <Globe className="h-12 w-12" />
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Funciones incluidas:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => setCurrentStep('design')}
              disabled={!selectedTemplate}
            >
              Continuar al Diseño
            </Button>
          </div>
        </TabsContent>

        {/* Design Customization */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalización de Diseño
              </CardTitle>
              <CardDescription>
                Configura los colores y estilo visual del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Esquema de Colores</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecciona la paleta de colores que mejor represente la identidad de la iglesia
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colorSchemes.map((scheme, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedColors === index 
                            ? 'ring-2 ring-primary border-primary' 
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedColors(index)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <div 
                                className="w-8 h-8 rounded-lg" 
                                style={{ backgroundColor: scheme.primary }}
                              />
                              <div 
                                className="w-8 h-8 rounded-lg" 
                                style={{ backgroundColor: scheme.secondary }}
                              />
                              <div 
                                className="w-8 h-8 rounded-lg" 
                                style={{ backgroundColor: scheme.accent }}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{scheme.name}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                <div>Principal: {scheme.primary}</div>
                                <div>Acento: {scheme.accent}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('template')}>
              Volver
            </Button>
            <Button onClick={() => setCurrentStep('content')}>
              Continuar al Contenido
            </Button>
          </div>
        </TabsContent>

        {/* Content Configuration */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Información de la Iglesia
              </CardTitle>
              <CardDescription>
                Proporciona los detalles básicos de la iglesia para el sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="churchName">Nombre de la Iglesia *</Label>
                    <Input
                      id="churchName"
                      placeholder="Ej: Iglesia Bautista Central"
                      value={formData.churchName}
                      onChange={(e) => handleInputChange('churchName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de Contacto *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="pastor@iglesia.org"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="websiteName">Nombre del Sitio Web *</Label>
                    <Input
                      id="websiteName"
                      placeholder="Ej: Iglesia Bautista Central Online"
                      value={formData.websiteName}
                      onChange={(e) => handleInputChange('websiteName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL del Sitio (slug)</Label>
                    <Input
                      id="slug"
                      placeholder="iglesia-bautista-central"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      URL final: church-sites.com/{formData.slug || 'tu-iglesia'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      placeholder="123 Calle Principal, Ciudad, Estado"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción de la Iglesia</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe brevemente la misión, visión y valores de la iglesia..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Cualquier característica específica, integración o personalización requerida..."
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('design')}>
              Volver
            </Button>
            <Button onClick={() => setCurrentStep('review')}>
              Revisar Proyecto
            </Button>
          </div>
        </TabsContent>

        {/* Review & Create */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revisión del Proyecto</CardTitle>
              <CardDescription>
                Verifica todos los detalles antes de crear el proyecto de sitio web
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Selected Template */}
                <div>
                  <h4 className="font-semibold mb-2">Plantilla Seleccionada</h4>
                  {selectedTemplate && (
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <Globe className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {churchTemplates.find(t => t.id === selectedTemplate)?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {churchTemplates.find(t => t.id === selectedTemplate)?.description}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        ${churchTemplates.find(t => t.id === selectedTemplate)?.price}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Color Scheme */}
                <div>
                  <h4 className="font-semibold mb-2">Esquema de Colores</h4>
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: colorSchemes[selectedColors].primary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: colorSchemes[selectedColors].secondary }}
                      />
                      <div 
                        className="w-8 h-8 rounded-lg" 
                        style={{ backgroundColor: colorSchemes[selectedColors].accent }}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{colorSchemes[selectedColors].name}</p>
                      <p className="text-sm text-muted-foreground">
                        Principal: {colorSchemes[selectedColors].primary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Church Information */}
                <div>
                  <h4 className="font-semibold mb-2">Información de la Iglesia</h4>
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Iglesia</p>
                      <p className="text-sm text-muted-foreground">{formData.churchName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sitio Web</p>
                      <p className="text-sm text-muted-foreground">{formData.websiteName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{formData.contactEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">URL</p>
                      <p className="text-sm text-muted-foreground">/{formData.slug}</p>
                    </div>
                  </div>
                </div>

                {/* Estimated Cost */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">Precio Estimado del Proyecto</p>
                      <p className="text-sm text-green-600">Incluye diseño, desarrollo y configuración inicial</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-800">
                        ${selectedTemplate ? churchTemplates.find(t => t.id === selectedTemplate)?.price : 599}
                      </p>
                      <p className="text-sm text-green-600">USD</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('content')}>
              Volver
            </Button>
            <Button 
              onClick={handleCreateWebsite}
              disabled={loading}
              size="lg"
              className="px-8"
            >
              {loading ? 'Creando Proyecto...' : 'Crear Proyecto de Sitio Web'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
