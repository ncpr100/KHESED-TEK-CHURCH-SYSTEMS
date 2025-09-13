
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Globe,
  Activity,
  UserCheck
} from 'lucide-react'

interface Church {
  id: string
  name: string
  address?: string
  phone?: string
  email: string
  website?: string
  founded?: string
  description?: string
  isActive: boolean
  createdAt: string
}

interface ChurchDetails extends Church {
  users: Array<{
    id: string
    name: string
    email: string
    role: string
    isActive: boolean
    createdAt: string
  }>
  stats: {
    donations: {
      total: number
      count: number
    }
    members: {
      active: number
      inactive: number
    }
    events: Record<string, number>
  }
}

interface ViewChurchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  church: Church
}

export function ViewChurchDialog({ open, onOpenChange, church }: ViewChurchDialogProps) {
  const [churchDetails, setChurchDetails] = useState<ChurchDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchChurchDetails = async () => {
    if (!church.id) return

    try {
      setLoading(true)
      const response = await fetch(`/api/platform/churches/${church.id}`)
      if (response.ok) {
        const data = await response.json()
        setChurchDetails(data)
      }
    } catch (error) {
      console.error('Error fetching church details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && church.id) {
      fetchChurchDetails()
    }
  }, [open, church.id])

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-2 text-gray-600">Cargando detalles...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!churchDetails) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p className="text-gray-600">Error al cargar los detalles de la iglesia</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {churchDetails.name}
            </DialogTitle>
            <Badge variant={churchDetails.isActive ? 'default' : 'secondary'}>
              {churchDetails.isActive ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="activity">Actividad</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {churchDetails.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Dirección</p>
                        <p className="text-sm text-gray-600">{churchDetails.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-gray-600">{churchDetails.email}</p>
                    </div>
                  </div>

                  {churchDetails.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-gray-600">{churchDetails.phone}</p>
                      </div>
                    </div>
                  )}

                  {churchDetails.website && (
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Sitio Web</p>
                        <a
                          href={churchDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {churchDetails.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {churchDetails.founded && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Fundada</p>
                        <p className="text-sm text-gray-600">
                          {new Date(churchDetails.founded).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Registrada</p>
                      <p className="text-sm text-gray-600">
                        {new Date(churchDetails.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {churchDetails.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Descripción</p>
                    <p className="text-sm text-gray-600">{churchDetails.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{churchDetails.stats.members.active}</p>
                      <p className="text-sm text-gray-600">Miembros Activos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        ${churchDetails.stats.donations.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Donaciones</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold">{churchDetails.users.length}</p>
                      <p className="text-sm text-gray-600">Usuarios Totales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {Object.keys(churchDetails.stats.events).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Eventos por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(churchDetails.stats.events).map(([type, count]) => (
                      <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-sm text-gray-600 capitalize">{type}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usuarios de la Iglesia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {churchDetails.users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'ADMIN_IGLESIA' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  Funcionalidad de actividad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
