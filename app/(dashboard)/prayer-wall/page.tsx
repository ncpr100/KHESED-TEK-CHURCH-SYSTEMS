
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  Eye,
  QrCode,
  FileText,
  BarChart3,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Heart,
  Sparkles
} from 'lucide-react'
import { PrayerFormBuilder } from '@/components/prayer-wall/PrayerFormBuilder'
import { QRCodeGenerator } from '@/components/prayer-wall/QRCodeGenerator'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface PrayerForm {
  id: string
  name: string
  description?: string
  slug: string
  fields: any[]
  style: any
  isActive: boolean
  isPublic: boolean
  createdAt: string
  qrCodes: any[]
  _count: {
    qrCodes: number
  }
}

interface QRCodeData {
  id: string
  name: string
  description?: string
  code: string
  design: any
  isActive: boolean
  scanCount: number
  lastScan?: string
  formId: string
  form: {
    id: string
    name: string
    slug: string
  }
}

interface PrayerRequest {
  id: string
  status: string
  priority: string
  createdAt: string
  contact: {
    fullName: string
    phone?: string
    email?: string
  }
  category: {
    name: string
    color?: string
  }
}

interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  totalContacts: number
  formsCount: number
  qrCodesCount: number
  testimoniesCount: number
  pendingTestimonies: number
  approvedTestimonies: number
}

interface PrayerTestimony {
  id: string
  title: string
  message: string
  category: string
  status: string
  isPublic: boolean
  isAnonymous: boolean
  imageUrl?: string
  submittedAt: string
  approvedAt?: string
  contact?: {
    fullName: string
    phone?: string
    email?: string
  }
  prayerRequest?: {
    id: string
    message: string
    category: {
      name: string
      color?: string
    }
  }
  approver?: {
    name: string
    email: string
  }
}

export default function PrayerWallPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')
  const [forms, setForms] = useState<PrayerForm[]>([])
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([])
  const [recentRequests, setRecentRequests] = useState<PrayerRequest[]>([])
  const [testimonies, setTestimonies] = useState<PrayerTestimony[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalContacts: 0,
    formsCount: 0,
    qrCodesCount: 0,
    testimoniesCount: 0,
    pendingTestimonies: 0,
    approvedTestimonies: 0
  })

  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false)
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<PrayerForm | null>(null)
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    if (!session?.user) return

    setLoading(true)
    try {
      await Promise.all([
        loadForms(),
        loadQRCodes(),
        loadRecentRequests(),
        loadTestimonies(),
        loadStats()
      ])
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadForms = async () => {
    try {
      const response = await fetch('/api/prayer-forms')
      if (response.ok) {
        const data = await response.json()
        setForms(data.forms || [])
      }
    } catch (error) {
      console.error('Error loading forms:', error)
    }
  }

  const loadQRCodes = async () => {
    try {
      const response = await fetch('/api/prayer-qr-codes')
      if (response.ok) {
        const data = await response.json()
        setQRCodes(data.qrCodes || [])
      }
    } catch (error) {
      console.error('Error loading QR codes:', error)
    }
  }

  const loadRecentRequests = async () => {
    try {
      const response = await fetch('/api/prayer-requests?limit=10')
      if (response.ok) {
        const data = await response.json()
        setRecentRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading recent requests:', error)
    }
  }

  const loadTestimonies = async () => {
    try {
      const response = await fetch('/api/testimonies?limit=10')
      if (response.ok) {
        const data = await response.json()
        setTestimonies(data.testimonies || [])
      }
    } catch (error) {
      console.error('Error loading testimonies:', error)
    }
  }

  const loadStats = async () => {
    try {
      const [formsRes, qrCodesRes, requestsRes, contactsRes, testimoniesRes] = await Promise.all([
        fetch('/api/prayer-forms'),
        fetch('/api/prayer-qr-codes'),
        fetch('/api/prayer-requests?limit=1000'),
        fetch('/api/prayer-contacts'),
        fetch('/api/testimonies?limit=1000')
      ])

      const formsData = formsRes.ok ? await formsRes.json() : { forms: [] }
      const qrCodesData = qrCodesRes.ok ? await qrCodesRes.json() : { qrCodes: [] }
      const requestsData = requestsRes.ok ? await requestsRes.json() : { requests: [] }
      const contactsData = contactsRes.ok ? await contactsRes.json() : { contacts: [] }
      const testimoniesData = testimoniesRes.ok ? await testimoniesRes.json() : { testimonies: [] }

      const requests = requestsData.requests || []
      const testimonies = testimoniesData.testimonies || []
      
      setStats({
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
        approvedRequests: requests.filter((r: any) => r.status === 'approved').length,
        totalContacts: contactsData.contacts?.length || 0,
        formsCount: formsData.forms?.length || 0,
        qrCodesCount: qrCodesData.qrCodes?.length || 0,
        testimoniesCount: testimonies.length,
        pendingTestimonies: testimonies.filter((t: any) => t.status === 'pending').length,
        approvedTestimonies: testimonies.filter((t: any) => t.status === 'approved').length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSaveForm = async (formData: any) => {
    try {
      const url = selectedForm ? `/api/prayer-forms/${selectedForm.id}` : '/api/prayer-forms'
      const method = selectedForm ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await loadForms()
        await loadStats()
        setIsFormBuilderOpen(false)
        setSelectedForm(null)
        toast.success(selectedForm ? 'Formulario actualizado' : 'Formulario creado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar el formulario')
      }
    } catch (error) {
      toast.error('Error al guardar el formulario')
    }
  }

  const handleSaveQRCode = async (qrCodeData: any) => {
    try {
      const url = selectedQRCode ? `/api/prayer-qr-codes/${selectedQRCode.id}` : '/api/prayer-qr-codes'
      const method = selectedQRCode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(qrCodeData)
      })

      if (response.ok) {
        await loadQRCodes()
        await loadStats()
        setIsQRGeneratorOpen(false)
        setSelectedQRCode(null)
        toast.success(selectedQRCode ? 'Código QR actualizado' : 'Código QR creado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar el código QR')
      }
    } catch (error) {
      toast.error('Error al guardar el código QR')
    }
  }

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('¿Está seguro de eliminar este formulario?')) return

    try {
      const response = await fetch(`/api/prayer-forms/${formId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadForms()
        await loadStats()
        toast.success('Formulario eliminado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el formulario')
      }
    } catch (error) {
      toast.error('Error al eliminar el formulario')
    }
  }

  const handleDeleteQRCode = async (qrCodeId: string) => {
    if (!confirm('¿Está seguro de eliminar este código QR?')) return

    try {
      const response = await fetch(`/api/prayer-qr-codes/${qrCodeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadQRCodes()
        await loadStats()
        toast.success('Código QR eliminado')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el código QR')
      }
    } catch (error) {
      toast.error('Error al eliminar el código QR')
    }
  }

  const filteredForms = forms.filter(form =>
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredQRCodes = qrCodes.filter(qr =>
    qr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Muro de Oración</h1>
          <p className="text-gray-600">
            Gestiona formularios de oración, códigos QR y peticiones
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="forms">Formularios</TabsTrigger>
          <TabsTrigger value="qrcodes">Códigos QR</TabsTrigger>
          <TabsTrigger value="requests">Peticiones</TabsTrigger>
          <TabsTrigger value="testimonies">Agradecimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Peticiones"
              value={stats.totalRequests}
              icon={MessageSquare}
              color="text-blue-600"
            />
            <StatCard
              title="Peticiones Pendientes"
              value={stats.pendingRequests}
              icon={Clock}
              color="text-yellow-600"
            />
            <StatCard
              title="Peticiones Aprobadas"
              value={stats.approvedRequests}
              icon={CheckCircle}
              color="text-green-600"
            />
            <StatCard
              title="Total Agradecimientos"
              value={stats.testimoniesCount}
              icon={Heart}
              color="text-pink-600"
            />
            <StatCard
              title="Agradecimientos Pendientes"
              value={stats.pendingTestimonies}
              icon={Clock}
              color="text-orange-600"
            />
            <StatCard
              title="Total Contactos"
              value={stats.totalContacts}
              icon={Users}
              color="text-purple-600"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Formularios Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.formsCount}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {forms.filter(f => f.isActive && f.isPublic).length} públicos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Códigos QR Generados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.qrCodesCount}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {qrCodes.filter(q => q.isActive).length} activos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Peticiones Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No hay peticiones recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{request.contact.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {request.category.name} • {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === 'pending' ? 'secondary' :
                          request.status === 'approved' ? 'default' : 'destructive'
                        }
                      >
                        {request.status === 'pending' ? 'Pendiente' :
                         request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar formularios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedForm(null)
                setIsFormBuilderOpen(true)
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Formulario
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{form.name}</CardTitle>
                    <div className="flex gap-1">
                      <Badge variant={form.isActive ? "default" : "secondary"}>
                        {form.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                      {form.isPublic && <Badge variant="outline">Público</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.description && (
                    <p className="text-sm text-gray-600">{form.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>{form.fields?.length || 0} campos</span>
                    <span>{form._count?.qrCodes || 0} códigos QR</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedForm(form)
                        setIsFormBuilderOpen(true)
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/prayer-form/${form.slug}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteForm(form.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="qrcodes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar códigos QR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setSelectedQRCode(null)
                setIsQRGeneratorOpen(true)
              }}
              disabled={forms.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Generar Código QR
            </Button>
          </div>

          {forms.length === 0 && (
            <div className="text-center py-12">
              <QrCode className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Crea un formulario primero para generar códigos QR</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQRCodes.map((qrCode) => (
              <Card key={qrCode.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{qrCode.name}</CardTitle>
                    <Badge variant={qrCode.isActive ? "default" : "secondary"}>
                      {qrCode.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qrCode.description && (
                    <p className="text-sm text-gray-600">{qrCode.description}</p>
                  )}
                  
                  <div className="text-sm">
                    <p><strong>Formulario:</strong> {qrCode.form.name}</p>
                    <p><strong>Escaneado:</strong> {qrCode.scanCount} veces</p>
                    {qrCode.lastScan && (
                      <p><strong>Último escaneo:</strong> {new Date(qrCode.lastScan).toLocaleDateString()}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQRCode(qrCode)
                        setIsQRGeneratorOpen(true)
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/prayer/${qrCode.code}`, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteQRCode(qrCode.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestión de Peticiones</CardTitle>
                <Button
                  onClick={() => window.open('/prayer-requests', '_blank')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Dashboard Completo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-8">
                Usa el dashboard completo de peticiones para gestionar, aprobar y responder a las peticiones de oración.
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('/prayer-requests', '_blank')}
                >
                  Ir a Peticiones de Oración
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar agradecimientos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.open('/testimony-form-builder', '_blank')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Formulario de Agradecimiento
              </Button>
              <Button
                onClick={() => window.open('/prayer-requests', '_blank')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gestionar Agradecimientos
              </Button>
            </div>
          </div>

          {/* Recent Testimonies */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pending Testimonies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Agradecimientos Pendientes ({stats.pendingTestimonies})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testimonies.filter(t => t.status === 'pending').length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay agradecimientos pendientes
                  </p>
                ) : (
                  <div className="space-y-3">
                    {testimonies.filter(t => t.status === 'pending').slice(0, 5).map((testimony) => (
                      <div
                        key={testimony.id}
                        className="flex items-start justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{testimony.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {testimony.message.substring(0, 120)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {!testimony.isAnonymous && testimony.contact && (
                              <span className="text-xs text-gray-500">
                                {testimony.contact.fullName}
                              </span>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {testimony.category}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(testimony.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button size="sm" variant="outline" className="px-2">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="default" className="px-2">
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Approved Testimonies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500" />
                  Agradecimientos Recientes ({stats.approvedTestimonies})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testimonies.filter(t => t.status === 'approved').length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No hay agradecimientos aprobados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {testimonies.filter(t => t.status === 'approved').slice(0, 5).map((testimony) => (
                      <div
                        key={testimony.id}
                        className="flex items-start justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{testimony.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {testimony.message.substring(0, 120)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {!testimony.isAnonymous && testimony.contact && (
                              <span className="text-xs text-gray-500">
                                {testimony.contact.fullName}
                              </span>
                            )}
                            <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                              {testimony.category}
                            </Badge>
                            {testimony.isPublic && (
                              <Badge variant="outline" className="text-xs">
                                Público
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400">
                              {new Date(testimony.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <Button size="sm" variant="outline" className="px-2">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Formularios de Agradecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Formularios activos</p>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Crear Formulario
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  Códigos QR Agradecimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-purple-600">0</p>
                <p className="text-xs text-gray-600 mt-1">Códigos QR generados</p>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <Plus className="w-3 h-3 mr-1" />
                  Generar QR
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Análisis de Agradecimientos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats.approvedTestimonies}</p>
                <p className="text-xs text-gray-600 mt-1">Agradecimientos publicados</p>
                <Button size="sm" variant="outline" className="w-full mt-3">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Ver Análisis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Form Builder Dialog */}
      <Dialog open={isFormBuilderOpen} onOpenChange={setIsFormBuilderOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedForm ? 'Editar Formulario' : 'Crear Formulario'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <PrayerFormBuilder
              form={selectedForm || undefined}
              onSave={handleSaveForm}
              onCancel={() => {
                setIsFormBuilderOpen(false)
                setSelectedForm(null)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Generator Dialog */}
      <Dialog open={isQRGeneratorOpen} onOpenChange={setIsQRGeneratorOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedQRCode ? 'Editar Código QR' : 'Generar Código QR'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <QRCodeGenerator
              qrCode={selectedQRCode || undefined}
              forms={forms.filter(f => f.isActive && f.isPublic)}
              onSave={handleSaveQRCode}
              onCancel={() => {
                setIsQRGeneratorOpen(false)
                setSelectedQRCode(null)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
