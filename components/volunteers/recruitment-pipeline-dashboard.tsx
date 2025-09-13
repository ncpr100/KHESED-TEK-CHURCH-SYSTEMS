

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
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  UserPlus, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Star,
  Loader2,
  Brain,
  Zap,
  BarChart3,
  Activity,
  Award,
  Send,
  Eye,
  PlayCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface RecruitmentPipelineDashboardProps {
  churchId: string
  userRole: string
}

interface MemberRecruitmentProfile {
  memberId: string
  memberName: string
  email?: string
  phone?: string
  recruitmentScore: number
  volunteerReadiness: 'READY' | 'DEVELOPING' | 'NOT_READY' | 'NEEDS_TRAINING'
  leadershipPotential: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
  recommendedMinistries: RecommendedMinistry[]
  onboardingPath: OnboardingStep[]
  engagementLevel: number
  spiritualMaturity: number
  availabilityFactor: number
  barriers: string[]
  nextActions: string[]
}

interface RecommendedMinistry {
  ministryId: string
  ministryName: string
  matchScore: number
  reasoning: string[]
  urgency: 'HIGH' | 'MEDIUM' | 'LOW'
  estimatedTimeCommitment: string
  requiredPreparation: string[]
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  estimatedDuration: string
  type: 'ASSESSMENT' | 'TRAINING' | 'ORIENTATION' | 'MENTORSHIP' | 'EXPERIENCE'
  resources: string[]
  autoComplete: boolean
}

interface PipelineMetrics {
  totalMembers: number
  currentVolunteers: number
  potentialCandidates: number
  conversionRate: number
  profileCompleteness: number
  availabilityDefined: number
}

export function RecruitmentPipelineDashboard({ churchId, userRole }: RecruitmentPipelineDashboardProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [recruitmentProfiles, setRecruitmentProfiles] = useState<MemberRecruitmentProfile[]>([])
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [insights, setInsights] = useState<any>(null)
  const [analysisSettings, setAnalysisSettings] = useState({
    includeVolunteers: false,
    minScore: 40,
    targetMemberId: ''
  })

  // Fetch pipeline metrics
  const fetchPipelineMetrics = async () => {
    try {
      const response = await fetch('/api/recruitment-pipeline')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      
      const data = await response.json()
      setPipelineMetrics(data.pipelineMetrics)
    } catch (error) {
      console.error('Error fetching pipeline metrics:', error)
      toast.error('Error al obtener métricas del pipeline')
    }
  }

  // Run recruitment analysis
  const runRecruitmentAnalysis = async () => {
    setLoading(true)
    
    try {
      toast.info('🎯 Iniciando análisis completo del pipeline de reclutamiento...')
      
      const response = await fetch('/api/recruitment-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisSettings)
      })

      if (!response.ok) throw new Error('Failed to run recruitment analysis')
      
      const data = await response.json()
      
      setRecruitmentProfiles(data.recruitmentProfiles || [])
      setSummary(data.summary)
      setInsights(data.insights)
      
      toast.success(`✅ Análisis completado: ${data.summary.qualifiedCandidates} candidatos identificados`)
      
    } catch (error) {
      console.error('Error running recruitment analysis:', error)
      toast.error('Error en análisis de reclutamiento')
    } finally {
      setLoading(false)
    }
  }

  // Start onboarding workflow for a candidate
  const startOnboardingWorkflow = async (profile: MemberRecruitmentProfile, ministryId: string) => {
    try {
      toast.info(`🚀 Iniciando workflow de onboarding para ${profile.memberName}...`)
      
      const response = await fetch('/api/recruitment-pipeline/onboarding-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: profile.memberId,
          targetMinistryId: ministryId,
          assignMentor: true,
          autoStart: true
        })
      })

      if (!response.ok) throw new Error('Failed to start onboarding')
      
      const data = await response.json()
      
      toast.success(`✅ Workflow iniciado: ${data.workflow.totalSteps} pasos programados`)
      
    } catch (error) {
      console.error('Error starting onboarding:', error)
      toast.error('Error al iniciar onboarding')
    }
  }

  // Contact candidate directly
  const contactCandidate = async (profile: MemberRecruitmentProfile) => {
    toast.success(`📧 Contacto programado para ${profile.memberName}`)
    // In a real implementation, this would send an email or create a task
  }

  useEffect(() => {
    fetchPipelineMetrics()
  }, [])

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case 'READY': return 'bg-green-500'
      case 'DEVELOPING': return 'bg-yellow-500'
      case 'NEEDS_TRAINING': return 'bg-orange-500'
      case 'NOT_READY': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getReadinessVariant = (readiness: string) => {
    switch (readiness) {
      case 'READY': return 'default'
      case 'DEVELOPING': return 'secondary'
      case 'NEEDS_TRAINING': return 'outline'
      case 'NOT_READY': return 'destructive'
      default: return 'secondary'
    }
  }

  const getPotentialIcon = (potential: string) => {
    switch (potential) {
      case 'HIGH': return <Star className="h-4 w-4 text-yellow-500" />
      case 'MEDIUM': return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'LOW': return <Activity className="h-4 w-4 text-gray-500" />
      default: return <Users className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Pipeline de Reclutamiento Automatizado
          </h2>
          <p className="text-muted-foreground">
            Identifica y convierte miembros en voluntarios usando IA
          </p>
        </div>
        <Button 
          onClick={runRecruitmentAnalysis}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Brain className="h-4 w-4 mr-2" />
          )}
          Ejecutar Análisis
        </Button>
      </div>

      {/* Pipeline Metrics Overview */}
      {pipelineMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">Total Miembros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.currentVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Voluntarios</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.potentialCandidates}</p>
                  <p className="text-xs text-muted-foreground">Candidatos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.conversionRate}%</p>
                  <p className="text-xs text-muted-foreground">Conversión</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.profileCompleteness}%</p>
                  <p className="text-xs text-muted-foreground">Perfiles</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{pipelineMetrics.availabilityDefined}%</p>
                  <p className="text-xs text-muted-foreground">Disponibilidad</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="candidates">
            Candidatos ({recruitmentProfiles.length})
          </TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado del Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Candidatos Calificados</span>
                        <span className="text-sm font-medium">{summary.qualifiedCandidates}/{summary.totalMembersAnalyzed}</span>
                      </div>
                      <Progress value={(summary.qualifiedCandidates / summary.totalMembersAnalyzed) * 100} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{summary.readyForRecruitment}</p>
                        <p className="text-xs text-muted-foreground">Listos Ahora</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{summary.developingCandidates}</p>
                        <p className="text-xs text-muted-foreground">En Desarrollo</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Score Promedio</span>
                        <Badge variant="outline">{summary.averageRecruitmentScore}/100</Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis Pendiente</h3>
                    <p className="text-gray-600 mb-4">
                      Ejecute el análisis para ver el estado del pipeline de reclutamiento
                    </p>
                    <Button onClick={runRecruitmentAnalysis} disabled={loading}>
                      <Brain className="h-4 w-4 mr-2" />
                      Iniciar Análisis
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
                    disabled={!summary || summary.readyForRecruitment === 0}
                    onClick={() => {
                      if (!summary?.readyForRecruitment) return;
                      // Contact all ready candidates
                      recruitmentProfiles
                        .filter(profile => profile.volunteerReadiness === 'READY')
                        .forEach(profile => contactCandidate(profile));
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Contactar Candidatos Listos ({summary?.readyForRecruitment || 0})
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!summary || summary.developingCandidates === 0}
                    onClick={() => {
                      if (!summary?.developingCandidates) return;
                      // Start workflows for developing candidates
                      recruitmentProfiles
                        .filter(profile => profile.volunteerReadiness === 'DEVELOPING')
                        .forEach(profile => {
                          if (profile.recommendedMinistries.length > 0) {
                            startOnboardingWorkflow(profile, profile.recommendedMinistries[0].ministryId);
                          }
                        });
                    }}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Iniciar Workflows ({summary?.developingCandidates || 0})
                  </Button>
                  
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={!insights}
                    onClick={() => {
                      if (!insights) return;
                      // Switch to detailed insights tab
                      setActiveTab('insights');
                      toast.info('📊 Mostrando oportunidades de ministerio identificadas');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Oportunidades de Ministerio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          <ScrollArea className="h-[600px]">
            {recruitmentProfiles.length === 0 ? (
              <Alert>
                <UserPlus className="h-4 w-4" />
                <AlertTitle>Sin Candidatos</AlertTitle>
                <AlertDescription>
                  Ejecute el análisis para identificar candidatos potenciales para reclutamiento.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {recruitmentProfiles.map((profile) => (
                  <Card key={profile.memberId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getReadinessColor(profile.volunteerReadiness)}`}
                          />
                          {profile.memberName}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {getPotentialIcon(profile.leadershipPotential)}
                          <Badge variant={getReadinessVariant(profile.volunteerReadiness) as any}>
                            {profile.volunteerReadiness}
                          </Badge>
                          <span className="text-sm font-medium">
                            {profile.recruitmentScore}/100
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Email:</span> {profile.email || 'No disponible'}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span> {profile.phone || 'No disponible'}
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Compromiso</span>
                              <span className="text-xs">{profile.engagementLevel}/100</span>
                            </div>
                            <Progress value={profile.engagementLevel} className="h-2" />
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
                              <span className="text-xs">Disponibilidad</span>
                              <span className="text-xs">{Math.round(profile.availabilityFactor)}/100</span>
                            </div>
                            <Progress value={profile.availabilityFactor} className="h-2" />
                          </div>
                        </div>

                        {/* Recommended Ministries */}
                        {profile.recommendedMinistries.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Ministerios Recomendados:</h4>
                            <div className="space-y-2">
                              {profile.recommendedMinistries.slice(0, 2).map((ministry, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{ministry.ministryName}</span>
                                      <Badge 
                                        variant={ministry.urgency === 'HIGH' ? 'destructive' : ministry.urgency === 'MEDIUM' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {ministry.urgency}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        {Math.round(ministry.matchScore)}/100
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {ministry.reasoning.slice(0, 2).join(', ')}
                                    </p>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => startOnboardingWorkflow(profile, ministry.ministryId)}
                                  >
                                    Iniciar
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Barriers and Next Actions */}
                        <div className="grid grid-cols-2 gap-4">
                          {profile.barriers.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Barreras:</h4>
                              <ul className="text-xs space-y-1">
                                {profile.barriers.slice(0, 2).map((barrier, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-red-500">•</span>
                                    {barrier}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-semibold mb-2 text-sm">Próximas Acciones:</h4>
                            <ul className="text-xs space-y-1">
                              {profile.nextActions.slice(0, 2).map((action, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-green-500">•</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => contactCandidate(profile)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Contactar
                          </Button>
                          
                          {profile.onboardingPath.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => profile.recommendedMinistries.length > 0 && 
                                startOnboardingWorkflow(profile, profile.recommendedMinistries[0].ministryId)}
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Onboarding ({profile.onboardingPath.length} pasos)
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Show member profile details
                              toast.info(`👤 Abriendo perfil de ${profile.memberName}`);
                              // NOTE: In production, this would navigate to member profile page
                              // window.location.href = `/members/${profile.memberId}`;
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Perfil
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

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Análisis</CardTitle>
              <CardDescription>
                Personalice los parámetros del análisis de reclutamiento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minScore">Puntuación Mínima de Reclutamiento</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Input
                        id="minScore"
                        type="number"
                        min="0"
                        max="100"
                        value={analysisSettings.minScore}
                        onChange={(e) => setAnalysisSettings(prev => ({ 
                          ...prev, 
                          minScore: parseInt(e.target.value) || 0 
                        }))}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        (0-100 puntos)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Solo mostrar candidatos con puntuación igual o superior a este valor
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeVolunteers"
                      checked={analysisSettings.includeVolunteers}
                      onCheckedChange={(checked) => setAnalysisSettings(prev => ({ 
                        ...prev, 
                        includeVolunteers: checked 
                      }))}
                    />
                    <Label htmlFor="includeVolunteers">
                      Incluir Voluntarios Actuales
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por defecto, solo se analizan miembros que no son voluntarios activos
                  </p>

                  <div>
                    <Label htmlFor="targetMember">Analizar Miembro Específico</Label>
                    <Input
                      id="targetMember"
                      placeholder="ID del miembro (opcional)"
                      value={analysisSettings.targetMemberId}
                      onChange={(e) => setAnalysisSettings(prev => ({ 
                        ...prev, 
                        targetMemberId: e.target.value 
                      }))}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Deje en blanco para analizar todos los candidatos elegibles
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Criterios de Evaluación</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Preparación Espiritual</span>
                        <span className="font-medium">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Disponibilidad y Compromiso</span>
                        <span className="font-medium">25%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Experiencia y Habilidades</span>
                        <span className="font-medium">20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Potencial de Liderazgo</span>
                        <span className="font-medium">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compromiso Actual</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Configuración de Onboarding</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="autoMentor" defaultChecked />
                        <Label htmlFor="autoMentor" className="text-sm">
                          Asignar mentor automáticamente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="autoStart" defaultChecked />
                        <Label htmlFor="autoStart" className="text-sm">
                          Iniciar workflows automáticamente
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="notifications" defaultChecked />
                        <Label htmlFor="notifications" className="text-sm">
                          Enviar notificaciones por email
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Análisis Programado</h4>
                  <p className="text-sm text-muted-foreground">
                    Ejecutar análisis automáticamente cada semana
                  </p>
                </div>
                <Switch id="scheduledAnalysis" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {insights ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Candidatos</CardTitle>
                  <CardDescription>
                    Los 5 candidatos con mayor potencial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.topCandidates?.map((candidate: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <span className="font-medium">{candidate.memberName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getReadinessVariant(candidate.volunteerReadiness) as any} className="text-xs">
                              {candidate.volunteerReadiness}
                            </Badge>
                            {getPotentialIcon(candidate.leadershipPotential)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">{candidate.recruitmentScore}</div>
                          <div className="text-xs text-muted-foreground">score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ministerios con Mayor Demanda</CardTitle>
                  <CardDescription>
                    Ministerios que más necesitan voluntarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.mostInDemandMinistries?.map((ministry: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{ministry.ministryName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{ministry.candidateCount} candidatos</Badge>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (ministry.candidateCount / Math.max(...insights.mostInDemandMinistries.map((m: any) => m.candidateCount))) * 100)}%` 
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
                  <CardTitle>Barreras Más Comunes</CardTitle>
                  <CardDescription>
                    Obstáculos frecuentes para el reclutamiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.commonBarriers?.map((barrier: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="text-sm">{barrier.barrier}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {barrier.memberCount} miembros
                          </span>
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (barrier.memberCount / Math.max(...insights.commonBarriers.map((b: any) => b.memberCount))) * 100)}%` 
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
                  <CardTitle>Recomendaciones</CardTitle>
                  <CardDescription>
                    Acciones sugeridas para mejorar el reclutamiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Alert>
                      <Target className="h-4 w-4" />
                      <AlertTitle>Enfoque Prioritario</AlertTitle>
                      <AlertDescription>
                        Concéntrese en los {summary?.readyForRecruitment || 0} candidatos listos para maximizar conversiones inmediatas.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Users className="h-4 w-4" />
                      <AlertTitle>Desarrollo de Pipeline</AlertTitle>
                      <AlertDescription>
                        Invierta en el desarrollo de {summary?.developingCandidates || 0} candidatos en desarrollo para resultados a medio plazo.
                      </AlertDescription>
                    </Alert>
                    
                    <Alert>
                      <Activity className="h-4 w-4" />
                      <AlertTitle>Completar Perfiles</AlertTitle>
                      <AlertDescription>
                        {pipelineMetrics && pipelineMetrics.profileCompleteness < 70 ? 
                          `Mejore la completitud de perfiles (${pipelineMetrics.profileCompleteness}%) para análisis más precisos.` :
                          `Excelente completitud de perfiles (${pipelineMetrics?.profileCompleteness || 0}%). Manténgala así.`
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Sin Insights Disponibles</AlertTitle>
              <AlertDescription>
                Ejecute el análisis de reclutamiento para generar insights y recomendaciones detalladas.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
