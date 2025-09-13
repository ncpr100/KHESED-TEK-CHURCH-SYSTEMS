
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Eye,
  TestTube,
  Calendar,
  Zap,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

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

interface AutomationRulesListProps {
  rules: AutomationRule[]
  loading: boolean
  onToggle: (rule: AutomationRule) => void
  onDelete: (rule: AutomationRule) => void
  onTest: (rule: AutomationRule) => void
  onEdit: (rule: AutomationRule) => void
}

export function AutomationRulesList({
  rules,
  loading,
  onToggle,
  onDelete,
  onTest,
  onEdit
}: AutomationRulesListProps) {

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'MEMBER_JOINED': 'Nuevo Miembro',
      'DONATION_RECEIVED': 'Donación Recibida',
      'EVENT_CREATED': 'Evento Creado',
      'EVENT_UPDATED': 'Evento Actualizado',
      'ATTENDANCE_RECORDED': 'Asistencia Registrada',
      'VOLUNTEER_ASSIGNED': 'Voluntario Asignado',
      'BIRTHDAY': 'Cumpleaños',
      'ANNIVERSARY': 'Aniversario',
      'SERMON_PUBLISHED': 'Sermón Publicado',
      'COMMUNICATION_SENT': 'Comunicación Enviada',
      'FOLLOW_UP_DUE': 'Seguimiento Vencido',
      'CUSTOM_EVENT': 'Evento Personalizado'
    }
    return labels[type] || type
  }

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SEND_NOTIFICATION': 'Notificación',
      'SEND_EMAIL': 'Email',
      'SEND_SMS': 'SMS',
      'CREATE_FOLLOW_UP': 'Crear Seguimiento',
      'ASSIGN_VOLUNTEER': 'Asignar Voluntario',
      'UPDATE_MEMBER': 'Actualizar Miembro',
      'CREATE_EVENT': 'Crear Evento',
      'CUSTOM_WEBHOOK': 'Webhook'
    }
    return labels[type] || type
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'destructive'
    if (priority >= 60) return 'default' 
    if (priority >= 40) return 'secondary'
    return 'outline'
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 80) return 'Urgente'
    if (priority >= 60) return 'Alta'
    if (priority >= 40) return 'Media'
    return 'Baja'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (rules.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay reglas de automatización</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primera regla para automatizar las notificaciones de tu iglesia.
            </p>
            <Button variant="outline">
              Crear Primera Regla
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {rules.map((rule) => (
        <Card key={rule.id} className={`transition-all ${rule.isActive ? 'border-primary/20' : 'border-muted'}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {rule.isActive ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold text-lg">{rule.name}</h3>
                  </div>
                  
                  <Badge variant={getPriorityColor(rule.priority)}>
                    {getPriorityLabel(rule.priority)}
                  </Badge>
                  
                  {rule.executeOnce && (
                    <Badge variant="outline">Una vez</Badge>
                  )}
                </div>

                {/* Description */}
                {rule.description && (
                  <p className="text-muted-foreground">{rule.description}</p>
                )}

                {/* Rule Components */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Triggers */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      Triggers ({rule.triggers.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {rule.triggers.slice(0, 2).map((trigger) => (
                        <Badge key={trigger.id} variant="secondary" className="text-xs">
                          {getTriggerTypeLabel(trigger.type)}
                        </Badge>
                      ))}
                      {rule.triggers.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{rule.triggers.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Condiciones ({rule.conditions.length})
                    </div>
                    {rule.conditions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {rule.conditions.slice(0, 2).map((condition, index) => (
                          <Badge key={condition.id} variant="outline" className="text-xs">
                            {condition.field}
                          </Badge>
                        ))}
                        {rule.conditions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{rule.conditions.length - 2} más
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Sin condiciones</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Target className="h-4 w-4" />
                      Acciones ({rule.actions.length})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {rule.actions.slice(0, 2).map((action) => (
                        <Badge key={action.id} variant="default" className="text-xs">
                          {getActionTypeLabel(action.type)}
                        </Badge>
                      ))}
                      {rule.actions.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{rule.actions.length - 2} más
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ejecutada {rule.executionCount} veces
                    </span>
                  </div>
                  {rule.lastExecuted && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Última: {formatDistanceToNow(new Date(rule.lastExecuted), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>
                      por {rule.creator.name || rule.creator.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onTest(rule)}
                  className="gap-1"
                  title="Probar regla"
                >
                  <TestTube className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(rule)}
                  className="gap-1"
                  title="Editar regla"
                >
                  <Edit className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant={rule.isActive ? "destructive" : "default"}
                  onClick={() => onToggle(rule)}
                  className="gap-1"
                  title={rule.isActive ? "Desactivar" : "Activar"}
                >
                  {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(rule)}
                  className="gap-1 text-destructive hover:text-destructive"
                  title="Eliminar regla"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Execution Limits Warning */}
            {rule.maxExecutions && rule.executionCount >= rule.maxExecutions * 0.8 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Esta regla ha usado {rule.executionCount} de {rule.maxExecutions} ejecuciones permitidas.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
