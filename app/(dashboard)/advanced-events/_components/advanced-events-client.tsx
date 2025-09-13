
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Calendar, Clock, MapPin, Users, Settings, Plus, Edit, Trash2, Monitor, Home, Package } from 'lucide-react'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  isPublic: boolean
  resourceReservations: EventResourceReservation[]
}

interface EventResource {
  id: string
  name: string
  description?: string
  type: string
  capacity?: number
  isActive: boolean
  reservations: EventResourceReservation[]
}

interface EventResourceReservation {
  id: string
  resourceId: string
  eventId: string
  startTime: string
  endTime: string
  notes?: string
  status: string
  resource: EventResource
  event: Event
}

interface AdvancedEventsClientProps {
  userRole: string
  churchId: string
}

export function AdvancedEventsClient({ userRole, churchId }: AdvancedEventsClientProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [resources, setResources] = useState<EventResource[]>([])
  const [reservations, setReservations] = useState<EventResourceReservation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('events')

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isPublic: true
  })

  const [resourceForm, setResourceForm] = useState({
    name: '',
    description: '',
    type: '',
    capacity: ''
  })

  const [reservationForm, setReservationForm] = useState({
    resourceId: '',
    eventId: '',
    startTime: '',
    endTime: '',
    notes: ''
  })

  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false)
  const [isNewResourceDialogOpen, setIsNewResourceDialogOpen] = useState(false)
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedResource, setSelectedResource] = useState<EventResource | null>(null)

  useEffect(() => {
    fetchEvents()
    fetchResources()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const data = await response.json()
        setEvents(data)
      }
    } catch (error) {
      toast.error('Error al cargar eventos')
    }
  }

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/event-resources')
      if (response.ok) {
        const data = await response.json()
        setResources(data)
      }
    } catch (error) {
      toast.error('Error al cargar recursos')
    } finally {
      setLoading(false)
    }
  }

  const fetchReservations = async (resourceId?: string, startDate?: string, endDate?: string) => {
    try {
      let url = `/api/event-resources/${resourceId}/reservations`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)
      }
    } catch (error) {
      toast.error('Error al cargar reservaciones')
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!eventForm.title || !eventForm.startDate) {
      toast.error('Título y fecha de inicio son requeridos')
      return
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...eventForm,
          startDate: new Date(eventForm.startDate).toISOString(),
          endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : null
        }),
      })

      if (response.ok) {
        toast.success('Evento creado exitosamente')
        setEventForm({
          title: '',
          description: '',
          startDate: '',
          endDate: '',
          location: '',
          isPublic: true
        })
        setIsNewEventDialogOpen(false)
        fetchEvents()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear evento')
      }
    } catch (error) {
      toast.error('Error al crear evento')
    }
  }

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resourceForm.name || !resourceForm.type) {
      toast.error('Nombre y tipo son requeridos')
      return
    }

    try {
      const response = await fetch('/api/event-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...resourceForm,
          capacity: resourceForm.capacity ? parseInt(resourceForm.capacity) : null
        }),
      })

      if (response.ok) {
        toast.success('Recurso creado exitosamente')
        setResourceForm({
          name: '',
          description: '',
          type: '',
          capacity: ''
        })
        setIsNewResourceDialogOpen(false)
        fetchResources()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear recurso')
      }
    } catch (error) {
      toast.error('Error al crear recurso')
    }
  }

  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reservationForm.resourceId || !reservationForm.eventId || !reservationForm.startTime || !reservationForm.endTime) {
      toast.error('Todos los campos son requeridos')
      return
    }

    try {
      const response = await fetch(`/api/event-resources/${reservationForm.resourceId}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: reservationForm.eventId,
          startTime: new Date(reservationForm.startTime).toISOString(),
          endTime: new Date(reservationForm.endTime).toISOString(),
          notes: reservationForm.notes
        }),
      })

      if (response.ok) {
        toast.success('Reservación creada exitosamente')
        setReservationForm({
          resourceId: '',
          eventId: '',
          startTime: '',
          endTime: '',
          notes: ''
        })
        setIsReservationDialogOpen(false)
        fetchResources()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear reservación')
      }
    } catch (error) {
      toast.error('Error al crear reservación')
    }
  }

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'EQUIPO': return <Monitor className="w-4 h-4" />
      case 'ESPACIO': return <Home className="w-4 h-4" />
      case 'MATERIAL': return <Package className="w-4 h-4" />
      default: return <Settings className="w-4 h-4" />
    }
  }

  const getResourceTypeBadge = (type: string) => {
    const variants: Record<string, any> = {
      'EQUIPO': 'default',
      'ESPACIO': 'secondary',
      'MATERIAL': 'outline'
    }
    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión Avanzada de Eventos</h1>
          <p className="text-gray-600">Administra eventos, recursos y reservaciones</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isNewResourceDialogOpen} onOpenChange={setIsNewResourceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Nuevo Recurso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Crear Recurso</DialogTitle>
                <DialogDescription>
                  Agrega un nuevo recurso para eventos
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateResource} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resourceName">Nombre del Recurso</Label>
                  <Input
                    id="resourceName"
                    value={resourceForm.name}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Proyector Principal"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceType">Tipo</Label>
                  <Select
                    value={resourceForm.type}
                    onValueChange={(value) => setResourceForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EQUIPO">Equipo</SelectItem>
                      <SelectItem value="ESPACIO">Espacio</SelectItem>
                      <SelectItem value="MATERIAL">Material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceCapacity">Capacidad (opcional)</Label>
                  <Input
                    id="resourceCapacity"
                    type="number"
                    value={resourceForm.capacity}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="Solo para espacios"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceDescription">Descripción</Label>
                  <Textarea
                    id="resourceDescription"
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del recurso"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewResourceDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Recurso</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Evento</DialogTitle>
                <DialogDescription>
                  Crea un nuevo evento con opciones avanzadas
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle">Título del Evento</Label>
                  <Input
                    id="eventTitle"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej: Culto Dominical"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descripción</Label>
                  <Textarea
                    id="eventDescription"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción del evento"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={eventForm.location}
                    onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Salón Principal"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublic"
                    checked={eventForm.isPublic}
                    onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="isPublic">Evento público</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewEventDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Evento</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events" onClick={() => setActiveTab('events')}>
            Eventos
          </TabsTrigger>
          <TabsTrigger value="resources" onClick={() => setActiveTab('resources')}>
            Recursos
          </TabsTrigger>
          <TabsTrigger value="calendar" onClick={() => setActiveTab('calendar')}>
            Calendario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay eventos programados</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsNewEventDialogOpen(true)}
                >
                  Crear primer evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant={event.isPublic ? "default" : "secondary"}>
                        {event.isPublic ? 'Público' : 'Privado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(event.startDate).toLocaleString('es-ES')}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Settings className="w-4 h-4" />
                        <span>{event.resourceReservations.length} recursos reservados</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setReservationForm(prev => ({ ...prev, eventId: event.id }))
                          setIsReservationDialogOpen(true)
                        }}
                      >
                        Reservar Recursos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay recursos registrados</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setIsNewResourceDialogOpen(true)}
                >
                  Crear primer recurso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getResourceTypeIcon(resource.type)}
                        {resource.name}
                      </CardTitle>
                      {getResourceTypeBadge(resource.type)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resource.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                    )}
                    
                    {resource.capacity && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>Capacidad: {resource.capacity}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{resource.reservations.length} reservaciones activas</span>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setReservationForm(prev => ({ ...prev, resourceId: resource.id }))
                          setIsReservationDialogOpen(true)
                        }}
                      >
                        Reservar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vista de Calendario</CardTitle>
              <CardDescription>
                Visualización de eventos y reservaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-600">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>Vista de calendario próximamente disponible</p>
                <p className="text-sm mt-2">Esta funcionalidad incluirá un calendario interactivo para gestionar eventos y recursos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reservation Dialog */}
      <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Recurso</DialogTitle>
            <DialogDescription>
              Crea una reservación de recurso para un evento
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateReservation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservationResource">Recurso</Label>
              <Select
                value={reservationForm.resourceId}
                onValueChange={(value) => setReservationForm(prev => ({ ...prev, resourceId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar recurso" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map(resource => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.name} ({resource.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservationEvent">Evento</Label>
              <Select
                value={reservationForm.eventId}
                onValueChange={(value) => setReservationForm(prev => ({ ...prev, eventId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map(event => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={reservationForm.startTime}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Fin</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={reservationForm.endTime}
                  onChange={(e) => setReservationForm(prev => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservationNotes">Notas</Label>
              <Textarea
                id="reservationNotes"
                value={reservationForm.notes}
                onChange={(e) => setReservationForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales sobre la reservación"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsReservationDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Reservación</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
