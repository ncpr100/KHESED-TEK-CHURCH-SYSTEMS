
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { 
  Send,
  FileText,
  Users,
  Target,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface CreateNotificationDialogProps {
  open: boolean
  onClose: () => void
  onNotificationCreated: () => void
}

interface NotificationTemplate {
  id: string
  name: string
  description?: string
  category: string
  type: string
  priority: string
  titleTemplate: string
  messageTemplate: string
  actionLabel?: string
  defaultTargetRole?: string
}

const NOTIFICATION_TYPES = [
  { value: 'INFO', label: 'Información', icon: Info, color: 'text-blue-500' },
  { value: 'SUCCESS', label: 'Éxito', icon: CheckCircle, color: 'text-green-500' },
  { value: 'WARNING', label: 'Advertencia', icon: AlertTriangle, color: 'text-yellow-500' },
  { value: 'ERROR', label: 'Error', icon: XCircle, color: 'text-red-500' },
]

const CATEGORIES = [
  { value: 'EVENT', label: 'Eventos' },
  { value: 'DONATION', label: 'Donaciones' },
  { value: 'COMMUNICATION', label: 'Comunicaciones' },
  { value: 'SYSTEM', label: 'Sistema' },
  { value: 'CUSTOM', label: 'Personalizado' },
]

const PRIORITIES = [
  { value: 'LOW', label: 'Baja' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
]

const TARGET_TYPES = [
  { value: 'GLOBAL', label: 'Toda la iglesia', description: 'Enviar a todos los miembros' },
  { value: 'ROLE', label: 'Por rol', description: 'Enviar a usuarios con un rol específico' },
  { value: 'USERS', label: 'Usuarios específicos', description: 'Seleccionar usuarios individualmente' },
]

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador' },
  { value: 'ADMIN_IGLESIA', label: 'Administrador de Iglesia' },
  { value: 'PASTOR', label: 'Pastor' },
  { value: 'LIDER', label: 'Líder' },
  { value: 'MIEMBRO', label: 'Miembro' },
]

export function CreateNotificationDialog({ open, onClose, onNotificationCreated }: CreateNotificationDialogProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  
  // Form state
  const [useTemplate, setUseTemplate] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR'>('INFO')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL')
  const [actionUrl, setActionUrl] = useState('')
  const [actionLabel, setActionLabel] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [targetType, setTargetType] = useState<'GLOBAL' | 'ROLE' | 'USERS'>('GLOBAL')
  const [targetRole, setTargetRole] = useState('')
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      fetchTemplates()
    }
  }, [open])

  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId)
      if (template) {
        setTitle(template.titleTemplate)
        setMessage(template.messageTemplate)
        setType(template.type as 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR')
        setCategory(template.category)
        setPriority(template.priority as 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT')
        if (template.actionLabel) {
          setActionLabel(template.actionLabel)
        }
        if (template.defaultTargetRole) {
          setTargetType('ROLE')
          setTargetRole(template.defaultTargetRole)
        }
      }
    }
  }, [selectedTemplateId, templates])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/notification-templates?activeOnly=true')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const resetForm = () => {
    setUseTemplate(false)
    setSelectedTemplateId('')
    setTitle('')
    setMessage('')
    setType('INFO')
    setCategory('')
    setPriority('NORMAL')
    setActionUrl('')
    setActionLabel('')
    setExpiresAt('')
    setTargetType('GLOBAL')
    setTargetRole('')
    setTemplateVariables({})
  }

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Título y mensaje son requeridos')
      return
    }

    if (targetType === 'ROLE' && !targetRole) {
      toast.error('Selecciona un rol para el envío')
      return
    }

    setLoading(true)
    try {
      const payload = {
        templateId: useTemplate ? selectedTemplateId : undefined,
        title: title.trim(),
        message: message.trim(),
        type,
        category: category || undefined,
        priority,
        actionUrl: actionUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        expiresAt: expiresAt || undefined,
        targetType,
        targetRole: targetType === 'ROLE' ? targetRole : undefined,
        variables: useTemplate && Object.keys(templateVariables).length > 0 
          ? templateVariables 
          : undefined,
      }

      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${result.notificationsCreated} notificación(es) enviada(s) exitosamente`)
        resetForm()
        onNotificationCreated()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar notificación')
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      toast.error('Error al enviar notificación')
    } finally {
      setLoading(false)
    }
  }

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Crear Nueva Notificación
          </DialogTitle>
          <DialogDescription>
            Envía notificaciones a los miembros de tu iglesia
          </DialogDescription>
        </DialogHeader>

        <Tabs value={useTemplate ? 'template' : 'manual'} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="manual" 
              onClick={() => setUseTemplate(false)}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Manual
            </TabsTrigger>
            <TabsTrigger 
              value="template" 
              onClick={() => setUseTemplate(true)}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Usar Plantilla
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Seleccionar Plantilla</CardTitle>
                <CardDescription>
                  Usa una plantilla predefinida para crear tu notificación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una plantilla..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{template.category}</Badge>
                          {template.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedTemplate && (
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{selectedTemplate.type}</Badge>
                      <Badge variant="outline">{selectedTemplate.priority}</Badge>
                    </div>
                    <h4 className="font-medium">{selectedTemplate.name}</h4>
                    {selectedTemplate.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}

                {/* Template Variables */}
                {selectedTemplate && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Variables de Plantilla</Label>
                    <p className="text-xs text-muted-foreground">
                      Personaliza las variables {'{'}variable{'}'} en el título y mensaje
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="memberName"
                        value={templateVariables.memberName || ''}
                        onChange={(e) => setTemplateVariables(prev => ({
                          ...prev,
                          memberName: e.target.value
                        }))}
                      />
                      <Input
                        placeholder="eventName"
                        value={templateVariables.eventName || ''}
                        onChange={(e) => setTemplateVariables(prev => ({
                          ...prev,
                          eventName: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            {/* Manual notification form is shared below */}
          </TabsContent>
        </Tabs>

        {/* Shared Form Fields */}
        <div className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contenido de la Notificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la notificación"
                  disabled={useTemplate && !!selectedTemplateId}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Contenido del mensaje"
                  rows={4}
                  disabled={useTemplate && !!selectedTemplateId}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={type} 
                    onValueChange={(value: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR') => setType(value)}
                    disabled={useTemplate && !!selectedTemplateId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center gap-2">
                            <t.icon className={`h-4 w-4 ${t.color}`} />
                            {t.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select 
                    value={priority} 
                    onValueChange={(value: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => setPriority(value)}
                    disabled={useTemplate && !!selectedTemplateId}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!useTemplate && (
                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action & Expiration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Acción y Expiración (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionUrl">URL de Acción</Label>
                  <Input
                    id="actionUrl"
                    type="url"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="https://ejemplo.com/accion"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actionLabel">Etiqueta del Botón</Label>
                  <Input
                    id="actionLabel"
                    value={actionLabel}
                    onChange={(e) => setActionLabel(e.target.value)}
                    placeholder="Ver más, Registrarse, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Fecha de Expiración</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Audiencia Objetivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {TARGET_TYPES.map(target => (
                  <div key={target.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={target.value}
                      name="targetType"
                      value={target.value}
                      checked={targetType === target.value}
                      onChange={(e) => setTargetType(e.target.value as 'GLOBAL' | 'ROLE' | 'USERS')}
                      className="w-4 h-4"
                    />
                    <label htmlFor={target.value} className="flex-1 cursor-pointer">
                      <div className="font-medium">{target.label}</div>
                      <div className="text-sm text-muted-foreground">{target.description}</div>
                    </label>
                  </div>
                ))}
              </div>

              {targetType === 'ROLE' && (
                <div className="space-y-2">
                  <Label>Selecciona el Rol</Label>
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un rol..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {targetType === 'USERS' && (
                <div className="p-3 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    La selección específica de usuarios estará disponible en una próxima actualización.
                    Por ahora, usa "Por rol" o "Toda la iglesia".
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !title.trim() || !message.trim() || (targetType === 'USERS')}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar Notificación'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
