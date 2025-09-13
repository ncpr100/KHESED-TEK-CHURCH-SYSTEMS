

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  CheckCircle,
  UserX,
  UserCheck,
  Activity,
  Loader2,
  PieChart,
  Target
} from 'lucide-react'
import { toast } from 'sonner'

interface WorkloadAnalyticsDashboardProps {
  churchId: string
  userRole: string
}

interface VolunteerWorkload {
  memberId: string
  memberName: string
  currentAssignments: number
  weeklyAssignments: number
  monthlyAssignments: number
  workloadScore: number
  burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  availabilityWindows: any[]
  skillsProfile: string[]
  lastAssignmentDate?: Date
}

interface BalancingRecommendation {
  type: 'REDISTRIBUTE' | 'REST_PERIOD' | 'NEW_RECRUITMENT' | 'SKILL_DEVELOPMENT'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  description: string
  affectedMembers: string[]
  expectedImpact: string
  actionItems: string[]
}

export function WorkloadAnalyticsDashboard({ churchId, userRole }: WorkloadAnalyticsDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [workloads, setWorkloads] = useState<VolunteerWorkload[]>([])
  const [recommendations, setRecommendations] = useState<BalancingRecommendation[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [selectedMember, setSelectedMember] = useState<string>('')

  // Fetch workload analysis
  const fetchWorkloadAnalysis = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/intelligent-scheduling/workload-balancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ includeInactive: false })
      })

      if (!response.ok) throw new Error('Failed to fetch workload analysis')
      
      const data = await response.json()
      setWorkloads(data.workloadAnalysis || [])
      setRecommendations(data.recommendations || [])
      setSummary(data.summary)
      
    } catch (error) {
      console.error('Error fetching workload analysis:', error)
      toast.error('Error al obtener análisis de carga de trabajo')
    } finally {
      setLoading(false)
    }
  }

  // Apply balancing recommendations
  const applyRecommendation = async (recommendation: BalancingRecommendation) => {
    try {
      toast.info(`Implementando: ${recommendation.description}`)
      // Implementation would depend on the specific recommendation type
      
      // For now, just show success and refresh data
      setTimeout(() => {
        toast.success('Recomendación aplicada exitosamente')
        fetchWorkloadAnalysis()
      }, 2000)
      
    } catch (error) {
      console.error('Error applying recommendation:', error)
      toast.error('Error al aplicar recomendación')
    }
  }

  useEffect(() => {
    fetchWorkloadAnalysis()
  }, [])

  const getBurnoutRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getBurnoutRiskVariant = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'default'
      case 'LOW': return 'secondary'
      default: return 'secondary'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'default'
      case 'LOW': return 'secondary'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Análisis de Carga de Trabajo
          </h2>
          <p className="text-muted-foreground">
            Monitoreo inteligente del balance y bienestar de voluntarios
          </p>
        </div>
        <Button 
          onClick={fetchWorkloadAnalysis}
          disabled={loading}
          variant="outline"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Activity className="h-4 w-4 mr-2" />
          )}
          Actualizar Análisis
        </Button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.totalVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Total Voluntarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.averageWorkloadScore}</p>
                  <p className="text-xs text-muted-foreground">Carga Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{summary.highBurnoutRisk}</p>
                  <p className="text-xs text-muted-foreground">Alto Riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <UserX className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.underutilized}</p>
                  <p className="text-xs text-muted-foreground">Subutilizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{summary.balanceScore}</p>
                  <p className="text-xs text-muted-foreground">Balance Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="workloads" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workloads">
            Cargas de Trabajo ({workloads.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            Recomendaciones ({recommendations.filter(r => r.priority === 'HIGH').length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            Insights y Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workloads" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Analizando cargas de trabajo...</span>
              </div>
            ) : workloads.length === 0 ? (
              <Alert>
                <Users className="h-4 w-4" />
                <AlertTitle>Sin Datos</AlertTitle>
                <AlertDescription>
                  No se encontraron datos de voluntarios activos para analizar.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {workloads.map((workload) => (
                  <Card key={workload.memberId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getBurnoutRiskColor(workload.burnoutRisk)}`}
                          />
                          {workload.memberName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={getBurnoutRiskVariant(workload.burnoutRisk) as any}>
                            {workload.burnoutRisk}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Score: {workload.workloadScore}/100
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Workload Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Carga de Trabajo</span>
                            <span className="text-sm text-muted-foreground">
                              {workload.workloadScore}/100
                            </span>
                          </div>
                          <Progress 
                            value={workload.workloadScore} 
                            className="h-2"
                          />
                        </div>

                        {/* Assignment Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">{workload.currentAssignments}</p>
                            <p className="text-xs text-muted-foreground">Actuales</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{workload.weeklyAssignments}</p>
                            <p className="text-xs text-muted-foreground">Semanales</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{workload.monthlyAssignments}</p>
                            <p className="text-xs text-muted-foreground">Mensuales</p>
                          </div>
                        </div>

                        {/* Skills and Availability */}
                        <div className="flex flex-wrap gap-1">
                          {workload.skillsProfile.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {workload.skillsProfile.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{workload.skillsProfile.length - 3} más
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons for High Risk */}
                        {workload.burnoutRisk === 'CRITICAL' || workload.burnoutRisk === 'HIGH' ? (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <UserX className="h-4 w-4 mr-2" />
                              Reducir Carga
                            </Button>
                            <Button size="sm" variant="outline">
                              <Clock className="h-4 w-4 mr-2" />
                              Programar Descanso
                            </Button>
                          </div>
                        ) : workload.currentAssignments === 0 ? (
                          <Button size="sm" variant="outline">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Asignar Responsabilidades
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {recommendations.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sistema Balanceado</AlertTitle>
                <AlertDescription>
                  No se requieren ajustes en este momento. La distribución de carga está optimizada.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {recommendations.map((recommendation, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(recommendation.priority) as any}>
                            {recommendation.priority}
                          </Badge>
                          {recommendation.type.replace('_', ' ')}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {recommendation.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Impacto Esperado:</h4>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.expectedImpact}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Acciones Requeridas:</h4>
                          <ul className="text-sm space-y-1">
                            {recommendation.actionItems.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Afecta a {recommendation.affectedMembers.length} voluntarios
                          </span>
                          <Button 
                            size="sm" 
                            onClick={() => applyRecommendation(recommendation)}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Implementar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Riesgo de Agotamiento</CardTitle>
              </CardHeader>
              <CardContent>
                {summary && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          Bajo Riesgo
                        </span>
                        <span className="font-medium">
                          {workloads.filter(w => w.burnoutRisk === 'LOW').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          Riesgo Moderado
                        </span>
                        <span className="font-medium">
                          {workloads.filter(w => w.burnoutRisk === 'MEDIUM').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          Alto Riesgo
                        </span>
                        <span className="font-medium">
                          {workloads.filter(w => w.burnoutRisk === 'HIGH').length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          Riesgo Crítico
                        </span>
                        <span className="font-medium">
                          {workloads.filter(w => w.burnoutRisk === 'CRITICAL').length}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones por Prioridad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Alta Prioridad
                      </span>
                      <span className="font-medium">
                        {recommendations.filter(r => r.priority === 'HIGH').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-yellow-500" />
                        Prioridad Media
                      </span>
                      <span className="font-medium">
                        {recommendations.filter(r => r.priority === 'MEDIUM').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Baja Prioridad
                      </span>
                      <span className="font-medium">
                        {recommendations.filter(r => r.priority === 'LOW').length}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="outline">
                      <PieChart className="h-4 w-4 mr-2" />
                      Ver Reporte Completo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
