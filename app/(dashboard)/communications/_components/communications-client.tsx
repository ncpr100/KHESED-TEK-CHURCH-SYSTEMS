
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, Send, Clock, Users, Mail, Phone, Plus, Edit, Settings, CheckCircle, XCircle, Zap, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Communication {
  id: string
  title: string
  content: string
  type: string
  targetGroup?: string
  recipients?: number
  status: string
  scheduledAt?: string
  sentAt?: string
  createdAt: string
}

interface CommunicationTemplate {
  id: string
  name: string
  subject?: string
  content: string
  type: string
  category?: string
  variables?: string
  isActive: boolean
}

interface IntegrationConfig {
  id: string
  service: string
  isActive: boolean
}

interface IntegrationStatus {
  communication: {
    email: { enabled: boolean; provider: string; configured: boolean }
    sms: { enabled: boolean; provider: string; configured: boolean }
    whatsapp: { enabled: boolean; provider: string; configured: boolean }
  }
  services: {
    mailgun: { enabled: boolean; configured: boolean }
    twilio: { enabled: boolean; configured: boolean }
    whatsapp: { enabled: boolean; configured: boolean }
  }
  environment: {
    mailgun_configured: boolean
    twilio_configured: boolean
    whatsapp_configured: boolean
    providers_enabled: {
      mailgun: boolean
      twilio: boolean
      whatsapp: boolean
    }
  }
}

interface CommunicationsClientProps {
  userRole: string
  churchId: string
}

export function CommunicationsClient({ userRole, churchId }: CommunicationsClientProps) {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([])
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('send')

  // Form states
  const [sendForm, setSendForm] = useState({
    title: '',
    content: '',
    type: '',
    targetGroup: '',
    templateId: '',
    scheduledAt: ''
  })

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    type: '',
    category: '',
    variables: ''
  })

  const [integrationForm, setIntegrationForm] = useState({
    service: '',
    config: {
      accountSid: '',
      authToken: '',
      phoneNumber: ''
    }
  })

  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false)
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null)

  // Integration state
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus | null>(null)
  const [integrationLoading, setIntegrationLoading] = useState(true)
  const [testLoading, setTestLoading] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  
  // Test form state
  const [testService, setTestService] = useState('email')
  const [testRecipient, setTestRecipient] = useState('')
  const [testMessage, setTestMessage] = useState('Mensaje de prueba desde Kḥesed-tek')
  const [testSubject, setTestSubject] = useState('Prueba de Integración')

  // Bulk send state
  const [bulkService, setBulkService] = useState('email')
  const [bulkRecipients, setBulkRecipients] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkResults, setBulkResults] = useState<any>(null)

  useEffect(() => {
    fetchCommunications()
    fetchTemplates()
    fetchIntegrations()
    fetchIntegrationStatus()
  }, [])

  const fetchCommunications = async () => {
    try {
      const response = await fetch('/api/communications')
      if (response.ok) {
        const data = await response.json()
        setCommunications(data)
      }
    } catch (error) {
      toast.error('Error al cargar comunicaciones')
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/communication-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      toast.error('Error al cargar templates')
    }
  }

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integration-configs')
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      }
    } catch (error) {
      toast.error('Error al cargar integraciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchIntegrationStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIntegrationStatus(data)
      } else {
        console.error('Failed to fetch integration status:', response.status, response.statusText)
        // Set default status when API fails
        setIntegrationStatus({
          communication: {
            email: { enabled: false, provider: 'internal', configured: false },
            sms: { enabled: false, provider: 'none', configured: false },
            whatsapp: { enabled: false, provider: 'none', configured: false }
          },
          services: {
            mailgun: { enabled: false, configured: false },
            twilio: { enabled: false, configured: false },
            whatsapp: { enabled: false, configured: false }
          },
          environment: {
            mailgun_configured: false,
            twilio_configured: false,
            whatsapp_configured: false,
            providers_enabled: {
              mailgun: false,
              twilio: false,
              whatsapp: false
            }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching integration status:', error)
      // Set default status on network error
      setIntegrationStatus({
        communication: {
          email: { enabled: false, provider: 'internal', configured: false },
          sms: { enabled: false, provider: 'none', configured: false },
          whatsapp: { enabled: false, provider: 'none', configured: false }
        },
        services: {
          mailgun: { enabled: false, configured: false },
          twilio: { enabled: false, configured: false },
          whatsapp: { enabled: false, configured: false }
        },
        environment: {
          mailgun_configured: false,
          twilio_configured: false,
          whatsapp_configured: false,
          providers_enabled: {
            mailgun: false,
            twilio: false,
            whatsapp: false
          }
        }
      })
    } finally {
      setIntegrationLoading(false)
    }
  }

  const testIntegration = async () => {
    if (!testRecipient || !testMessage) return
    
    setTestLoading(testService)
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: testService,
          recipient: testRecipient,
          message: testMessage,
          subject: testSubject
        })
      })

      const result = await response.json()
      setTestResults(result)
      
      if (result.success) {
        toast.success(`Mensaje enviado exitosamente via ${result.provider}`)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error testing integration:', error)
      setTestResults({ success: false, error: 'Error de conexión' })
      toast.error('Error de conexión')
    } finally {
      setTestLoading('')
    }
  }

  const sendBulkMessage = async () => {
    if (!bulkMessage || !bulkRecipients) return

    setTestLoading('bulk')
    try {
      const recipients = bulkRecipients.split('\n').filter(r => r.trim())
      
      const response = await fetch('/api/integrations/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: bulkService,
          recipients,
          message: bulkMessage,
          subject: bulkSubject
        })
      })

      const result = await response.json()
      setBulkResults(result)
      
      if (result.success) {
        toast.success(`Envío completado: ${result.successful}/${result.total} mensajes enviados`)
      } else {
        toast.error(`Error en envío masivo: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending bulk:', error)
      setBulkResults({ success: false, error: 'Error de conexión' })
      toast.error('Error de conexión')
    } finally {
      setTestLoading('')
    }
  }

  const StatusBadge = ({ enabled, configured }: { enabled: boolean; configured: boolean }) => {
    if (enabled && configured) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>
    }
    if (configured) {
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Configurado</Badge>
    }
    return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />No configurado</Badge>
  }

  const handleSendCommunication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sendForm.title || !sendForm.type || !sendForm.targetGroup) {
      toast.error('Título, tipo y grupo objetivo son requeridos')
      return
    }

    if ((!sendForm.templateId || sendForm.templateId === 'no-template') && !sendForm.content) {
      toast.error('Selecciona un template o escribe el contenido')
      return
    }

    try {
      // Handle "no-template" selection by sending null
      const submitData = {
        ...sendForm,
        templateId: sendForm.templateId === 'no-template' ? null : sendForm.templateId
      }

      const response = await fetch('/api/communications/mass-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success('Comunicación enviada exitosamente')
        setSendForm({
          title: '',
          content: '',
          type: '',
          targetGroup: '',
          templateId: '',
          scheduledAt: ''
        })
        fetchCommunications()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al enviar comunicación')
      }
    } catch (error) {
      toast.error('Error al enviar comunicación')
    }
  }

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateForm.name || !templateForm.content || !templateForm.type) {
      toast.error('Nombre, contenido y tipo son requeridos')
      return
    }

    try {
      const response = await fetch('/api/communication-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...templateForm,
          variables: templateForm.variables ? templateForm.variables.split(',').map(v => v.trim()) : []
        }),
      })

      if (response.ok) {
        toast.success('Template creado exitosamente')
        setTemplateForm({
          name: '',
          subject: '',
          content: '',
          type: '',
          category: '',
          variables: ''
        })
        setIsNewTemplateDialogOpen(false)
        fetchTemplates()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear template')
      }
    } catch (error) {
      toast.error('Error al crear template')
    }
  }

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!integrationForm.service || !integrationForm.config.accountSid) {
      toast.error('Servicio y configuración son requeridos')
      return
    }

    try {
      const response = await fetch('/api/integration-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: integrationForm.service,
          config: integrationForm.config,
          isActive: true
        }),
      })

      if (response.ok) {
        toast.success('Integración configurada exitosamente')
        setIntegrationForm({
          service: '',
          config: {
            accountSid: '',
            authToken: '',
            phoneNumber: ''
          }
        })
        setIsIntegrationDialogOpen(false)
        fetchIntegrations()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al configurar integración')
      }
    } catch (error) {
      toast.error('Error al configurar integración')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'BORRADOR': 'secondary',
      'ENVIADO': 'default',
      'PROGRAMADO': 'outline',
      'FALLIDO': 'destructive'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS': return <Phone className="w-4 h-4" />
      case 'EMAIL': return <Mail className="w-4 h-4" />
      case 'WHATSAPP': return <MessageSquare className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunicaciones Masivas</h1>
          <p className="text-gray-600">Envía mensajes SMS, WhatsApp y emails a tu congregación</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isIntegrationDialogOpen} onOpenChange={setIsIntegrationDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Integraciones
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Integración</DialogTitle>
                <DialogDescription>
                  Configura servicios externos para comunicaciones
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveIntegration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Servicio</Label>
                  <Select
                    value={integrationForm.service}
                    onValueChange={(value) => setIntegrationForm(prev => ({ ...prev, service: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TWILIO">Twilio (SMS)</SelectItem>
                      <SelectItem value="WHATSAPP">WhatsApp Business</SelectItem>
                      <SelectItem value="MAILGUN">Mailgun (Email)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {integrationForm.service === 'TWILIO' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="accountSid">Account SID</Label>
                      <Input
                        id="accountSid"
                        value={integrationForm.config.accountSid}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          config: { ...prev.config, accountSid: e.target.value }
                        }))}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authToken">Auth Token</Label>
                      <Input
                        id="authToken"
                        type="password"
                        value={integrationForm.config.authToken}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          config: { ...prev.config, authToken: e.target.value }
                        }))}
                        placeholder="Auth Token de Twilio"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Número de Teléfono</Label>
                      <Input
                        id="phoneNumber"
                        value={integrationForm.config.phoneNumber}
                        onChange={(e) => setIntegrationForm(prev => ({
                          ...prev,
                          config: { ...prev.config, phoneNumber: e.target.value }
                        }))}
                        placeholder="+1234567890"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsIntegrationDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Template</DialogTitle>
                <DialogDescription>
                  Crea un template reutilizable para comunicaciones
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Nombre del Template</Label>
                  <Input
                    id="templateName"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Bienvenida nuevos miembros"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateType">Tipo</Label>
                    <Select
                      value={templateForm.type}
                      onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="templateCategory">Categoría</Label>
                    <Select
                      value={templateForm.category}
                      onValueChange={(value) => setTemplateForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BIENVENIDA">Bienvenida</SelectItem>
                        <SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem>
                        <SelectItem value="ANUNCIO">Anuncio</SelectItem>
                        <SelectItem value="RECORDATORIO">Recordatorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {templateForm.type === 'EMAIL' && (
                  <div className="space-y-2">
                    <Label htmlFor="templateSubject">Asunto (Email)</Label>
                    <Input
                      id="templateSubject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Asunto del email"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="templateContent">Contenido</Label>
                  <Textarea
                    id="templateContent"
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="¡Hola {{nombre}}! Bienvenido a nuestra iglesia..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateVariables">Variables (separadas por comas)</Label>
                  <Input
                    id="templateVariables"
                    value={templateForm.variables}
                    onChange={(e) => setTemplateForm(prev => ({ ...prev, variables: e.target.value }))}
                    placeholder="nombre, apellido, evento"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Template</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="send" onClick={() => setActiveTab('send')}>
            Enviar
          </TabsTrigger>
          <TabsTrigger value="bulk" onClick={() => setActiveTab('bulk')}>
            Masivo
          </TabsTrigger>
          <TabsTrigger value="templates" onClick={() => setActiveTab('templates')}>
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="history" onClick={() => setActiveTab('history')}>
            Historial
          </TabsTrigger>
          <TabsTrigger value="setup" onClick={() => setActiveTab('setup')}>
            Configurar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Comunicación</CardTitle>
              <CardDescription>
                Envía mensajes masivos a tu congregación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendCommunication} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={sendForm.title}
                    onChange={(e) => setSendForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Título de la comunicación"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Mensaje</Label>
                    <Select
                      value={sendForm.type}
                      onValueChange={(value) => setSendForm(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetGroup">Destinatarios</Label>
                    <Select
                      value={sendForm.targetGroup}
                      onValueChange={(value) => setSendForm(prev => ({ ...prev, targetGroup: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grupo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODOS">Todos los miembros</SelectItem>
                        <SelectItem value="VOLUNTARIOS">Solo voluntarios</SelectItem>
                        <SelectItem value="LIDERES">Solo líderes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template">Template (opcional)</Label>
                  <Select
                    value={sendForm.templateId}
                    onValueChange={(value) => setSendForm(prev => ({ ...prev, templateId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-template">Sin template</SelectItem>
                      {templates
                        .filter(t => !sendForm.type || t.type === sendForm.type)
                        .map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {!sendForm.templateId && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Contenido</Label>
                    <Textarea
                      id="content"
                      value={sendForm.content}
                      onChange={(e) => setSendForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={4}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">Programar envío (opcional)</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={sendForm.scheduledAt}
                    onChange={(e) => setSendForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  {sendForm.scheduledAt ? 'Programar Envío' : 'Enviar Ahora'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {communications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay comunicaciones enviadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communications.map((comm) => (
                <Card key={comm.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getTypeIcon(comm.type)}
                        {comm.title}
                      </CardTitle>
                      {getStatusBadge(comm.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{comm.content}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{comm.recipients || 0} destinatarios</span>
                      </div>
                      {comm.sentAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(comm.sentAt).toLocaleString('es-ES')}</span>
                        </div>
                      )}
                    </div>
                    
                    {comm.targetGroup && (
                      <Badge variant="outline">{comm.targetGroup}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Edit className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay templates creados</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsNewTemplateDialogOpen(true)}
                >
                  Crear primer template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getTypeIcon(template.type)}
                        {template.name}
                      </CardTitle>
                      <Badge variant="outline">{template.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                    
                    {template.category && (
                      <Badge variant="secondary">{template.category}</Badge>
                    )}
                    
                    {template.variables && (
                      <div className="text-xs text-gray-500">
                        Variables: {JSON.parse(template.variables).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          {/* Integration Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-8 w-8 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{integrationStatus?.communication.email.provider || 'internal'}</p>
                  </div>
                  <StatusBadge 
                    enabled={integrationStatus?.communication.email.enabled || false}
                    configured={integrationStatus?.communication.email.configured || false}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Phone className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">{integrationStatus?.communication.sms.provider || 'none'}</p>
                  </div>
                  <StatusBadge 
                    enabled={integrationStatus?.communication.sms.enabled || false}
                    configured={integrationStatus?.communication.sms.configured || false}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                  <div className="flex-1">
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">{integrationStatus?.communication.whatsapp.provider || 'none'}</p>
                  </div>
                  <StatusBadge 
                    enabled={integrationStatus?.communication.whatsapp.enabled || false}
                    configured={integrationStatus?.communication.whatsapp.configured || false}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Send Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Envío Masivo Directo
              </CardTitle>
              <CardDescription>
                Envía mensajes masivos usando las integraciones configuradas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bulkService">Servicio</Label>
                  <Select value={bulkService} onValueChange={setBulkService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bulkService === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="bulkSubject">Asunto</Label>
                  <Input
                    id="bulkSubject"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    placeholder="Asunto del mensaje"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bulkRecipients">Destinatarios (uno por línea)</Label>
                <Textarea
                  id="bulkRecipients"
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                  placeholder={bulkService === 'email' 
                    ? 'email1@ejemplo.com\nemail2@ejemplo.com'
                    : '+57300123456\n+57301234567'
                  }
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkMessage">Mensaje</Label>
                <Textarea
                  id="bulkMessage"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <Button 
                onClick={sendBulkMessage}
                disabled={testLoading === 'bulk' || !bulkMessage || !bulkRecipients}
                className="w-full"
              >
                {testLoading === 'bulk' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar a Todos
              </Button>

              {bulkResults && (
                <Alert className={bulkResults.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  <AlertDescription>
                    {bulkResults.success ? (
                      <div className="text-green-700">
                        ✅ Envío completado: {bulkResults.successful}/{bulkResults.total} mensajes enviados
                      </div>
                    ) : (
                      <div className="text-red-700">
                        ❌ Error en envío masivo: {bulkResults.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          {/* Integration Testing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Probar Integraciones
              </CardTitle>
              <CardDescription>
                Envía mensajes de prueba para verificar que las integraciones funcionan correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testService">Servicio</Label>
                  <Select value={testService} onValueChange={setTestService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testRecipient">Destinatario</Label>
                  <Input
                    id="testRecipient"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder={testService === 'email' ? 'email@ejemplo.com' : '+57300123456'}
                  />
                </div>
              </div>

              {testService === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="testSubject">Asunto</Label>
                  <Input
                    id="testSubject"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    placeholder="Asunto del mensaje"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="testMessage">Mensaje</Label>
                <Textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Escribe tu mensaje de prueba aquí..."
                />
              </div>

              <Button 
                onClick={testIntegration}
                disabled={testLoading === testService || !testRecipient || !testMessage}
                className="w-full"
              >
                {testLoading === testService ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Prueba
              </Button>

              {testResults && (
                <Alert className={testResults.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  <AlertDescription>
                    {testResults.success ? (
                      <div className="text-green-700">
                        ✅ Mensaje enviado exitosamente via {testResults.provider}
                        {testResults.messageId && <div className="text-sm mt-1">ID: {testResults.messageId}</div>}
                      </div>
                    ) : (
                      <div className="text-red-700">
                        ❌ Error: {testResults.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configuration Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Guía de Configuración
              </CardTitle>
              <CardDescription>
                Variables de entorno requeridas para habilitar las integraciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mailgun Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Mailgun Email Service
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  MAILGUN_API_KEY="key-xxxxx"<br/>
                  MAILGUN_DOMAIN="mg.tudominio.com"<br/>
                  MAILGUN_FROM_EMAIL="noreply@tudominio.com"<br/>
                  ENABLE_MAILGUN="true"
                </div>
              </div>

              <Separator />

              {/* Twilio Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Twilio SMS/WhatsApp
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  TWILIO_ACCOUNT_SID="ACxxxxx"<br/>
                  TWILIO_AUTH_TOKEN="xxxxx"<br/>
                  TWILIO_PHONE_NUMBER="+1234567890"<br/>
                  ENABLE_TWILIO_SMS="true"
                </div>
              </div>

              <Separator />

              {/* WhatsApp Business Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Business API
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  WHATSAPP_BUSINESS_ACCOUNT_ID="xxxxx"<br/>
                  WHATSAPP_ACCESS_TOKEN="xxxxx"<br/>
                  WHATSAPP_PHONE_NUMBER_ID="xxxxx"<br/>
                  WHATSAPP_WEBHOOK_VERIFY_TOKEN="xxxxx"<br/>
                  ENABLE_WHATSAPP="true"
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
