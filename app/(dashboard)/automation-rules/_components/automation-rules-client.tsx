
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { 
  Zap, 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Settings,
  FileText,
  TestTube
} from 'lucide-react'
import { CreateAutomationRuleDialog } from './create-automation-rule-dialog'
import { AutomationRulesList } from './automation-rules-list'
import { AutomationTemplates } from './automation-templates'
import { AutomationStats } from './automation-stats'

interface AutomationRule {
  id: string
  name: string
  description: string | null
  isActive: boolean
  priority: number
  executeOnce: boolean
  maxExecutions: number | null
  executionCount: number
  lastExecuted: string | null
  createdAt: string
  updatedAt: string
  triggers: Array<{
    id: string
    type: string
    eventSource: string | null
    configuration: any
  }>
  conditions: Array<{
    id: string
    type: string
    field: string
    operator: string
    value: any
    logicalOperator: string
  }>
  actions: Array<{
    id: string
    type: string
    configuration: any
    orderIndex: number
    delay: number
  }>
  creator: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    executions: number
  }
}

interface AutomationRulesResponse {
  automationRules: AutomationRule[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export function AutomationRulesClient() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [triggerTypeFilter, setTriggerTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)

  useEffect(() => {
    if (session?.user?.role && ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
      fetchAutomationRules()
    }
  }, [session, pagination.page, statusFilter, triggerTypeFilter, sortBy, sortOrder])

  const fetchAutomationRules = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder
      })
      
      if (statusFilter !== 'all') {
        params.append('isActive', statusFilter)
      }
      
      if (triggerTypeFilter !== 'all') {
        params.append('triggerType', triggerTypeFilter)
      }
      
      const response = await fetch(`/api/automation-rules?${params}`)
      if (!response.ok) throw new Error('Error al cargar reglas de automatización')
      
      const data: AutomationRulesResponse = await response.json()
      setAutomationRules(data.automationRules)
      setPagination(data.pagination)
      
    } catch (error) {
      console.error('Error fetching automation rules:', error)
      toast.error('Error al cargar las reglas de automatización')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const response = await fetch(`/api/automation-rules/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !rule.isActive
        })
      })

      if (!response.ok) throw new Error('Error al actualizar regla')

      toast.success(`Regla ${rule.isActive ? 'desactivada' : 'activada'} exitosamente`)
      fetchAutomationRules()

    } catch (error) {
      console.error('Error toggling rule:', error)
      toast.error('Error al actualizar la regla')
    }
  }

  const handleDeleteRule = async (rule: AutomationRule) => {
    if (!window.confirm(`¿Estás seguro de eliminar la regla "${rule.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/automation-rules/${rule.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar regla')

      toast.success('Regla eliminada exitosamente')
      fetchAutomationRules()

    } catch (error) {
      console.error('Error deleting rule:', error)
      toast.error('Error al eliminar la regla')
    }
  }

  const handleTestRule = async (rule: AutomationRule) => {
    try {
      const response = await fetch(`/api/automation-rules/${rule.id}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: {},
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Prueba ejecutada exitosamente')
      } else {
        toast.error(`Error en prueba: ${result.message}`)
      }

    } catch (error) {
      console.error('Error testing rule:', error)
      toast.error('Error al probar la regla')
    }
  }

  const filteredRules = automationRules.filter(rule => 
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Access control
  if (!session?.user?.role || !['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(session.user.role)) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              Solo los administradores pueden gestionar las reglas de automatización.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Reglas de Automatización
          </h1>
          <p className="text-muted-foreground mt-2">
            Crea notificaciones automáticas basadas en eventos de la iglesia
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Regla
        </Button>
      </div>

      {/* Stats Overview */}
      <AutomationStats />

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Reglas Activas
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Plantillas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar reglas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Activos</SelectItem>
                    <SelectItem value="false">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={triggerTypeFilter} onValueChange={setTriggerTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Triggers</SelectItem>
                    <SelectItem value="MEMBER_JOINED">Nuevo Miembro</SelectItem>
                    <SelectItem value="DONATION_RECEIVED">Donación</SelectItem>
                    <SelectItem value="EVENT_CREATED">Evento Creado</SelectItem>
                    <SelectItem value="BIRTHDAY">Cumpleaños</SelectItem>
                    <SelectItem value="ANNIVERSARY">Aniversario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Automation Rules List */}
          <AutomationRulesList
            rules={filteredRules}
            loading={loading}
            onToggle={handleToggleRule}
            onDelete={handleDeleteRule}
            onTest={handleTestRule}
            onEdit={setSelectedRule}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <AutomationTemplates
            onSelectTemplate={(template) => {
              setShowCreateDialog(true)
              // Pass template data to create dialog
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ejecuciones por Día</CardTitle>
                <CardDescription>
                  Actividad de automatización en los últimos 30 días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mr-2" />
                  Gráfico de tendencias (próximamente)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Triggers Más Utilizados</CardTitle>
                <CardDescription>
                  Los eventos que más automatizaciones disparan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'MEMBER_JOINED', count: 45, percentage: 35 },
                    { type: 'DONATION_RECEIVED', count: 32, percentage: 25 },
                    { type: 'EVENT_CREATED', count: 28, percentage: 22 },
                    { type: 'BIRTHDAY', count: 23, percentage: 18 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <span className="text-sm">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <div className="w-20 h-2 bg-muted rounded">
                          <div 
                            className="h-full bg-primary rounded" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Rule Dialog */}
      <CreateAutomationRuleDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false)
          fetchAutomationRules()
        }}
      />
    </div>
  )
}
