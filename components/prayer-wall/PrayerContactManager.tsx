
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Search,
  Filter, 
  User,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Plus,
  Users,
  Heart,
  Clock,
  TrendingUp,
  Download,
  Send
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PrayerContact {
  id: string
  fullName: string
  phone?: string
  email?: string
  preferredContact: 'email' | 'sms' | 'whatsapp'
  isAnonymous: boolean
  lastContactDate?: string
  totalRequests: number
  tags?: string[]
  notes?: string
  status: 'active' | 'inactive' | 'unsubscribed'
  createdAt: string
  updatedAt: string
  requests: Array<{
    id: string
    status: string
    priority: string
    message: string
    createdAt: string
    category: {
      name: string
      color?: string
    }
  }>
}

interface ContactStats {
  totalContacts: number
  activeContacts: number
  newThisMonth: number
  avgRequestsPerContact: number
  topCategories: Array<{
    name: string
    count: number
    color?: string
  }>
}

interface FilterState {
  search: string
  status: string
  preferredContact: string
  dateRange: string
  category: string
  hasRequests: string
}

interface PrayerContactManagerProps {
  onContactUpdate?: () => void
}

export function PrayerContactManager({ onContactUpdate }: PrayerContactManagerProps) {
  const { data: session } = useSession()
  const [contacts, setContacts] = useState<PrayerContact[]>([])
  const [selectedContact, setSelectedContact] = useState<PrayerContact | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [stats, setStats] = useState<ContactStats>({
    totalContacts: 0,
    activeContacts: 0,
    newThisMonth: 0,
    avgRequestsPerContact: 0,
    topCategories: []
  })
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    preferredContact: 'all',
    dateRange: 'all',
    category: 'all',
    hasRequests: 'all'
  })

  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'email' as 'email' | 'sms' | 'whatsapp',
    notes: '',
    tags: [] as string[],
    status: 'active' as 'active' | 'inactive' | 'unsubscribed'
  })

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadContacts(),
        loadStats()
      ])
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/prayer-contacts?includeRequests=true')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.contacts || [])
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const loadStats = async () => {
    try {
      // This would typically come from a dedicated stats endpoint
      const contactsResponse = await fetch('/api/prayer-contacts')
      const requestsResponse = await fetch('/api/prayer-requests?limit=1000')
      
      if (contactsResponse.ok && requestsResponse.ok) {
        const contactsData = await contactsResponse.json()
        const requestsData = await requestsResponse.json()
        
        const contacts = contactsData.contacts || []
        const requests = requestsData.requests || []
        
        const now = new Date()
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
        const newThisMonth = contacts.filter((contact: any) => 
          new Date(contact.createdAt) >= thisMonth
        ).length

        const categoryCount = requests.reduce((acc: any, request: any) => {
          const categoryName = request.category?.name || 'Sin categoría'
          acc[categoryName] = (acc[categoryName] || 0) + 1
          return acc
        }, {})

        const topCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({ name, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setStats({
          totalContacts: contacts.length,
          activeContacts: contacts.filter((c: any) => c.status === 'active').length,
          newThisMonth,
          avgRequestsPerContact: contacts.length > 0 ? requests.length / contacts.length : 0,
          topCategories
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const openEditDialog = (contact?: PrayerContact) => {
    if (contact) {
      setSelectedContact(contact)
      setContactForm({
        fullName: contact.fullName,
        email: contact.email || '',
        phone: contact.phone || '',
        preferredContact: contact.preferredContact,
        notes: contact.notes || '',
        tags: contact.tags || [],
        status: contact.status
      })
    } else {
      setSelectedContact(null)
      setContactForm({
        fullName: '',
        email: '',
        phone: '',
        preferredContact: 'email',
        notes: '',
        tags: [],
        status: 'active'
      })
    }
    setIsEditDialogOpen(true)
  }

  const handleSaveContact = async () => {
    if (!contactForm.fullName.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (!contactForm.email && !contactForm.phone) {
      toast.error('Debe proporcionar email o teléfono')
      return
    }

    setSaving(true)
    try {
      const url = selectedContact ? `/api/prayer-contacts/${selectedContact.id}` : '/api/prayer-contacts'
      const method = selectedContact ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      })

      if (response.ok) {
        await loadData()
        setIsEditDialogOpen(false)
        toast.success(selectedContact ? 'Contacto actualizado' : 'Contacto creado')
        onContactUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al guardar el contacto')
      }
    } catch (error) {
      toast.error('Error al guardar el contacto')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('¿Está seguro de eliminar este contacto? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/prayer-contacts/${contactId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadData()
        toast.success('Contacto eliminado')
        onContactUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al eliminar el contacto')
      }
    } catch (error) {
      toast.error('Error al eliminar el contacto')
    }
  }

  const exportContacts = async () => {
    try {
      const response = await fetch('/api/prayer-contacts?export=csv')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `contactos-oracion-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success('Contactos exportados')
      }
    } catch (error) {
      toast.error('Error al exportar contactos')
    }
  }

  const filteredContacts = contacts.filter(contact => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        contact.fullName.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.phone?.includes(searchTerm) ||
        contact.notes?.toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    // Status filter
    if (filters.status !== 'all' && contact.status !== filters.status) {
      return false
    }

    // Preferred contact filter
    if (filters.preferredContact !== 'all' && contact.preferredContact !== filters.preferredContact) {
      return false
    }

    // Has requests filter
    if (filters.hasRequests !== 'all') {
      const hasRequests = contact.totalRequests > 0
      if (filters.hasRequests === 'yes' && !hasRequests) return false
      if (filters.hasRequests === 'no' && hasRequests) return false
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const contactDate = new Date(contact.createdAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (filters.dateRange) {
        case 'week':
          if (daysDiff > 7) return false
          break
        case 'month':
          if (daysDiff > 30) return false
          break
        case 'quarter':
          if (daysDiff > 90) return false
          break
      }
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'unsubscribed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'inactive': return 'Inactivo'
      case 'unsubscribed': return 'Dado de baja'
      default: return status
    }
  }

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <Phone className="w-4 h-4" />
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const ContactCard = ({ contact }: { contact: PrayerContact }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="font-medium">{contact.fullName}</p>
              <div className="flex items-center gap-3 mt-1">
                {contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{contact.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(contact.status)}>
            {getStatusText(contact.status)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Peticiones:</span>
            </div>
            <span className="font-medium">{contact.totalRequests}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {getContactMethodIcon(contact.preferredContact)}
              <span className="text-gray-600">Contacto preferido:</span>
            </div>
            <span className="capitalize">{contact.preferredContact}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Registrado:</span>
            </div>
            <span>{format(new Date(contact.createdAt), 'dd/MM/yyyy', { locale: es })}</span>
          </div>

          {contact.lastContactDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Último contacto:</span>
              </div>
              <span>{format(new Date(contact.lastContactDate), 'dd/MM/yyyy', { locale: es })}</span>
            </div>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {contact.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedContact(contact)
              setIsDetailDialogOpen(true)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditDialog(contact)}
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteContact(contact.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ContactDetail = ({ contact }: { contact: PrayerContact }) => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium">{contact.fullName}</h3>
            <div className="flex items-center gap-4 mt-2">
              {contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{contact.phone}</span>
                </div>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(contact.status)}>
            {getStatusText(contact.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-600">Contacto preferido</p>
            <div className="flex items-center gap-1">
              {getContactMethodIcon(contact.preferredContact)}
              <span className="capitalize">{contact.preferredContact}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total de peticiones</p>
            <p className="font-medium">{contact.totalRequests}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Registrado</p>
            <p>{format(new Date(contact.createdAt), "d 'de' MMMM, yyyy", { locale: es })}</p>
          </div>
          {contact.lastContactDate && (
            <div>
              <p className="text-sm text-gray-600">Último contacto</p>
              <p>{format(new Date(contact.lastContactDate), "d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
          )}
        </div>

        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Etiquetas</p>
            <div className="flex flex-wrap gap-1">
              {contact.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {contact.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Notas</p>
            <p className="text-sm bg-white rounded p-2">{contact.notes}</p>
          </div>
        )}
      </div>

      {contact.requests.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Historial de Peticiones ({contact.requests.length})</h4>
          <div className="space-y-3">
            {contact.requests.map(request => (
              <div key={request.id} className="bg-gray-50 rounded p-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {request.status === 'pending' ? 'Pendiente' :
                     request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(request.createdAt), "d 'de' MMM, yyyy", { locale: es })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Categoría:</strong> {request.category.name}
                </p>
                <p className="text-sm text-gray-700">{request.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Contactos</h2>
          <p className="text-gray-600">
            Administra los contactos de las peticiones de oración
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportContacts}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => openEditDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Contacto
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="contacts">Contactos</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total de Contactos"
              value={stats.totalContacts}
              icon={Users}
              color="text-blue-600"
            />
            <StatCard
              title="Contactos Activos"
              value={stats.activeContacts}
              subtitle={`${Math.round((stats.activeContacts / Math.max(stats.totalContacts, 1)) * 100)}% del total`}
              icon={TrendingUp}
              color="text-green-600"
            />
            <StatCard
              title="Nuevos este mes"
              value={stats.newThisMonth}
              icon={Plus}
              color="text-purple-600"
            />
            <StatCard
              title="Promedio de peticiones"
              value={stats.avgRequestsPerContact.toFixed(1)}
              subtitle="por contacto"
              icon={Heart}
              color="text-red-600"
            />
          </div>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categorías más solicitadas</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCategories.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  No hay datos de categorías disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span>{category.name}</span>
                      </div>
                      <Badge variant="outline">{category.count} peticiones</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label>Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Nombre, email, teléfono..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label>Estado</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activos</SelectItem>
                      <SelectItem value="inactive">Inactivos</SelectItem>
                      <SelectItem value="unsubscribed">Dados de baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Contacto preferido</Label>
                  <Select
                    value={filters.preferredContact}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, preferredContact: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fecha de registro</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="week">Esta semana</SelectItem>
                      <SelectItem value="month">Este mes</SelectItem>
                      <SelectItem value="quarter">Este trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tiene peticiones</Label>
                  <Select
                    value={filters.hasRequests}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, hasRequests: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">Con peticiones</SelectItem>
                      <SelectItem value="no">Sin peticiones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      status: 'all',
                      preferredContact: 'all',
                      dateRange: 'all',
                      category: 'all',
                      hasRequests: 'all'
                    })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredContacts.length} de {contacts.length} contactos
              </p>
            </div>

            {filteredContacts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No se encontraron contactos</p>
                  {contacts.length === 0 ? (
                    <Button
                      className="mt-4"
                      onClick={() => openEditDialog()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Primer Contacto
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-400 mt-1">
                      Intenta ajustar los filtros
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map(contact => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Contactos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Las funciones de análisis avanzado se implementarán en futuras versiones.
                Por ahora, puedes ver las estadísticas básicas en la pestaña de Resumen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Contacto</DialogTitle>
          </DialogHeader>
          {selectedContact && <ContactDetail contact={selectedContact} />}
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? 'Editar Contacto' : 'Nuevo Contacto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre completo *</Label>
              <Input
                id="fullName"
                value={contactForm.fullName}
                onChange={(e) => setContactForm(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Juan Pérez"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+506 8888-8888"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Contacto preferido</Label>
                <Select
                  value={contactForm.preferredContact}
                  onValueChange={(value: any) => setContactForm(prev => ({ ...prev, preferredContact: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estado</Label>
                <Select
                  value={contactForm.status}
                  onValueChange={(value: any) => setContactForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="unsubscribed">Dado de baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={contactForm.notes}
                onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales sobre el contacto..."
                rows={3}
              />
            </div>

            <p className="text-sm text-gray-600">
              * Debe proporcionar email o teléfono
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveContact}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar Contacto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
