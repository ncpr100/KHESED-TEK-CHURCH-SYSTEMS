

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar,
  Save,
  Loader2,
  AlertTriangle,
  Trash2,
  Power
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

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
}

export default function ChurchSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const [church, setChurch] = useState<Church | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    website: '',
    founded: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    const fetchChurchDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/platform/churches/${params.id}`)
        
        if (response.ok) {
          const data = await response.json()
          setChurch(data.church)
          setFormData({
            name: data.church.name,
            email: data.church.email,
            address: data.church.address || '',
            phone: data.church.phone || '',
            website: data.church.website || '',
            founded: data.church.founded ? data.church.founded.split('T')[0] : '',
            description: data.church.description || '',
            isActive: data.church.isActive
          })
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Nombre e email son requeridos')
      return
    }

    setSaving(true)
    
    try {
      const response = await fetch(`/api/platform/churches/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setChurch(data.church)
        toast.success('Configuración actualizada exitosamente')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al actualizar la configuración')
      }
    } catch (error) {
      console.error('Error updating church:', error)
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!confirm('¿Estás seguro de que quieres desactivar esta iglesia? Esta acción desactivará también a todos sus usuarios.')) {
      return
    }

    setDeactivating(true)
    
    try {
      const response = await fetch(`/api/platform/churches/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Iglesia desactivada exitosamente')
        router.push('/platform/churches')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al desactivar la iglesia')
      }
    } catch (error) {
      console.error('Error deactivating church:', error)
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setDeactivating(false)
    }
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
          {Array.from({ length: 2 }, (_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
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
            <p className="text-red-600 mb-6">No se pudo cargar la configuración de la iglesia</p>
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
              Configurar {church.name}
            </h1>
            <p className="text-gray-600 mt-1">Administrar configuración y ajustes de la iglesia</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={church.isActive ? "default" : "destructive"} className={church.isActive ? "bg-green-100 text-green-700" : ""}>
            <Power className="h-3 w-3 mr-1" />
            {church.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Configuración principal de la iglesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Iglesia *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nombre de la iglesia"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email de Contacto *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contacto@iglesia.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.iglesia.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="founded">Fecha de Fundación</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="founded"
                      type="date"
                      value={formData.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección Completa</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Calle Principal 123, Ciudad, Estado, País"
                    className="pl-10"
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Breve descripción de la misión y visión de la iglesia..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Control */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Iglesia</CardTitle>
              <CardDescription>
                Controlar el acceso y estado de activación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="active-switch">Estado Activo</Label>
                  <p className="text-sm text-gray-600">
                    {formData.isActive ? 'La iglesia está activa' : 'La iglesia está inactiva'}
                  </p>
                </div>
                <Switch
                  id="active-switch"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
              
              {!formData.isActive && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Iglesia Inactiva</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Los usuarios no podrán acceder al sistema
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/platform/churches/${church.id}/details`}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/platform/churches/${church.id}/users`}>
                  <Power className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Link>
              </Button>
              
              <Separator />
              
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={handleDeactivate}
                disabled={deactivating || !church.isActive}
              >
                {deactivating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Desactivando...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desactivar Iglesia
                  </>
                )}
              </Button>
              
              {!church.isActive && (
                <p className="text-xs text-gray-500 text-center">
                  La iglesia ya está desactivada
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

