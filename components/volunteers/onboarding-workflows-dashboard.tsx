

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  PlayCircle, 
  Users, 
  Clock, 
  CheckCircle,
  Star,
  Loader2,
  BookOpen,
  UserPlus,
  Calendar,
  Eye,
  Edit,
  Pause,
  RotateCcw,
  Send,
  Award,
  Target
} from 'lucide-react'
import { toast } from 'sonner'

interface OnboardingWorkflowsDashboardProps {
  churchId: string
  userRole: string
}

interface OnboardingWorkflow {
  id: string
  memberId: string
  memberName: string
  memberEmail?: string
  targetMinistryId: string
  targetMinistryName: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED'
  priority: string
  matchScore: number
  createdAt: Date
  updatedAt: Date
  estimatedCompletion?: Date
}

interface WorkflowStep {
  id: string
  title: string
  description: string
  stepType: 'ASSESSMENT' | 'TRAINING' | 'ORIENTATION' | 'MENTORSHIP' | 'EXPERIENCE' | 'DOCUMENTATION'
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'FAILED'
  estimatedDuration: string
  actualDuration?: string
  resources: any[]
  completedAt?: Date
  notes?: string
  autoAdvance: boolean
}

export function OnboardingWorkflowsDashboard({ churchId, userRole }: OnboardingWorkflowsDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<OnboardingWorkflow | null>(null)
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createWorkflowData, setCreateWorkflowData] = useState({
    memberId: '',
    targetMinistryId: '',
    assignMentor: true,
    autoStart: true
  })

  // Fetch existing workflows
  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recruitment-pipeline/onboarding-workflows')
      if (!response.ok) throw new Error('Failed to fetch workflows')
      
      const data = await response.json()
      setWorkflows(data.workflows || [])
      setSummary(data.summary)
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast.error('Error al obtener workflows de onboarding')
    } finally {
      setLoading(false)
    }
  }

  // Create new workflow
  const createWorkflow = async () => {
    try {
      setLoading(true)
      toast.info('🚀 Creando workflow de onboarding...')
      
      const response = await fetch('/api/recruitment-pipeline/onboarding-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createWorkflowData)
      })

      if (!response.ok) throw new Error('Failed to create workflow')
      
      const data = await response.json()
      
      toast.success(`✅ Workflow creado: ${data.workflow.totalSteps} pasos programados`)
      setIsCreateDialogOpen(false)
      setCreateWorkflowData({
        memberId: '',
        targetMinistryId: '',
        assignMentor: true,
        autoStart: true
      })
      fetchWorkflows() // Refresh list
      
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Error al crear workflow')
    } finally {
      setLoading(false)
    }
  }

  // Update workflow status
  const updateWorkflowStatus = async (workflowId: string, newStatus: string) => {
    try {
      toast.info(`Actualizando estado del workflow...`)
      
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the update
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: newStatus as any, updatedAt: new Date() }
          : w
      ))
      
      toast.success(`Estado actualizado a ${newStatus}`)
      
    } catch (error) {
      console.error('Error updating workflow:', error)
      toast.error('Error al actualizar workflow')
    }
  }

  // View workflow details
  const viewWorkflowDetails = async (workflow: OnboardingWorkflow) => {
    setSelectedWorkflow(workflow)
    
    // Generate sample workflow steps for demonstration
    const sampleSteps: WorkflowStep[] = [
      {
        id: 'welcome',
        title: 'Bienvenida y Orientación',
        description: 'Introducción al ministerio y expectativas generales',
        stepType: 'ORIENTATION',
        status: 'COMPLETED',
        estimatedDuration: '1 hora',
        actualDuration: '45 minutos',
        resources: [],
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        autoAdvance: true
      },
      {
        id: 'assessment',
        title: 'Evaluación de Dones Espirituales',
        description: 'Completar cuestionario de dones espirituales',
        stepType: 'ASSESSMENT',
        status: 'IN_PROGRESS',
        estimatedDuration: '30 minutos',
        resources: [],
        autoAdvance: false
      },
      {
        id: 'training',
        title: 'Capacitación Específica',
        description: `Entrenamiento específico para ${workflow.targetMinistryName}`,
        stepType: 'TRAINING',
        status: 'PENDING',
        estimatedDuration: '2-3 horas',
        resources: [],
        autoAdvance: false
      },
      {
        id: 'mentorship',
        title: 'Asignación de Mentor',
        description: 'Emparejamiento con mentor experimentado',
        stepType: 'MENTORSHIP',
        status: 'PENDING',
        estimatedDuration: '30 minutos',
        resources: [],
        autoAdvance: true
      },
      {
        id: 'experience',
        title: 'Experiencia Práctica',
        description: 'Participación supervisada en actividades del ministerio',
        stepType: 'EXPERIENCE',
        status: 'PENDING',
        estimatedDuration: '2-4 semanas',
        resources: [],
        autoAdvance: false
      }
    ]
    
    setWorkflowSteps(sampleSteps)
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      case 'PAUSED': return 'bg-yellow-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'NOT_STARTED': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'PAUSED': return 'outline'
      case 'CANCELLED': return 'destructive'
      case 'NOT_STARTED': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'ASSESSMENT': return <Target className="h-4 w-4 text-blue-500" />
      case 'TRAINING': return <BookOpen className="h-4 w-4 text-green-500" />
      case 'ORIENTATION': return <Users className="h-4 w-4 text-purple-500" />
      case 'MENTORSHIP': return <UserPlus className="h-4 w-4 text-orange-500" />
      case 'EXPERIENCE': return <Star className="h-4 w-4 text-yellow-500" />
      case 'DOCUMENTATION': return <Award className="h-4 w-4 text-gray-500" />
      default: return <CheckCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS': return <PlayCircle className="h-4 w-4 text-blue-500" />
      case 'FAILED': return <RotateCcw className="h-4 w-4 text-red-500" />
      case 'SKIPPED': return <Eye className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-green-600" />
            Workflows de Onboarding
          </h2>
          <p className="text-muted-foreground">
            Gestiona procesos personalizados de integración de voluntarios
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
              <PlayCircle className="h-4 w-4 mr-2" />
              Crear Workflow
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Workflow de Onboarding</DialogTitle>
              <DialogDescription>
                Configure un proceso personalizado de integración para un voluntario
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="memberId">ID del Miembro</Label>
                <Input
                  id="memberId"
                  placeholder="Ingrese el ID del miembro"
                  value={createWorkflowData.memberId}
                  onChange={(e) => setCreateWorkflowData(prev => ({ ...prev, memberId: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="targetMinistry">Ministerio Objetivo</Label>
                <Input
                  id="targetMinistry"
                  placeholder="Ingrese el ID del ministerio"
                  value={createWorkflowData.targetMinistryId}
                  onChange={(e) => setCreateWorkflowData(prev => ({ ...prev, targetMinistryId: e.target.value }))}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="assignMentor"
                    checked={createWorkflowData.assignMentor}
                    onChange={(e) => setCreateWorkflowData(prev => ({ ...prev, assignMentor: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="assignMentor">Asignar mentor automáticamente</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoStart"
                    checked={createWorkflowData.autoStart}
                    onChange={(e) => setCreateWorkflowData(prev => ({ ...prev, autoStart: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="autoStart">Iniciar workflow automáticamente</Label>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button onClick={createWorkflow} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                  Crear Workflow
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <PlayCircle className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.total}</p>
                  <p className="text-xs text-muted-foreground">Total Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.inProgress}</p>
                  <p className="text-xs text-muted-foreground">En Progreso</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.completed}</p>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="workflows">
            Workflows Activos ({workflows.length})
          </TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado General</CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Tasa de Finalización</span>
                        <span className="text-sm font-medium">
                          {Math.round((summary.completed / summary.total) * 100)}%
                        </span>
                      </div>
                      <Progress value={(summary.completed / summary.total) * 100} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{summary.inProgress}</p>
                        <p className="text-xs text-muted-foreground">En Progreso</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
                        <p className="text-xs text-muted-foreground">Completados</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sin Workflows</h3>
                    <p className="text-gray-600 mb-4">
                      Cree su primer workflow de onboarding para comenzar
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Crear Primer Workflow
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Crear Nuevo Workflow
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!summary || summary.inProgress === 0}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Revisar Workflows Pendientes ({summary?.inProgress || 0})
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Gestionar Plantillas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {workflows.length === 0 ? (
              <Alert>
                <PlayCircle className="h-4 w-4" />
                <AlertTitle>Sin Workflows</AlertTitle>
                <AlertDescription>
                  No hay workflows de onboarding creados. Comience creando su primer workflow.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <Card key={workflow.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`}
                          />
                          {workflow.memberName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(workflow.status) as any}>
                            {workflow.status}
                          </Badge>
                          <Badge variant="outline">
                            {workflow.priority}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {workflow.matchScore}/100
                          </span>
                        </div>
                      </div>
                      <CardDescription>
                        {workflow.targetMinistryName} • Creado {new Date(workflow.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Email:</span> {workflow.memberEmail || 'No disponible'}
                          </div>
                          <div>
                            <span className="font-medium">Última actualización:</span> {new Date(workflow.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {workflow.estimatedCompletion && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              Finalización estimada: {new Date(workflow.estimatedCompletion).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => viewWorkflowDetails(workflow)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Button>
                          
                          {workflow.status === 'IN_PROGRESS' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateWorkflowStatus(workflow.id, 'PAUSED')}
                            >
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </Button>
                          )}
                          
                          {workflow.status === 'PAUSED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateWorkflowStatus(workflow.id, 'IN_PROGRESS')}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Reanudar
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Workflow Details Modal */}
          {selectedWorkflow && (
            <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Workflow: {selectedWorkflow.memberName}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedWorkflow.targetMinistryName} • {selectedWorkflow.status}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Progreso General</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Pasos Completados</span>
                          <span className="text-sm font-medium">
                            {workflowSteps.filter(s => s.status === 'COMPLETED').length}/{workflowSteps.length}
                          </span>
                        </div>
                        <Progress 
                          value={(workflowSteps.filter(s => s.status === 'COMPLETED').length / workflowSteps.length) * 100}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Workflow Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Pasos del Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {workflowSteps.map((step, index) => (
                          <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-muted">
                                <span className="text-sm font-medium">{index + 1}</span>
                              </div>
                              {index < workflowSteps.length - 1 && (
                                <div className="w-px h-16 bg-border" />
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getStepIcon(step.stepType)}
                                  <h4 className="font-medium">{step.title}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStepStatusIcon(step.status)}
                                  <Badge 
                                    variant={step.status === 'COMPLETED' ? 'default' : step.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}
                                  >
                                    {step.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">{step.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.actualDuration || step.estimatedDuration}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {step.stepType}
                                </Badge>
                                {step.autoAdvance && (
                                  <Badge variant="outline" className="text-xs">
                                    AUTO
                                  </Badge>
                                )}
                              </div>
                              
                              {step.completedAt && (
                                <div className="text-xs text-green-600">
                                  Completado el {step.completedAt.toLocaleDateString()}
                                </div>
                              )}
                              
                              {step.notes && (
                                <div className="text-xs bg-muted p-2 rounded">
                                  <strong>Notas:</strong> {step.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Workflow</CardTitle>
              <CardDescription>
                Plantillas predefinidas para diferentes tipos de ministerios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Ministerio General
                    </CardTitle>
                    <CardDescription>
                      Workflow estándar para ministerios generales
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Orientación inicial (1 hora)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Evaluación de dones (30 min)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Capacitación básica (2 horas)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Período de prueba (4 semanas)</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Usar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-green-500" />
                      Ministerio de Niños
                    </CardTitle>
                    <CardDescription>
                      Workflow especializado para trabajo con niños
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Verificación de antecedentes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Capacitación en seguridad</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Curso de desarrollo infantil</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Período de observación (6 semanas)</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Usar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Liderazgo
                    </CardTitle>
                    <CardDescription>
                      Workflow para desarrollo de líderes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Evaluación de liderazgo 360°</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Curso de liderazgo (8 semanas)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Mentoría con líder senior</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>Proyecto de liderazgo (12 semanas)</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        Usar Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      Personalizado
                    </CardTitle>
                    <CardDescription>
                      Crear plantilla personalizada
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Configure un workflow personalizado según las necesidades específicas de su ministerio
                      </p>
                      <Button size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Crear Plantilla
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
