

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { 
  Shield, 
  Camera, 
  Key, 
  QrCode, 
  AlertTriangle, 
  CheckCircle, 
  Baby,
  Clock,
  MapPin,
  Phone,
  Mail,
  Heart,
  Users
} from 'lucide-react'
import { toast } from 'sonner'

interface QRChildrenCheckInClientProps {
  qrCode: string
  churchInfo: any
  eventInfo: any
  existingCheckIn: any
}

export function QRChildrenCheckInClient({ 
  qrCode, 
  churchInfo, 
  eventInfo, 
  existingCheckIn 
}: QRChildrenCheckInClientProps) {
  const [step, setStep] = useState(1) // 1: Info, 2: Photos, 3: Confirmation
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    childName: existingCheckIn?.childName || '',
    childAge: existingCheckIn?.childAge?.toString() || '',
    parentName: existingCheckIn?.parentName || '',
    parentPhone: existingCheckIn?.parentPhone || '',
    parentEmail: existingCheckIn?.parentEmail || '',
    emergencyContact: existingCheckIn?.emergencyContact || '',
    emergencyPhone: existingCheckIn?.emergencyPhone || '',
    allergies: existingCheckIn?.allergies || '',
    specialNeeds: existingCheckIn?.specialNeeds || ''
  })

  const [photos, setPhotos] = useState({
    child: null as string | null,
    parent: null as string | null
  })

  const [cameraMode, setCameraMode] = useState<'child' | 'parent' | null>(null)
  const [result, setResult] = useState<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  // Initialize camera
  const startCamera = async (mode: 'child' | 'parent') => {
    try {
      setCameraMode(mode)
      setCameraReady(false)
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })

      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true)
        }
      }
    } catch (error) {
      console.error('Camera access error:', error)
      toast.error('Error al acceder a la cámara. Verifique los permisos.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCameraMode(null)
    setCameraReady(false)
  }

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) {
      toast.error('Cámara no está lista')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) {
      toast.error('Error al capturar foto')
      return
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    // Store photo
    setPhotos(prev => ({ 
      ...prev, 
      [cameraMode!]: imageData 
    }))

    stopCamera()
    toast.success(`✅ Foto ${cameraMode === 'child' ? 'del niño' : 'del padre'} capturada exitosamente`)
  }

  // Retake photo
  const retakePhoto = (type: 'child' | 'parent') => {
    setPhotos(prev => ({ ...prev, [type]: null }))
    startCamera(type)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.childName || !formData.parentName || !formData.parentPhone) {
      toast.error('Nombre del niño, nombre del padre y teléfono son requeridos')
      return
    }

    if (!photos.child || !photos.parent) {
      toast.error('Se requieren fotos del niño y del padre para la seguridad')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/children-check-ins/qr/${qrCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          childAge: formData.childAge ? parseInt(formData.childAge) : null,
          childPhoto: photos.child,
          parentPhoto: photos.parent,
          eventId: eventInfo?.id || null,
          churchId: churchInfo?.id || null
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setStep(3)
        toast.success('🎉 Check-in completado exitosamente')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al completar check-in')
      }
    } catch (error) {
      console.error('Check-in error:', error)
      toast.error('Error al procesar check-in')
    } finally {
      setLoading(false)
    }
  }

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {churchInfo?.logo && (
            <img 
              src={churchInfo.logo} 
              alt={churchInfo.name}
              className="w-16 h-16 mx-auto mb-4 rounded-full"
            />
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Check-in de Niños
          </h1>
          <p className="text-gray-600">
            {churchInfo?.name || 'Iglesia'} - Registro via QR
          </p>
          {eventInfo && (
            <Badge variant="secondary" className="mt-2">
              📅 {eventInfo.title}
            </Badge>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Paso {step} de 3</span>
            <span className="text-sm text-gray-500">
              {step === 1 && 'Información del Niño'}
              {step === 2 && 'Fotos de Seguridad'}
              {step === 3 && 'Confirmación'}
            </span>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-5 h-5" />
                Información del Niño
              </CardTitle>
              <CardDescription>
                Complete la información básica de su hijo/a
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childName">Nombre del Niño *</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => handleInputChange('childName', e.target.value)}
                    placeholder="Nombre completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childAge">Edad (años)</Label>
                  <Input
                    id="childAge"
                    type="number"
                    value={formData.childAge}
                    onChange={(e) => handleInputChange('childAge', e.target.value)}
                    placeholder="5"
                    min="0"
                    max="18"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parentName">Nombre del Padre/Madre *</Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleInputChange('parentName', e.target.value)}
                    placeholder="Nombre completo del padre/madre"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parentPhone">Teléfono *</Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parentEmail">Email (Opcional)</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange('parentEmail', e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
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
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Alergias (si aplica)</Label>
                <Textarea
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder="Describir cualquier alergia conocida..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="specialNeeds">Necesidades Especiales (si aplica)</Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                  placeholder="Describir cualquier necesidad especial..."
                  rows={2}
                />
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full mt-6"
                disabled={!formData.childName || !formData.parentName || !formData.parentPhone}
              >
                Continuar a Fotos de Seguridad
                <Camera className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Security Photos */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Fotos de Seguridad
              </CardTitle>
              <CardDescription>
                Para la seguridad de su hijo/a, necesitamos fotos del niño y del padre/madre
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Info */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  🔒 Las fotos se eliminan automáticamente después de 7 días por seguridad.
                  Se requieren ambas fotos para completar el check-in.
                </AlertDescription>
              </Alert>

              {/* Child Photo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Baby className="w-5 h-5 text-blue-600" />
                  <Label className="text-lg font-medium">Foto del Niño</Label>
                </div>
                
                {!photos.child ? (
                  <div className="space-y-3">
                    {cameraMode === 'child' ? (
                      <div className="space-y-3">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover"
                          />
                          {!cameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="text-white">Preparando cámara...</div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            className="flex-1"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capturar Foto
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={stopCamera}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startCamera('child')}
                        variant="outline" 
                        className="w-full h-32 border-dashed border-2"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Tomar Foto del Niño</p>
                        </div>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img 
                        src={photos.child} 
                        alt="Foto del niño"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Capturada
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => retakePhoto('child')}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Tomar Nueva Foto
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              {/* Parent Photo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <Label className="text-lg font-medium">Foto del Padre/Madre</Label>
                </div>
                
                {!photos.parent ? (
                  <div className="space-y-3">
                    {cameraMode === 'parent' ? (
                      <div className="space-y-3">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover"
                          />
                          {!cameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <div className="text-white">Preparando cámara...</div>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button 
                            onClick={capturePhoto}
                            disabled={!cameraReady}
                            className="flex-1"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Capturar Foto
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={stopCamera}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => startCamera('parent')}
                        variant="outline" 
                        className="w-full h-32 border-dashed border-2"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Tomar Foto del Padre/Madre</p>
                        </div>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img 
                        src={photos.parent} 
                        alt="Foto del padre/madre"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Capturada
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => retakePhoto('parent')}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Tomar Nueva Foto
                    </Button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Anterior
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!photos.child || !photos.parent || loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Completar Check-in
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                Check-in Completado
              </CardTitle>
              <CardDescription>
                Su hijo/a ha sido registrado exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">¡Check-in Exitoso!</h3>
                    <p className="text-green-600">Su hijo/a está seguro con nosotros</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Baby className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>Niño:</strong> {formData.childName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm">
                      <strong>Hora:</strong> {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security PIN */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Key className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-blue-800">Código de Seguridad</h4>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-blue-900 mb-2">
                    {result.securityPin}
                  </div>
                  <p className="text-sm text-blue-600">
                    💡 Guarde este código para recoger a su hijo/a
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-800">Instrucciones de Recogida</h4>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Presente su código de seguridad: <strong>{result.securityPin}</strong></li>
                  <li>• Se le tomará una foto para verificar identidad</li>
                  <li>• Solo padres autorizados pueden recoger al niño</li>
                  <li>• En caso de emergencia, contacte al personal de la iglesia</li>
                </ul>
              </div>

              {/* Contact Info */}
              {eventInfo && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Información del Evento</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Evento:</span>
                      <span>{eventInfo.title}</span>
                    </div>
                    {eventInfo.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{eventInfo.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => window.close()}
                className="w-full"
                variant="outline"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Hidden Canvas for Photo Capture */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
      </div>
    </div>
  )
}
