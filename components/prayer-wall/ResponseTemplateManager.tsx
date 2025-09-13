
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Plus,
  Search, 
  Edit3, 
  Trash2,
  Eye,
  MessageSquare,
  Clock,
  Heart,
  User,
  Settings,
  Copy,
  Send,
  Wand2,
  Globe
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface PrayerResponse {
  id: string
  name: string
  subject: string
  content: string
  isActive: boolean
  isDefault: boolean
  deliveryTiming: 'immediate' | 'delayed' | 'scheduled'
  delayHours?: number
  scheduledTime?: string
  messageType: 'email' | 'sms' | 'whatsapp' | 'all'
  variables: string[]
  categoryId?: string
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
    color?: string
  }
  _count?: {
    sentMessages: number
  }
}

interface PrayerCategory {
  id: string
  name: string
  color?: string
  icon?: string
}

interface ResponseTemplateManagerProps {
  onTemplateUpdate?: () => void
}

const AVAILABLE_VARIABLES = [
  { key: '{nombre}', description: 'Nombre del solicitante' },
  { key: '{iglesia}', description: 'Nombre de la iglesia' },
  { key: '{categoria}', description: 'Categoría de la petición' },
  { key: '{fecha}', description: 'Fecha actual' },
  { key: '{pastor}', description: 'Nombre del pastor' },
  { key: '{peticion}', description: 'Mensaje de la petición' },
  { key: '{contacto}', description: 'Información de contacto' }
]

const DEFAULT_TEMPLATES = [
  {
    name: 'Respuesta General - Familia',
    subject: 'Recibimos tu petición de oración - {iglesia}',
    content: `Estimado/a {nombre},

Recibimos tu petición de oración sobre {categoria} y queremos que sepas que nuestro equipo pastoral estará orando por ti y tu familia.

Tu petición: "{peticion}"

En {iglesia}, creemos en el poder de la oración y estamos comprometidos a acompañarte en este tiempo. Estaremos intercediendo por esta situación en nuestros próximos momentos de oración corporativa.

Si necesitas hablar con alguien o requieres apoyo adicional, no dudes en contactarnos. Estamos aquí para ti.

Con amor cristiano,
{pastor}
{iglesia}

"Pedid, y se os dará; buscad, y hallaréis; llamad, y se os abrirá" - Mateo 7:7`,
    categoryType: 'familia'
  },
  {
    name: 'Respuesta General - Salud',
    subject: 'Oramos por tu sanidad - {iglesia}',
    content: `Querido/a {nombre},

Hemos recibido tu petición de oración por sanidad y queremos asegurarte que estaremos orando fervientemente por tu completa restauración.

Tu petición: "{peticion}"

Creemos en un Dios que sana y que tiene compasión de nuestras enfermedades. En {iglesia}, tenemos un equipo de intercesión dedicado que estará orando específicamente por tu situación de salud.

Recuerda que "Él sana a los quebrantados de corazón, Y venda sus heridas" (Salmos 147:3).

Si deseas que oremos contigo en persona o necesitas visita pastoral, por favor contáctanos al {contacto}.

Bendiciones y sanidad,
{pastor}
{iglesia}`,
    categoryType: 'salud'
  },
  {
    name: 'Respuesta - Finanzas',
    subject: 'Dios proveerá todas tus necesidades - {iglesia}',
    content: `Estimado/a {nombre},

Gracias por confiar en nosotros con tu petición sobre {categoria}. Queremos que sepas que entendemos las presiones financieras y estaremos orando por la provisión de Dios en tu vida.

Tu petición: "{peticion}"

La Palabra de Dios nos promete en Filipenses 4:19: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús."

En {iglesia}, no solo oramos por las necesidades financieras, sino que también ofrecemos recursos y apoyo práctico. Si deseas información sobre nuestros programas de ayuda o consejería financiera bíblica, no dudes en contactarnos.

Confiando en la provisión divina,
{pastor}
{iglesia}`,
    categoryType: 'finanzas'
  }
]

export function ResponseTemplateManager({ onTemplateUpdate }: ResponseTemplateManagerProps) {
  const { data: session } = useSession()
  const [templates, setTemplates] = useState<PrayerResponse[]>([])
  const [categories, setCategories] = useState<PrayerCategory[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<PrayerResponse | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    isActive: true,
    isDefault: false,
    deliveryTiming: 'delayed' as 'immediate' | 'delayed' | 'scheduled',
    delayHours: 2,
    scheduledTime: '09:00',
    messageType: 'all' as 'email' | 'sms' | 'whatsapp' | 'all',
    categoryId: ''
  })

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadTemplates(),
        loadCategories()
      ])
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/prayer-responses')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.responses || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/prayer-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const openTemplateDialog = (template?: PrayerResponse) => {
    if (template) {
      setSelectedTemplate(template)
      setTemplateForm({
        name: template.name,
        subject: template.subject,
        content: template.content,
        isActive: template.isActive,
        isDefault: template.isDefault,
        deliveryTiming: template.deliveryTiming,
        delayHours: template.delayHours || 2,
        scheduledTime: template.scheduledTime || '09:00',
        messageType: template.messageType,
        categoryId: template.categoryId || 'no-category'
      })
    } else {
      setSelectedTemplate(null)
      setTemplateForm({
        name: '',
        subject: '',
        content: '',
        isActive: true,
        isDefault: false,
        deliveryTiming: 'delayed',
        delayHours: 2,
        scheduledTime: '09:00',
        messageType: 'all',
        categoryId: 'no-category'
      })
    }
    setIsTemplateDialogOpen(true)
  }

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.subject.trim() || !templateForm.content.trim()) {
      toast.error('Completa todos los campos requeridos')
      return
    }

    setSaving(true)
    try {
      const url = selectedTemplate ? `/api/prayer-responses/${selectedTemplate.id}` : '/api/prayer-responses'
      const method = selectedTemplate ? 'PUT' : 'POST'
      
      const payload = {
        ...templateForm,
        delayHours: templateForm.deliveryTiming === 'delayed' ? templateForm.delayHours : undefined,
        scheduledTime: templateForm.deliveryTiming === 'scheduled' ? templateForm.scheduledTime : undefined,
        categoryId: templateForm.categoryId || null
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        await loadTemplates()
        setIsTemplateDialogOpen(false)
        toast.success(selectedTemplate ? 'Plantilla actualizada' : 'Plantilla creada')
        onTemplateUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar la plantilla')
      }
    } catch (error) {
      toast.error('Error al guardar la plantilla')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('¿Está seguro de eliminar esta plantilla? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/prayer-responses/${templateId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadTemplates()
        toast.success('Plantilla eliminada')
        onTemplateUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar la plantilla')
      }
    } catch (error) {
      toast.error('Error al eliminar la plantilla')
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = templateForm.content
    const before = text.substring(0, start)
    const after = text.substring(end)

    setTemplateForm(prev => ({
      ...prev,
      content: before + variable + after
    }))

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  }

  const createDefaultTemplates = async () => {
    try {
      const promises = DEFAULT_TEMPLATES.map(async (template) => {
        // Find category by type
        const category = categories.find(c => 
          c.name.toLowerCase().includes(template.categoryType)
        )

        return fetch('/api/prayer-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: template.name,
            subject: template.subject,
            content: template.content,
            isActive: true,
            isDefault: false,
            deliveryTiming: 'delayed',
            delayHours: 2,
            messageType: 'all',
            categoryId: category?.id || null
          })
        })
      })

      await Promise.all(promises)
      await loadTemplates()
      toast.success('Plantillas por defecto creadas')
    } catch (error) {
      toast.error('Error al crear las plantillas por defecto')
    }
  }

  const previewTemplate = (template: PrayerResponse) => {
    // Replace variables with example data for preview
    const exampleData = {
      '{nombre}': 'María García',
      '{iglesia}': 'Iglesia Khesed-Tek',
      '{categoria}': template.category?.name || 'Familia',
      '{fecha}': new Date().toLocaleDateString('es-ES'),
      '{pastor}': 'Pastor Juan Pérez',
      '{peticion}': 'Oro por la salud de mi madre que está enferma.',
      '{contacto}': 'contacto@iglesia.com'
    }

    let previewContent = template.content
    let previewSubject = template.subject

    Object.entries(exampleData).forEach(([variable, value]) => {
      previewContent = previewContent.replace(new RegExp(variable, 'g'), value)
      previewSubject = previewSubject.replace(new RegExp(variable, 'g'), value)
    })

    return { subject: previewSubject, content: previewContent }
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' || template.categoryId === filterCategory
    const matchesType = filterType === 'all' || template.messageType === filterType

    return matchesSearch && matchesCategory && matchesType
  })

  const getTimingDisplay = (template: PrayerResponse) => {
    switch (template.deliveryTiming) {
      case 'immediate':
        return 'Inmediato'
      case 'delayed':
        return `${template.delayHours || 2}h después`
      case 'scheduled':
        return `A las ${template.scheduledTime}`
      default:
        return 'No configurado'
    }
  }

  const getMessageTypeDisplay = (type: string) => {
    switch (type) {
      case 'email': return 'Email'
      case 'sms': return 'SMS'
      case 'whatsapp': return 'WhatsApp'
      case 'all': return 'Todos'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plantillas de Respuesta</h2>
          <p className="text-gray-600">
            Crea respuestas automáticas personalizadas para las peticiones de oración
          </p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button
              variant="outline"
              onClick={createDefaultTemplates}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Crear Plantillas por Defecto
            </Button>
          )}
          <Button onClick={() => openTemplateDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Buscar plantillas</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nombre, asunto, contenido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Categoría</Label>
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="no-category">Sin categoría específica</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tipo de mensaje</Label>
              <Select
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                </div>
                <div className="flex gap-1">
                  <Badge variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                  {template.isDefault && (
                    <Badge variant="outline">Por defecto</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Envío:</span>
                  <span>{getTimingDisplay(template)}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Send className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Tipo:</span>
                  <span>{getMessageTypeDisplay(template.messageType)}</span>
                </div>
                {template.category && (
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Categoría:</span>
                    <span>{template.category.name}</span>
                  </div>
                )}
                {template._count && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Enviados:</span>
                    <span>{template._count.sentMessages}</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600 line-clamp-3">
                  {template.content.substring(0, 120)}...
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTemplate(template)
                    setIsPreviewDialogOpen(true)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openTemplateDialog(template)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(template.content)
                    toast.success('Contenido copiado')
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron plantillas</p>
            {templates.length === 0 ? (
              <Button
                className="mt-4"
                onClick={() => openTemplateDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Plantilla
              </Button>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Intenta ajustar los filtros
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? 'Editar Plantilla' : 'Nueva Plantilla de Respuesta'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la plantilla *</Label>
                <Input
                  id="name"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Respuesta General - Familia"
                />
              </div>

              <div>
                <Label htmlFor="subject">Asunto del mensaje *</Label>
                <Input
                  id="subject"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Ej: Recibimos tu petición de oración"
                />
              </div>

              <div>
                <Label htmlFor="content">Contenido del mensaje *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Escribe el contenido del mensaje..."
                  rows={12}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría específica</Label>
                  <Select
                    value={templateForm.categoryId}
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de mensaje</Label>
                  <Select
                    value={templateForm.messageType}
                    onValueChange={(value: any) => setTemplateForm(prev => ({ ...prev, messageType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="email">Solo Email</SelectItem>
                      <SelectItem value="sms">Solo SMS</SelectItem>
                      <SelectItem value="whatsapp">Solo WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Momento de envío</Label>
                <Select
                  value={templateForm.deliveryTiming}
                  onValueChange={(value: any) => setTemplateForm(prev => ({ ...prev, deliveryTiming: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Envío inmediato</SelectItem>
                    <SelectItem value="delayed">Envío diferido</SelectItem>
                    <SelectItem value="scheduled">Envío programado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {templateForm.deliveryTiming === 'delayed' && (
                <div>
                  <Label>Horas de retraso</Label>
                  <Select
                    value={templateForm.delayHours.toString()}
                    onValueChange={(value) => setTemplateForm(prev => ({ ...prev, delayHours: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="6">6 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {templateForm.deliveryTiming === 'scheduled' && (
                <div>
                  <Label>Hora programada</Label>
                  <Input
                    type="time"
                    value={templateForm.scheduledTime}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={templateForm.isActive}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Plantilla activa</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={templateForm.isDefault}
                    onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isDefault: checked }))}
                  />
                  <Label htmlFor="isDefault">Usar por defecto</Label>
                </div>
              </div>
            </div>

            {/* Variables Panel */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Variables Disponibles</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Haz clic en una variable para insertarla en el mensaje
                </p>
                <div className="space-y-2">
                  {AVAILABLE_VARIABLES.map(variable => (
                    <Button
                      key={variable.key}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <code className="text-blue-600 mr-2">{variable.key}</code>
                      <span className="text-xs text-gray-600">{variable.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">💡 Consejos</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa variables para personalizar los mensajes</li>
                  <li>• Las plantillas activas se aplicarán automáticamente</li>
                  <li>• Los envíos diferidos son más humanos</li>
                  <li>• Revisa la vista previa antes de guardar</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Plantilla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa - {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              {(() => {
                const preview = previewTemplate(selectedTemplate)
                return (
                  <>
                    <div>
                      <Label>Asunto:</Label>
                      <div className="bg-gray-50 rounded p-3 mt-1">
                        <p className="font-medium">{preview.subject}</p>
                      </div>
                    </div>
                    <div>
                      <Label>Contenido:</Label>
                      <div className="bg-gray-50 rounded p-3 mt-1 max-h-96 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{preview.content}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 rounded p-3">
                      <strong>Nota:</strong> Esta es una vista previa con datos de ejemplo. 
                      Los valores reales se sustituirán automáticamente cuando se envíe el mensaje.
                    </div>
                  </>
                )
              })()}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
