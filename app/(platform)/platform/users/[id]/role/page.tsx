

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Shield, 
  User,
  Mail,
  Church,
  Save,
  AlertTriangle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  church: {
    id: string
    name: string
  } | null
}

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Administrador', description: 'Acceso completo a la plataforma' },
  { value: 'ADMIN_IGLESIA', label: 'Administrador de Iglesia', description: 'Gestión completa de la iglesia' },
  { value: 'PASTOR', label: 'Pastor', description: 'Acceso pastoral y ministerial' },
  { value: 'LIDER', label: 'Líder', description: 'Liderazgo de ministerios específicos' },
  { value: 'MIEMBRO', label: 'Miembro', description: 'Acceso básico como miembro' }
]

export default function EditUserRolePage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchUserDetails()
    }
  }, [params.id])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/platform/users/${params.id}`)
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setSelectedRole(userData.role)
      } else {
        toast.error('Error al cargar los detalles del usuario')
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveRole = async () => {
    if (!user || !selectedRole) return

    try {
      setSaving(true)
      const response = await fetch(`/api/platform/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole })
      })

      if (response.ok) {
        toast.success('Rol actualizado exitosamente')
        router.push(`/platform/users/${user.id}/details`)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al actualizar el rol')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-700 hover:bg-red-200'
      case 'ADMIN_IGLESIA':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      case 'PASTOR':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200'
      case 'LIDER':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  }

  const getSelectedRoleInfo = () => {
    return ROLES.find(role => role.value === selectedRole)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Cargando...</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold">Usuario no encontrado</h1>
        </div>
        <p className="text-gray-600">No se pudo encontrar el usuario solicitado.</p>
      </div>
    )
  }

  const hasRoleChanged = selectedRole !== user.role

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Editar Rol de Usuario</h1>
            <p className="text-gray-600">Modificar permisos y accesos del usuario</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-lg font-medium">{user.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Correo</label>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>

              {user.church && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Iglesia</label>
                  <p className="flex items-center gap-2">
                    <Church className="h-4 w-4" />
                    {user.church.name}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Rol Actual</label>
                <Badge variant="secondary" className={getRoleColor(user.role)}>
                  <Shield className="h-3 w-3 mr-1" />
                  {ROLES.find(r => r.value === user.role)?.label || user.role}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seleccionar Nuevo Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role-select">Rol del Usuario</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-600">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {getSelectedRoleInfo() && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  {getSelectedRoleInfo()?.label}
                </h4>
                <p className="text-sm text-blue-700">
                  {getSelectedRoleInfo()?.description}
                </p>
              </div>
            )}

            {selectedRole === 'SUPER_ADMIN' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Advertencia:</strong> El rol de Super Administrador otorga acceso completo 
                  a toda la plataforma, incluyendo la gestión de todas las iglesias y usuarios.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSaveRole}
            disabled={!hasRoleChanged || saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancelar
          </Button>

          {hasRoleChanged && (
            <div className="text-sm text-amber-600">
              ⚠️ Tienes cambios sin guardar
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

