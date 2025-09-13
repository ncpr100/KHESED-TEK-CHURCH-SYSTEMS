
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Heart, Users, Baby, Crown, QrCode, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface VisitorProfileFormProps {
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

const MINISTRY_OPTIONS = [
  { id: 'worship', label: 'Adoración y Música', icon: '🎵' },
  { id: 'children', label: 'Ministerio Infantil', icon: '👶' },
  { id: 'youth', label: 'Ministerio Juvenil', icon: '🧑‍🤝‍🧑' },
  { id: 'seniors', label: 'Adultos Mayores', icon: '👴' },
  { id: 'kitchen', label: 'Cocina y Alimentación', icon: '🍽️' },
  { id: 'security', label: 'Seguridad', icon: '🛡️' },
  { id: 'tech', label: 'Tecnología y Multimedia', icon: '💻' },
  { id: 'prayer', label: 'Intercesión y Oración', icon: '🙏' },
  { id: 'evangelism', label: 'Evangelización', icon: '📢' },
  { id: 'discipleship', label: 'Discipulado', icon: '📖' }
]

const REFERRAL_SOURCES = [
  'Miembro de la iglesia',
  'Redes sociales',
  'Sitio web',
  'Volante/Folleto',
  'Radio/TV',
  'Evento especial',
  'Pasando por aquí',
  'Google/Internet',
  'Familiar/Amigo',
  'Otro'
]

export function VisitorProfileForm({ onSubmit, loading }: VisitorProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isFirstTime: true,
    visitReason: '',
    prayerRequest: '',
    ageGroup: '',
    familyStatus: '',
    referredBy: '',
    ministryInterest: [] as string[]
  })

  const [automationResult, setAutomationResult] = useState<any>(null)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMinistryToggle = (ministryId: string) => {
    setFormData(prev => ({
      ...prev,
      ministryInterest: prev.ministryInterest.includes(ministryId)
        ? prev.ministryInterest.filter(id => id !== ministryId)
        : [...prev.ministryInterest, ministryId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!formData.firstName || !formData.lastName) {
        toast.error('Nombre y apellido son obligatorios')
        return
      }

      // Create check-in record
      const checkInResponse = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          visitorType: determineVisitorType(),
          engagementScore: calculateInitialEngagement()
        })
      })

      const checkInResult = await checkInResponse.json()

      if (checkInResult.success) {
        // Trigger automation
        const automationResponse = await fetch('/api/visitor-automation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'trigger_automation',
            checkInId: checkInResult.checkIn.id
          })
        })

        if (automationResponse.ok) {
          setAutomationResult({
            checkInId: checkInResult.checkIn.id,
            visitorType: determineVisitorType(),
            automationTriggered: true
          })
          
          toast.success('Visitante registrado y automatización activada')
          await onSubmit(checkInResult)
        }
      }

    } catch (error) {
      console.error('Visitor registration error:', error)
      toast.error('Error al registrar visitante')
    }
  }

  const determineVisitorType = () => {
    if (formData.prayerRequest) return 'PRAYER_REQUEST'
    if (formData.ministryInterest.length > 0) return 'MINISTRY_INTEREST'
    if (formData.isFirstTime) return 'FIRST_TIME'
    return 'RETURN'
  }

  const calculateInitialEngagement = () => {
    let score = 10 // Base score
    
    if (formData.email) score += 20
    if (formData.phone) score += 15
    if (formData.prayerRequest) score += 25
    if (formData.ministryInterest.length > 0) score += 20
    if (formData.referredBy) score += 10
    
    return Math.min(score, 100)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isFirstTime: true,
      visitReason: '',
      prayerRequest: '',
      ageGroup: '',
      familyStatus: '',
      referredBy: '',
      ministryInterest: []
    })
    setAutomationResult(null)
  }

  if (automationResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-700">
            <Zap className="h-6 w-6" />
            Visitante Registrado Exitosamente
          </CardTitle>
          <CardDescription>
            Automatización de seguimiento activada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Badge variant="outline" className="mb-3">
              {automationResult.visitorType}
            </Badge>
            <p className="text-sm text-muted-foreground">
              Se ha activado la secuencia de seguimiento automático apropiada
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Próximos pasos automáticos:</h4>
            <div className="space-y-2">
              {automationResult.visitorType === 'FIRST_TIME' && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Bienvenida inmediata por email
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Video de bienvenida del pastor (2 días)
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Conectar con ministerios de interés (1 semana)
              </div>
            </div>
          </div>

          <Button onClick={resetForm} className="w-full">
            Registrar Otro Visitante
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Registro de Visitante con Automatización
          </CardTitle>
          <CardDescription>
            Sistema inteligente de seguimiento y conexión ministerial
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Nombre"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Apellido"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isFirstTime"
              checked={formData.isFirstTime}
              onCheckedChange={(checked) => handleInputChange('isFirstTime', checked)}
            />
            <Label htmlFor="isFirstTime">¿Es su primera vez visitando nuestra iglesia?</Label>
          </div>
        </CardContent>
      </Card>

      {/* Visit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la Visita</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ageGroup">Grupo de Edad</Label>
              <Select value={formData.ageGroup} onValueChange={(value) => handleInputChange('ageGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione grupo de edad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="children">Niños (0-12)</SelectItem>
                  <SelectItem value="youth">Jóvenes (13-17)</SelectItem>
                  <SelectItem value="young-adults">Jóvenes Adultos (18-30)</SelectItem>
                  <SelectItem value="adults">Adultos (31-60)</SelectItem>
                  <SelectItem value="seniors">Adultos Mayores (60+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="familyStatus">Estado Familiar</Label>
              <Select value={formData.familyStatus} onValueChange={(value) => handleInputChange('familyStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione estado familiar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Soltero/a</SelectItem>
                  <SelectItem value="married">Casado/a</SelectItem>
                  <SelectItem value="family-with-kids">Familia con niños</SelectItem>
                  <SelectItem value="widowed">Viudo/a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="referredBy">¿Cómo se enteró de nuestra iglesia?</Label>
            <Select value={formData.referredBy} onValueChange={(value) => handleInputChange('referredBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione cómo nos conoció" />
              </SelectTrigger>
              <SelectContent>
                {REFERRAL_SOURCES.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="visitReason">Motivo de la visita (opcional)</Label>
            <Textarea
              id="visitReason"
              value={formData.visitReason}
              onChange={(e) => handleInputChange('visitReason', e.target.value)}
              placeholder="¿Qué lo motivó a visitarnos hoy?"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ministry Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ministerios de Interés
          </CardTitle>
          <CardDescription>
            Seleccione los ministerios en los que le gustaría participar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MINISTRY_OPTIONS.map(ministry => (
              <div key={ministry.id} className="flex items-center space-x-3">
                <Checkbox
                  id={ministry.id}
                  checked={formData.ministryInterest.includes(ministry.id)}
                  onCheckedChange={() => handleMinistryToggle(ministry.id)}
                />
                <Label htmlFor={ministry.id} className="flex items-center gap-2 cursor-pointer">
                  <span>{ministry.icon}</span>
                  {ministry.label}
                </Label>
              </div>
            ))}
          </div>

          {formData.ministryInterest.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Automatización activada:</strong> Se conectará automáticamente con líderes de los ministerios seleccionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prayer Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Petición de Oración
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="prayerRequest">¿Hay algo por lo que podamos orar? (opcional)</Label>
            <Textarea
              id="prayerRequest"
              value={formData.prayerRequest}
              onChange={(e) => handleInputChange('prayerRequest', e.target.value)}
              placeholder="Compartir su petición de oración (será confidencial)"
              rows={4}
            />
          </div>

          {formData.prayerRequest && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">
                <strong>Integración con Muro de Oración:</strong> Su petición será incluida en nuestro sistema de seguimiento de oración
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Puntuación de Compromiso Inicial:</p>
              <p className="text-xs text-muted-foreground">
                {calculateInitialEngagement()}/100 puntos
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.firstName || !formData.lastName}
              size="lg"
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Registrando...' : 'Registrar y Activar Automatización'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
