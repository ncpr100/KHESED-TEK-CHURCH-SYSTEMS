

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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Crown, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Star,
  Loader2,
  Award,
  BookOpen,
  Lightbulb,
  UserCheck,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface LeadershipDevelopmentDashboardProps {
  churchId: string
  userRole: string
}

interface LeadershipProfile {
  memberId: string
  memberName: string
  currentRole: string
  leadershipPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'EMERGING'
  leadershipScore: number
  leadershipReadiness: 'READY_NOW' | 'READY_6_MONTHS' | 'READY_1_YEAR' | 'NEEDS_DEVELOPMENT'
  strongSuits: string[]
  developmentAreas: string[]
  recommendedPositions: LeadershipOpportunity[]
  developmentPath: DevelopmentMilestone[]
  mentoringCapability: 'EXCELLENT' | 'GOOD' | 'DEVELOPING' | 'BASIC'
  influenceLevel: number
  communicationSkills: number
  spiritualMaturity: number
  experienceDepth: number
  teamLeadership: number
  visionCasting: number
  currentMentees: number
  maxMenteeCapacity: number
  nextReviewDate: Date
}

interface LeadershipOpportunity {
  positionId: string
  positionTitle: string
  ministryArea: string
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW'
  matchScore: number
  requiredSkills: string[]
  timeCommitment: string
  leadershipLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXECUTIVE'
  reasoning: string[]
}

interface DevelopmentMilestone {
  id: string
  title: string
  description: string
  category: 'SPIRITUAL' | 'SKILLS' | 'EXPERIENCE' | 'MENTORING' | 'TRAINING'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedDuration: string
  measurableOutcomes: string[]
  targetCompletionDate: Date
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED'
}

export function LeadershipDevelopmentDashboard({ churchId, userRole }: LeadershipDevelopmentDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [leadershipProfiles, setLeadershipProfiles] = useState<LeadershipProfile[]>([])
  const [developmentMetrics, setDevelopmentMetrics] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [analysisSettings, setAnalysisSettings] = useState({
    minLeadershipScore: 50,
    targetMemberId: ''
  })

  // Fetch development metrics
  const fetchDevelopmentMetrics = async () => {
    try {
      const response = await fetch('/api/recruitment-pipeline/leadership-development')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      
      const data = await response.json()
      setDevelopmentMetrics(data.developmentMetrics)
    } catch (error) {
      console.error('Error fetching development metrics:', error)
      toast.error('Error al obtener métricas de desarrollo de liderazgo')
    }
  }

  // Run leadership development analysis
  const runLeadershipAnalysis = async () => {
    setLoading(true)
    
    try {
      toast.info('🌟 Iniciando análisis de desarrollo de liderazgo...')
      
      const response = await fetch('/api/recruitment-pipeline/leadership-development', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisSettings)
      })

      if (!response.ok) throw new Error('Failed to run leadership analysis')
      
      const data = await response.json()
      
      setLeadershipProfiles(data.leadershipProfiles || [])
      setSummary(data.summary)
      setInsights(data.insights)
      
      toast.success(`✅ Análisis completado: ${data.summary.qualifiedLeaders} líderes potenciales identificados`)
      
    } catch (error) {
      console.error('Error running leadership analysis:', error)
      toast.error('Error en análisis de liderazgo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevelopmentMetrics()
  }, [])

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'HIGH': return 'bg-green-500'
      case 'MEDIUM': return 'bg-blue-500'
      case 'EMERGING': return 'bg-yellow-500'
      case 'LOW': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getPotentialVariant = (potential: string) => {
    switch (potential) {
      case 'HIGH': return 'default'
      case 'MEDIUM': return 'secondary'
      case 'EMERGING': return 'outline'
      case 'LOW': return 'destructive'
      default: return 'secondary'
    }
  }

  const getReadinessIcon = (readiness: string) => {
    switch (readiness) {
      case 'READY_NOW': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'READY_6_MONTHS': return <Clock className="h-4 w-4 text-blue-500" />
      case 'READY_1_YEAR': return <Calendar className="h-4 w-4 text-yellow-500" />
      case 'NEEDS_DEVELOPMENT': return <BookOpen className="h-4 w-4 text-red-500" />
      default: return <Users className="h-4 w-4 text-gray-400" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'IMMEDIATE': return 'destructive'
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
            <Crown className="h-6 w-6 text-yellow-600" />
            Desarrollo de Liderazgo e IA Predictiva
          </h2>
          <p className="text-muted-foreground">
            Identifica y desarrolla líderes futuros con inteligencia artificial
          </p>
        </div>
        <Button 
          onClick={runLeadershipAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Crown className="h-4 w-4 mr-2" />
          )}
          Ejecutar Análisis
        </Button>
      </div>

      {/* Development Metrics Overview */}
      {developmentMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Total Miembros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.potentialLeaders}</p>
                  <p className="text-xs text-muted-foreground">Potenciales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.currentLeaders}</p>
                  <p className="text-xs text-muted-foreground">Líderes Actuales</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.leadershipPipeline}</p>
                  <p className="text-xs text-muted-foreground">En Pipeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.leadershipRatio}%</p>
                  <p className="text-xs text-muted-foreground">Ratio Liderazgo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{developmentMetrics.developmentOpportunity}%</p>
                  <p className="text-xs text-muted-foreground">Oportunidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="leaders">
            Líderes ({leadershipProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="development">Desarrollo</TabsTrigger>
          <TabsTrigger value="succession">Sucesión</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline de Liderazgo</CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Líderes Calificados</span>
                        <span className="text-sm font-medium">{summary.qualifiedLeaders}/{summary.totalCandidatesAnalyzed}</span>
                      </div>
                      <Progress value={(summary.qualifiedLeaders / summary.totalCandidatesAnalyzed) * 100} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{summary.readyNow}</p>
                        <p className="text-xs text-muted-foreground">Listos Ahora</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{summary.ready6Months}</p>
                        <p className="text-xs text-muted-foreground">6 Meses</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{summary.highPotential}</p>
                        <p className="text-xs text-muted-foreground">Alto Potencial</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{Math.round(summary.averageLeadershipScore)}</p>
                        <p className="text-xs text-muted-foreground">Score Promedio</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis Pendiente</h3>
                    <p className="text-gray-600 mb-4">
                      Ejecute el análisis para evaluar el potencial de liderazgo
                    </p>
                    <Button onClick={runLeadershipAnalysis} disabled={loading}>
                      <Crown className="h-4 w-4 mr-2" />
                      Iniciar Análisis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desarrollo Prioritario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!summary || summary.readyNow === 0}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Promocionar Líderes Listos ({summary?.readyNow || 0})
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!summary || summary.ready6Months === 0}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Acelerar Desarrollo ({summary?.ready6Months || 0})
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!insights}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Ver Plan de Sucesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaders" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Perfiles de Liderazgo</h3>
              <p className="text-sm text-muted-foreground">
                Análisis completo del potencial de liderazgo de cada candidato
              </p>
            </div>
            <Select
              value={analysisSettings.minLeadershipScore.toString()}
              onValueChange={(value) => setAnalysisSettings(prev => ({ 
                ...prev, 
                minLeadershipScore: parseInt(value) 
              }))}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Score ≥ 30</SelectItem>
                <SelectItem value="50">Score ≥ 50</SelectItem>
                <SelectItem value="70">Score ≥ 70</SelectItem>
                <SelectItem value="85">Score ≥ 85</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[600px]">
            {leadershipProfiles.length === 0 ? (
              <Alert>
                <Crown className="h-4 w-4" />
                <AlertTitle>Sin Perfiles</AlertTitle>
                <AlertDescription>
                  Ejecute el análisis para evaluar perfiles de liderazgo de los miembros.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {leadershipProfiles.map((profile) => (
                  <Card key={profile.memberId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getPotentialColor(profile.leadershipPotential)}`}
                          />
                          {profile.memberName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getReadinessIcon(profile.leadershipReadiness)}
                          <Badge variant={getPotentialVariant(profile.leadershipPotential) as any}>
                            {profile.leadershipPotential}
                          </Badge>
                          <span className="text-sm font-medium">
                            {profile.leadershipScore}/100
                          </span>
                        </div>
                      </div>
                      <CardDescription>
                        {profile.currentRole} • {profile.leadershipReadiness.replace('_', ' ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Leadership Skills Radar */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Influencia</span>
                              <span className="text-xs">{profile.influenceLevel}/100</span>
                            </div>
                            <Progress value={profile.influenceLevel} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Comunicación</span>
                              <span className="text-xs">{profile.communicationSkills}/100</span>
                            </div>
                            <Progress value={profile.communicationSkills} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Madurez Espiritual</span>
                              <span className="text-xs">{profile.spiritualMaturity}/100</span>
                            </div>
                            <Progress value={profile.spiritualMaturity} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Experiencia</span>
                              <span className="text-xs">{profile.experienceDepth}/100</span>
                            </div>
                            <Progress value={profile.experienceDepth} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Liderazgo de Equipo</span>
                              <span className="text-xs">{profile.teamLeadership}/100</span>
                            </div>
                            <Progress value={profile.teamLeadership} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Visión</span>
                              <span className="text-xs">{profile.visionCasting}/100</span>
                            </div>
                            <Progress value={profile.visionCasting} className="h-2" />
                          </div>
                        </div>

                        {/* Strong Suits and Development Areas */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-green-600">Fortalezas:</h4>
                            <ul className="text-xs space-y-1">
                              {profile.strongSuits.slice(0, 3).map((suit, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {suit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-orange-600">Desarrollo:</h4>
                            <ul className="text-xs space-y-1">
                              {profile.developmentAreas.slice(0, 3).map((area, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <Target className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Recommended Positions */}
                        {profile.recommendedPositions.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Posiciones Recomendadas:</h4>
                            <div className="space-y-2">
                              {profile.recommendedPositions.slice(0, 2).map((position, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{position.positionTitle}</span>
                                      <Badge 
                                        variant={getUrgencyColor(position.urgency) as any}
                                        className="text-xs"
                                      >
                                        {position.urgency}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {Math.round(position.matchScore)}/100
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {position.leadershipLevel}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        {position.timeCommitment}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {position.reasoning.slice(0, 2).join(', ')}
                                    </p>
                                  </div>
                                  <Button size="sm" variant="outline">
                                    Ver Detalles
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mentoring Capability */}
                        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                          <div>
                            <span className="text-sm font-medium">Capacidad de Mentoría:</span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={profile.mentoringCapability === 'EXCELLENT' ? 'default' : 'secondary'}>
                                {profile.mentoringCapability}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {profile.currentMentees}/{profile.maxMenteeCapacity} mentees actuales
                              </span>
                            </div>
                          </div>
                          {profile.mentoringCapability === 'EXCELLENT' && (
                            <Button size="sm" variant="outline">
                              <UserCheck className="h-4 w-4 mr-2" />
                              Asignar Mentee
                            </Button>
                          )}
                        </div>

                        {/* Development Path Progress */}
                        {profile.developmentPath.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">Plan de Desarrollo:</h4>
                              <span className="text-xs text-muted-foreground">
                                {profile.developmentPath.filter(m => m.status === 'COMPLETED').length}/{profile.developmentPath.length} completados
                              </span>
                            </div>
                            <div className="space-y-1">
                              {profile.developmentPath.slice(0, 3).map((milestone, index) => (
                                <div key={index} className="flex items-center gap-2 text-xs">
                                  {milestone.status === 'COMPLETED' ? 
                                    <CheckCircle className="h-3 w-3 text-green-500" /> :
                                    <Clock className="h-3 w-3 text-yellow-500" />
                                  }
                                  <span className={milestone.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}>
                                    {milestone.title}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {milestone.priority}
                                  </Badge>
                                </div>
                              ))}
                              {profile.developmentPath.length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{profile.developmentPath.length - 3} milestones más
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="default">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Plan Desarrollo
                          </Button>
                          
                          {profile.leadershipReadiness === 'READY_NOW' && (
                            <Button size="sm" variant="outline">
                              <Crown className="h-4 w-4 mr-2" />
                              Promocionar
                            </Button>
                          )}
                          
                          <Button size="sm" variant="outline">
                            <Activity className="h-4 w-4 mr-2" />
                            Ver Perfil Completo
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

        <TabsContent value="development" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Desarrollo</CardTitle>
              <CardDescription>
                Personalice los parámetros del análisis de liderazgo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minLeadershipScore">Puntuación Mínima de Liderazgo</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="minLeadershipScore"
                        type="number"
                        min="0"
                        max="100"
                        value={analysisSettings.minLeadershipScore}
                        onChange={(e) => setAnalysisSettings(prev => ({ 
                          ...prev, 
                          minLeadershipScore: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        (0-100 puntos)
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="targetLeader">Analizar Líder Específico</Label>
                    <Input
                      id="targetLeader"
                      placeholder="ID del miembro (opcional)"
                      value={analysisSettings.targetMemberId}
                      onChange={(e) => setAnalysisSettings(prev => ({ 
                        ...prev, 
                        targetMemberId: e.target.value 
                      }))}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Criterios de Evaluación</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Preparación de Liderazgo Actual</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experiencia y Historial</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desempeño Actual</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dones Espirituales</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Comunicación e Influencia</span>
                        <span className="font-medium">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disponibilidad y Compromiso</span>
                        <span className="font-medium">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Formación y Potencial</span>
                        <span className="font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="succession" className="space-y-6">
          {insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan de Sucesión</CardTitle>
                  <CardDescription>
                    Candidatos listos para roles de liderazgo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.successionPlan?.map((succession: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Crown className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{succession.candidate}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {succession.readiness.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {succession.bestFit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{succession.timeline}</div>
                          <Button size="sm" variant="outline" className="mt-1">
                            Ver Plan
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prioridades de Desarrollo</CardTitle>
                  <CardDescription>
                    Áreas que requieren más atención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.developmentPriorities?.map((priority: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium">{priority.area}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{priority.affectedCandidates} candidatos</Badge>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (priority.affectedCandidates / Math.max(...insights.developmentPriorities.map((p: any) => p.affectedCandidates))) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Oportunidades de Mentoría</CardTitle>
                  <CardDescription>
                    Mentores disponibles y su capacidad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.mentoringOpportunities?.map((mentor: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{mentor.mentorName}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {mentor.strengths?.map((strength: string, sIndex: number) => (
                              <Badge key={sIndex} variant="outline" className="text-xs">
                                {strength}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="font-medium text-green-600">{mentor.available}</span>
                            <span className="text-muted-foreground">/{mentor.capacity} disponibles</span>
                          </div>
                          <Button size="sm" variant="outline" className="mt-1">
                            Asignar Mentee
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Recomendadas</CardTitle>
                  <CardDescription>
                    Próximos pasos para el desarrollo de liderazgo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <Crown className="h-4 w-4" />
                      <AlertTitle>Promoción Inmediata</AlertTitle>
                      <AlertDescription>
                        {summary?.readyNow || 0} líderes están listos para promoción inmediata. Considere crear roles de liderazgo para ellos.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <BookOpen className="h-4 w-4" />
                      <AlertTitle>Desarrollo Acelerado</AlertTitle>
                      <AlertDescription>
                        {summary?.ready6Months || 0} candidatos pueden estar listos en 6 meses con el programa de desarrollo adecuado.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertTitle>Mentoring Program</AlertTitle>
                      <AlertDescription>
                        Establezca un programa formal de mentoría con los {insights.mentoringOpportunities?.length || 0} mentores capacitados disponibles.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertTitle>Sin Plan de Sucesión</AlertTitle>
              <AlertDescription>
                Ejecute el análisis de liderazgo para generar un plan de sucesión y recomendaciones de desarrollo.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
