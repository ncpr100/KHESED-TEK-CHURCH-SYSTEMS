
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface SmartSchedulingDashboardProps {
  churchId: string
  userRole: string
}

interface GapAnalysis {
  id: string
  ministry: { name: string }
  urgencyScore: number
  currentStaffing: number
  optimalStaffing: number
  gapPercentage: number
  gapsIdentified: any[]
}

interface Recommendation {
  id: string
  member: { firstName: string, lastName: string, email: string, phone?: string }
  ministry: { name: string }
  matchScore: number
  reasoning: { reasons: string[] }
  priority: string
  status: string
}

export function SmartSchedulingDashboard({ churchId, userRole }: SmartSchedulingDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [ministries, setMinistries] = useState<any[]>([])
  const [gapAnalyses, setGapAnalyses] = useState<GapAnalysis[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedMinistryId, setSelectedMinistryId] = useState<string>('all')
  
  // Loading states
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false)
  
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ministriesResponse, recommendationsResponse] = await Promise.all([
        fetch('/api/ministries'),
        fetch('/api/volunteer-matching')
      ])

      if (ministriesResponse.ok) {
        const ministriesData = await ministriesResponse.json()
        setMinistries(ministriesData)
      }

      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json()
        setRecommendations(recommendationsData.recommendations || [])
      }

      // Simulate gap analysis data (would be real API call)
      setGapAnalyses([
        {
          id: '1',
          ministry: { name: 'Ministerio Juvenil' },
          urgencyScore: 9,
          currentStaffing: 3,
          optimalStaffing: 6,
          gapPercentage: 50,
          gapsIdentified: [{ role: 'Líder de Alabanza', needed: 1 }, { role: 'Maestro', needed: 2 }]
        },
        {
          id: '2', 
          ministry: { name: 'Ministerio Infantil' },
          urgencyScore: 7,
          currentStaffing: 8,
          optimalStaffing: 10,
          gapPercentage: 20,
          gapsIdentified: [{ role: 'Ayudante', needed: 2 }]
        },
        {
          id: '3',
          ministry: { name: 'Adoración' },
          urgencyScore: 5,
          currentStaffing: 12,
          optimalStaffing: 12,
          gapPercentage: 0,
          gapsIdentified: []
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const generateRecommendations = async (ministryId: string) => {
    setGeneratingRecommendations(true)
    try {
      const response = await fetch('/api/volunteer-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ministryId,
          maxRecommendations: 5
        })
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendations(data.recommendations || [])
        toast.success(`${data.recommendations.length} recomendaciones generadas`)
      } else {
        throw new Error('Error generating recommendations')
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Error al generar recomendaciones')
    } finally {
      setGeneratingRecommendations(false)
    }
  }

  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'bg-red-500'
    if (score >= 6) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando dashboard inteligente...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Voluntarios Inteligente</h1>
          <p className="text-muted-foreground">
            Sistema de programación automatizada con IA para optimizar asignaciones ministeriales
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Brain className="h-4 w-4 mr-2" />
          IA Activa
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visión General</TabsTrigger>
          <TabsTrigger value="gaps">Análisis de Brechas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
          <TabsTrigger value="matching">Generador IA</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ministerios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ministries.length}</div>
                <p className="text-xs text-muted-foreground">
                  {ministries.filter(m => m.isActive).length} activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Brechas Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {gapAnalyses.filter(g => g.urgencyScore >= 8).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención inmediata
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recomendaciones IA</CardTitle>
                <Brain className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Sugerencias inteligentes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiencia Global</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">85%</div>
                <p className="text-xs text-muted-foreground">
                  Cobertura ministerial
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Ministry Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Salud Ministerial por Área</CardTitle>
              <CardDescription>
                Vista rápida del estado de cobertura de cada ministerio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gapAnalyses.map(gap => (
                  <div key={gap.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium truncate">{gap.ministry.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {gap.currentStaffing}/{gap.optimalStaffing}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getUrgencyColor(gap.urgencyScore)} text-white border-0`}
                          >
                            {gap.urgencyScore >= 8 ? 'Crítico' : gap.urgencyScore >= 6 ? 'Atención' : 'Estable'}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={((gap.optimalStaffing - gap.gapPercentage * gap.optimalStaffing / 100) / gap.optimalStaffing) * 100} 
                        className="mt-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gaps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Análisis Detallado de Brechas Ministeriales
              </CardTitle>
              <CardDescription>
                Identificación automática de necesidades de personal en cada ministerio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {gapAnalyses.map(gap => (
                  <div key={gap.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{gap.ministry.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Personal actual: {gap.currentStaffing} / Óptimo: {gap.optimalStaffing}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getUrgencyColor(gap.urgencyScore)} text-white border-0`}
                      >
                        Urgencia: {gap.urgencyScore}/10
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <Progress value={((gap.optimalStaffing - gap.gapPercentage * gap.optimalStaffing / 100) / gap.optimalStaffing) * 100} />
                      <p className="text-sm text-muted-foreground mt-2">
                        Cobertura: {Math.round(((gap.optimalStaffing - gap.gapPercentage * gap.optimalStaffing / 100) / gap.optimalStaffing) * 100)}%
                      </p>
                    </div>

                    {gap.gapsIdentified.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Posiciones Necesarias:</h4>
                        <div className="flex flex-wrap gap-2">
                          {gap.gapsIdentified.map((gapDetail, index) => (
                            <Badge key={index} variant="outline">
                              {gapDetail.role} ({gapDetail.needed})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end mt-4 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => generateRecommendations(gap.ministry.name)}
                        disabled={generatingRecommendations}
                      >
                        {generatingRecommendations ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Generar Recomendaciones IA
                          </>
                        )}
                      </Button>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Reclutar Voluntarios
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Recomendaciones Inteligentes de Voluntarios
              </CardTitle>
              <CardDescription>
                Sugerencias basadas en dones espirituales, disponibilidad y experiencia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay recomendaciones activas</h3>
                    <p className="text-muted-foreground mb-4">
                      Use el generador IA para crear recomendaciones personalizadas
                    </p>
                    <Button onClick={() => setActiveTab('matching')}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generar Recomendaciones
                    </Button>
                  </div>
                ) : (
                  recommendations.map(rec => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">
                            {rec.member.firstName} {rec.member.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">{rec.member.email}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            {rec.ministry.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(rec.matchScore)}%
                          </div>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium mb-2">Razones de Coincidencia:</h4>
                        <ul className="text-sm space-y-1">
                          {rec.reasoning.reasons.map((reason, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          Ver Perfil Completo
                        </Button>
                        <Button size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Asignar Actividad
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Matching Generator Tab */}
        <TabsContent value="matching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                Generador de Coincidencias con IA
              </CardTitle>
              <CardDescription>
                Genere recomendaciones inteligentes para ministerios específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Seleccionar Ministerio
                  </Label>
                  <Select value={selectedMinistryId} onValueChange={setSelectedMinistryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un ministerio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Ministerios</SelectItem>
                      {ministries.map(ministry => (
                        <SelectItem key={ministry.id} value={ministry.id}>
                          {ministry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => selectedMinistryId !== 'all' && generateRecommendations(selectedMinistryId)}
                    disabled={generatingRecommendations || selectedMinistryId === 'all'}
                    className="w-full"
                    size="lg"
                  >
                    {generatingRecommendations ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Analizando perfiles...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Generar Recomendaciones IA
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Cómo funciona el algoritmo IA:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Análisis de Dones (40%):</strong> Compatibilidad entre dones espirituales y ministerio</li>
                  <li>• <strong>Disponibilidad (25%):</strong> Matriz de disponibilidad y horarios libres</li>
                  <li>• <strong>Experiencia (15%):</strong> Nivel de experiencia ministerial</li>
                  <li>• <strong>Pasión Ministerial (10%):</strong> Interés expresado en el ministerio</li>
                  <li>• <strong>Actividad Reciente (10%):</strong> Balance de compromisos actuales</li>
                </ul>
              </div>

              {recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Últimas Recomendaciones Generadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.slice(0, 3).map(rec => (
                        <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-medium">
                              {rec.member.firstName} {rec.member.lastName}
                            </span>
                            <span className="text-sm text-muted-foreground ml-2">
                              → {rec.ministry.name}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-green-700">
                            {Math.round(rec.matchScore)}% coincidencia
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
