
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Member } from '@prisma/client'
import { Save, X, User, Heart, Calendar, Brain } from 'lucide-react'
import { SpiritualAssessment } from './spiritual-assessment'
import { AvailabilityMatrix } from './availability-matrix'
import { toast } from 'sonner'

interface EnhancedMemberFormProps {
  member?: Member | null
  onSave: (memberData: any) => void
  onCancel: () => void
  isLoading?: boolean
}

export function EnhancedMemberForm({ member, onSave, onCancel, isLoading }: EnhancedMemberFormProps) {
  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    email: member?.email || '',
    phone: member?.phone || '',
    address: member?.address || '',
    city: member?.city || '',
    state: member?.state || '',
    zipCode: member?.zipCode || '',
    birthDate: member?.birthDate ? member.birthDate.toISOString().split('T')[0] : '',
    baptismDate: member?.baptismDate ? member.baptismDate.toISOString().split('T')[0] : '',
    membershipDate: member?.membershipDate ? member.membershipDate.toISOString().split('T')[0] : '',
    maritalStatus: member?.maritalStatus || '',
    gender: member?.gender || '',
    occupation: member?.occupation || '',
    notes: member?.notes || '',
    // Enhanced CRM fields
    emergencyContact: member?.emergencyContact || '',
    transportationOwned: member?.transportationOwned || false,
    childcareAvailable: member?.childcareAvailable || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [formData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario')
      return
    }

    const memberData = {
      ...formData,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
      baptismDate: formData.baptismDate ? new Date(formData.baptismDate) : null,
      membershipDate: formData.membershipDate ? new Date(formData.membershipDate) : null,
    }

    onSave(memberData)
    setHasUnsavedChanges(false)
  }

  const handleSpiritualAssessmentSave = (profile: any) => {
    toast.success('Evaluación espiritual guardada')
    // Optionally update local state or trigger parent refresh
  }

  const handleAvailabilityMatrixSave = (matrix: any) => {
    toast.success('Disponibilidad guardada')
    // Optionally update local state or trigger parent refresh
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {member ? 'Editar Miembro' : 'Nuevo Miembro'}
          </h2>
          <p className="text-muted-foreground">
            Complete la información del miembro con evaluación espiritual y disponibilidad
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600">
              Cambios sin guardar
            </Badge>
          )}
          {member?.spiritualGifts && (
            <Badge variant="secondary" className="text-green-700">
              <Heart className="h-3 w-3 mr-1" />
              Evaluación completa
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Información Básica</TabsTrigger>
          <TabsTrigger value="spiritual" className="relative">
            Evaluación Espiritual
            {member?.spiritualGifts && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="availability">
            Disponibilidad
            {member?.availabilityScore && member.availabilityScore > 0 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal y Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">Estado/Provincia</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Código Postal</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar género" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="femenino">Femenino</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                        <SelectItem value="no-especificar">Prefiero no especificar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Church Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baptismDate">Fecha de Bautismo</Label>
                    <Input
                      id="baptismDate"
                      type="date"
                      value={formData.baptismDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, baptismDate: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="membershipDate">Fecha de Membresía</Label>
                    <Input
                      id="membershipDate"
                      type="date"
                      value={formData.membershipDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, membershipDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Enhanced CRM Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Adicional</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="occupation">Ocupación</Label>
                      <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Estado Civil</Label>
                      <Select value={formData.maritalStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soltero">Soltero(a)</SelectItem>
                          <SelectItem value="casado">Casado(a)</SelectItem>
                          <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="viudo">Viudo(a)</SelectItem>
                          <SelectItem value="union-libre">Unión Libre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Nombre y teléfono de contacto de emergencia"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-6">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Guardando...' : member ? 'Actualizar Miembro' : 'Crear Miembro'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spiritual Assessment Tab */}
        <TabsContent value="spiritual">
          {member?.id ? (
            <SpiritualAssessment 
              memberId={member.id}
              memberName={`${formData.firstName} ${formData.lastName}`}
              onSave={handleSpiritualAssessmentSave}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Primero guarde la información básica</h3>
                <p className="text-muted-foreground">
                  La evaluación espiritual estará disponible después de crear el miembro
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Availability Matrix Tab */}
        <TabsContent value="availability">
          {member?.id ? (
            <AvailabilityMatrix
              memberId={member.id}
              memberName={`${formData.firstName} ${formData.lastName}`}
              onSave={handleAvailabilityMatrixSave}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Primero guarde la información básica</h3>
                <p className="text-muted-foreground">
                  La matriz de disponibilidad estará disponible después de crear el miembro
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
