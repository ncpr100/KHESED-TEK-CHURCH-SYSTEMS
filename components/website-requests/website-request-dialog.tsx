
'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface WebsiteRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestSubmitted: () => void
  existingWebsite?: {
    id: string
    name: string
    slug: string
  } | null
}

const websiteTypes = [
  {
    value: 'complete-website',
    label: 'Sitio Web Completo',
    description: 'Sitio web de múltiples páginas con todas las funcionalidades',
    estimatedPrice: '599-899',
    features: ['Página de inicio', 'Servicios', 'Eventos', 'Donaciones', 'Contacto', 'Blog (opcional)']
  },
  {
    value: 'landing-page',
    label: 'Landing Page/Funnel',
    description: 'Página única para campaña específica o captación de leads',
    estimatedPrice: '199-399',
    features: ['Diseño enfocado', 'Formulario de contacto', 'Call-to-action optimizado']
  },
  {
    value: 'website-update',
    label: 'Actualización de Sitio',
    description: 'Mejoras a un sitio web existente',
    estimatedPrice: '99-299',
    features: ['Nuevas secciones', 'Diseño actualizado', 'Funcionalidades adicionales']
  }
]

const priorityLevels = [
  { value: 'low', label: 'Baja (10-15 días)', description: 'No urgente' },
  { value: 'medium', label: 'Media (5-10 días)', description: 'Estándar' },
  { value: 'high', label: 'Alta (2-5 días)', description: '+$150 costo adicional' }
]

export function WebsiteRequestDialog({ 
  open, 
  onOpenChange, 
  onRequestSubmitted,
  existingWebsite 
}: WebsiteRequestDialogProps) {
  const { data: session } = useSession() || {}
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({
    requestType: '',
    priority: 'medium',
    projectName: '',
    description: '',
    contactEmail: '',
    phone: '',
    preferredColors: '',
    additionalFeatures: [] as string[],
    specialRequests: '',
    budget: '',
    timeline: '',
    referenceWebsites: ''
  })

  const additionalFeatureOptions = [
    'Sistema de donaciones online',
    'Calendario de eventos integrado',
    'Reproductor de sermones/podcasts',
    'Galería de fotos/videos',
    'Sistema de registro de miembros',
    'Blog/noticias',
    'Tienda online',
    'Formularios de oración',
    'Streaming en vivo',
    'Redes sociales integradas',
    'Sistema multiidioma',
    'Área privada para miembros'
  ]

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: checked 
        ? [...prev.additionalFeatures, feature]
        : prev.additionalFeatures.filter(f => f !== feature)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedType) {
      toast.error('Por favor selecciona el tipo de proyecto')
      return
    }

    if (!formData.projectName.trim()) {
      toast.error('El nombre del proyecto es requerido')
      return
    }

    if (!formData.description.trim()) {
      toast.error('La descripción del proyecto es requerida')
      return
    }

    setLoading(true)

    try {
      const selectedTypeData = websiteTypes.find(t => t.value === selectedType)
      
      const response = await fetch('/api/website-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          requestType: selectedType,
          requestTypeLabel: selectedTypeData?.label,
          estimatedPrice: selectedTypeData?.estimatedPrice,
          churchName: session?.user?.church?.name || 'Iglesia',
          contactEmail: formData.contactEmail || session?.user?.email,
          existingWebsiteId: existingWebsite?.id || null
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al enviar la solicitud')
      }

      const request = await response.json()
      
      onRequestSubmitted()
      
      // Reset form
      setFormData({
        requestType: '',
        priority: 'medium',
        projectName: '',
        description: '',
        contactEmail: '',
        phone: '',
        preferredColors: '',
        additionalFeatures: [],
        specialRequests: '',
        budget: '',
        timeline: '',
        referenceWebsites: ''
      })
      setSelectedType('')
      
    } catch (error: any) {
      console.error('Error creating website request:', error)
      toast.error(error.message || 'Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingWebsite ? 'Solicitar Mejoras al Sitio Web' : 'Solicitar Sitio Web Profesional'}
          </DialogTitle>
          <DialogDescription>
            Completa este formulario y nuestro equipo de expertos se pondrá en contacto contigo en 24 horas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tipo de Proyecto *</Label>
            <RadioGroup value={selectedType} onValueChange={setSelectedType}>
              <div className="space-y-3">
                {websiteTypes.map((type) => (
                  <div key={type.value}>
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <div className="space-y-1 flex-1">
                        <Label 
                          htmlFor={type.value} 
                          className="text-sm font-medium cursor-pointer flex items-center justify-between"
                        >
                          {type.label}
                          <span className="text-green-600 font-semibold">${type.estimatedPrice}</span>
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {type.features.map((feature, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nombre del Proyecto *</Label>
              <Input
                id="projectName"
                placeholder="Ej: Sitio Web Iglesia Central"
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad del Proyecto</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-sm text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción del Proyecto *</Label>
            <Textarea
              id="description"
              placeholder="Describe en detalle lo que necesitas para tu sitio web..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email de Contacto</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder={session?.user?.email || "tu@email.com"}
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Design Preferences */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preferredColors">Colores Preferidos (opcional)</Label>
              <Input
                id="preferredColors"
                placeholder="Ej: azul, blanco, dorado"
                value={formData.preferredColors}
                onChange={(e) => handleInputChange('preferredColors', e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Funcionalidades Adicionales</Label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {additionalFeatureOptions.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.additionalFeatures.includes(feature)}
                      onCheckedChange={(checked) => handleFeatureChange(feature, checked as boolean)}
                    />
                    <Label 
                      htmlFor={feature} 
                      className="text-sm cursor-pointer"
                    >
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto Aproximado (opcional)</Label>
              <Input
                id="budget"
                placeholder="Ej: $800 USD"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Fecha Límite Ideal (opcional)</Label>
              <Input
                id="timeline"
                placeholder="Ej: Antes del 15 de diciembre"
                value={formData.timeline}
                onChange={(e) => handleInputChange('timeline', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceWebsites">Sitios Web de Referencia (opcional)</Label>
              <Textarea
                id="referenceWebsites"
                placeholder="URLs de sitios que te gustan o inspiraciones de diseño..."
                value={formData.referenceWebsites}
                onChange={(e) => handleInputChange('referenceWebsites', e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Solicitudes Especiales</Label>
              <Textarea
                id="specialRequests"
                placeholder="Cualquier requerimiento específico, integración especial, etc..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
