

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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Monitor, 
  Home, 
  Package,
  Brain,
  Sparkles,
  Target,
  DollarSign,
  MessageSquare,
  BarChart3,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone,
  Share2,
  Heart,
  Zap,
  TrendingUp,
  Activity
} from 'lucide-react'
import { toast } from 'sonner'

interface SmartEventsClientProps {
  userRole: string
  churchId: string
}

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
  isPublic: boolean
  category: string
  budget?: number
  attendees?: EventAttendee[]
  volunteers?: EventVolunteer[]
  resourceReservations: EventResourceReservation[]
  communications: EventCommunication[]
  donations: EventDonation[]
  status: 'PLANIFICANDO' | 'PROMOCIONANDO' | 'ACTIVO' | 'COMPLETADO' | 'CANCELADO'
  createdAt: string
}

interface EventResource {
  id: string
  name: string
  description?: string
  type: 'EQUIPO' | 'ESPACIO' | 'MATERIAL'
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
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA'
  resource: EventResource
  event: Event
}

interface EventAttendee {
  id: string
  eventId: string
  memberId: string
  status: 'INVITADO' | 'CONFIRMADO' | 'ASISTIO' | 'NO_ASISTIO'
  registrationDate: string
  member: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
}

interface EventVolunteer {
  id: string
  eventId: string
  volunteerId: string
  role: string
  assignedTasks?: string[]
  status: 'ASIGNADO' | 'CONFIRMADO' | 'COMPLETADO'
  volunteer: {
    firstName: string
    lastName: string
    skills?: string[]
  }
}

interface EventCommunication {
  id: string
  eventId: string
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'SOCIAL'
  subject: string
  content: string
  sentAt?: string
  scheduledFor?: string
  recipientCount: number
  status: 'BORRADOR' | 'PROGRAMADA' | 'ENVIADA' | 'FALLIDA'
}

interface EventDonation {
  id: string
  eventId: string
  amount: number
  donorName?: string
  date: string
  method: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'ONLINE'
  purpose?: string
}

interface EventAnalytics {
  totalEvents: number
  activeEvents: number
  completedEvents: number
  totalAttendees: number
  averageAttendance: number
  totalDonations: number
  volunteerParticipation: number
  monthlyTrends: {
    month: string
    events: number
    attendance: number
    donations: number
  }[]
}

export function SmartEventsClient({ userRole, churchId }: SmartEventsClientProps) {
  // State Management
  const [events, setEvents] = useState<Event[]>([])
  const [resources, setResources] = useState<EventResource[]>([])
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('planning')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Dialog states
  const [isNewEventDialogOpen, setIsNewEventDialogOpen] = useState(false)
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false)
  const [isCommunicationDialogOpen, setIsCommunicationDialogOpen] = useState(false)
  const [isVolunteerAssignmentOpen, setIsVolunteerAssignmentOpen] = useState(false)

  // Form states
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    category: 'CULTO',
    startDate: '',
    endDate: '',
    location: '',
    budget: '',
    isPublic: true
  })

  const [resourceForm, setResourceForm] = useState({
    name: '',
    description: '',
    type: 'EQUIPO' as const,
    capacity: ''
  })

  const [communicationForm, setCommunicationForm] = useState({
    type: 'EMAIL' as const,
    subject: '',
    content: '',
    scheduledFor: '',
    targetAudience: 'ALL'
  })

  // Data Fetching
  useEffect(() => {
    fetchEvents()
    fetchResources()
    fetchAnalytics()
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

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/events/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  // Event Management
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
          endDate: eventForm.endDate ? new Date(eventForm.endDate).toISOString() : null,
          budget: eventForm.budget ? parseFloat(eventForm.budget) : null,
          status: 'PLANIFICANDO'
        }),
      })

      if (response.ok) {
        toast.success('✅ Evento creado exitosamente')
        resetEventForm()
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
        toast.success('✅ Recurso creado exitosamente')
        resetResourceForm()
        setIsResourceDialogOpen(false)
        fetchResources()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear recurso')
      }
    } catch (error) {
      toast.error('Error al crear recurso')
    }
  }

  const generateEventSuggestions = async () => {
    try {
      toast.info('🧠 Generando sugerencias inteligentes...')
      
      const response = await fetch('/api/events/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          churchId,
          eventHistory: events.slice(-10), // Last 10 events for context
          currentSeason: new Date().getMonth() + 1 
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.suggestions && data.suggestions.length > 0) {
          const suggestion = data.suggestions[0] // Use first suggestion
          setEventForm(prev => ({
            ...prev,
            title: suggestion.title || '',
            description: suggestion.description || '',
            category: suggestion.category || 'CULTO',
            location: suggestion.location || ''
          }))
          toast.success('✨ Sugerencia aplicada - puedes editarla antes de guardar')
        } else {
          toast.info('No se encontraron sugerencias específicas')
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error)
      toast.error('Error al generar sugerencias')
    }
  }

  const autoAssignVolunteers = async (eventId: string) => {
    try {
      toast.info('🎯 Asignando voluntarios automáticamente...')
      
      const response = await fetch(`/api/events/${eventId}/auto-assign-volunteers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`✅ ${data.assignedCount} voluntarios asignados automáticamente`)
        fetchEvents()
      }
    } catch (error) {
      toast.error('Error en asignación automática')
    }
  }

  const sendEventCommunication = async (eventId: string) => {
    try {
      if (!communicationForm.subject || !communicationForm.content) {
        toast.error('Asunto y contenido son requeridos')
        return
      }

      const response = await fetch(`/api/events/${eventId}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communicationForm)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`📧 Comunicación programada para ${data.recipientCount} destinatarios`)
        setCommunicationForm({
          type: 'EMAIL',
          subject: '',
          content: '',
          scheduledFor: '',
          targetAudience: 'ALL'
        })
        setIsCommunicationDialogOpen(false)
        fetchEvents()
      }
    } catch (error) {
      toast.error('Error al enviar comunicación')
    }
  }

  // Utility Functions
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      category: 'CULTO',
      startDate: '',
      endDate: '',
      location: '',
      budget: '',
      isPublic: true
    })
  }

  const resetResourceForm = () => {
    setResourceForm({
      name: '',
      description: '',
      type: 'EQUIPO',
      capacity: ''
    })
  }

  const getEventStatusColor = (status: string) => {
    const colors = {
      PLANIFICANDO: 'bg-yellow-100 text-yellow-800',
      PROMOCIONANDO: 'bg-blue-100 text-blue-800',
      ACTIVO: 'bg-green-100 text-green-800',
      COMPLETADO: 'bg-gray-100 text-gray-800',
      CANCELADO: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryIcon = (category: string) => {
    const icons = {
      CULTO: <Heart className="h-4 w-4" />,
      CONFERENCIA: <Users className="h-4 w-4" />,
      SOCIAL: <Share2 className="h-4 w-4" />,
      CAPACITACION: <Brain className="h-4 w-4" />,
      SERVICIO: <Heart className="h-4 w-4" />,
      OTRO: <Calendar className="h-4 w-4" />
    }
    return icons[category as keyof typeof icons] || <Calendar className="h-4 w-4" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando sistema de eventos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            Sistema Inteligente de Eventos
          </h1>
          <p className="text-muted-foreground">
            Planificación completa con IA, gestión de voluntarios, y comunicaciones automatizadas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="px-3 py-1 bg-green-100 text-green-800">
            <Zap className="h-4 w-4 mr-2" />
            Sistema Unificado
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Target className="h-4 w-4 mr-2" />
            Integración Completa
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Total Eventos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics.activeEvents}</p>
                  <p className="text-xs text-muted-foreground">Eventos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{analytics.totalAttendees}</p>
                  <p className="text-xs text-muted-foreground">Asistentes Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">${analytics.totalDonations.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Donaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{Math.round(analytics.averageAttendance)}</p>
                  <p className="text-xs text-muted-foreground">Promedio Asistencia</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="planning" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Planificación
          </TabsTrigger>
          <TabsTrigger value="volunteers" className="flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            Voluntarios
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="communications" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Comunicaciones
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Presupuesto
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Calendario
          </TabsTrigger>
        </TabsList>

        {/* Event Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Planificación de Eventos</h2>
            <Dialog open={isNewEventDialogOpen} onOpenChange={setIsNewEventDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Crear Evento Inteligente
                  </DialogTitle>
                  <DialogDescription>
                    Usa IA para sugerencias automáticas o crea tu evento desde cero
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateEventSuggestions}
                      className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generar Sugerencias IA
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="eventTitle">Título del Evento *</Label>
                      <Input
                        id="eventTitle"
                        value={eventForm.title}
                        onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Culto Especial de Navidad"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="eventCategory">Categoría</Label>
                      <Select
                        value={eventForm.category}
                        onValueChange={(value) => setEventForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CULTO">Culto</SelectItem>
                          <SelectItem value="CONFERENCIA">Conferencia</SelectItem>
                          <SelectItem value="SOCIAL">Evento Social</SelectItem>
                          <SelectItem value="CAPACITACION">Capacitación</SelectItem>
                          <SelectItem value="SERVICIO">Servicio Comunitario</SelectItem>
                          <SelectItem value="OTRO">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventDescription">Descripción</Label>
                    <Textarea
                      id="eventDescription"
                      value={eventForm.description}
                      onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción detallada del evento..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha de Inicio *</Label>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Ubicación</Label>
                      <Input
                        id="location"
                        value={eventForm.location}
                        onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Salón principal, Auditorio..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Presupuesto (€)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={eventForm.budget}
                        onChange={(e) => setEventForm(prev => ({ ...prev, budget: e.target.value }))}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={eventForm.isPublic}
                      onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, isPublic: checked }))}
                    />
                    <Label htmlFor="isPublic">Evento público (visible para todos los miembros)</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsNewEventDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Evento</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Events Grid */}
          {events.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2">¡Comienza a Planificar!</h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu primer evento con asistencia de IA y gestión automática de recursos
                </p>
                <Button onClick={() => setIsNewEventDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Evento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(event.category)}
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </div>
                      <Badge className={getEventStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(event.startDate).toLocaleString('es-ES')}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees?.length || 0} asistentes</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserPlus className="h-4 w-4" />
                        <span>{event.volunteers?.length || 0} voluntarios</span>
                      </div>

                      {event.budget && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>€{event.budget.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => autoAssignVolunteers(event.id)}
                          className="text-xs"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          Auto-Asignar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(event)
                            setIsCommunicationDialogOpen(true)
                          }}
                          className="text-xs"
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Comunicar
                        </Button>
                      </div>
                      
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Additional tabs would continue here with comprehensive implementations */}
        {/* For brevity, I'll include placeholder tabs that can be expanded */}
        
        <TabsContent value="volunteers" className="space-y-4">
          <Alert>
            <UserPlus className="h-4 w-4" />
            <AlertTitle>Gestión Inteligente de Voluntarios</AlertTitle>
            <AlertDescription>
              Asignación automática basada en habilidades, disponibilidad y carga de trabajo. 
              Integrado con el sistema de voluntarios existente.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertTitle>Centro de Participación de Miembros</AlertTitle>
            <AlertDescription>
              Invitaciones automáticas, seguimiento de asistencia, y retroalimentación post-evento.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestión de Recursos</h2>
            <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Recurso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Recurso</DialogTitle>
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
                      onValueChange={(value) => setResourceForm(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resourceDescription">Descripción</Label>
                    <Textarea
                      id="resourceDescription"
                      value={resourceForm.description}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Recurso</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {resources.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay recursos registrados</p>
                <Button className="mt-4" onClick={() => setIsResourceDialogOpen(true)}>
                  Crear primer recurso
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {resource.type === 'EQUIPO' && <Monitor className="h-4 w-4" />}
                      {resource.type === 'ESPACIO' && <Home className="h-4 w-4" />}
                      {resource.type === 'MATERIAL' && <Package className="h-4 w-4" />}
                      {resource.name}
                    </CardTitle>
                    <Badge variant="outline">{resource.type}</Badge>
                  </CardHeader>
                  <CardContent>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    )}
                    {resource.capacity && (
                      <p className="text-sm">Capacidad: {resource.capacity}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {resource.reservations.length} reservaciones activas
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Alert>
            <MessageSquare className="h-4 w-4" />
            <AlertTitle>Comunicaciones Automatizadas</AlertTitle>
            <AlertDescription>
              Invitaciones, recordatorios, y actualizaciones automáticas via email, SMS, y push notifications.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Gestión de Presupuesto y Donaciones</AlertTitle>
            <AlertDescription>
              Seguimiento de gastos por evento y recaudación de fondos específicos.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertTitle>Analytics Avanzados</AlertTitle>
            <AlertDescription>
              Análisis de asistencia, participación de voluntarios, ROI de eventos, y tendencias.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertTitle>Vista de Calendario Interactivo</AlertTitle>
            <AlertDescription>
              Calendario visual con drag-and-drop, vista mensual/semanal, y sincronización de recursos.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>

      {/* Communication Dialog */}
      <Dialog open={isCommunicationDialogOpen} onOpenChange={setIsCommunicationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Comunicación</DialogTitle>
            <DialogDescription>
              {selectedEvent ? `Para el evento: ${selectedEvent.title}` : 'Comunicación del evento'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            if (selectedEvent) sendEventCommunication(selectedEvent.id)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="communicationType">Tipo de Comunicación</Label>
              <Select
                value={communicationForm.type}
                onValueChange={(value) => setCommunicationForm(prev => ({ ...prev, type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="PUSH">Notificación Push</SelectItem>
                  <SelectItem value="SOCIAL">Redes Sociales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={communicationForm.subject}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del mensaje"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                value={communicationForm.content}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Contenido del mensaje..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledFor">Programar Para (opcional)</Label>
              <Input
                id="scheduledFor"
                type="datetime-local"
                value={communicationForm.scheduledFor}
                onChange={(e) => setCommunicationForm(prev => ({ ...prev, scheduledFor: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCommunicationDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {communicationForm.scheduledFor ? 'Programar' : 'Enviar Ahora'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

