

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { UserCheck, QrCode, Users, Clock, Phone, Mail, MessageSquare, Shield, Camera, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { VisitorProfileForm } from '@/components/visitor-automation/visitor-profile-form'
import { SecureCheckInForm } from '@/components/child-security/secure-checkin-form'

interface CheckIn {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  isFirstTime: boolean
  visitReason?: string
  prayerRequest?: string
  qrCode?: string
  checkedInAt: string
  event?: { title: string }
  followUps: FollowUp[]
  
  // Enhanced visitor tracking
  visitorType?: string
  ministryInterest?: string[]
  ageGroup?: string
  familyStatus?: string
  referredBy?: string
  followUpFormId?: string
  automationTriggered: boolean
  lastContactDate?: string
  engagementScore: number
}

interface ChildCheckIn {
  id: string
  childName: string
  childAge?: number
  parentName: string
  parentPhone: string
  parentEmail?: string
  emergencyContact?: string
  emergencyPhone?: string
  allergies?: string
  specialNeeds?: string
  qrCode: string
  checkedIn: boolean
  checkedOut: boolean
  checkedInAt: string
  checkedOutAt?: string
  event?: { title: string }
  
  // Enhanced security features
  childPhotoUrl?: string
  parentPhotoUrl?: string
  securityPin: string
  biometricHash?: string
  photoTakenAt?: string
  backupAuthCodes: string[]
  pickupAttempts: any[]
  requiresBothAuth: boolean
}

interface FollowUp {
  id: string
  followUpType: string
  status: string
  scheduledAt?: string
  notes?: string
  assignedUser?: { name: string }
}

interface CheckInsClientProps {
  userRole: string
  churchId: string
}

export function CheckInsClient({ userRole, churchId }: CheckInsClientProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [childrenCheckIns, setChildrenCheckIns] = useState<ChildCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visitors')

  // Form states for visitor check-in
  const [visitorForm, setVisitorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isFirstTime: false,
    visitReason: '',
    prayerRequest: ''
  })

  // Form states for child check-in
  const [childForm, setChildForm] = useState({
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

  const [isVisitorDialogOpen, setIsVisitorDialogOpen] = useState(false)
  const [isChildDialogOpen, setIsChildDialogOpen] = useState(false)
  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState(false)
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null)
  const [generatedQrInfo, setGeneratedQrInfo] = useState<any>(null)

  useEffect(() => {
    fetchCheckIns()
    fetchChildrenCheckIns()
  }, [])

  const fetchCheckIns = async () => {
    try {
      const response = await fetch('/api/check-ins')
      if (response.ok) {
        const data = await response.json()
        setCheckIns(data)
      } else {
        toast.error('Error al cargar check-ins')
      }
    } catch (error) {
      toast.error('Error al cargar check-ins')
    } finally {
      setLoading(false)
    }
  }

  const fetchChildrenCheckIns = async () => {
    try {
      const response = await fetch('/api/children-check-ins')
      if (response.ok) {
        const data = await response.json()
        setChildrenCheckIns(data)
      } else {
        toast.error('Error al cargar check-ins de niños')
      }
    } catch (error) {
      toast.error('Error al cargar check-ins de niños')
    }
  }

  const handleVisitorCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!visitorForm.firstName || !visitorForm.lastName) {
      toast.error('Nombre y apellido son requeridos')
      return
    }

    try {
      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorForm),
      })

      if (response.ok) {
        const newCheckIn = await response.json()
        toast.success('Check-in registrado exitosamente')
        
        // Show QR code
        if (newCheckIn.qrCode) {
          setSelectedQrCode(newCheckIn.qrCode)
        }
        
        // Reset form
        setVisitorForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          isFirstTime: false,
          visitReason: '',
          prayerRequest: ''
        })
        setIsVisitorDialogOpen(false)
        fetchCheckIns()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al registrar check-in')
      }
    } catch (error) {
      toast.error('Error al registrar check-in')
    }
  }

  const handleChildCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!childForm.childName || !childForm.parentName || !childForm.parentPhone) {
      toast.error('Nombre del niño, nombre del padre y teléfono son requeridos')
      return
    }

    try {
      const response = await fetch('/api/children-check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...childForm,
          childAge: childForm.childAge ? parseInt(childForm.childAge) : null
        }),
      })

      if (response.ok) {
        const newCheckIn = await response.json()
        toast.success('Check-in de niño registrado exitosamente')
        
        // Show QR code
        if (newCheckIn.qrCode) {
          setSelectedQrCode(newCheckIn.qrCode)
        }
        
        // Reset form
        setChildForm({
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
        setIsChildDialogOpen(false)
        fetchChildrenCheckIns()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al registrar check-in de niño')
      }
    } catch (error) {
      toast.error('Error al registrar check-in de niño')
    }
  }

  const handleChildCheckOut = async (childCheckInId: string) => {
    try {
      const response = await fetch(`/api/children-check-ins/${childCheckInId}/checkout`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Niño retirado exitosamente')
        fetchChildrenCheckIns()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al retirar niño')
      }
    } catch (error) {
      toast.error('Error al retirar niño')
    }
  }

  const generateQRCodeUrl = (qrCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}&format=png`
  }

  // Generate QR code for children check-in
  const generateChildrenQR = async (eventTitle: string = 'Evento General') => {
    setLoading(true)
    try {
      const response = await fetch('/api/children-check-ins/generate-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventTitle
        }),
      })

      if (response.ok) {
        const qrInfo = await response.json()
        setGeneratedQrInfo(qrInfo)
        setIsQrGeneratorOpen(true)
        toast.success('🎉 Código QR generado para check-in de niños')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al generar código QR')
      }
    } catch (error) {
      console.error('QR generation error:', error)
      toast.error('Error al generar código QR')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Registro</h1>
          <p className="text-gray-600">Gestiona el registro de visitantes y niños</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isVisitorDialogOpen} onOpenChange={setIsVisitorDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserCheck className="w-4 h-4 mr-2" />
                Registro de Visitante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Visitante</DialogTitle>
                <DialogDescription>
                  Completa los datos del visitante para el registro
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVisitorCheckIn} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nombre *</Label>
                    <Input
                      id="firstName"
                      value={visitorForm.firstName}
                      onChange={(e) => setVisitorForm(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido *</Label>
                    <Input
                      id="lastName"
                      value={visitorForm.lastName}
                      onChange={(e) => setVisitorForm(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={visitorForm.email}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isFirstTime"
                    checked={visitorForm.isFirstTime}
                    onCheckedChange={(checked) => setVisitorForm(prev => ({ ...prev, isFirstTime: checked }))}
                  />
                  <Label htmlFor="isFirstTime">¿Primera vez visitando?</Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visitReason">Motivo de la visita</Label>
                  <Input
                    id="visitReason"
                    value={visitorForm.visitReason}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, visitReason: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prayerRequest">Petición de oración</Label>
                  <Textarea
                    id="prayerRequest"
                    value={visitorForm.prayerRequest}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, prayerRequest: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsVisitorDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar Check-in</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isChildDialogOpen} onOpenChange={setIsChildDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Registro de Niños (Escritorio)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Registrar Niño</DialogTitle>
                <DialogDescription>
                  Completa los datos del niño y los padres
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleChildCheckIn} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Nombre del niño *</Label>
                    <Input
                      id="childName"
                      value={childForm.childName}
                      onChange={(e) => setChildForm(prev => ({ ...prev, childName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="childAge">Edad</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min="0"
                      max="18"
                      value={childForm.childAge}
                      onChange={(e) => setChildForm(prev => ({ ...prev, childAge: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Nombre del padre *</Label>
                    <Input
                      id="parentName"
                      value={childForm.parentName}
                      onChange={(e) => setChildForm(prev => ({ ...prev, parentName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Teléfono del padre *</Label>
                    <Input
                      id="parentPhone"
                      value={childForm.parentPhone}
                      onChange={(e) => setChildForm(prev => ({ ...prev, parentPhone: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentEmail">Email del padre</Label>
                  <Input
                    id="parentEmail"
                    type="email"
                    value={childForm.parentEmail}
                    onChange={(e) => setChildForm(prev => ({ ...prev, parentEmail: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
                    <Input
                      id="emergencyContact"
                      value={childForm.emergencyContact}
                      onChange={(e) => setChildForm(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Teléfono de emergencia</Label>
                    <Input
                      id="emergencyPhone"
                      value={childForm.emergencyPhone}
                      onChange={(e) => setChildForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={childForm.allergies}
                    onChange={(e) => setChildForm(prev => ({ ...prev, allergies: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNeeds">Necesidades especiales</Label>
                  <Textarea
                    id="specialNeeds"
                    value={childForm.specialNeeds}
                    onChange={(e) => setChildForm(prev => ({ ...prev, specialNeeds: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsChildDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Registrar Check-in</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* QR Code Generator for Children Check-in */}
          <Dialog open={isQrGeneratorOpen} onOpenChange={setIsQrGeneratorOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <QrCode className="w-4 h-4 mr-2" />
                Generar QR Niños
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Código QR para Registro de Niños
                </DialogTitle>
                <DialogDescription>
                  Los padres pueden escanear este código para registrar a sus hijos automáticamente
                </DialogDescription>
              </DialogHeader>

              {generatedQrInfo ? (
                <div className="space-y-4">
                  {/* QR Code Display */}
                  <div className="text-center bg-white p-4 rounded-lg border">
                    <img 
                      src={generatedQrInfo.qrDisplayUrl} 
                      alt="Código QR para registro de niños"
                      className="mx-auto mb-3"
                    />
                    <p className="text-sm text-gray-600 mb-2">
                      Código QR para: <strong>{generatedQrInfo.eventTitle}</strong>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {generatedQrInfo.qrCode}
                    </Badge>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Cómo Funciona
                    </h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. {generatedQrInfo.instructions.step1}</li>
                      <li>2. {generatedQrInfo.instructions.step2}</li>
                      <li>3. {generatedQrInfo.instructions.step3}</li>
                      <li>4. {generatedQrInfo.instructions.step4}</li>
                    </ol>
                  </div>

                  {/* Security Features */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Características de Seguridad
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>✅ Fotos del niño y padre requeridas</li>
                      <li>✅ PIN de seguridad generado automáticamente</li>
                      <li>✅ Fotos se eliminan después de 7 días</li>
                      <li>✅ Verificación dual para recogida</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setGeneratedQrInfo(null)
                        setIsQrGeneratorOpen(false)
                      }}
                      className="flex-1"
                    >
                      Cerrar
                    </Button>
                    <Button
                      onClick={() => generateChildrenQR('Nuevo Evento')}
                      className="flex-1"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generar Nuevo QR
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Button
                    onClick={() => generateChildrenQR('Evento General')}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 mr-2" />
                        Generar Código QR
                      </>
                    )}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="visitors" 
            onClick={() => setActiveTab('visitors')}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Visitantes
          </TabsTrigger>
          <TabsTrigger 
            value="visitor-automation" 
            onClick={() => setActiveTab('visitor-automation')}
            className="gap-2"
          >
            <Zap className="h-4 w-4" />
            Automatización
          </TabsTrigger>
          <TabsTrigger 
            value="children" 
            onClick={() => setActiveTab('children')}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Niños
          </TabsTrigger>
          <TabsTrigger 
            value="children-security" 
            onClick={() => setActiveTab('children-security')}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Seguridad WebRTC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Check-ins Hoy</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {checkIns.filter(c => 
                    new Date(c.checkedInAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Primeras Visitas</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {checkIns.filter(c => c.isFirstTime).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Seguimientos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {checkIns.reduce((acc, c) => acc + c.followUps.filter(f => f.status === 'PENDIENTE').length, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visitors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkIns.map((checkIn) => (
              <Card key={checkIn.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {checkIn.firstName} {checkIn.lastName}
                    {checkIn.isFirstTime && (
                      <Badge variant="default">Primera vez</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {new Date(checkIn.checkedInAt).toLocaleString('es-ES')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {checkIn.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{checkIn.email}</span>
                    </div>
                  )}
                  
                  {checkIn.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{checkIn.phone}</span>
                    </div>
                  )}

                  {checkIn.visitReason && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Motivo:</span> {checkIn.visitReason}
                    </div>
                  )}

                  {checkIn.prayerRequest && (
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{checkIn.prayerRequest}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {checkIn.followUps.length} seguimientos
                    </Badge>
                    
                    {checkIn.qrCode && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedQrCode(checkIn.qrCode!)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="children" className="space-y-4">
          {/* Children Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Niños Presentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {childrenCheckIns.filter(c => c.checkedIn && !c.checkedOut).length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Niños Retirados</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {childrenCheckIns.filter(c => c.checkedOut).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Hoy</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {childrenCheckIns.filter(c => 
                    new Date(c.checkedInAt).toDateString() === new Date().toDateString()
                  ).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Children List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {childrenCheckIns.map((checkIn) => (
              <Card key={checkIn.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {checkIn.childName} {checkIn.childAge && `(${checkIn.childAge} años)`}
                    <Badge variant={checkIn.checkedOut ? "secondary" : "default"}>
                      {checkIn.checkedOut ? 'Retirado' : 'Presente'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Ingreso: {new Date(checkIn.checkedInAt).toLocaleString('es-ES')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Padre:</span> {checkIn.parentName}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{checkIn.parentPhone}</span>
                  </div>

                  {checkIn.emergencyContact && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Emergencia:</span> {checkIn.emergencyContact}
                      {checkIn.emergencyPhone && ` - ${checkIn.emergencyPhone}`}
                    </div>
                  )}

                  {checkIn.allergies && (
                    <div className="text-sm text-red-600">
                      <span className="font-medium">Alergias:</span> {checkIn.allergies}
                    </div>
                  )}

                  {checkIn.specialNeeds && (
                    <div className="text-sm text-yellow-600">
                      <span className="font-medium">Necesidades especiales:</span> {checkIn.specialNeeds}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedQrCode(checkIn.qrCode)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Ver QR
                    </Button>
                    
                    {!checkIn.checkedOut && (
                      <Button 
                        size="sm"
                        onClick={() => handleChildCheckOut(checkIn.id)}
                      >
                        Retirar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Visitor Automation Tab */}
        <TabsContent value="visitor-automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Sistema de Automatización Inteligente de Visitantes
              </CardTitle>
              <CardDescription>
                Registro avanzado con seguimiento automático, conexión ministerial y formas de seguimiento con QR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Automatizaciones Activas</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {checkIns.filter(c => c.automationTriggered).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conexiones Ministeriales</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {checkIns.filter(c => 
                        c.ministryInterest && c.ministryInterest.length > 0
                      ).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Visitantes con intereses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio de Engagement</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(checkIns.reduce((sum, c) => sum + (c.engagementScore || 0), 0) / Math.max(checkIns.length, 1))}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Puntuación de compromiso
                    </p>
                  </CardContent>
                </Card>
              </div>

              <VisitorProfileForm
                onSubmit={async (data) => {
                  await fetchCheckIns()
                  toast.success('Visitante registrado con automatización activada')
                }}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Children Security Tab */}
        <TabsContent value="children-security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Sistema WebRTC de Seguridad Infantil
              </CardTitle>
              <CardDescription>
                Check-in seguro con captura de fotos en tiempo real, verificación biométrica y códigos PIN
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Check-ins Seguros</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {childrenCheckIns.filter(c => 
                        c.childPhotoUrl && c.parentPhotoUrl
                      ).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Con fotos de seguridad
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actualmente Presentes</CardTitle>
                    <Camera className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {childrenCheckIns.filter(c => 
                        c.checkedIn && !c.checkedOut
                      ).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esperando recogida
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Intentos Fallidos</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {childrenCheckIns.reduce((sum, c) => 
                        sum + (c.pickupAttempts?.filter(attempt => !attempt.success)?.length || 0), 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este mes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {childrenCheckIns.length > 0 
                        ? Math.round((childrenCheckIns.filter(c => c.checkedOut).length / childrenCheckIns.length) * 100)
                        : 0
                      }%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recogidas exitosas
                    </p>
                  </CardContent>
                </Card>
              </div>

              <SecureCheckInForm
                onSubmit={async (data) => {
                  await fetchChildrenCheckIns()
                  toast.success('Check-in seguro completado exitosamente')
                }}
                loading={loading}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={selectedQrCode !== null} onOpenChange={() => setSelectedQrCode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Código QR</DialogTitle>
            <DialogDescription>
              Código QR para el registro
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            {selectedQrCode && (
              <img
                src={generateQRCodeUrl(selectedQrCode)}
                alt="QR Code"
                className="w-48 h-48"
              />
            )}
          </div>
          <div className="flex justify-center">
            <Button onClick={() => setSelectedQrCode(null)}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

