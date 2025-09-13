

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Brain, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  UserPlus,
  Calendar,
  Star,
  Loader2,
  Zap,
  BarChart3,
  Settings,
  Shield,
  Target,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface IntelligentSchedulingEngineProps {
  churchId: string
  userRole: string
}

interface SchedulingGap {
  id: string
  eventId?: string
  ministryId: string
  title: string
  date: Date
  startTime: string
  endTime: string
  requiredVolunteers: number
  currentVolunteers: number
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  urgencyScore: number
}

interface OptimalMatch {
  memberId: string
  gapId: string
  matchScore: number
  availabilityScore: number
  workloadScore: number
  skillsMatch: number
  conflictRisk: number
  reasoning: string[]
}

interface SchedulingConflict {
  id: string
  type: 'TIME_OVERLAP' | 'OVERLOAD' | 'SKILL_MISMATCH' | 'AVAILABILITY_CONFLICT'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  memberId: string
  conflictingAssignments: string[]
  description: string
  suggestedResolutions: any[]
}

interface WorkloadAnalysis {
  totalVolunteers: number
  averageWorkloadScore: number
  highBurnoutRisk: number
  underutilized: number
  balanceScore: number
}

export function IntelligentSchedulingEngine({ churchId, userRole }: IntelligentSchedulingEngineProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('gaps')
  const [gaps, setGaps] = useState<any[]>([])
  const [conflicts, setConflicts] = useState<SchedulingConflict[]>([])
  const [workloadAnalysis, setWorkloadAnalysis] = useState<WorkloadAnalysis | null>(null)
  const [schedulingSettings, setSchedulingSettings] = useState({
    daysAhead: 30,
    autoAssign: false,
    maxRecommendations: 3,
    autoResolve: false
  })
  const [engineStatus, setEngineStatus] = useState<'idle' | 'analyzing' | 'optimizing' | 'complete'>('idle')

  // Fetch scheduling gaps analysis
  const fetchSchedulingGaps = async () => {
    try {
      const response = await fetch(`/api/intelligent-scheduling?daysAhead=${schedulingSettings.daysAhead}`)
      if (!response.ok) throw new Error('Failed to fetch gaps')
      
      const data = await response.json()
      if (data && typeof data === 'object') {
        setGaps(Array.isArray(data.gaps) ? data.gaps : [])
      } else {
        setGaps([])
      }
    } catch (error) {
      console.error('Error fetching gaps:', error)
      setGaps([])
      toast.error('Error al obtener análisis de brechas')
    }
  }

  // Fetch scheduling conflicts
  const fetchSchedulingConflicts = async () => {
    try {
      const response = await fetch('/api/intelligent-scheduling/conflict-resolution')
      if (!response.ok) throw new Error('Failed to fetch conflicts')
      
      const data = await response.json()
      if (data && typeof data === 'object') {
        setConflicts(Array.isArray(data.conflicts) ? data.conflicts : [])
      } else {
        setConflicts([])
      }
    } catch (error) {
      console.error('Error fetching conflicts:', error)
      setConflicts([])
      toast.error('Error al obtener conflictos de programación')
    }
  }

  // Fetch workload analysis
  const fetchWorkloadAnalysis = async () => {
    try {
      const response = await fetch('/api/intelligent-scheduling/workload-balancer')
      if (!response.ok) throw new Error('Failed to fetch workload')
      
      const data = await response.json()
      if (data && typeof data === 'object' && data.summary) {
        setWorkloadAnalysis(data.summary)
      } else {
        setWorkloadAnalysis(null)
      }
    } catch (error) {
      console.error('Error fetching workload:', error)
      setWorkloadAnalysis(null)
      toast.error('Error al obtener análisis de carga de trabajo')
    }
  }

  // Run intelligent scheduling analysis
  const runIntelligentScheduling = async () => {
    setLoading(true)
    setEngineStatus('analyzing')
    
    try {
      toast.info('🧠 Iniciando análisis inteligente de programación...')
      
      const response = await fetch('/api/intelligent-scheduling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedulingSettings)
      })

      if (!response.ok) throw new Error('Failed to run scheduling')
      
      const data = await response.json()
      
      setEngineStatus('optimizing')
      
      // Safely access data properties with null checks
      if (data && data.summary && typeof data.summary.totalGapsIdentified !== 'undefined') {
        toast.success(`✅ Análisis completo: ${data.summary.totalGapsIdentified} brechas identificadas`)
      } else {
        toast.success('✅ Análisis completo')
      }
      
      if (data && data.summary && data.summary.autoAssignments > 0) {
        toast.success(`🤖 ${data.summary.autoAssignments} asignaciones automáticas creadas`)
      }

      // Refresh all data
      await Promise.all([
        fetchSchedulingGaps(),
        fetchSchedulingConflicts(), 
        fetchWorkloadAnalysis()
      ])

      setEngineStatus('complete')
      
    } catch (error) {
      console.error('Error running intelligent scheduling:', error)
      toast.error('Error en motor de programación inteligente')
      setEngineStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  // Auto-resolve conflicts
  const autoResolveConflicts = async () => {
    try {
      setLoading(true)
      toast.info('🔧 Resolviendo conflictos automáticamente...')
      
      const response = await fetch('/api/intelligent-scheduling/conflict-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoResolve: true })
      })

      if (!response.ok) throw new Error('Failed to resolve conflicts')
      
      const data = await response.json()
      
      if (data && Array.isArray(data.resolvedConflicts) && data.resolvedConflicts.length > 0) {
        toast.success(`✅ ${data.resolvedConflicts.length} conflictos resueltos automáticamente`)
        fetchSchedulingConflicts() // Refresh conflicts
      } else {
        toast.info('No hay conflictos que puedan resolverse automáticamente')
      }
      
    } catch (error) {
      console.error('Error resolving conflicts:', error)
      toast.error('Error al resolver conflictos')
    } finally {
      setLoading(false)
    }
  }

  // Run workload balancing
  const runWorkloadBalancing = async () => {
    try {
      setLoading(true)
      toast.info('⚖️ Analizando y balanceando cargas de trabajo...')
      
      const response = await fetch('/api/intelligent-scheduling/workload-balancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoImplement: true })
      })

      if (!response.ok) throw new Error('Failed to balance workload')
      
      const data = await response.json()
      
      if (data && data.summary && typeof data.summary.totalVolunteers !== 'undefined') {
        toast.success(`✅ Análisis de carga completado: ${data.summary.totalVolunteers} voluntarios analizados`)
      } else {
        toast.success('✅ Análisis de carga completado')
      }
      
      if (data && Array.isArray(data.implementedActions) && data.implementedActions.length > 0) {
        toast.success(`🎯 ${data.implementedActions.length} acciones implementadas automáticamente`)
      }

      if (data && data.summary) {
        setWorkloadAnalysis(data.summary)
      }
      
    } catch (error) {
      console.error('Error balancing workload:', error)
      toast.error('Error al balancear cargas de trabajo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedulingGaps()
    fetchSchedulingConflicts()
    fetchWorkloadAnalysis()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'default'
      case 'LOW': return 'secondary'
      default: return 'secondary'
    }
  }

  const getEngineStatusIcon = () => {
    switch (engineStatus) {
      case 'analyzing': return <Brain className="h-4 w-4 animate-pulse text-blue-500" />
      case 'optimizing': return <Zap className="h-4 w-4 animate-bounce text-yellow-500" />
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Engine Status & Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getEngineStatusIcon()}
                Motor de Programación Inteligente
              </CardTitle>
              <CardDescription>
                Sistema automatizado de optimización de voluntarios con IA
              </CardDescription>
            </div>
            <Badge variant={engineStatus === 'complete' ? 'default' : 'secondary'}>
              {engineStatus === 'idle' && 'Listo'}
              {engineStatus === 'analyzing' && 'Analizando...'}
              {engineStatus === 'optimizing' && 'Optimizando...'}
              {engineStatus === 'complete' && 'Completado'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="daysAhead">Días a Analizar</Label>
              <Select
                value={schedulingSettings.daysAhead.toString()}
                onValueChange={(value) => setSchedulingSettings(prev => ({ ...prev, daysAhead: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 días</SelectItem>
                  <SelectItem value="14">14 días</SelectItem>
                  <SelectItem value="30">30 días</SelectItem>
                  <SelectItem value="60">60 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="maxRecs">Max Recomendaciones</Label>
              <Select
                value={schedulingSettings.maxRecommendations.toString()}
                onValueChange={(value) => setSchedulingSettings(prev => ({ ...prev, maxRecommendations: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 por brecha</SelectItem>
                  <SelectItem value="3">3 por brecha</SelectItem>
                  <SelectItem value="5">5 por brecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoAssign"
                checked={schedulingSettings.autoAssign}
                onCheckedChange={(checked) => setSchedulingSettings(prev => ({ ...prev, autoAssign: checked }))}
              />
              <Label htmlFor="autoAssign">Auto-Asignar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoResolve"
                checked={schedulingSettings.autoResolve}
                onCheckedChange={(checked) => setSchedulingSettings(prev => ({ ...prev, autoResolve: checked }))}
              />
              <Label htmlFor="autoResolve">Auto-Resolver</Label>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runIntelligentScheduling}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Ejecutar Análisis Inteligente
            </Button>
            
            <Button 
              variant="outline" 
              onClick={autoResolveConflicts}
              disabled={loading || conflicts.length === 0}
            >
              <Shield className="h-4 w-4 mr-2" />
              Resolver Conflictos ({conflicts.filter(c => c.severity === 'CRITICAL').length})
            </Button>
            
            <Button 
              variant="outline" 
              onClick={runWorkloadBalancing}
              disabled={loading}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Balancear Cargas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {workloadAnalysis && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{workloadAnalysis.totalVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Voluntarios Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(workloadAnalysis.averageWorkloadScore)}</p>
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
                  <p className="text-2xl font-bold text-red-600">{workloadAnalysis.highBurnoutRisk}</p>
                  <p className="text-xs text-muted-foreground">Alto Riesgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{workloadAnalysis.underutilized}</p>
                  <p className="text-xs text-muted-foreground">Subutilizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(workloadAnalysis.balanceScore)}</p>
                  <p className="text-xs text-muted-foreground">Balance Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Brechas Identificadas ({gaps.length})
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Conflictos ({conflicts.filter(c => c.severity === 'CRITICAL').length})
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Optimización
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gaps" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {gaps.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>¡Excelente!</AlertTitle>
                <AlertDescription>
                  No se encontraron brechas críticas en la programación. El sistema está funcionando de manera óptima.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {gaps.map((gapData: any, index: number) => {
                  // Safely access gap data with fallbacks
                  const gap = gapData?.gap || gapData || {}
                  const title = gap.title || 'Brecha sin título'
                  const priority = gap.priority || 'LOW'
                  const startTime = gap.startTime || '00:00'
                  const endTime = gap.endTime || '00:00'
                  const urgencyScore = gap.urgencyScore || 0
                  const requiredVolunteers = gap.requiredVolunteers || 0
                  const currentVolunteers = gap.currentVolunteers || 0
                  
                  return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(priority) as any}>
                            {priority}
                          </Badge>
                          {title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {startTime} - {endTime}
                        </div>
                      </div>
                      <CardDescription>
                        Urgencia: {urgencyScore}/100 | 
                        Necesita: {Math.max(0, requiredVolunteers - currentVolunteers)} voluntarios adicionales
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div>
                            <Progress 
                              value={requiredVolunteers > 0 ? (currentVolunteers / requiredVolunteers) * 100 : 0} 
                              className="w-32"
                            />
                          </div>
                          <span className="text-sm">
                            {currentVolunteers}/{requiredVolunteers} voluntarios
                          </span>
                        </div>

                        {gapData?.recommendations && Array.isArray(gapData.recommendations) && gapData.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Recomendaciones Inteligentes:</h4>
                            <div className="space-y-2">
                              {gapData.recommendations.slice(0, 3).map((rec: any, recIndex: number) => {
                                const matchScore = rec?.matchScore || 0
                                const reasoning = Array.isArray(rec?.reasoning) ? rec.reasoning : ['Sin información disponible']
                                
                                return (
                                <div key={recIndex} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Star className="h-4 w-4 text-yellow-500" />
                                      <span className="font-medium">
                                        Candidato #{recIndex + 1}
                                      </span>
                                      <Badge variant="outline">
                                        {Math.round(matchScore)}/100
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {reasoning.join(', ')}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Asignar
                                  </Button>
                                </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {conflicts.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sin Conflictos</AlertTitle>
                <AlertDescription>
                  No se detectaron conflictos de programación en el sistema.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {conflicts.map((conflict) => (
                  <Card key={conflict.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant={getPriorityColor(conflict.severity) as any}>
                            {conflict.severity}
                          </Badge>
                          {conflict.type.replace('_', ' ')}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{conflict.description}</p>
                      
                      {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Resoluciones Sugeridas:</h4>
                          <div className="space-y-2">
                            {conflict.suggestedResolutions.slice(0, 2).map((resolution, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                <div>
                                  <p className="font-medium">{resolution.description}</p>
                                  <p className="text-sm text-muted-foreground">{resolution.impact}</p>
                                </div>
                                <Button size="sm" variant="outline">
                                  Aplicar
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Optimización</CardTitle>
              </CardHeader>
              <CardContent>
                {workloadAnalysis && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Balance General</span>
                        <span className="text-sm font-medium">{Math.round(workloadAnalysis.balanceScore)}/100</span>
                      </div>
                      <Progress value={workloadAnalysis.balanceScore} />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Utilización Promedio</span>
                        <span className="text-sm font-medium">{Math.round(workloadAnalysis.averageWorkloadScore)}%</span>
                      </div>
                      <Progress value={workloadAnalysis.averageWorkloadScore} />
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-red-600">{workloadAnalysis.highBurnoutRisk}</p>
                        <p className="text-xs text-muted-foreground">Alto Riesgo</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{workloadAnalysis.underutilized}</p>
                        <p className="text-xs text-muted-foreground">Disponibles</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Recomendadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Optimización Automática</AlertTitle>
                    <AlertDescription>
                      El sistema puede optimizar automáticamente las asignaciones basándose en disponibilidad y habilidades.
                    </AlertDescription>
                  </Alert>
                  
                  <Button className="w-full" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Ejecutar Optimización Completa
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planificar Próximas 4 Semanas
                  </Button>
                  
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Generar Plan de Reclutamiento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
