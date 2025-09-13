

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MessageSquare, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface FollowUp {
  id: string
  followUpType: string
  status: string
  scheduledAt?: string
  completedAt?: string
  notes?: string
  checkIn: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
    isFirstTime: boolean
  }
  assignedUser?: {
    name: string
  }
}

interface FollowUpsClientProps {
  userRole: string
  churchId: string
}

export function FollowUpsClient({ userRole, churchId }: FollowUpsClientProps) {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUp | null>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    notes: '',
    completedAt: ''
  })

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    try {
      const response = await fetch('/api/visitor-follow-ups')
      if (response.ok) {
        const data = await response.json()
        setFollowUps(data)
      } else {
        toast.error('Error al cargar seguimientos')
      }
    } catch (error) {
      toast.error('Error al cargar seguimientos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFollowUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFollowUp) return

    try {
      const response = await fetch(`/api/visitor-follow-ups/${selectedFollowUp.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateForm,
          completedAt: updateForm.status === 'COMPLETADO' ? new Date().toISOString() : null
        }),
      })

      if (response.ok) {
        toast.success('Seguimiento actualizado exitosamente')
        setIsUpdateDialogOpen(false)
        setSelectedFollowUp(null)
        fetchFollowUps()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar seguimiento')
      }
    } catch (error) {
      toast.error('Error al actualizar seguimiento')
    }
  }

  const openUpdateDialog = (followUp: FollowUp) => {
    setSelectedFollowUp(followUp)
    setUpdateForm({
      status: followUp.status,
      notes: followUp.notes || '',
      completedAt: followUp.completedAt ? new Date(followUp.completedAt).toISOString().split('T')[0] : ''
    })
    setIsUpdateDialogOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETADO':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'PENDIENTE':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'FALLIDO':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LLAMADA':
        return <Phone className="w-4 h-4" />
      case 'EMAIL':
        return <Mail className="w-4 h-4" />
      case 'SMS':
        return <MessageSquare className="w-4 h-4" />
      case 'VISITA':
        return <User className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  const filteredFollowUps = followUps.filter(followUp => {
    const statusMatch = filterStatus === 'all' || followUp.status === filterStatus
    const typeMatch = filterType === 'all' || followUp.followUpType === filterType
    return statusMatch && typeMatch
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seguimiento de Visitantes</h1>
          <p className="text-gray-600">Gestiona el seguimiento y contacto con visitantes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDIENTE">Pendiente</SelectItem>
            <SelectItem value="COMPLETADO">Completado</SelectItem>
            <SelectItem value="FALLIDO">Fallido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="LLAMADA">Llamada</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="SMS">SMS</SelectItem>
            <SelectItem value="VISITA">Visita</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Seguimientos</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{followUps.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(f => f.status === 'PENDIENTE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(f => f.status === 'COMPLETADO').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {followUps.filter(f => f.status === 'FALLIDO').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-ups List */}
      <div className="space-y-4">
        {filteredFollowUps.map((followUp) => (
          <Card key={followUp.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(followUp.followUpType)}
                  <div>
                    <CardTitle className="text-lg">
                      {followUp.checkIn.firstName} {followUp.checkIn.lastName}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>{followUp.followUpType}</span>
                      {followUp.checkIn.isFirstTime && (
                        <Badge variant="outline" className="ml-2">Primera vez</Badge>
                      )}
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(followUp.status)}
                  <Badge 
                    variant={
                      followUp.status === 'COMPLETADO' ? 'default' : 
                      followUp.status === 'PENDIENTE' ? 'secondary' : 'destructive'
                    }
                  >
                    {followUp.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {followUp.checkIn.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{followUp.checkIn.email}</span>
                    </div>
                  )}
                  
                  {followUp.checkIn.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{followUp.checkIn.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {followUp.scheduledAt && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Programado: {new Date(followUp.scheduledAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                  
                  {followUp.completedAt && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-600">
                        Completado: {new Date(followUp.completedAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {followUp.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700">{followUp.notes}</p>
                </div>
              )}

              {followUp.assignedUser && (
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Asignado a: {followUp.assignedUser.name}
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  size="sm"
                  onClick={() => openUpdateDialog(followUp)}
                  disabled={followUp.status === 'COMPLETADO'}
                >
                  {followUp.status === 'COMPLETADO' ? 'Completado' : 'Actualizar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFollowUps.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron seguimientos</h3>
            <p className="text-gray-600">Los seguimientos se crean automáticamente cuando hay visitantes por primera vez</p>
          </CardContent>
        </Card>
      )}

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizar Seguimiento</DialogTitle>
            <DialogDescription>
              {selectedFollowUp && (
                <>Seguimiento de {selectedFollowUp.checkIn.firstName} {selectedFollowUp.checkIn.lastName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFollowUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={updateForm.status} onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                  <SelectItem value="FALLIDO">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Agregar notas sobre el seguimiento..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

