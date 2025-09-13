

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  UserCheck,
  UserX,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface Church {
  id: string
  name: string
  isActive: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

interface UsersResponse {
  users: User[]
  church: Church
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

const ROLE_COLORS = {
  'ADMIN_IGLESIA': 'bg-red-100 text-red-700',
  'PASTOR': 'bg-purple-100 text-purple-700',
  'LIDER': 'bg-blue-100 text-blue-700',
  'MIEMBRO': 'bg-green-100 text-green-700'
}

const ROLE_NAMES = {
  'ADMIN_IGLESIA': 'Admin Iglesia',
  'PASTOR': 'Pastor',
  'LIDER': 'Líder',
  'MIEMBRO': 'Miembro'
}

export default function ChurchUsersPage() {
  const params = useParams()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateUserModal, setShowCreateUserModal] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'MIEMBRO'
  })
  
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Nombre y email son requeridos')
      return
    }

    setIsCreatingUser(true)
    try {
      const response = await fetch(`/api/platform/churches/${params.id}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (response.ok) {
        toast.success('Usuario creado exitosamente')
        setShowCreateUserModal(false)
        setNewUser({ name: '', email: '', role: 'MIEMBRO' })
        fetchUsers() // Refresh the users list
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al crear usuario')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Error de conexión')
    } finally {
      setIsCreatingUser(false)
    }
  }
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params_obj = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        role: roleFilter,
        status: statusFilter
      })
      
      const response = await fetch(`/api/platform/churches/${params.id}/users?${params_obj}`)
      if (response.ok) {
        const data: UsersResponse = await response.json()
        setUsers(data.users)
        setChurch(data.church)
        setTotalPages(data.pagination.pages)
        setTotalUsers(data.pagination.total)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchUsers()
    }
  }, [params.id, currentPage, searchTerm, roleFilter, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/platform/churches/${params.id}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`)
        fetchUsers() // Refresh the list
      } else {
        toast.error('Error al actualizar el estado del usuario')
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Error de conexión')
    }
  }

  const handleSendEmail = (userEmail: string, userName: string) => {
    const subject = encodeURIComponent(`Mensaje de ${church?.name || 'la iglesia'}`)
    const body = encodeURIComponent(`Hola ${userName},\n\n`)
    const mailtoUrl = `mailto:${userEmail}?subject=${subject}&body=${body}`
    window.open(mailtoUrl, '_blank')
    toast.success('Cliente de email abierto')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  if (loading && !church) {
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
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
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
              <Users className="h-8 w-8 text-blue-600" />
              Usuarios de {church?.name || 'Iglesia'}
            </h1>
            <p className="text-gray-600 mt-1">
              Gestionar usuarios y permisos de la iglesia
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            {totalUsers} Usuarios Totales
          </Badge>
          <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Agregar un nuevo usuario a la iglesia {church?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="col-span-3"
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                    placeholder="usuario@email.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Rol
                  </Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MIEMBRO">Miembro</SelectItem>
                      <SelectItem value="LIDER">Líder</SelectItem>
                      <SelectItem value="PASTOR">Pastor</SelectItem>
                      <SelectItem value="ADMIN_IGLESIA">Admin Iglesia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateUserModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  disabled={isCreatingUser || !newUser.name || !newUser.email}
                >
                  {isCreatingUser ? 'Creando...' : 'Crear Usuario'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Roles</SelectItem>
                  <SelectItem value="ADMIN_IGLESIA">Admin Iglesia</SelectItem>
                  <SelectItem value="PASTOR">Pastor</SelectItem>
                  <SelectItem value="LIDER">Líder</SelectItem>
                  <SelectItem value="MIEMBRO">Miembro</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={fetchUsers}>
              <Activity className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="text-center p-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay usuarios registrados</h3>
            <p className="text-gray-600 mb-6">Esta iglesia no tiene usuarios asignados aún</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Usuario
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <Badge 
                          variant="secondary" 
                          className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-700'}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_NAMES[user.role as keyof typeof ROLE_NAMES] || user.role}
                        </Badge>
                        {user.isActive ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <UserX className="h-3 w-3 mr-1" />
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Registrado: {formatDate(user.createdAt)}</span>
                          {user.lastLogin && (
                            <span>Último acceso: {formatDate(user.lastLogin)}</span>
                          )}
                        </div>
                      </div>
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
                        <Link href={`/platform/churches/${params.id}/users/${user.id}/profile`} className="flex items-center w-full">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Ver Perfil
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/platform/churches/${params.id}/users/${user.id}/permissions`} className="flex items-center w-full">
                          <Shield className="h-4 w-4 mr-2" />
                          Editar Permisos
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleSendEmail(user.email, user.name)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Enviar Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className={user.isActive ? "text-red-600" : "text-green-600"}
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-2" />
                            Activar
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
    </div>
  )
}

