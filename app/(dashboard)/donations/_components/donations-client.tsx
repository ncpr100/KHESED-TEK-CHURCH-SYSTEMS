

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Plus, Calendar, CreditCard, Globe, Settings, Link2, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { DonationStats } from './donation-stats'
import { DonationForm } from './donation-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Donation {
  id: string
  amount: number
  currency: string
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  reference?: string
  notes?: string
  isAnonymous: boolean
  status: string
  donationDate: string
  category: {
    id: string
    name: string
  }
  paymentMethod: {
    id: string
    name: string
    isDigital: boolean
  }
  member?: {
    id: string
    firstName: string
    lastName: string
    email?: string
  }
}

interface DonationsClientProps {
  userRole: string
  churchId: string
}

export function DonationsClient({ userRole, churchId }: DonationsClientProps) {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Filtros
  const [filters, setFilters] = useState({
    categoryId: 'all',
    paymentMethodId: 'all',
    startDate: '',
    endDate: '',
    status: ''
  })

  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [paymentMethods, setPaymentMethods] = useState<{id: string, name: string, isDigital: boolean}[]>([])
  
  // Online giving state
  const [onlinePayments, setOnlinePayments] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('donations')
  const [publicDonationUrl, setPublicDonationUrl] = useState('')

  useEffect(() => {
    fetchDonations()
    fetchCategories()
    fetchPaymentMethods()
    if (activeTab === 'online-giving') {
      fetchOnlinePayments()
      fetchCampaigns()
      generatePublicUrl()
    }
  }, [currentPage, filters, activeTab])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== 'all'))
      })

      const response = await fetch(`/api/donations?${params}`)
      if (!response.ok) throw new Error('Error fetching donations')

      const data = await response.json()
      setDonations(data.donations)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar las donaciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/donation-categories')
      if (!response.ok) throw new Error('Error fetching categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment-methods')
      if (!response.ok) throw new Error('Error fetching payment methods')
      const data = await response.json()
      setPaymentMethods(data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchOnlinePayments = async () => {
    try {
      const response = await fetch(`/api/online-payments?churchId=${churchId}`)
      if (!response.ok) throw new Error('Error fetching online payments')
      const data = await response.json()
      // Ensure data is always an array to prevent filter errors
      setOnlinePayments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error:', error)
      // Set empty array on error to prevent filter crashes
      setOnlinePayments([])
      toast.error('Error al cargar los pagos online')
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/donation-campaigns')
      if (!response.ok) throw new Error('Error fetching campaigns')
      const data = await response.json()
      // Handle both array response and paginated response
      const campaigns = Array.isArray(data) ? data : (data.campaigns || [])
      setCampaigns(campaigns)
    } catch (error) {
      console.error('Error:', error)
      // Set empty array on error to prevent filter crashes
      setCampaigns([])
    }
  }

  const generatePublicUrl = () => {
    const baseUrl = window.location.origin
    setPublicDonationUrl(`${baseUrl}/donate/${churchId}`)
  }

  const copyPublicUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicDonationUrl)
      toast.success('Enlace copiado al portapapeles')
    } catch (error) {
      toast.error('Error al copiar enlace')
    }
  }

  const formatCurrency = (amount: number, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADA': return 'bg-green-100 text-green-800'
      case 'PENDIENTE': return 'bg-yellow-100 text-yellow-800'
      case 'FALLIDA': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      categoryId: 'all',
      paymentMethodId: 'all',
      startDate: '',
      endDate: '',
      status: ''
    })
    setCurrentPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donaciones</h1>
          <p className="text-muted-foreground">
            Gestión y seguimiento de donaciones de la iglesia
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Donaciones Tradicionales
          </TabsTrigger>
          <TabsTrigger value="online-giving" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Donaciones Online
            <Badge variant="secondary" className="text-xs">Nuevo</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gestión de Donaciones</h2>
              <p className="text-muted-foreground">
                Administra las donaciones registradas manualmente
              </p>
            </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Donación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Donación</DialogTitle>
              <DialogDescription>
                Complete la información de la donación
              </DialogDescription>
            </DialogHeader>
            <DonationForm 
              categories={categories}
              paymentMethods={paymentMethods}
              onSuccess={() => {
                setIsCreateDialogOpen(false)
                fetchDonations()
                toast.success('Donación registrada exitosamente')
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <DonationStats />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="category-filter">Categoría</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-method-filter">Método de Pago</Label>
              <Select
                value={filters.paymentMethodId}
                onValueChange={(value) => handleFilterChange('paymentMethodId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Fecha Inicio</Label>
              <Input
                id="start-date"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Fecha Fin</Label>
              <Input
                id="end-date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de donaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Donaciones</CardTitle>
          <CardDescription>
            {donations.length} donaciones encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron donaciones</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">
                          {formatCurrency(donation.amount, donation.currency)}
                        </h3>
                        <Badge className={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {donation.isAnonymous ? 'Donación Anónima' : (
                          donation.member 
                            ? `${donation.member.firstName} ${donation.member.lastName}`
                            : donation.donorName || 'Sin nombre'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{donation.category.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <CreditCard className="h-3 w-3 mr-1" />
                      {donation.paymentMethod.name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(donation.donationDate)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="online-giving" className="space-y-6">
          {/* Public Donation Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-600" />
                Enlace Público de Donaciones
              </CardTitle>
              <CardDescription>
                Comparte este enlace para que las personas puedan donar online sin necesidad de registrarse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  value={publicDonationUrl}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                />
                <Button onClick={copyPublicUrl} variant="outline">
                  <Link2 className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
                <Button asChild variant="default">
                  <a href={publicDonationUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" />
                    Ver Página
                  </a>
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">¿Cómo funciona?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Las personas pueden donar directamente desde esta página</li>
                  <li>• No necesitan crear cuenta ni iniciar sesión</li>
                  <li>• Pueden pagar con PSE (bancos) o Nequi</li>
                  <li>• Reciben recibo automático por email</li>
                  <li>• Las donaciones aparecen automáticamente en su sistema</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Online Payments Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pagos Online (Mes)
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(onlinePayments || []).filter(p => p?.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{(onlinePayments || []).filter(p => p?.status === 'pending').length} pendientes
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monto Total Online
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    (onlinePayments || [])
                      .filter(p => p?.status === 'completed')
                      .reduce((sum, p) => sum + (p?.amount || 0), 0)
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Campañas Activas
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(campaigns || []).filter(c => c?.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(campaigns || []).length} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Online Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Pagos Online Recientes
              </CardTitle>
              <CardDescription>
                Transacciones procesadas automáticamente a través de PSE y Nequi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando pagos online...</p>
                  </div>
                </div>
              ) : onlinePayments.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aún no hay pagos online</h3>
                  <p className="text-muted-foreground mb-4">
                    Los pagos aparecerán aquí cuando las personas donen a través de su enlace público
                  </p>
                  <Button onClick={copyPublicUrl} variant="outline">
                    <Link2 className="mr-2 h-4 w-4" />
                    Copiar Enlace de Donaciones
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {(onlinePayments || []).slice(0, 10).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            payment?.status === 'completed' ? 'bg-green-500' :
                            payment?.status === 'pending' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">
                              {payment?.donorName || 'Donante Anónimo'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment?.gatewayType?.toUpperCase() || 'N/A'} • {payment?.createdAt ? formatDate(payment.createdAt) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(payment?.amount || 0, payment?.currency)}
                        </p>
                        <Badge 
                          variant={
                            payment?.status === 'completed' ? 'default' :
                            payment?.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {payment?.status === 'completed' ? 'Completado' :
                           payment?.status === 'pending' ? 'Pendiente' :
                           'Fallido'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Settings className="h-5 w-5" />
                Configuración Requerida
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-800">
              <p className="mb-4">
                Para activar completamente las donaciones online, configure los métodos de pago:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span><strong>PSE:</strong> Solicite credenciales a su banco (Merchant ID, API Key)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span><strong>Nequi:</strong> Registre su aplicación en el portal de desarrolladores Nequi</span>
                </div>
              </div>
              <Button variant="outline" className="mt-4" asChild>
                <a href="/help/addons/donaciones-online" target="_blank">
                  Ver Guía Completa
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

