
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  FileText, 
  Search, 
  Star, 
  Users, 
  Heart, 
  Gift, 
  Calendar, 
  MessageSquare,
  Sparkles
} from 'lucide-react'

interface AutomationTemplate {
  id: string
  name: string
  description: string | null
  category: string
  usageCount: number
  isSystem: boolean
  template: any
  creator?: {
    id: string
    name: string | null
  }
}

interface AutomationTemplatesProps {
  onSelectTemplate: (template: AutomationTemplate) => void
}

export function AutomationTemplates({ onSelectTemplate }: AutomationTemplatesProps) {
  const [templates, setTemplates] = useState<AutomationTemplate[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
      const response = await fetch(`/api/automation-templates?${params}`)
      if (!response.ok) throw new Error('Error al cargar plantillas')
      
      const data = await response.json()
      setTemplates(data.templates)
      setCategories(data.categories)
      
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'nuevos-miembros': <Users className="h-4 w-4" />,
      'donaciones': <Gift className="h-4 w-4" />,
      'eventos': <Calendar className="h-4 w-4" />,
      'comunicacion': <MessageSquare className="h-4 w-4" />,
      'fechas-especiales': <Heart className="h-4 w-4" />,
      'seguimiento': <Star className="h-4 w-4" />
    }
    return icons[category] || <FileText className="h-4 w-4" />
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'nuevos-miembros': 'Nuevos Miembros',
      'donaciones': 'Donaciones',
      'eventos': 'Eventos',
      'comunicacion': 'Comunicación',
      'fechas-especiales': 'Fechas Especiales',
      'seguimiento': 'Seguimiento'
    }
    return labels[category] || category
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mock templates for demonstration
  const mockTemplates = [
    {
      id: '1',
      name: 'Bienvenida a Nuevos Miembros',
      description: 'Envía automáticamente un mensaje de bienvenida cuando alguien se une a la iglesia',
      category: 'nuevos-miembros',
      usageCount: 156,
      isSystem: true,
      template: {
        triggers: [{ type: 'MEMBER_JOINED' }],
        actions: [{ type: 'SEND_NOTIFICATION', configuration: { title: 'Bienvenido a nuestra familia' } }]
      }
    },
    {
      id: '2',
      name: 'Agradecimiento por Donación',
      description: 'Agradece automáticamente a los miembros cuando realizan una donación',
      category: 'donaciones',
      usageCount: 89,
      isSystem: true,
      template: {
        triggers: [{ type: 'DONATION_RECEIVED' }],
        actions: [{ type: 'SEND_EMAIL', configuration: { subject: 'Gracias por tu donación' } }]
      }
    },
    {
      id: '3',
      name: 'Recordatorio de Cumpleaños',
      description: 'Felicita a los miembros en su cumpleaños',
      category: 'fechas-especiales',
      usageCount: 234,
      isSystem: true,
      template: {
        triggers: [{ type: 'BIRTHDAY' }],
        actions: [{ type: 'SEND_NOTIFICATION', configuration: { title: '¡Feliz Cumpleaños!' } }]
      }
    },
    {
      id: '4',
      name: 'Confirmación de Evento',
      description: 'Confirma automáticamente la creación de nuevos eventos',
      category: 'eventos',
      usageCount: 67,
      isSystem: true,
      template: {
        triggers: [{ type: 'EVENT_CREATED' }],
        actions: [{ type: 'SEND_NOTIFICATION', configuration: { title: 'Evento creado exitosamente' } }]
      }
    },
    {
      id: '5',
      name: 'Seguimiento de Visitantes',
      description: 'Crea automáticamente tareas de seguimiento para nuevos visitantes',
      category: 'seguimiento',
      usageCount: 45,
      isSystem: true,
      template: {
        triggers: [{ type: 'MEMBER_JOINED' }],
        conditions: [{ field: 'memberType', value: 'visitor' }],
        actions: [{ type: 'CREATE_FOLLOW_UP', configuration: { priority: 'HIGH' } }]
      }
    },
    {
      id: '6',
      name: 'Aniversario de Membresía',
      description: 'Celebra automáticamente los aniversarios de membresía',
      category: 'fechas-especiales',
      usageCount: 78,
      isSystem: true,
      template: {
        triggers: [{ type: 'ANNIVERSARY' }],
        actions: [{ type: 'SEND_NOTIFICATION', configuration: { title: '¡Feliz Aniversario!' } }]
      }
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Plantillas de Automatización
        </h2>
        <p className="text-muted-foreground mt-1">
          Utiliza plantillas predefinidas para crear reglas rápidamente
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las Categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.name} value={category.name}>
                {getCategoryLabel(category.name)} ({category.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTemplates.filter(template =>
          (selectedCategory === 'all' || template.category === selectedCategory) &&
          (template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           template.description.toLowerCase().includes(searchTerm.toLowerCase()))
        ).map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(template.category)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                {template.isSystem && (
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="h-3 w-3" />
                    Sistema
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Template Components */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Triggers:</span>
                    <div className="mt-1">
                      {template.template.triggers?.length || 0}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Acciones:</span>
                    <div className="mt-1">
                      {template.template.actions?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-4 w-4" />
                    <span>{template.usageCount} usos</span>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="gap-2"
                  >
                    Usar Plantilla
                  </Button>
                </div>

                {/* Category Badge */}
                <Badge variant="outline" className="w-fit">
                  {getCategoryLabel(template.category)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No se encontraron plantillas</h3>
              <p className="text-muted-foreground">
                No hay plantillas que coincidan con tu búsqueda.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
