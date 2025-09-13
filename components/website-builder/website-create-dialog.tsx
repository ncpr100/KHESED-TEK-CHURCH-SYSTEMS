
'use client'

import { useState } from 'react'
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
import { toast } from 'sonner'

interface WebsiteCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onWebsiteCreated: () => void
}

const themes = [
  { value: 'modern', label: 'Moderno', description: 'Diseño limpio y contemporáneo' },
  { value: 'classic', label: 'Clásico', description: 'Estilo tradicional y elegante' },
  { value: 'minimal', label: 'Minimalista', description: 'Simple y enfocado en el contenido' },
  { value: 'bold', label: 'Atrevido', description: 'Colores vibrantes y tipografía fuerte' },
]

const colorSchemes = [
  { primary: '#3B82F6', secondary: '#64748B', name: 'Azul Profesional' },
  { primary: '#7C3AED', secondary: '#6B7280', name: 'Púrpura Espiritual' },
  { primary: '#059669', secondary: '#4B5563', name: 'Verde Esperanza' },
  { primary: '#DC2626', secondary: '#6B7280', name: 'Rojo Pasión' },
  { primary: '#D97706', secondary: '#6B7280', name: 'Naranja Cálido' },
]

export function WebsiteCreateDialog({ 
  open, 
  onOpenChange, 
  onWebsiteCreated 
}: WebsiteCreateDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    theme: 'modern',
    colorScheme: 0
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generar slug basado en el nombre
      ...(field === 'name' && {
        slug: value
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '')
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre del sitio web es requerido')
      return
    }

    if (!formData.slug.trim()) {
      toast.error('La URL del sitio web es requerida')
      return
    }

    setLoading(true)

    try {
      const selectedColors = colorSchemes[formData.colorScheme]
      
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          primaryColor: selectedColors.primary,
          secondaryColor: selectedColors.secondary,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear el sitio web')
      }

      const website = await response.json()
      
      toast.success('Sitio web creado exitosamente')
      onWebsiteCreated()
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        theme: 'modern',
        colorScheme: 0
      })
    } catch (error: any) {
      console.error('Error creating website:', error)
      toast.error(error.message || 'Error al crear el sitio web')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Sitio Web</DialogTitle>
          <DialogDescription>
            Configura tu nuevo sitio web. Podrás personalizarlo completamente después de crearlo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Información Básica */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Sitio Web</Label>
              <Input
                id="name"
                placeholder="Ej: Iglesia Nueva Vida"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL del Sitio (slug)</Label>
              <Input
                id="slug"
                placeholder="ej: iglesia-nueva-vida"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Esta será la URL de tu sitio: yourchurch.com/{formData.slug || 'tu-sitio'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente tu sitio web..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Configuración de Diseño */}
            <div className="space-y-2">
              <Label htmlFor="theme">Tema de Diseño</Label>
              <Select 
                value={formData.theme} 
                onValueChange={(value) => handleInputChange('theme', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tema" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      <div>
                        <div className="font-medium">{theme.label}</div>
                        <div className="text-sm text-muted-foreground">{theme.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Esquema de Colores</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorSchemes.map((scheme, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInputChange('colorScheme', index.toString())}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      formData.colorScheme === index 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium">{scheme.name}</span>
                  </button>
                ))}
              </div>
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
              {loading ? 'Creando...' : 'Crear Sitio Web'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
