
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Clock, MapPin, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AvailabilityMatrixProps {
  memberId: string
  memberName: string
  existingMatrix?: any
  onSave?: (matrix: any) => void
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes', short: 'L' },
  { key: 'tuesday', label: 'Martes', short: 'M' },
  { key: 'wednesday', label: 'Miércoles', short: 'X' },
  { key: 'thursday', label: 'Jueves', short: 'J' },
  { key: 'friday', label: 'Viernes', short: 'V' },
  { key: 'saturday', label: 'Sábado', short: 'S' },
  { key: 'sunday', label: 'Domingo', short: 'D' }
]

const TIME_SLOTS = [
  { key: 'morning', label: 'Mañana (6:00 - 12:00)', value: 'morning' },
  { key: 'afternoon', label: 'Tarde (12:00 - 18:00)', value: 'afternoon' },
  { key: 'evening', label: 'Noche (18:00 - 22:00)', value: 'evening' }
]

export function AvailabilityMatrix({ 
  memberId, 
  memberName, 
  existingMatrix, 
  onSave 
}: AvailabilityMatrixProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ministries, setMinistries] = useState<any[]>([])

  const [formData, setFormData] = useState({
    recurringAvailability: existingMatrix?.recurringAvailability || {},
    blackoutDates: existingMatrix?.blackoutDates || [],
    preferredMinistries: existingMatrix?.preferredMinistries || [],
    maxCommitmentsPerMonth: existingMatrix?.maxCommitmentsPerMonth || [4],
    preferredTimeSlots: existingMatrix?.preferredTimeSlots || [],
    travelWillingness: existingMatrix?.travelWillingness || [5]
  })

  const [newBlackoutStart, setNewBlackoutStart] = useState('')
  const [newBlackoutEnd, setNewBlackoutEnd] = useState('')
  const [newBlackoutReason, setNewBlackoutReason] = useState('')

  useEffect(() => {
    fetchMinistries()
  }, [])

  const fetchMinistries = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ministries')
      if (response.ok) {
        const data = await response.json()
        setMinistries(data)
      }
    } catch (error) {
      console.error('Error fetching ministries:', error)
      toast.error('Error al cargar ministerios')
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityToggle = (day: string, timeSlot: string) => {
    const currentAvailability = formData.recurringAvailability
    
    if (!currentAvailability[day]) {
      currentAvailability[day] = []
    }

    const daySlots = currentAvailability[day]
    const newSlots = daySlots.includes(timeSlot)
      ? daySlots.filter((slot: string) => slot !== timeSlot)
      : [...daySlots, timeSlot]

    setFormData(prev => ({
      ...prev,
      recurringAvailability: {
        ...currentAvailability,
        [day]: newSlots
      }
    }))
  }

  const handleMinistryToggle = (ministryId: string) => {
    const newPreferred = formData.preferredMinistries.includes(ministryId)
      ? formData.preferredMinistries.filter((id: string) => id !== ministryId)
      : [...formData.preferredMinistries, ministryId]
    
    setFormData(prev => ({ ...prev, preferredMinistries: newPreferred }))
  }

  const handleTimeSlotToggle = (timeSlot: string) => {
    const newTimeSlots = formData.preferredTimeSlots.includes(timeSlot)
      ? formData.preferredTimeSlots.filter((slot: string) => slot !== timeSlot)
      : [...formData.preferredTimeSlots, timeSlot]
    
    setFormData(prev => ({ ...prev, preferredTimeSlots: newTimeSlots }))
  }

  const addBlackoutPeriod = () => {
    if (!newBlackoutStart || !newBlackoutEnd) {
      toast.error('Por favor complete las fechas de inicio y fin')
      return
    }

    const newBlackout = {
      start: newBlackoutStart,
      end: newBlackoutEnd,
      reason: newBlackoutReason || 'No disponible'
    }

    setFormData(prev => ({
      ...prev,
      blackoutDates: [...prev.blackoutDates, newBlackout]
    }))

    setNewBlackoutStart('')
    setNewBlackoutEnd('')
    setNewBlackoutReason('')
  }

  const removeBlackoutPeriod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blackoutDates: prev.blackoutDates.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/availability-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          ...formData,
          maxCommitmentsPerMonth: formData.maxCommitmentsPerMonth[0],
          travelWillingness: formData.travelWillingness[0]
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Disponibilidad guardada exitosamente')
        onSave?.(data.matrix)
      } else {
        throw new Error('Error saving availability')
      }
    } catch (error) {
      console.error('Error saving availability matrix:', error)
      toast.error('Error al guardar la disponibilidad')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando configuración de disponibilidad...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Matriz de Disponibilidad - {memberName}
          </CardTitle>
          <CardDescription>
            Configure cuando está disponible para servir en ministerios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Weekly Availability Grid */}
          <div>
            <Label className="text-base font-semibold mb-4 block">
              Disponibilidad Semanal Recurrente
            </Label>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-4 gap-2 min-w-[600px]">
                <div></div> {/* Empty corner */}
                {TIME_SLOTS.map((slot: any) => (
                  <div key={slot.key} className="text-center text-sm font-medium p-2">
                    <Clock className="h-4 w-4 mx-auto mb-1" />
                    {slot.label}
                  </div>
                ))}
                
                {DAYS_OF_WEEK.map(day => (
                  <div key={day.key} className="contents">
                    <div className="text-sm font-medium p-3 flex items-center">
                      <span className="hidden md:inline">{day.label}</span>
                      <span className="md:hidden">{day.short}</span>
                    </div>
                    {TIME_SLOTS.map((slot: any) => (
                      <div key={`${day.key}-${slot.key}`} className="p-2">
                        <Checkbox
                          checked={formData.recurringAvailability[day.key]?.includes(slot.value) || false}
                          onCheckedChange={() => handleAvailabilityToggle(day.key, slot.value)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Time Slots */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Horarios Preferidos en General
            </Label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot: any) => (
                <Badge
                  key={slot.key}
                  variant={formData.preferredTimeSlots.includes(slot.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTimeSlotToggle(slot.value)}
                >
                  {slot.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Ministries */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Ministerios Preferidos
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ministries.map(ministry => (
                <div
                  key={ministry.id}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    formData.preferredMinistries.includes(ministry.id)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleMinistryToggle(ministry.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.preferredMinistries.includes(ministry.id)}
                      onChange={() => {}}
                    />
                    <span className="text-sm font-medium">{ministry.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commitments and Travel */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-base font-semibold">
                Máximo Compromisos por Mes
              </Label>
              <div className="space-y-2">
                <Slider
                  value={formData.maxCommitmentsPerMonth}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, maxCommitmentsPerMonth: value }))}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 compromiso</span>
                  <span className="font-medium">{formData.maxCommitmentsPerMonth[0]} compromisos</span>
                  <span>20 compromisos</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Disposición para Viajar/Desplazarse
              </Label>
              <div className="space-y-2">
                <Slider
                  value={formData.travelWillingness}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, travelWillingness: value }))}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Solo local (1)</span>
                  <span className="font-medium">Nivel: {formData.travelWillingness[0]}</span>
                  <span>Cualquier lugar (10)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blackout Dates */}
          <div>
            <Label className="text-base font-semibold mb-3 block">
              Períodos No Disponibles
            </Label>
            
            {/* Add new blackout period */}
            <div className="grid md:grid-cols-4 gap-3 p-4 border rounded-lg bg-muted/30 mb-4">
              <div>
                <Label className="text-sm">Fecha Inicio</Label>
                <Input
                  type="date"
                  value={newBlackoutStart}
                  onChange={(e) => setNewBlackoutStart(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Fecha Fin</Label>
                <Input
                  type="date"
                  value={newBlackoutEnd}
                  onChange={(e) => setNewBlackoutEnd(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">Motivo (opcional)</Label>
                <Input
                  placeholder="Vacaciones, trabajo..."
                  value={newBlackoutReason}
                  onChange={(e) => setNewBlackoutReason(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addBlackoutPeriod} size="sm">
                  Agregar
                </Button>
              </div>
            </div>

            {/* Existing blackout periods */}
            <div className="space-y-2">
              {formData.blackoutDates.map((blackout: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">
                      {new Date(blackout.start).toLocaleDateString()} - {new Date(blackout.end).toLocaleDateString()}
                    </span>
                    {blackout.reason && (
                      <span className="text-sm text-muted-foreground ml-2">({blackout.reason})</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeBlackoutPeriod(index)}
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
              {formData.blackoutDates.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No hay períodos de no disponibilidad configurados
                </p>
              )}
            </div>
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
                  Guardar Disponibilidad
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
