
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Play,
  Pause,
  Settings,
  Send,
  MessageSquare,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface AutomationRule {
  id: string
  name: string
  description: string
  isActive: boolean
  triggerType: 'approval' | 'time_delay' | 'scheduled' | 'priority'
  triggerConditions: {
    status?: string[]
    priority?: string[]
    category?: string[]
    delayMinutes?: number
    scheduleTime?: string
  }
  actions: Array<{
    type: 'send_message' | 'update_status' | 'assign_tag' | 'create_followup'
    config: any
  }>
  stats: {
    totalRuns: number
    successRuns: number
    lastRun?: string
    avgResponseTime: number
  }
  createdAt: string
  updatedAt: string
}

interface MessageQueue {
  id: string
  prayerRequestId: string
  contactId: string
  messageType: 'email' | 'sms' | 'whatsapp'
  content: {
    subject?: string
    body: string
  }
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'scheduled'
  scheduledAt?: string
  sentAt?: string
  errorMessage?: string
  deliveryConfirmation?: {
    delivered: boolean
    readAt?: string
    responseReceived?: boolean
  }
  automationRuleId?: string
  retryCount: number
  createdAt: string
}

interface MessagingStats {
  totalSent: number
  deliveryRate: number
  responseRate: number
  avgDeliveryTime: number
  messagesByType: {
    email: number
    sms: number
    whatsapp: number
  }
  messagesByStatus: {
    pending: number
    sent: number
    failed: number
  }
  topTemplates: Array<{
    id: string
    name: string
    usageCount: number
    successRate: number
  }>
}

interface AutomationEngineProps {
  onUpdate?: () => void
}

export function AutomationEngine({ onUpdate }: AutomationEngineProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('rules')
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [messageQueue, setMessageQueue] = useState<MessageQueue[]>([])
  const [messagingStats, setMessagingStats] = useState<MessagingStats>({
    totalSent: 0,
    deliveryRate: 0,
    responseRate: 0,
    avgDeliveryTime: 0,
    messagesByType: { email: 0, sms: 0, whatsapp: 0 },
    messagesByStatus: { pending: 0, sent: 0, failed: 0 },
    topTemplates: []
  })
  
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [isTestingRule, setIsTestingRule] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Rule form state
  const [ruleForm, setRuleForm] = useState({
    name: '',
    description: '',
    isActive: true,
    triggerType: 'approval' as 'approval' | 'time_delay' | 'scheduled' | 'priority',
    triggerConditions: {
      status: [] as string[],
      priority: [] as string[],
      category: [] as string[],
      delayMinutes: 120,
      scheduleTime: '09:00'
    },
    actions: [{
      type: 'send_message' as 'send_message' | 'update_status' | 'assign_tag' | 'create_followup',
      config: {
        templateId: '',
        messageType: 'email' as 'email' | 'sms' | 'whatsapp',
        delay: 0
      }
    }]
  })

  useEffect(() => {
    if (session?.user) {
      loadData()
      // Set up real-time updates every 30 seconds
      const interval = setInterval(loadMessageQueue, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadAutomationRules(),
        loadMessageQueue(),
        loadMessagingStats()
      ])
    } catch (error) {
      toast.error('Error al cargar los datos de automatización')
    } finally {
      setLoading(false)
    }
  }

  const loadAutomationRules = async () => {
    try {
      const response = await fetch('/api/automation-rules')
      if (response.ok) {
        const data = await response.json()
        setAutomationRules(data.rules || [])
      }
    } catch (error) {
      console.error('Error loading automation rules:', error)
    }
  }

  const loadMessageQueue = async () => {
    try {
      const response = await fetch('/api/prayer-message-queue')
      if (response.ok) {
        const data = await response.json()
        setMessageQueue(data.messages || [])
      }
    } catch (error) {
      console.error('Error loading message queue:', error)
    }
  }

  const loadMessagingStats = async () => {
    try {
      const response = await fetch('/api/prayer-messaging-stats')
      if (response.ok) {
        const data = await response.json()
        setMessagingStats(data.stats || messagingStats)
      }
    } catch (error) {
      console.error('Error loading messaging stats:', error)
    }
  }

  const openRuleDialog = (rule?: AutomationRule) => {
    if (rule) {
      setSelectedRule(rule)
      setRuleForm({
        name: rule.name,
        description: rule.description,
        isActive: rule.isActive,
        triggerType: rule.triggerType,
        triggerConditions: rule.triggerConditions as any,
        actions: rule.actions
      })
    } else {
      setSelectedRule(null)
      setRuleForm({
        name: '',
        description: '',
        isActive: true,
        triggerType: 'approval',
        triggerConditions: {
          status: [],
          priority: [],
          category: [],
          delayMinutes: 120,
          scheduleTime: '09:00'
        },
        actions: [{
          type: 'send_message',
          config: {
            templateId: '',
            messageType: 'email',
            delay: 0
          }
        }]
      })
    }
    setIsRuleDialogOpen(true)
  }

  const handleSaveRule = async () => {
    if (!ruleForm.name.trim()) {
      toast.error('El nombre de la regla es requerido')
      return
    }

    setSaving(true)
    try {
      const url = selectedRule ? `/api/automation-rules/${selectedRule.id}` : '/api/automation-rules'
      const method = selectedRule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleForm)
      })

      if (response.ok) {
        await loadAutomationRules()
        setIsRuleDialogOpen(false)
        toast.success(selectedRule ? 'Regla actualizada' : 'Regla creada')
        onUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar la regla')
      }
    } catch (error) {
      toast.error('Error al guardar la regla')
    } finally {
      setSaving(false)
    }
  }

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/automation-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        await loadAutomationRules()
        toast.success(`Regla ${isActive ? 'activada' : 'desactivada'}`)
        onUpdate?.()
      }
    } catch (error) {
      toast.error('Error al cambiar el estado de la regla')
    }
  }

  const testAutomationRule = async (ruleId: string) => {
    setIsTestingRule(true)
    try {
      const response = await fetch(`/api/automation-rules/${ruleId}/test`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Prueba completada: ${data.message}`)
        await loadData()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error en la prueba')
      }
    } catch (error) {
      toast.error('Error al ejecutar la prueba')
    } finally {
      setIsTestingRule(false)
    }
  }

  const retryFailedMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/prayer-message-queue/${messageId}/retry`, {
        method: 'POST'
      })

      if (response.ok) {
        await loadMessageQueue()
        toast.success('Mensaje reenviado a la cola')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al reintentar el mensaje')
      }
    } catch (error) {
      toast.error('Error al reintentar el mensaje')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />
      case 'scheduled': return <Calendar className="w-4 h-4 text-purple-600" />
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <Phone className="w-4 h-4" />
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />
      default: return <Send className="w-4 h-4" />
    }
  }

  const getTriggerTypeDisplay = (type: string) => {
    switch (type) {
      case 'approval': return 'Al aprobar petición'
      case 'time_delay': return 'Tiempo diferido'
      case 'scheduled': return 'Programado'
      case 'priority': return 'Por prioridad'
      default: return type
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-600">{trend}</span>
              </div>
            )}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

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
          <h2 className="text-2xl font-bold">Motor de Automatización</h2>
          <p className="text-gray-600">
            Gestiona las reglas de automatización y el envío de mensajes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadData}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => openRuleDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Regla
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Mensajes Enviados"
          value={messagingStats.totalSent}
          subtitle="Total histórico"
          icon={Send}
          color="text-blue-600"
        />
        <StatCard
          title="Tasa de Entrega"
          value={`${messagingStats.deliveryRate}%`}
          subtitle="Mensajes entregados"
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="Tasa de Respuesta"
          value={`${messagingStats.responseRate}%`}
          subtitle="Respuestas recibidas"
          icon={MessageSquare}
          color="text-purple-600"
        />
        <StatCard
          title="Tiempo Promedio"
          value={`${messagingStats.avgDeliveryTime}m`}
          subtitle="Tiempo de entrega"
          icon={Clock}
          color="text-orange-600"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules">
            <Settings className="w-4 h-4 mr-2" />
            Reglas de Automatización
          </TabsTrigger>
          <TabsTrigger value="queue">
            <Send className="w-4 h-4 mr-2" />
            Cola de Mensajes
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Análisis de Mensajería
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Zap className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {automationRules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay reglas de automatización configuradas</p>
                <Button
                  className="mt-4"
                  onClick={() => openRuleDialog()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Regla
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {automationRules.map(rule => (
                <Card key={rule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{rule.name}</h3>
                          <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {rule.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <Badge variant="outline">
                            {getTriggerTypeDisplay(rule.triggerType)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{rule.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Ejecuciones totales</p>
                            <p className="font-medium">{rule.stats.totalRuns}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ejecuciones exitosas</p>
                            <p className="font-medium text-green-600">{rule.stats.successRuns}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tasa de éxito</p>
                            <p className="font-medium">
                              {rule.stats.totalRuns > 0 
                                ? Math.round((rule.stats.successRuns / rule.stats.totalRuns) * 100)
                                : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Última ejecución</p>
                            <p className="font-medium">
                              {rule.stats.lastRun 
                                ? format(new Date(rule.stats.lastRun), 'dd/MM/yy HH:mm')
                                : 'Nunca'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testAutomationRule(rule.id)}
                        disabled={isTestingRule}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Probar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRuleDialog(rule)}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-2xl font-bold">{messagingStats.messagesByStatus.pending}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{messagingStats.messagesByStatus.sent}</p>
                <p className="text-sm text-gray-600">Enviados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <XCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-2xl font-bold">{messagingStats.messagesByStatus.failed}</p>
                <p className="text-sm text-gray-600">Fallidos</p>
              </CardContent>
            </Card>
          </div>

          {messageQueue.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Send className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No hay mensajes en cola</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messageQueue.map(message => (
                <Card key={message.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getMessageTypeIcon(message.messageType)}
                          <span className="font-medium capitalize">{message.messageType}</span>
                          <Badge className={getStatusColor(message.status)}>
                            {getStatusIcon(message.status)}
                            <span className="ml-1 capitalize">{message.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          {message.content.subject && (
                            <p><span className="font-medium">Asunto:</span> {message.content.subject}</p>
                          )}
                          <p><span className="font-medium">Contenido:</span> {message.content.body.substring(0, 100)}...</p>
                          <p><span className="font-medium">Creado:</span> {format(new Date(message.createdAt), "d 'de' MMM, HH:mm", { locale: es })}</p>
                          {message.scheduledAt && (
                            <p><span className="font-medium">Programado:</span> {format(new Date(message.scheduledAt), "d 'de' MMM, HH:mm", { locale: es })}</p>
                          )}
                          {message.sentAt && (
                            <p><span className="font-medium">Enviado:</span> {format(new Date(message.sentAt), "d 'de' MMM, HH:mm", { locale: es })}</p>
                          )}
                          {message.errorMessage && (
                            <p className="text-red-600"><span className="font-medium">Error:</span> {message.errorMessage}</p>
                          )}
                        </div>
                      </div>
                      
                      {message.status === 'failed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => retryFailedMessage(message.id)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Reintentar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mensajes por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email</span>
                  </div>
                  <span className="font-medium">{messagingStats.messagesByType.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>SMS</span>
                  </div>
                  <span className="font-medium">{messagingStats.messagesByType.sms}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span>WhatsApp</span>
                  </div>
                  <span className="font-medium">{messagingStats.messagesByType.whatsapp}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plantillas Más Usadas</CardTitle>
              </CardHeader>
              <CardContent>
                {messagingStats.topTemplates.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No hay datos disponibles</p>
                ) : (
                  <div className="space-y-3">
                    {messagingStats.topTemplates.map((template, index) => (
                      <div key={template.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-sm">{template.name}</span>
                        </div>
                        <Badge variant="outline">{template.usageCount}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{messagingStats.deliveryRate}%</p>
                  <p className="text-sm text-gray-600">Tasa de entrega</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{messagingStats.responseRate}%</p>
                  <p className="text-sm text-gray-600">Tasa de respuesta</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{messagingStats.avgDeliveryTime}m</p>
                  <p className="text-sm text-gray-600">Tiempo promedio</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Mensajería</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                La configuración avanzada de mensajería se implementará en futuras versiones.
                Incluirá configuraciones para proveedores de SMS, WhatsApp Business API, 
                configuraciones SMTP personalizadas y más.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Editar Regla de Automatización' : 'Nueva Regla de Automatización'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre de la regla *</Label>
              <Input
                id="name"
                value={ruleForm.name}
                onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Respuesta automática al aprobar familia"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={ruleForm.description}
                onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe qué hace esta regla de automatización..."
                rows={2}
              />
            </div>

            <div>
              <Label>Tipo de disparador</Label>
              <Select
                value={ruleForm.triggerType}
                onValueChange={(value: any) => setRuleForm(prev => ({ ...prev, triggerType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approval">Al aprobar petición</SelectItem>
                  <SelectItem value="time_delay">Tiempo diferido</SelectItem>
                  <SelectItem value="scheduled">Programado</SelectItem>
                  <SelectItem value="priority">Por prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {ruleForm.triggerType === 'time_delay' && (
              <div>
                <Label>Minutos de retraso</Label>
                <Select
                  value={ruleForm.triggerConditions.delayMinutes?.toString() || '120'}
                  onValueChange={(value) => setRuleForm(prev => ({
                    ...prev,
                    triggerConditions: { ...prev.triggerConditions, delayMinutes: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="360">6 horas</SelectItem>
                    <SelectItem value="720">12 horas</SelectItem>
                    <SelectItem value="1440">24 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {ruleForm.triggerType === 'scheduled' && (
              <div>
                <Label>Hora programada</Label>
                <Input
                  type="time"
                  value={ruleForm.triggerConditions.scheduleTime || '09:00'}
                  onChange={(e) => setRuleForm(prev => ({
                    ...prev,
                    triggerConditions: { ...prev.triggerConditions, scheduleTime: e.target.value }
                  }))}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={ruleForm.isActive}
                onCheckedChange={(checked) => setRuleForm(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Regla activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRuleDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Regla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
