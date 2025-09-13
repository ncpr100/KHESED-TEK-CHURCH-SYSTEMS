

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Users,
  DollarSign,
  Activity,
  Settings,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface Church {
  id: string
  name: string
  email: string
  address: string | null
  phone: string | null
  website: string | null
  founded: string | null
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count: {
    users: number
    members: number
    events: number
    donations: number
  }
  stats: {
    totalMembers: number
    activeUsers: number
    totalEvents: number
    totalDonations: number
  }
}

export default function ChurchDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchChurchDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/platform/churches/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setChurch(data.church)
        } else if (response.status === 404) {
          setError('Iglesia no encontrada')
        } else {
          setError('Error al cargar los detalles de la iglesia')
        }
      } catch (error) {
        console.error('Error fetching church details:', error)
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchChurchDetails()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        
        <div className="grid gap-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/platform/churches">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Error</h1>
        </div>
        
        <Card>
          <CardContent className="text-center p-12">
            <Building2 className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">{error}</h3>
            <p className="text-red-600 mb-6">No se pudieron cargar los detalles de la iglesia</p>
            <Button asChild>
              <Link href="/platform/churches">
                Volver a Iglesias
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!church) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/platform/churches">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {church.name.charAt(0)}
              </div>
              {church.name}
            </h1>
            <p className="text-gray-600 mt-1">Detalles completos de la iglesia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {church.isActive ? (
            <Badge variant="default" className="bg-green-100 text-green-700">
              <Activity className="h-3 w-3 mr-1" />
              Activa
            </Badge>
          ) : (
            <Badge variant="destructive">
              <Activity className="h-3 w-3 mr-1" />
              Inactiva
            </Badge>
          )}
          <Button asChild>
            <Link href={`/platform/churches/${church.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-sm text-gray-900 mt-1">{church.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${church.email}`} className="text-sm text-blue-600 hover:underline">
                      {church.email}
                    </a>
                  </div>
                </div>
                
                {church.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Teléfono</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${church.phone}`} className="text-sm text-blue-600 hover:underline">
                        {church.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {church.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sitio Web</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a href={church.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {church.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {church.address && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Dirección</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-900">{church.address}</p>
                  </div>
                </div>
              )}
              
              {church.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Descripción</label>
                  <p className="text-sm text-gray-900 mt-1">{church.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Registrada en la Plataforma</p>
                  <p className="text-sm text-blue-700">{formatDate(church.createdAt)}</p>
                </div>
              </div>
              
              {church.founded && (
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-green-900">Iglesia Fundada</p>
                    <p className="text-sm text-green-700">
                      {new Date(church.founded).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Última Actualización</p>
                  <p className="text-sm text-gray-700">{formatDate(church.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{church.stats.activeUsers}</div>
                  <div className="text-xs text-blue-700">Usuarios Activos</div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{church.stats.totalMembers}</div>
                  <div className="text-xs text-green-700">Miembros Totales</div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{church.stats.totalEvents}</div>
                  <div className="text-xs text-purple-700">Eventos</div>
                </div>
                
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-lg font-bold text-orange-600">
                    {formatCurrency(church.stats.totalDonations)}
                  </div>
                  <div className="text-xs text-orange-700">Donaciones</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/platform/churches/${church.id}/users`}>
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/platform/churches/${church.id}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </Link>
              </Button>
              
              <Separator />
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/platform/analytics">
                  <Activity className="h-4 w-4 mr-2" />
                  Ver Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

