
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, Star, Users, ChevronRight, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface SpiritualGift {
  id: string
  name: string
  category: string
  description?: string
}

interface SpiritualAssessmentProps {
  memberId: string
  memberName: string
  existingProfile?: any
  onSave?: (profile: any) => void
}

export function SpiritualAssessment({ 
  memberId, 
  memberName, 
  existingProfile, 
  onSave 
}: SpiritualAssessmentProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [spiritualGifts, setSpiritualGifts] = useState<Record<string, SpiritualGift[]>>({})
  const [ministries, setMinistries] = useState<any[]>([])

  const [formData, setFormData] = useState({
    primaryGifts: existingProfile?.primaryGifts || [],
    secondaryGifts: existingProfile?.secondaryGifts || [],
    spiritualCalling: existingProfile?.spiritualCalling || '',
    ministryPassions: existingProfile?.ministryPassions || [],
    experienceLevel: existingProfile?.experienceLevel || [5],
    leadershipScore: existingProfile?.leadershipScore || [5],
    servingMotivation: existingProfile?.servingMotivation || '',
    previousExperience: existingProfile?.previousExperience || [],
    trainingCompleted: existingProfile?.trainingCompleted || []
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [giftsResponse, ministriesResponse] = await Promise.all([
        fetch('/api/spiritual-gifts'),
        fetch('/api/ministries')
      ])

      if (giftsResponse.ok) {
        const giftsData = await giftsResponse.json()
        setSpiritualGifts(giftsData.categories || {})
      }

      if (ministriesResponse.ok) {
        const ministriesData = await ministriesResponse.json()
        setMinistries(ministriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleGiftToggle = (giftId: string, isPrimary: boolean) => {
    if (isPrimary) {
      const newPrimaryGifts = formData.primaryGifts.includes(giftId)
        ? formData.primaryGifts.filter((id: string) => id !== giftId)
        : [...formData.primaryGifts, giftId]
      
      setFormData(prev => ({ ...prev, primaryGifts: newPrimaryGifts }))
    } else {
      const newSecondaryGifts = formData.secondaryGifts.includes(giftId)
        ? formData.secondaryGifts.filter((id: string) => id !== giftId)
        : [...formData.secondaryGifts, giftId]
      
      setFormData(prev => ({ ...prev, secondaryGifts: newSecondaryGifts }))
    }
  }

  const handleMinistryToggle = (ministryId: string) => {
    const newMinistryPassions = formData.ministryPassions.includes(ministryId)
      ? formData.ministryPassions.filter((id: string) => id !== ministryId)
      : [...formData.ministryPassions, ministryId]
    
    setFormData(prev => ({ ...prev, ministryPassions: newMinistryPassions }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/member-spiritual-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...formData,
          experienceLevel: formData.experienceLevel[0],
          leadershipScore: formData.leadershipScore[0]
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Perfil espiritual guardado exitosamente')
        onSave?.(data.profile)
      } else {
        throw new Error('Error saving profile')
      }
    } catch (error) {
      console.error('Error saving spiritual profile:', error)
      toast.error('Error al guardar el perfil espiritual')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando evaluación espiritual...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Evaluación Espiritual - {memberName}
          </CardTitle>
          <CardDescription>
            Complete esta evaluación para identificar los dones espirituales y ministerios de interés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Primary Spiritual Gifts */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Dones Espirituales Principales
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione los dones que mejor describen sus fortalezas espirituales principales
            </p>
            <div className="grid gap-4">
              {Object.entries(spiritualGifts).map(([category, gifts]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-2 text-primary">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {gifts.map(gift => (
                      <div
                        key={gift.id}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                          formData.primaryGifts.includes(gift.id)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleGiftToggle(gift.id, true)}
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={formData.primaryGifts.includes(gift.id)}
                            onChange={() => {}}
                          />
                          <span className="text-sm font-medium">{gift.name}</span>
                        </div>
                        {gift.description && (
                          <p className="text-xs opacity-75 mt-1">{gift.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Spiritual Gifts */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Dones Espirituales Secundarios
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione dones en los que tiene habilidad o interés en desarrollar
            </p>
            <div className="grid gap-4">
              {Object.entries(spiritualGifts).map(([category, gifts]) => (
                <div key={`secondary-${category}`}>
                  <h4 className="font-medium text-sm mb-2 text-secondary-foreground">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {gifts.map(gift => (
                      <Badge
                        key={`secondary-${gift.id}`}
                        variant={formData.secondaryGifts.includes(gift.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleGiftToggle(gift.id, false)}
                      >
                        {gift.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spiritual Calling */}
          <div className="space-y-2">
            <Label htmlFor="spiritualCalling" className="text-base font-semibold">
              Llamado Espiritual Personal
            </Label>
            <p className="text-sm text-muted-foreground">
              Describa en sus propias palabras cómo siente que Dios lo está llamando a servir
            </p>
            <Textarea
              id="spiritualCalling"
              placeholder="Ejemplo: Siento que Dios me ha llamado a trabajar con jóvenes y ayudarles a crecer en su fe..."
              value={formData.spiritualCalling}
              onChange={(e) => setFormData(prev => ({ ...prev, spiritualCalling: e.target.value }))}
              rows={4}
            />
          </div>

          {/* Ministry Passions */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Ministerios de Interés
            </Label>
            <p className="text-sm text-muted-foreground mb-4">
              Seleccione los ministerios en los que le gustaría servir o aprender más
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ministries.map(ministry => (
                <div
                  key={ministry.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.ministryPassions.includes(ministry.id)
                      ? 'bg-secondary border-secondary text-secondary-foreground'
                      : 'hover:border-secondary'
                  }`}
                  onClick={() => handleMinistryToggle(ministry.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{ministry.name}</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      formData.ministryPassions.includes(ministry.id) ? 'rotate-90' : ''
                    }`} />
                  </div>
                  {ministry.description && (
                    <p className="text-sm opacity-75 mt-1">{ministry.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Experience and Leadership Levels */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Nivel de Experiencia en Ministerio
              </Label>
              <div className="space-y-2">
                <Slider
                  value={formData.experienceLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Principiante (1)</span>
                  <span className="font-medium">Nivel: {formData.experienceLevel[0]}</span>
                  <span>Experto (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Disposición para Liderazgo
              </Label>
              <div className="space-y-2">
                <Slider
                  value={formData.leadershipScore}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, leadershipScore: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Prefiero seguir (1)</span>
                  <span className="font-medium">Nivel: {formData.leadershipScore[0]}</span>
                  <span>Listo para liderar (10)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Serving Motivation */}
          <div className="space-y-2">
            <Label htmlFor="servingMotivation" className="text-base font-semibold">
              Motivación para Servir
            </Label>
            <p className="text-sm text-muted-foreground">
              ¿Qué lo motiva a querer servir en el ministerio?
            </p>
            <Textarea
              id="servingMotivation"
              placeholder="Ejemplo: Quiero servir porque deseo ver cómo Dios transforma vidas a través de mi servicio..."
              value={formData.servingMotivation}
              onChange={(e) => setFormData(prev => ({ ...prev, servingMotivation: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="lg"
              className="px-8"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Evaluación
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
