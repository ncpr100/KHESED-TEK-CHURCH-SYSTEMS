

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import {
  FileText,
  Plus,
  Send,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Eye,
  Edit,
  MessageSquare,
  RefreshCw
} from 'lucide-react'

interface Invoice {
  id: string
  invoiceNumber: string
  churchId: string
  subscriptionId?: string
  status: string
  type: string
  currency: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  dueDate: string
  notes?: string
  sentAt?: string
  paidAt?: string
  church: {
    id: string
    name: string
    email: string
  }
  lineItems: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  payments: Array<{
    amount: number
    paymentMethod: string
    reference?: string
    verifiedAt: string
    verifier?: {
      name: string
    }
  }>
  _count: {
    communications: number
  }
}

interface Church {
  id: string
  name: string
  email: string
}

export default function InvoiceManagementPage() {
  const { data: session } = useSession()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filters, setFilters] = useState({
    status: 'ALL',
    churchId: 'all',
    page: 1
  })

  // Invoice creation form
  const [newInvoice, setNewInvoice] = useState({
    churchId: 'select-church',
    type: 'SUBSCRIPTION',
    dueDate: '',
    isRecurrent: false,
    notes: '',
    lineItems: [
      { description: 'Suscripción mensual', quantity: 1, unitPrice: 0 }
    ]
  })

  // Bulk invoice form
  const [bulkInvoice, setBulkInvoice] = useState({
    churchIds: [] as string[],
    type: 'SUBSCRIPTION',
    dueDate: '',
    notes: '',
    lineItems: [
      { description: 'Suscripción mensual', quantity: 1, unitPrice: 0 }
    ]
  })

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchInvoices()
      fetchChurches()
    }
  }, [session, filters])

  const fetchInvoices = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        status: filters.status,
        page: filters.page.toString()
      })
      if (filters.churchId && filters.churchId !== 'all') queryParams.set('churchId', filters.churchId)

      const response = await fetch(`/api/platform/invoices?${queryParams}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices)
      } else {
        toast.error('Error al cargar facturas')
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      toast.error('Error de conexión')
    }
    setLoading(false)
  }

  const fetchChurches = async () => {
    try {
      const response = await fetch('/api/platform/churches')
      if (response.ok) {
        const data = await response.json()
        setChurches(data.churches || [])
      }
    } catch (error) {
      console.error('Error fetching churches:', error)
    }
  }

  const createInvoice = async () => {
    try {
      const response = await fetch('/api/platform/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      })

      if (response.ok) {
        toast.success('Factura creada exitosamente')
        setCreateDialogOpen(false)
        fetchInvoices()
        setNewInvoice({
          churchId: 'select-church',
          type: 'SUBSCRIPTION',
          dueDate: '',
          isRecurrent: false,
          notes: '',
          lineItems: [{ description: 'Suscripción mensual', quantity: 1, unitPrice: 0 }]
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear factura')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast.error('Error de conexión')
    }
  }

  const createBulkInvoices = async () => {
    try {
      const response = await fetch('/api/platform/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkInvoice)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message)
        setBulkDialogOpen(false)
        fetchInvoices()
        setBulkInvoice({
          churchIds: [],
          type: 'SUBSCRIPTION',
          dueDate: '',
          notes: '',
          lineItems: [{ description: 'Suscripción mensual', quantity: 1, unitPrice: 0 }]
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear facturas')
      }
    } catch (error) {
      console.error('Error creating bulk invoices:', error)
      toast.error('Error de conexión')
    }
  }

  const updateInvoiceStatus = async (invoiceId: string, status: string) => {
    try {
      const response = await fetch(`/api/platform/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast.success(`Factura marcada como ${status.toLowerCase()}`)
        fetchInvoices()
      } else {
        toast.error('Error al actualizar factura')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      toast.error('Error de conexión')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      SENT: { color: 'bg-blue-100 text-blue-800', icon: Send },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      OVERDUE: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      CANCELLED: { color: 'bg-gray-100 text-gray-600', icon: XCircle }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    const IconComponent = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    )
  }

  const addLineItem = (isBulk = false) => {
    if (isBulk) {
      setBulkInvoice(prev => ({
        ...prev,
        lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0 }]
      }))
    } else {
      setNewInvoice(prev => ({
        ...prev,
        lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0 }]
      }))
    }
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
            <p className="text-muted-foreground">
              Solo usuarios SUPER_ADMIN pueden acceder a la gestión de facturas.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Facturas</h1>
          <p className="text-muted-foreground">Sistema profesional de facturación para tenants</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Factura</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Iglesia</Label>
                    <Select
                      value={newInvoice.churchId}
                      onValueChange={(value) => setNewInvoice(prev => ({ ...prev, churchId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar iglesia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select-church" disabled>Seleccionar iglesia</SelectItem>
                        {churches.map((church) => (
                          <SelectItem key={church.id} value={church.id}>
                            {church.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fecha de Vencimiento</Label>
                    <Input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={newInvoice.notes}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas adicionales para la factura..."
                  />
                </div>

                <div>
                  <Label>Items de Factura</Label>
                  {newInvoice.lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                      <Input
                        placeholder="Descripción"
                        value={item.description}
                        onChange={(e) => {
                          const items = [...newInvoice.lineItems]
                          items[index].description = e.target.value
                          setNewInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...newInvoice.lineItems]
                          items[index].quantity = parseInt(e.target.value) || 1
                          setNewInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Precio USD"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const items = [...newInvoice.lineItems]
                          items[index].unitPrice = parseFloat(e.target.value) || 0
                          setNewInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addLineItem(false)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Item
                  </Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createInvoice} disabled={!newInvoice.churchId || newInvoice.churchId === 'select-church' || !newInvoice.dueDate}>
                    Crear Factura
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Facturación Masiva
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Facturación Masiva</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Iglesias</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded p-2">
                    {churches.map((church) => (
                      <label key={church.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={bulkInvoice.churchIds.includes(church.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkInvoice(prev => ({
                                ...prev,
                                churchIds: [...prev.churchIds, church.id]
                              }))
                            } else {
                              setBulkInvoice(prev => ({
                                ...prev,
                                churchIds: prev.churchIds.filter(id => id !== church.id)
                              }))
                            }
                          }}
                        />
                        <span className="text-sm">{church.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bulkInvoice.churchIds.length} iglesias seleccionadas
                  </p>
                </div>

                <div>
                  <Label>Fecha de Vencimiento</Label>
                  <Input
                    type="date"
                    value={bulkInvoice.dueDate}
                    onChange={(e) => setBulkInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Items de Factura</Label>
                  {bulkInvoice.lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                      <Input
                        placeholder="Descripción"
                        value={item.description}
                        onChange={(e) => {
                          const items = [...bulkInvoice.lineItems]
                          items[index].description = e.target.value
                          setBulkInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Cantidad"
                        value={item.quantity}
                        onChange={(e) => {
                          const items = [...bulkInvoice.lineItems]
                          items[index].quantity = parseInt(e.target.value) || 1
                          setBulkInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Precio USD"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const items = [...bulkInvoice.lineItems]
                          items[index].unitPrice = parseFloat(e.target.value) || 0
                          setBulkInvoice(prev => ({ ...prev, lineItems: items }))
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => addLineItem(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Item
                  </Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createBulkInvoices} 
                    disabled={bulkInvoice.churchIds.length === 0 || !bulkInvoice.dueDate}
                  >
                    Crear {bulkInvoice.churchIds.length} Facturas
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchInvoices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div>
              <Label>Estado</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="DRAFT">Borradores</SelectItem>
                  <SelectItem value="SENT">Enviadas</SelectItem>
                  <SelectItem value="PAID">Pagadas</SelectItem>
                  <SelectItem value="OVERDUE">Vencidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Iglesia</Label>
              <Select
                value={filters.churchId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, churchId: value, page: 1 }))}
              >
                <SelectTrigger className="w-60">
                  <SelectValue placeholder="Todas las iglesias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las iglesias</SelectItem>
                  {churches.map((church) => (
                    <SelectItem key={church.id} value={church.id}>
                      {church.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Facturas Generadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Cargando facturas...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay facturas generadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{invoice.invoiceNumber}</h3>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <p className="text-sm font-medium">{invoice.church.name}</p>
                      <p className="text-sm text-muted-foreground">{invoice.church.email}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                        </span>
                        {invoice.sentAt && (
                          <span className="flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            Enviada: {new Date(invoice.sentAt).toLocaleDateString()}
                          </span>
                        )}
                        {invoice.paidAt && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Pagada: {new Date(invoice.paidAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-green-600">
                        ${invoice.totalAmount.toFixed(2)} USD
                      </div>
                      <div className="flex gap-2">
                        {invoice.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            onClick={() => updateInvoiceStatus(invoice.id, 'SENT')}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Enviar
                          </Button>
                        )}
                        {invoice.status === 'SENT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateInvoiceStatus(invoice.id, 'PAID')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Marcar Pagada
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </div>
                      {invoice._count.communications > 0 && (
                        <div className="text-xs text-blue-600">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {invoice._count.communications} comunicaciones
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

