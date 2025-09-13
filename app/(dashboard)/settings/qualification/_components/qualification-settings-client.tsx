

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  UserPlus, 
  Crown, 
  Save, 
  RotateCcw,
  Info,
  Target,
  Brain,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface QualificationSettingsClientProps {
  userRole: string
  churchId: string
}

interface QualificationSettings {
  volunteerMinMembershipDays: number
  volunteerRequireActiveStatus: boolean
  volunteerRequireSpiritualAssessment: boolean
  volunteerMinSpiritualScore: number
  leadershipMinMembershipDays: number
  leadershipRequireVolunteerExp: boolean
  leadershipMinVolunteerDays: number
  leadershipRequireTraining: boolean
  leadershipMinSpiritualScore: number
  leadershipMinLeadershipScore: number
  enableSpiritualMaturityScoring: boolean
  enableLeadershipAptitudeScoring: boolean
  enableMinistryPassionMatching: boolean
  spiritualGiftsWeight: number
  availabilityWeight: number
  experienceWeight: number
  ministryPassionWeight: number
  activityWeight: number
}

export function QualificationSettingsClient({ userRole, churchId }: QualificationSettingsClientProps) {
  const [settings, setSettings] = useState<QualificationSettings>({
    volunteerMinMembershipDays: 0,
    volunteerRequireActiveStatus: true,
    volunteerRequireSpiritualAssessment: false,
    volunteerMinSpiritualScore: 0,
    leadershipMinMembershipDays: 365,
    leadershipRequireVolunteerExp: false,
    leadershipMinVolunteerDays: 0,
    leadershipRequireTraining: false,
    leadershipMinSpiritualScore: 70,
    leadershipMinLeadershipScore: 60,
    enableSpiritualMaturityScoring: true,
    enableLeadershipAptitudeScoring: true,
    enableMinistryPassionMatching: true,
    spiritualGiftsWeight: 0.4,
    availabilityWeight: 0.25,
    experienceWeight: 0.15,
    ministryPassionWeight: 0.1,
    activityWeight: 0.1
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/qualification-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: keyof QualificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/qualification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Configuración guardada exitosamente')
        setHasChanges(false)
      } else {
        toast.error('Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings({
      volunteerMinMembershipDays: 0,
      volunteerRequireActiveStatus: true,
      volunteerRequireSpiritualAssessment: false,
      volunteerMinSpiritualScore: 0,
      leadershipMinMembershipDays: 365,
      leadershipRequireVolunteerExp: false,
      leadershipMinVolunteerDays: 0,
      leadershipRequireTraining: false,
      leadershipMinSpiritualScore: 70,
      leadershipMinLeadershipScore: 60,
      enableSpiritualMaturityScoring: true,
      enableLeadershipAptitudeScoring: true,
      enableMinistryPassionMatching: true,
      spiritualGiftsWeight: 0.4,
      availabilityWeight: 0.25,
      experienceWeight: 0.15,
      ministryPassionWeight: 0.1,
      activityWeight: 0.1
    })
    setHasChanges(true)
    toast.info('Configuración restaurada a valores predeterminados')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Criterios de Calificación</h1>
          <p className="text-muted-foreground">
            Personaliza los criterios para candidatos a voluntarios y liderazgo
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="volunteer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="volunteer" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Candidatos Voluntarios
          </TabsTrigger>
          <TabsTrigger value="leadership" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Listos para Liderazgo
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sistema de Puntuación
          </TabsTrigger>
        </TabsList>

        {/* Volunteer Criteria */}
        <TabsContent value="volunteer">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Criterios para Candidatos a Voluntarios
              </CardTitle>
              <CardDescription>
                Define quién puede ser considerado como candidato para ser voluntario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Mínimo de días como miembro</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.volunteerMinMembershipDays}
                    onChange={(e) => handleSettingChange('volunteerMinMembershipDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.volunteerMinMembershipDays === 0 ? 'Sin restricción' : `${settings.volunteerMinMembershipDays} días (${Math.round(settings.volunteerMinMembershipDays / 30)} meses aprox.)`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Puntaje mínimo de madurez espiritual</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.volunteerMinSpiritualScore]}
                      onValueChange={([value]) => handleSettingChange('volunteerMinSpiritualScore', value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Badge variant="outline">{settings.volunteerMinSpiritualScore}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puntaje mínimo en evaluación de madurez espiritual (0-100)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Requisitos Adicionales</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debe estar activo como miembro</Label>
                    <p className="text-sm text-muted-foreground">Solo miembros con estado activo</p>
                  </div>
                  <Switch
                    checked={settings.volunteerRequireActiveStatus}
                    onCheckedChange={(value) => handleSettingChange('volunteerRequireActiveStatus', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debe completar evaluación espiritual</Label>
                    <p className="text-sm text-muted-foreground">Requiere evaluación de dones espirituales</p>
                  </div>
                  <Switch
                    checked={settings.volunteerRequireSpiritualAssessment}
                    onCheckedChange={(value) => handleSettingChange('volunteerRequireSpiritualAssessment', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leadership Criteria */}
        <TabsContent value="leadership">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Criterios para Listos para Liderazgo
              </CardTitle>
              <CardDescription>
                Define quién puede ser considerado como candidato para liderazgo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Mínimo de días como miembro</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.leadershipMinMembershipDays}
                    onChange={(e) => handleSettingChange('leadershipMinMembershipDays', parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(settings.leadershipMinMembershipDays / 30)} meses aprox. ({Math.round(settings.leadershipMinMembershipDays / 365 * 10) / 10} años)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mínimo de días como voluntario</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.leadershipMinVolunteerDays}
                    onChange={(e) => handleSettingChange('leadershipMinVolunteerDays', parseInt(e.target.value) || 0)}
                    disabled={!settings.leadershipRequireVolunteerExp}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.leadershipMinVolunteerDays === 0 ? 'Sin restricción' : `${Math.round(settings.leadershipMinVolunteerDays / 30)} meses aprox.`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Puntaje mínimo de madurez espiritual</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.leadershipMinSpiritualScore]}
                      onValueChange={([value]) => handleSettingChange('leadershipMinSpiritualScore', value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Badge variant="outline">{settings.leadershipMinSpiritualScore}%</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Puntaje mínimo de aptitud de liderazgo</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[settings.leadershipMinLeadershipScore]}
                      onValueChange={([value]) => handleSettingChange('leadershipMinLeadershipScore', value)}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <Badge variant="outline">{settings.leadershipMinLeadershipScore}%</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-semibold">Requisitos Adicionales</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debe tener experiencia como voluntario</Label>
                    <p className="text-sm text-muted-foreground">Requiere ser voluntario antes del liderazgo</p>
                  </div>
                  <Switch
                    checked={settings.leadershipRequireVolunteerExp}
                    onCheckedChange={(value) => handleSettingChange('leadershipRequireVolunteerExp', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Debe completar entrenamiento de liderazgo</Label>
                    <p className="text-sm text-muted-foreground">Requiere capacitación específica para líderes</p>
                  </div>
                  <Switch
                    checked={settings.leadershipRequireTraining}
                    onCheckedChange={(value) => handleSettingChange('leadershipRequireTraining', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scoring System */}
        <TabsContent value="scoring">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Sistema de Evaluación Inteligente
                </CardTitle>
                <CardDescription>
                  Configura los sistemas de evaluación y puntuación automática
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Sistemas de Evaluación Habilitados</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Evaluación de madurez espiritual</Label>
                      <p className="text-sm text-muted-foreground">Incluye madurez espiritual en calificaciones</p>
                    </div>
                    <Switch
                      checked={settings.enableSpiritualMaturityScoring}
                      onCheckedChange={(value) => handleSettingChange('enableSpiritualMaturityScoring', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Evaluación de aptitud de liderazgo</Label>
                      <p className="text-sm text-muted-foreground">Incluye aptitudes de liderazgo en calificaciones</p>
                    </div>
                    <Switch
                      checked={settings.enableLeadershipAptitudeScoring}
                      onCheckedChange={(value) => handleSettingChange('enableLeadershipAptitudeScoring', value)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Coincidencias de pasión ministerial</Label>
                      <p className="text-sm text-muted-foreground">Incluye pasión por ministerios en recomendaciones</p>
                    </div>
                    <Switch
                      checked={settings.enableMinistryPassionMatching}
                      onCheckedChange={(value) => handleSettingChange('enableMinistryPassionMatching', value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pesos de Puntuación para Recomendaciones IA</CardTitle>
                <CardDescription>
                  Ajusta la importancia de cada factor en las recomendaciones automáticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {[
                    { key: 'spiritualGiftsWeight', label: 'Dones espirituales', description: 'Coincidencia de dones con ministerio' },
                    { key: 'availabilityWeight', label: 'Disponibilidad', description: 'Tiempo disponible para servir' },
                    { key: 'experienceWeight', label: 'Experiencia', description: 'Experiencia previa en ministerio' },
                    { key: 'ministryPassionWeight', label: 'Pasión ministerial', description: 'Interés expresado en ministerios' },
                    { key: 'activityWeight', label: 'Actividad reciente', description: 'Nivel de participación actual' }
                  ].map(({ key, label, description }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <Badge variant="outline">{Math.round(settings[key as keyof QualificationSettings] as number * 100)}%</Badge>
                      </div>
                      <Slider
                        value={[settings[key as keyof QualificationSettings] as number]}
                        onValueChange={([value]) => handleSettingChange(key as keyof QualificationSettings, value)}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Total: {Math.round((settings.spiritualGiftsWeight + settings.availabilityWeight + settings.experienceWeight + settings.ministryPassionWeight + settings.activityWeight) * 100)}%</strong>
                    {Math.abs((settings.spiritualGiftsWeight + settings.availabilityWeight + settings.experienceWeight + settings.ministryPassionWeight + settings.activityWeight) - 1) > 0.01 && 
                      <span className="text-orange-600 ml-2">(Se recomienda que sumen 100%)</span>
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
