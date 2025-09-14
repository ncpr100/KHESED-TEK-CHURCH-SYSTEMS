'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Ticket, 
  User, 
  Building, 
  Calendar,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface TicketMessage {
  id: string
  message: string
  isFromSupport: boolean
  createdAt: string
  sentBy: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface TicketData {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  description: string
  resolution?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  createdBy: {
    id: string
    name: string
    email: string
    role: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  church?: {
    id: string
    name: string
  }
  messages: TicketMessage[]
}

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [updatingTicket, setUpdatingTicket] = useState(false)
  
  // Update form states
  const [newStatus, setNewStatus] = useState('')
  const [newPriority, setNewPriority] = useState('')
  const [resolution, setResolution] = useState('')

  const fetchTicketDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tickets/${ticketId}`)
      const data = await response.json()

      if (response.ok) {
        setTicket(data.ticket)
        setNewStatus(data.ticket.status)
        setNewPriority(data.ticket.priority)
        setResolution(data.ticket.resolution || '')
      } else {
        toast.error(data.error || 'Error al cargar ticket')
      }
    } catch (error) {
      console.error('Error fetching ticket:', error)
      toast.error('Error de conexión al cargar ticket')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error('El mensaje no puede estar vacío')
      return
    }

    try {
      setSendingMessage(true)
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Mensaje enviado exitosamente')
        setNewMessage('')
        fetchTicketDetails() // Refresh to get the new message
      } else {
        toast.error(result.error || 'Error al enviar mensaje')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error de conexión al enviar mensaje')
    } finally {
      setSendingMessage(false)
    }
  }

  const updateTicket = async () => {
    try {
      setUpdatingTicket(true)
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          priority: newPriority,
          resolution: resolution
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Ticket actualizado exitosamente')
        fetchTicketDetails() // Refresh data
      } else {
        toast.error(result.error || 'Error al actualizar ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      toast.error('Error de conexión al actualizar ticket')
    } finally {
      setUpdatingTicket(false)
    }
  }

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Cargando ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Ticket no encontrado</p>
          <Link href="/admin/tickets">
            <Button className="mt-4">Volver a Tickets</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/tickets">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tickets
          </Button>
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">#{ticket.ticketNumber}</h1>
              <p className="text-muted-foreground">{ticket.subject}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge className={getStatusColor(ticket.status)}>
              {ticket.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle>Descripción del Problema</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Conversación ({ticket.messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hay mensajes en este ticket
                </p>
              ) : (
                <div className="space-y-4">
                  {ticket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromSupport ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.isFromSupport
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs mb-1">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{message.sentBy.name}</span>
                          <span className="opacity-70">
                            {new Date(message.createdAt).toLocaleString('es-ES')}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Message Form */}
              <div className="border-t pt-4">
                <Textarea
                  placeholder="Escriba su respuesta..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={3}
                  disabled={sendingMessage}
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    onClick={sendMessage} 
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Respuesta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuario</label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{ticket.createdBy.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.createdBy.email}</p>
              </div>

              {ticket.church && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Iglesia</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">{ticket.church.name}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                <Badge variant="outline" className="mt-1">{ticket.category}</Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Creado</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(ticket.createdAt).toLocaleString('es-ES')}</span>
                </div>
              </div>

              {ticket.resolvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resuelto</label>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{new Date(ticket.resolvedAt).toLocaleString('es-ES')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Ticket */}
          <Card>
            <CardHeader>
              <CardTitle>Actualizar Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Abierto</SelectItem>
                    <SelectItem value="in-progress">En progreso</SelectItem>
                    <SelectItem value="resolved">Resuelto</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Prioridad</label>
                <Select value={newPriority} onValueChange={setNewPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notas de Resolución</label>
                <Textarea
                  placeholder="Notas sobre la resolución del ticket..."
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={updateTicket} 
                className="w-full"
                disabled={updatingTicket}
              >
                {updatingTicket ? 'Actualizando...' : 'Actualizar Ticket'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}