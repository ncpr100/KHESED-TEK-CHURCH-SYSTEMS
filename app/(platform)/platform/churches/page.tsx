

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  DollarSign,
  Activity,
  Eye,
  Settings,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Trash2,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'react-hot-toast'

interface Church {
  id: string
  name: string
  email: string
  address: string | null
  phone: string | null
  website: string | null
  founded: string | null
  isActive: boolean
  createdAt: string
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

interface ChurchesResponse {
  churches: Church[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function PlatformChurchesPage() {
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalChurches, setTotalChurches] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteChurchId, setDeleteChurchId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const fetchChurches = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      })
      
      const response = await fetch(`/api/platform/churches?${params}`)
      if (response.ok) {
        const data: ChurchesResponse = await response.json()
        setChurches(data.churches)
        setTotalPages(data.pagination.pages)
        setTotalChurches(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching churches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChurch = async (churchId: string) => {
    if (!churchId) return
    
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/platform/churches/${churchId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al desactivar iglesia')
      }

      toast.success('Iglesia desactivada exitosamente')
      setDeleteChurchId(null)
      
      // Refresh the churches list
      await fetchChurches()
      
    } catch (error: any) {
      console.error('Error al desactivar iglesia:', error)
      toast.error(error.message || 'Error al desactivar iglesia')
    } finally {
      setDeleteLoading(false)
    }
  }

  useEffect(() => {
    fetchChurches()
  }, [currentPage, searchTerm, statusFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/platform/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              Gestión de Inquilinos
            </h1>
            <p className="text-gray-600 mt-1">
              Administrar todas las iglesias y tenants de la plataforma
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {totalChurches} Iglesias Totales
          </Badge>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/platform/churches/fresh-onboard">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Iglesia
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar iglesias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="inactive">Inactivas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={fetchChurches}>
              <Activity className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Churches List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : churches.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay iglesias registradas</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primera iglesia en la plataforma</p>
            <Button asChild>
              <Link href="/platform/churches/fresh-onboard">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Iglesia
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {churches.map((church) => (
            <Card key={church.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {church.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{church.name}</h3>
                        {church.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactiva
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Email:</strong> {church.email}</p>
                        {church.address && <p><strong>Dirección:</strong> {church.address}</p>}
                        {church.phone && <p><strong>Teléfono:</strong> {church.phone}</p>}
                        <p><strong>Registrada:</strong> {formatDate(church.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="text-lg font-bold text-blue-600">
                            {church.stats.activeUsers}
                          </span>
                        </div>
                        <p className="text-xs text-blue-700">Usuarios</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="h-4 w-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {church.stats.totalMembers}
                          </span>
                        </div>
                        <p className="text-xs text-green-700">Miembros</p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span className="text-lg font-bold text-purple-600">
                            {church.stats.totalEvents}
                          </span>
                        </div>
                        <p className="text-xs text-purple-700">Eventos</p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-bold text-orange-600">
                            {formatCurrency(church.stats.totalDonations)}
                          </span>
                        </div>
                        <p className="text-xs text-orange-700">Donaciones</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/platform/churches/${church.id}/details`} className="flex items-center w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/platform/churches/${church.id}/settings`} className="flex items-center w-full">
                            <Settings className="h-4 w-4 mr-2" />
                            Configurar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/platform/churches/${church.id}/users`} className="flex items-center w-full">
                            <Users className="h-4 w-4 mr-2" />
                            Gestionar Usuarios
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteChurchId(church.id)}
                          className="flex items-center w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Desactivar Iglesia
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteChurchId} onOpenChange={() => setDeleteChurchId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar Iglesia?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la iglesia y sus usuarios asociados. Los datos se conservarán pero 
              la iglesia no podrá acceder al sistema hasta ser reactivada por un administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteChurchId && handleDeleteChurch(deleteChurchId)}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desactivando...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desactivar Iglesia
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

