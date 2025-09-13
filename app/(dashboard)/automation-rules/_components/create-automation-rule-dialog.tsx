
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'react-hot-toast'
import { 
  Plus, 
  Trash2, 
  Zap, 
  Target, 
  Play,
  Settings,
  AlertCircle,
  HelpCircle
} from 'lucide-react'

interface CreateAutomationRuleDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface TriggerConfig {
  type: string
  eventSource?: string
  configuration: Record<string, any>
}

interface ConditionConfig {
  type: string
  field: string
  operator: string
  value: any
  logicalOperator: 'AND' | 'OR'
  groupId?: string
  orderIndex: number
}

interface ActionConfig {
  type: string
  configuration: Record<string, any>
  orderIndex: number
  delay: number
}

export function CreateAutomationRuleDialog({ 
  open, 
  onClose, 
  onSuccess 
}: CreateAutomationRuleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  
  // Basic rule info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(0)
  const [executeOnce, setExecuteOnce] = useState(false)
  const [maxExecutions, setMaxExecutions] = useState<number | undefined>()
  
  // Rule components
  const [triggers, setTriggers] = useState<TriggerConfig[]>([])
  const [conditions, setConditions] = useState<ConditionConfig[]>([])
  const [actions, setActions] = useState<ActionConfig[]>([])

  const resetForm = () => {
    setCurrentStep(1)
    setName('')
    setDescription('')
    setPriority(0)
    setExecuteOnce(false)
    setMaxExecutions(undefined)
    setTriggers([])
    setConditions([])
    setActions([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const addTrigger = () => {
    setTriggers([...triggers, {
      type: '',
      configuration: {}
    }])
  }

  const updateTrigger = (index: number, field: keyof TriggerConfig, value: any) => {
    const newTriggers = [...triggers]
    newTriggers[index] = { ...newTriggers[index], [field]: value }
    setTriggers(newTriggers)
  }

  const removeTrigger = (index: number) => {
    setTriggers(triggers.filter((_, i) => i !== index))
  }

  const addCondition = () => {
    setConditions([...conditions, {
      type: 'EQUALS',
      field: '',
      operator: '=',
      value: '',
      logicalOperator: 'AND',
      orderIndex: conditions.length
    }])
  }

  const updateCondition = (index: number, field: keyof ConditionConfig, value: any) => {
    const newConditions = [...conditions]
    newConditions[index] = { ...newConditions[index], [field]: value }
    setConditions(newConditions)
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const addAction = () => {
    setActions([...actions, {
      type: '',
      configuration: {},
      orderIndex: actions.length,
      delay: 0
    }])
  }

  const updateAction = (index: number, field: keyof ActionConfig, value: any) => {
    const newActions = [...actions]
    newActions[index] = { ...newActions[index], [field]: value }
    setActions(newActions)
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (triggers.length === 0) {
      toast.error('Al menos un trigger es requerido')
      return
    }

    if (actions.length === 0) {
      toast.error('Al menos una acción es requerida')
      return
    }

    // Validate triggers
    for (const trigger of triggers) {
      if (!trigger.type) {
        toast.error('Todos los triggers deben tener un tipo')
        return
      }
    }

    // Validate actions
    for (const action of actions) {
      if (!action.type) {
        toast.error('Todas las acciones deben tener un tipo')
        return
      }
    }

    setLoading(true)
    try {
      const response = await fetch('/api/automation-rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          priority,
          executeOnce,
          maxExecutions,
          triggers,
          conditions,
          actions
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear la regla')
      }

      toast.success('Regla de automatización creada exitosamente')
      onSuccess()
      handleClose()

    } catch (error) {
      console.error('Error creating automation rule:', error)
      toast.error(error instanceof Error ? error.message : 'Error al crear la regla')
    } finally {
      setLoading(false)
    }
  }

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'MEMBER_JOINED': 'Nuevo Miembro',
      'DONATION_RECEIVED': 'Donación Recibida',
      'EVENT_CREATED': 'Evento Creado',
      'BIRTHDAY': 'Cumpleaños',
      'ANNIVERSARY': 'Aniversario',
      'SERMON_PUBLISHED': 'Sermón Publicado',
      'ATTENDANCE_RECORDED': 'Asistencia Registrada'
    }
    return labels[type] || type
  }

  const getActionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'SEND_NOTIFICATION': 'Enviar Notificación',
      'SEND_EMAIL': 'Enviar Email',
      'SEND_PUSH': 'Enviar Push Notification',
      'CREATE_FOLLOW_UP': 'Crear Seguimiento'
    }
    return labels[type] || type
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Nueva Regla de Automatización
          </DialogTitle>
          <DialogDescription>
            Crea una regla que se ejecute automáticamente cuando ocurran eventos específicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <Tabs value={currentStep.toString()} className="space-y-6">
            <TabsList className="hidden" />
            
            {/* Step 1: Basic Info */}
            <TabsContent value="1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>
                    Configura los detalles básicos de tu regla de automatización
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre de la Regla *</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej: Bienvenida nuevos miembros"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select value={priority.toString()} onValueChange={(value) => setPriority(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Baja (0)</SelectItem>
                          <SelectItem value="25">Normal (25)</SelectItem>
                          <SelectItem value="50">Media (50)</SelectItem>
                          <SelectItem value="75">Alta (75)</SelectItem>
                          <SelectItem value="100">Urgente (100)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe qué hace esta regla..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="executeOnce"
                        checked={executeOnce}
                        onCheckedChange={(checked) => setExecuteOnce(checked as boolean)}
                      />
                      <Label htmlFor="executeOnce">Ejecutar solo una vez por entidad</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxExecutions">Máximo de Ejecuciones (opcional)</Label>
                    <Input
                      id="maxExecutions"
                      type="number"
                      value={maxExecutions || ''}
                      onChange={(e) => setMaxExecutions(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Sin límite"
                      min="1"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Triggers */}
            <TabsContent value="2" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Triggers
                      </CardTitle>
                      <CardDescription>
                        Define qué eventos dispararán esta regla
                      </CardDescription>
                    </div>
                    <Button onClick={addTrigger} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Trigger
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {triggers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No has configurado ningún trigger</p>
                      <p className="text-sm">Agrega al menos un trigger para continuar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {triggers.map((trigger, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-4">
                                <div>
                                  <Label>Tipo de Evento *</Label>
                                  <Select
                                    value={trigger.type}
                                    onValueChange={(value) => updateTrigger(index, 'type', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar evento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="MEMBER_JOINED">Nuevo Miembro</SelectItem>
                                      <SelectItem value="DONATION_RECEIVED">Donación Recibida</SelectItem>
                                      <SelectItem value="EVENT_CREATED">Evento Creado</SelectItem>
                                      <SelectItem value="BIRTHDAY">Cumpleaños</SelectItem>
                                      <SelectItem value="ANNIVERSARY">Aniversario</SelectItem>
                                      <SelectItem value="SERMON_PUBLISHED">Sermón Publicado</SelectItem>
                                      <SelectItem value="ATTENDANCE_RECORDED">Asistencia Registrada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeTrigger(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Conditions (Optional) */}
            <TabsContent value="3" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Condiciones (Opcional)
                      </CardTitle>
                      <CardDescription>
                        Agrega condiciones para hacer la regla más específica
                      </CardDescription>
                    </div>
                    <Button onClick={addCondition} size="sm" variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Condición
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {conditions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No has configurado condiciones</p>
                      <p className="text-sm">Las condiciones son opcionales pero pueden hacer más específica tu regla</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conditions.map((condition, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <Label>Campo</Label>
                                  <Input
                                    value={condition.field}
                                    onChange={(e) => updateCondition(index, 'field', e.target.value)}
                                    placeholder="Ej: data.amount"
                                  />
                                </div>
                                <div>
                                  <Label>Operador</Label>
                                  <Select
                                    value={condition.type}
                                    onValueChange={(value) => updateCondition(index, 'type', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EQUALS">Igual a</SelectItem>
                                      <SelectItem value="NOT_EQUALS">No igual a</SelectItem>
                                      <SelectItem value="GREATER_THAN">Mayor que</SelectItem>
                                      <SelectItem value="LESS_THAN">Menor que</SelectItem>
                                      <SelectItem value="CONTAINS">Contiene</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Valor</Label>
                                  <Input
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                    placeholder="Valor a comparar"
                                  />
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeCondition(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Actions */}
            <TabsContent value="4" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Acciones
                      </CardTitle>
                      <CardDescription>
                        Define qué acciones se ejecutarán cuando se dispare la regla
                      </CardDescription>
                    </div>
                    <Button onClick={addAction} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar Acción
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {actions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No has configurado ninguna acción</p>
                      <p className="text-sm">Agrega al menos una acción para continuar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {actions.map((action, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label>Tipo de Acción *</Label>
                                    <Select
                                      value={action.type}
                                      onValueChange={(value) => updateAction(index, 'type', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar acción" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="SEND_NOTIFICATION">Enviar Notificación</SelectItem>
                                        <SelectItem value="SEND_EMAIL">Enviar Email</SelectItem>
                                        <SelectItem value="SEND_PUSH">Enviar Push Notification</SelectItem>
                                        <SelectItem value="CREATE_FOLLOW_UP">Crear Seguimiento</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label>Retraso (segundos)</Label>
                                    <Input
                                      type="number"
                                      value={action.delay}
                                      onChange={(e) => updateAction(index, 'delay', parseInt(e.target.value) || 0)}
                                      min="0"
                                    />
                                  </div>
                                </div>

                                {/* Action Configuration */}
                                {action.type === 'SEND_NOTIFICATION' && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Título</Label>
                                      <Input
                                        value={action.configuration.title || ''}
                                        onChange={(e) => updateAction(index, 'configuration', {
                                          ...action.configuration,
                                          title: e.target.value
                                        })}
                                        placeholder="Título de la notificación"
                                      />
                                    </div>
                                    <div>
                                      <Label>Mensaje</Label>
                                      <Input
                                        value={action.configuration.message || ''}
                                        onChange={(e) => updateAction(index, 'configuration', {
                                          ...action.configuration,
                                          message: e.target.value
                                        })}
                                        placeholder="Mensaje de la notificación"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Push Notification Configuration */}
                                {action.type === 'SEND_PUSH' && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>Título</Label>
                                        <Input
                                          value={action.configuration.title || ''}
                                          onChange={(e) => updateAction(index, 'configuration', {
                                            ...action.configuration,
                                            title: e.target.value
                                          })}
                                          placeholder="Título de la push notification"
                                        />
                                      </div>
                                      <div>
                                        <Label>Mensaje</Label>
                                        <Input
                                          value={action.configuration.body || action.configuration.message || ''}
                                          onChange={(e) => updateAction(index, 'configuration', {
                                            ...action.configuration,
                                            body: e.target.value,
                                            message: e.target.value
                                          })}
                                          placeholder="Mensaje de la push notification"
                                        />
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <Label>URL de Destino</Label>
                                        <Input
                                          value={action.configuration.url || ''}
                                          onChange={(e) => updateAction(index, 'configuration', {
                                            ...action.configuration,
                                            url: e.target.value
                                          })}
                                          placeholder="/dashboard"
                                        />
                                      </div>
                                      <div>
                                        <Label>Destinatario</Label>
                                        <Select
                                          value={action.configuration.target || 'church'}
                                          onValueChange={(value) => updateAction(index, 'configuration', {
                                            ...action.configuration,
                                            target: value
                                          })}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="church">Toda la Iglesia</SelectItem>
                                            <SelectItem value="admins">Administradores</SelectItem>
                                            <SelectItem value="pastors">Pastores</SelectItem>
                                            <SelectItem value="leaders">Líderes</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeAction(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Paso {currentStep} de 4
              </span>
            </div>

            {currentStep < 4 ? (
              <Button
                onClick={() => {
                  // Validation for each step
                  if (currentStep === 1 && !name.trim()) {
                    toast.error('El nombre es requerido')
                    return
                  }
                  if (currentStep === 2 && triggers.length === 0) {
                    toast.error('Al menos un trigger es requerido')
                    return
                  }
                  if (currentStep === 4 && actions.length === 0) {
                    toast.error('Al menos una acción es requerida')
                    return
                  }
                  
                  setCurrentStep(currentStep + 1)
                }}
              >
                Siguiente
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creando...' : 'Crear Regla'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
