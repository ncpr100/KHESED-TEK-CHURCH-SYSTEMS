
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  Eye,
  Check, 
  X,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  User,
  Heart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface PrayerRequest {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  message: string
  isAnonymous: boolean
  preferredContact: 'email' | 'sms' | 'whatsapp'
  createdAt: string
  updatedAt: string
  contact: {
    id: string
    fullName: string
    phone?: string
    email?: string
  }
  category: {
    id: string
    name: string
    description?: string
    color?: string
    icon?: string
  }
  form?: {
    id: string
    name: string
  }
  qrCode?: {
    id: string
    name: string
  }
  approval?: {
    id: string
    status: string
    notes?: string
    reviewedAt: string
    reviewedBy: {
      id: string
      name: string
    }
  }
}

interface PrayerCategory {
  id: string
  name: string
  color?: string
  icon?: string
}

interface FilterState {
  status: string
  priority: string
  category: string
  dateRange: string
  search: string
}

interface PrayerRequestManagerProps {
  initialRequests?: PrayerRequest[]
  onRequestUpdate?: () => void
}

export function PrayerRequestManager({ initialRequests = [], onRequestUpdate }: PrayerRequestManagerProps) {
  const { data: session } = useSession()
  const [requests, setRequests] = useState<PrayerRequest[]>(initialRequests)
  const [categories, setCategories] = useState<PrayerCategory[]>([])
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [selectedRequests, setSelectedRequests] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: 'all',
    search: ''
  })
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  useEffect(() => {
    if (session?.user) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadRequests(),
        loadCategories()
      ])
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/prayer-requests?includeAll=true')
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/prayer-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleApproval = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await fetch('/api/prayer-approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          status: action === 'approve' ? 'approved' : 'rejected',
          notes: notes?.trim()
        })
      })

      if (response.ok) {
        await loadRequests()
        toast.success(`Petición ${action === 'approve' ? 'aprobada' : 'rechazada'}`)
        onRequestUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al procesar la petición')
      }
    } catch (error) {
      toast.error('Error al procesar la petición')
    }
  }

  const handleBulkApproval = async (action: 'approve' | 'reject') => {
    if (selectedRequests.length === 0) {
      toast.error('Selecciona al menos una petición')
      return
    }

    setBulkProcessing(true)
    try {
      const promises = selectedRequests.map(requestId =>
        handleApproval(requestId, action, approvalNotes)
      )

      await Promise.all(promises)
      setSelectedRequests([])
      setApprovalNotes('')
      setIsApprovalDialogOpen(false)
      toast.success(`${selectedRequests.length} peticiones ${action === 'approve' ? 'aprobadas' : 'rechazadas'}`)
    } catch (error) {
      toast.error('Error en el procesamiento masivo')
    } finally {
      setBulkProcessing(false)
    }
  }

  const filteredRequests = requests.filter(request => {
    // Status filter
    if (filters.status !== 'all' && request.status !== filters.status) {
      return false
    }

    // Priority filter
    if (filters.priority !== 'all' && request.priority !== filters.priority) {
      return false
    }

    // Category filter
    if (filters.category !== 'all' && request.category.id !== filters.category) {
      return false
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const requestDate = new Date(request.createdAt)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (filters.dateRange) {
        case 'today':
          if (daysDiff > 0) return false
          break
        case 'week':
          if (daysDiff > 7) return false
          break
        case 'month':
          if (daysDiff > 30) return false
          break
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesSearch = 
        request.contact.fullName.toLowerCase().includes(searchTerm) ||
        request.message.toLowerCase().includes(searchTerm) ||
        request.category.name.toLowerCase().includes(searchTerm)

      if (!matchesSearch) return false
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'normal': return 'text-blue-600'
      case 'low': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertTriangle className="w-4 h-4" />
      case 'normal': return <Clock className="w-4 h-4" />
      case 'low': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const RequestCard = ({ request }: { request: PrayerRequest }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedRequests.includes(request.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRequests([...selectedRequests, request.id])
                } else {
                  setSelectedRequests(selectedRequests.filter(id => id !== request.id))
                }
              }}
              className="rounded"
            />
            <Badge className={getStatusColor(request.status)}>
              {request.status === 'pending' ? 'Pendiente' :
               request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
            </Badge>
            <div className={`flex items-center gap-1 ${getPriorityColor(request.priority)}`}>
              {getPriorityIcon(request.priority)}
              <span className="text-sm capitalize">{request.priority}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRequest(request)
              setIsDetailDialogOpen(true)
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium">
              {request.isAnonymous ? 'Anónimo' : request.contact.fullName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{request.category.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {format(new Date(request.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
            </span>
          </div>

          {!request.isAnonymous && (
            <div className="flex items-center gap-2">
              {request.preferredContact === 'email' ? (
                <Mail className="w-4 h-4 text-gray-500" />
              ) : (
                <Phone className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm text-gray-600">
                {request.contact.email || request.contact.phone}
              </span>
            </div>
          )}

          <div className="mt-2">
            <p className="text-sm text-gray-700 line-clamp-2">
              {request.message}
            </p>
          </div>
        </div>

        {request.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              onClick={() => handleApproval(request.id, 'approve')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Aprobar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleApproval(request.id, 'reject')}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" />
              Rechazar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const RequestDetail = ({ request }: { request: PrayerRequest }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(request.status)}>
            {request.status === 'pending' ? 'Pendiente' :
             request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
          </Badge>
          <div className={`flex items-center gap-1 ${getPriorityColor(request.priority)}`}>
            {getPriorityIcon(request.priority)}
            <span className="text-sm capitalize font-medium">{request.priority}</span>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(request.createdAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium">
              {request.isAnonymous ? 'Petición Anónima' : request.contact.fullName}
            </p>
            {!request.isAnonymous && (
              <div className="flex items-center gap-4 mt-1">
                {request.contact.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{request.contact.email}</span>
                  </div>
                )}
                {request.contact.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{request.contact.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-gray-600" />
          <div>
            <p className="font-medium">{request.category.name}</p>
            {request.category.description && (
              <p className="text-sm text-gray-600">{request.category.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <span className="font-medium">Contacto preferido:</span>
          <span className="text-sm">
            {request.preferredContact === 'email' ? 'Email' :
             request.preferredContact === 'sms' ? 'SMS' : 'WhatsApp'}
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-medium mb-2">Mensaje de la petición:</h4>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{request.message}</p>
        </div>
      </div>

      {request.form && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Formulario:</span> {request.form.name}
        </div>
      )}

      {request.qrCode && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Código QR:</span> {request.qrCode.name}
        </div>
      )}

      {request.approval && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            {request.approval.status === 'approved' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            Estado de Revisión
          </h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Revisado por:</span> {request.approval.reviewedBy.name}
            </p>
            <p>
              <span className="font-medium">Fecha:</span>{' '}
              {format(new Date(request.approval.reviewedAt), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
            </p>
            {request.approval.notes && (
              <div className="mt-2">
                <p className="font-medium">Notas:</p>
                <p className="text-gray-700">{request.approval.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {request.status === 'pending' && (
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => handleApproval(request.id, 'approve')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Aprobar Petición
          </Button>
          <Button
            variant="outline"
            onClick={() => handleApproval(request.id, 'reject')}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Rechazar Petición
          </Button>
        </div>
      )}
    </div>
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
          <h2 className="text-2xl font-bold">Gestión de Peticiones</h2>
          <p className="text-gray-600">
            Revisa y aprueba las peticiones de oración de tu comunidad
          </p>
        </div>
        {selectedRequests.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setApprovalAction('approve')
                setIsApprovalDialogOpen(true)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Aprobar Seleccionadas ({selectedRequests.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setApprovalAction('reject')
                setIsApprovalDialogOpen(true)
              }}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Rechazar Seleccionadas ({selectedRequests.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Nombre, mensaje, categoría..."
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
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prioridad</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Categoría</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fecha</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredRequests.length} de {requests.length} peticiones
          </p>
          {filteredRequests.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allVisible = filteredRequests.every(req => selectedRequests.includes(req.id))
                if (allVisible) {
                  setSelectedRequests([])
                } else {
                  setSelectedRequests(filteredRequests.map(req => req.id))
                }
              }}
            >
              {filteredRequests.every(req => selectedRequests.includes(req.id)) 
                ? 'Deseleccionar todas' 
                : 'Seleccionar todas'
              }
            </Button>
          )}
        </div>

        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron peticiones</p>
              {filters.search || filters.status !== 'all' || filters.category !== 'all' ? (
                <p className="text-sm text-gray-400 mt-1">
                  Intenta ajustar los filtros
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de la Petición</DialogTitle>
          </DialogHeader>
          {selectedRequest && <RequestDetail request={selectedRequest} />}
        </DialogContent>
      </Dialog>

      {/* Bulk Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Aprobar Peticiones' : 'Rechazar Peticiones'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Vas a {approvalAction === 'approve' ? 'aprobar' : 'rechazar'} {selectedRequests.length} peticiones.
            </p>
            <div>
              <Label>Notas (opcional)</Label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Agrega notas sobre esta decisión..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(false)
                setApprovalNotes('')
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleBulkApproval(approvalAction!)}
              disabled={bulkProcessing}
              className={approvalAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {bulkProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center">
                  {approvalAction === 'approve' ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <X className="w-4 h-4 mr-2" />
                  )}
                  {approvalAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
