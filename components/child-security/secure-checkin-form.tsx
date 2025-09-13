
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Camera, Key, QrCode, AlertTriangle, CheckCircle } from 'lucide-react'
import { WebRTCCamera } from './webrtc-camera'
import { toast } from 'sonner'

interface SecureCheckInFormProps {
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export function SecureCheckInForm({ onSubmit, loading }: SecureCheckInFormProps) {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    emergencyContact: '',
    emergencyPhone: '',
    allergies: '',
    specialNeeds: ''
  })

  const [photos, setPhotos] = useState({
    child: null as string | null,
    parent: null as string | null
  })

  const [currentCameraStep, setCurrentCameraStep] = useState<'child' | 'parent' | null>('child')
  const [securityPin, setSecurityPin] = useState<string>('')
  const [checkInResult, setCheckInResult] = useState<any>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoCapture = (photo: string, type: 'child' | 'parent') => {
    setPhotos(prev => ({ ...prev, [type]: photo }))
    
    if (type === 'child') {
      setCurrentCameraStep('parent')
      toast.success('Foto del niño/a capturada correctamente')
    } else if (type === 'parent') {
      setCurrentCameraStep(null)
      toast.success('Foto del padre/madre capturada correctamente')
    }
  }

  const handleSecureCheckIn = async () => {
    try {
      if (!photos.child || !photos.parent) {
        toast.error('Se requieren ambas fotos para continuar')
        return
      }

      if (!formData.childName || !formData.parentName || !formData.parentPhone) {
        toast.error('Complete los campos obligatorios')
        return
      }

      const checkInData = {
        ...formData,
        childAge: formData.childAge ? parseInt(formData.childAge) : null,
        childPhoto: photos.child,
        parentPhoto: photos.parent
      }

      const response = await fetch('/api/child-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'secure_checkin',
          ...checkInData
        })
      })

      const result = await response.json()

      if (result.success) {
        setCheckInResult(result)
        setSecurityPin(result.securityPin)
        toast.success('Check-in seguro completado exitosamente')
        await onSubmit(result)
      } else {
        toast.error('Error en el check-in seguro')
      }

    } catch (error) {
      console.error('Secure check-in error:', error)
      toast.error('Error al procesar el check-in')
    }
  }

  const resetForm = () => {
    setFormData({
      childName: '',
      childAge: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      emergencyContact: '',
      emergencyPhone: '',
      allergies: '',
      specialNeeds: ''
    })
    setPhotos({ child: null, parent: null })
    setCurrentCameraStep('child')
    setCheckInResult(null)
    setSecurityPin('')
  }

  if (checkInResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-green-700">
            <CheckCircle className="h-6 w-6" />
            Check-In Seguro Completado
          </CardTitle>
          <CardDescription>
            El niño/a ha sido registrado con seguridad biométrica
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Key className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <Label className="text-sm font-medium">PIN de Seguridad</Label>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {securityPin}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Necesario para recoger al niño/a
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <QrCode className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <Label className="text-sm font-medium">Código QR</Label>
              <div className="text-lg font-bold text-green-700 mt-1">
                {checkInResult.qrCode}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Código de identificación
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Para recoger al niño/a necesita AMBOS:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>PIN de seguridad: <strong>{securityPin}</strong></li>
                <li>Verificación fotográfica en el momento de recogida</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Las fotos se almacenan cifradas y se eliminan automáticamente en 7 días.
              El PIN es único para esta sesión.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button onClick={resetForm} variant="outline" className="flex-1">
              Nuevo Check-In
            </Button>
            <Button 
              onClick={() => window.print()} 
              variant="outline" 
              className="flex-1"
            >
              Imprimir Recibo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Check-In Seguro de Niños - WebRTC
          </CardTitle>
          <CardDescription>
            Sistema de verificación biométrica con fotos y PIN de seguridad
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Step 1: Child Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paso 1: Información del Niño/a</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="childName">Nombre del Niño/a *</Label>
              <Input
                id="childName"
                value={formData.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="childAge">Edad</Label>
              <Input
                id="childAge"
                type="number"
                value={formData.childAge}
                onChange={(e) => handleInputChange('childAge', e.target.value)}
                placeholder="Edad en años"
                min="0"
                max="18"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea
                id="allergies"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Especifique alergias conocidas"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="specialNeeds">Necesidades Especiales</Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds}
                onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                placeholder="Medicamentos, cuidados especiales, etc."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paso 2: Información del Padre/Madre</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentName">Nombre del Padre/Madre *</Label>
              <Input
                id="parentName"
                value={formData.parentName}
                onChange={(e) => handleInputChange('parentName', e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>
            <div>
              <Label htmlFor="parentPhone">Teléfono *</Label>
              <Input
                id="parentPhone"
                value={formData.parentPhone}
                onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                placeholder="+57 300 123 4567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentEmail">Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                placeholder="padre@email.com"
              />
            </div>
          </div>

          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div>
              <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="+57 300 987 6543"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Photo Capture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WebRTCCamera
          onPhotoCapture={handlePhotoCapture}
          captureType="child"
          isActive={currentCameraStep === 'child'}
        />
        
        <WebRTCCamera
          onPhotoCapture={handlePhotoCapture}
          captureType="parent"
          isActive={currentCameraStep === 'parent'}
        />
      </div>

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {photos.child && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Foto Niño/a
                </Badge>
              )}
              {photos.parent && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Foto Padre/Madre
                </Badge>
              )}
            </div>

            <Button
              onClick={handleSecureCheckIn}
              disabled={loading || !photos.child || !photos.parent || !formData.childName || !formData.parentName}
              size="lg"
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              {loading ? 'Procesando...' : 'Completar Check-In Seguro'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
