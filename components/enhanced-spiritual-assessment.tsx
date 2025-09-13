

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Heart, 
  Star, 
  Target, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Calendar,
  Save,
  CheckCircle,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'

interface EnhancedSpiritualAssessmentProps {
  memberId: string
  memberName: string
  onSave: (profile: any) => void
  onCancel: () => void
  existingProfile?: any
}

export function EnhancedSpiritualAssessment({ 
  memberId, 
  memberName, 
  onSave, 
  onCancel, 
  existingProfile 
}: EnhancedSpiritualAssessmentProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [spiritualGifts, setSpiritualGifts] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Form data with all enhanced fields
  const [formData, setFormData] = useState({
    // Basic spiritual profile
    primaryGifts: existingProfile?.primaryGifts || [],
    secondaryGifts: existingProfile?.secondaryGifts || [],
    spiritualCalling: existingProfile?.spiritualCalling || '',
    ministryPassions: existingProfile?.ministryPassions || [],
    experienceLevel: existingProfile?.experienceLevel || 1,
    leadershipScore: existingProfile?.leadershipScore || 1,
    servingMotivation: existingProfile?.servingMotivation || '',
    previousExperience: existingProfile?.previousExperience || [],
    trainingCompleted: existingProfile?.trainingCompleted || [],
    
    // Enhanced assessment scores (0-100)
    spiritualMaturityScore: existingProfile?.spiritualMaturityScore || 50,
    leadershipAptitudeScore: existingProfile?.leadershipAptitudeScore || 50,
    ministryPassionScore: existingProfile?.ministryPassionScore || 50,
    availabilityScore: existingProfile?.availabilityScore || 50,
    teachingAbility: existingProfile?.teachingAbility || 50,
    pastoralHeart: existingProfile?.pastoralHeart || 50,
    organizationalSkills: existingProfile?.organizationalSkills || 50,
    communicationSkills: existingProfile?.communicationSkills || 50,
    
    // Training and development tracking
    leadershipTrainingCompleted: existingProfile?.leadershipTrainingCompleted || false,
    leadershipTrainingDate: existingProfile?.leadershipTrainingDate || null,
    mentoringExperience: existingProfile?.mentoringExperience || false,
    discipleshipTraining: existingProfile?.discipleshipTraining || false
  })

  useEffect(() => {
    fetchSpiritualGifts()
  }, [])

  const fetchSpiritualGifts = async () => {
    try {
      const response = await fetch('/api/spiritual-gifts')
      if (response.ok) {
        const data = await response.json()
        setSpiritualGifts(data.gifts || [])
      }
    } catch (error) {
      console.error('Error fetching spiritual gifts:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/enhanced-spiritual-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, ...formData })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Evaluación espiritual guardada exitosamente')
        onSave(data.profile)
      } else {
        toast.error('Error al guardar evaluación')
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      toast.error('Error al guardar evaluación')
    } finally {
      setSaving(false)
    }
  }

  const getScoreLabel = (score: number): { label: string, color: string } => {
    if (score >= 80) return { label: 'Excelente', color: 'bg-green-500' }
    if (score >= 60) return { label: 'Bueno', color: 'bg-blue-500' }
    if (score >= 40) return { label: 'Regular', color: 'bg-yellow-500' }
    return { label: 'Necesita desarrollo', color: 'bg-red-500' }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Evaluación Espiritual Integral - {memberName}
          </CardTitle>
          <CardDescription>
            Evaluación completa de dones espirituales, madurez y aptitudes de liderazgo
          </CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Progress value={(currentStep / totalSteps) * 100} />
            </div>
            <Badge variant="outline">
              Paso {currentStep} de {totalSteps}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={currentStep.toString()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="1" disabled={currentStep < 1}>
            <Brain className="h-4 w-4 mr-2" />
            Dones Espirituales
          </TabsTrigger>
          <TabsTrigger value="2" disabled={currentStep < 2}>
            <Heart className="h-4 w-4 mr-2" />
            Madurez Espiritual
          </TabsTrigger>
          <TabsTrigger value="3" disabled={currentStep < 3}>
            <Star className="h-4 w-4 mr-2" />
            Aptitudes de Liderazgo
          </TabsTrigger>
          <TabsTrigger value="4" disabled={currentStep < 4}>
            <BookOpen className="h-4 w-4 mr-2" />
            Capacitación y Experiencia
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Spiritual Gifts */}
        <TabsContent value="1">
          <Card>
            <CardHeader>
              <CardTitle>Dones Espirituales y Llamado</CardTitle>
              <CardDescription>
                Identifica tus dones espirituales principales y tu llamado ministerial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Dones espirituales principales (selecciona hasta 3)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {spiritualGifts.map((gift: any) => (
                      <div key={gift.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`primary-${gift.id}`}
                          checked={formData.primaryGifts.includes(gift.id)}
                          onCheckedChange={(checked) => {
                            if (checked && formData.primaryGifts.length < 3) {
                              setFormData(prev => ({
                                ...prev,
                                primaryGifts: [...prev.primaryGifts, gift.id]
                              }))
                            } else if (!checked) {
                              setFormData(prev => ({
                                ...prev,
                                primaryGifts: prev.primaryGifts.filter((id: any) => id !== gift.id)
                              }))
                            }
                          }}
                          disabled={!formData.primaryGifts.includes(gift.id) && formData.primaryGifts.length >= 3}
                        />
                        <label 
                          htmlFor={`primary-${gift.id}`} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {gift.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Llamado espiritual</Label>
                  <Textarea
                    value={formData.spiritualCalling}
                    onChange={(e) => setFormData(prev => ({ ...prev, spiritualCalling: e.target.value }))}
                    placeholder="Describe tu llamado espiritual y cómo sientes que Dios te guía para servir..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Motivación para servir</Label>
                  <Textarea
                    value={formData.servingMotivation}
                    onChange={(e) => setFormData(prev => ({ ...prev, servingMotivation: e.target.value }))}
                    placeholder="¿Qué te motiva a servir en el ministerio?"
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Spiritual Maturity */}
        <TabsContent value="2">
          <Card>
            <CardHeader>
              <CardTitle>Evaluación de Madurez Espiritual</CardTitle>
              <CardDescription>
                Evalúa diferentes aspectos de tu desarrollo y madurez espiritual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { 
                  key: 'spiritualMaturityScore', 
                  title: 'Madurez Espiritual General', 
                  description: 'Nivel general de crecimiento en la fe y conocimiento bíblico' 
                },
                { 
                  key: 'ministryPassionScore', 
                  title: 'Pasión por el Ministerio', 
                  description: 'Entusiasmo y dedicación hacia el servicio ministerial' 
                },
                { 
                  key: 'availabilityScore', 
                  title: 'Disponibilidad para Servir', 
                  description: 'Tiempo y compromiso disponible para actividades ministeriales' 
                }
              ].map(({ key, title, description }) => {
                const scoreInfo = getScoreLabel(formData[key as keyof typeof formData] as number)
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base">{title}</Label>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      <Badge className={`${scoreInfo.color} text-white`}>
                        {formData[key as keyof typeof formData]}% - {scoreInfo.label}
                      </Badge>
                    </div>
                    <Slider
                      value={[formData[key as keyof typeof formData] as number]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, [key]: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )
              })}

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Consejos para la evaluación:</strong> Sé honesto en tu autoevaluación. 
                  Esta información ayudará a encontrar las mejores oportunidades de servicio para ti.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Leadership Aptitude */}
        <TabsContent value="3">
          <Card>
            <CardHeader>
              <CardTitle>Aptitudes de Liderazgo</CardTitle>
              <CardDescription>
                Evalúa tus habilidades y aptitudes para roles de liderazgo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { 
                  key: 'leadershipAptitudeScore', 
                  title: 'Aptitud de Liderazgo General', 
                  description: 'Habilidad natural para liderar y dirigir equipos',
                  icon: <Star className="h-4 w-4" />
                },
                { 
                  key: 'teachingAbility', 
                  title: 'Habilidad para Enseñar', 
                  description: 'Capacidad para enseñar y transmitir conocimiento',
                  icon: <BookOpen className="h-4 w-4" />
                },
                { 
                  key: 'pastoralHeart', 
                  title: 'Corazón Pastoral', 
                  description: 'Compasión y cuidado por las necesidades de otros',
                  icon: <Heart className="h-4 w-4" />
                },
                { 
                  key: 'organizationalSkills', 
                  title: 'Habilidades Organizacionales', 
                  description: 'Capacidad de planificación y coordinación',
                  icon: <Target className="h-4 w-4" />
                },
                { 
                  key: 'communicationSkills', 
                  title: 'Habilidades de Comunicación', 
                  description: 'Capacidad de comunicación verbal y escrita',
                  icon: <MessageSquare className="h-4 w-4" />
                }
              ].map(({ key, title, description, icon }) => {
                const scoreInfo = getScoreLabel(formData[key as keyof typeof formData] as number)
                return (
                  <div key={key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {icon}
                        <div>
                          <Label className="text-base">{title}</Label>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                      </div>
                      <Badge className={`${scoreInfo.color} text-white`}>
                        {formData[key as keyof typeof formData]}% - {scoreInfo.label}
                      </Badge>
                    </div>
                    <Slider
                      value={[formData[key as keyof typeof formData] as number]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, [key]: value }))}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Training and Experience */}
        <TabsContent value="4">
          <Card>
            <CardHeader>
              <CardTitle>Capacitación y Experiencia</CardTitle>
              <CardDescription>
                Información sobre tu experiencia previa y capacitación completada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nivel de experiencia general (1-10)</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[formData.experienceLevel]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline">{formData.experienceLevel}/10</Badge>
                  </div>
                </div>

                <div>
                  <Label>Puntuación de liderazgo actual (1-10)</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Slider
                      value={[formData.leadershipScore]}
                      onValueChange={([value]) => setFormData(prev => ({ ...prev, leadershipScore: value }))}
                      max={10}
                      min={1}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="outline">{formData.leadershipScore}/10</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base">Capacitación y Experiencia Completada</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="leadershipTraining"
                      checked={formData.leadershipTrainingCompleted}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, leadershipTrainingCompleted: checked === true }))
                      }
                    />
                    <Label htmlFor="leadershipTraining">Capacitación en liderazgo completada</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mentoringExp"
                      checked={formData.mentoringExperience}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, mentoringExperience: checked === true }))
                      }
                    />
                    <Label htmlFor="mentoringExp">Experiencia mentoreando a otros</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="discipleshipTraining"
                      checked={formData.discipleshipTraining}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, discipleshipTraining: checked === true }))
                      }
                    />
                    <Label htmlFor="discipleshipTraining">Capacitación en discipulado</Label>
                  </div>
                </div>

                {formData.leadershipTrainingCompleted && (
                  <div>
                    <Label htmlFor="trainingDate">Fecha de capacitación en liderazgo</Label>
                    <Input
                      id="trainingDate"
                      type="date"
                      value={formData.leadershipTrainingDate || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        leadershipTrainingDate: e.target.value 
                      }))}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Resumen de Puntuaciones</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((formData.spiritualMaturityScore + formData.ministryPassionScore + formData.availabilityScore) / 3)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Preparación Voluntario</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((formData.leadershipAptitudeScore + formData.teachingAbility + formData.pastoralHeart + formData.organizationalSkills + formData.communicationSkills) / 5)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Preparación Liderazgo</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{formData.experienceLevel}</div>
                    <div className="text-xs text-muted-foreground">Nivel Experiencia</div>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {[formData.leadershipTrainingCompleted, formData.mentoringExperience, formData.discipleshipTraining].filter(Boolean).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Capacitaciones</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation and Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
              Anterior
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        
        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button onClick={() => setCurrentStep(prev => prev + 1)}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
