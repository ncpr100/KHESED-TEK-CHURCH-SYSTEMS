
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Save,
  Building2,
  Camera,
  Palette,
  Type,
  RotateCcw,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChurchProfilePage() {
  const { data: session } = useSession() || {}
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [churchData, setChurchData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    logo: ''
  })

  const [themeData, setThemeData] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B', 
    accentColor: '#10B981',
    primaryFont: 'Inter',
    headingFont: 'Inter',
    badgeStyle: 'modern'
  })

  // 11 Church Branding Presets (Platform Default + 10 Church Options)
  const churchPresets = [
    { 
      name: 'Kḥesed-tek Predeterminado', 
      description: 'Colores oficiales de la plataforma',
      primary: '#3B82F6', 
      secondary: '#64748B', 
      accent: '#10B981',
      isDefault: true
    },
    { 
      name: 'Azul Confianza', 
      description: 'Profesional y confiable',
      primary: '#2563EB', 
      secondary: '#6B7280', 
      accent: '#059669' 
    },
    { 
      name: 'Verde Esperanza', 
      description: 'Esperanza y crecimiento',
      primary: '#059669', 
      secondary: '#6B7280', 
      accent: '#DC2626' 
    },
    { 
      name: 'Púrpura Realeza', 
      description: 'Elegante y espiritual',
      primary: '#7C3AED', 
      secondary: '#6B7280', 
      accent: '#F59E0B' 
    },
    { 
      name: 'Rojo Pasión', 
      description: 'Energía y pasión',
      primary: '#DC2626', 
      secondary: '#6B7280', 
      accent: '#059669' 
    },
    { 
      name: 'Naranja Cálido', 
      description: 'Acogedor y amigable',
      primary: '#EA580C', 
      secondary: '#6B7280', 
      accent: '#2563EB' 
    },
    { 
      name: 'Gris Elegante', 
      description: 'Sofisticado y moderno',
      primary: '#374151', 
      secondary: '#9CA3AF', 
      accent: '#059669' 
    },
    { 
      name: 'Azul Cielo', 
      description: 'Paz y serenidad',
      primary: '#0EA5E9', 
      secondary: '#64748B', 
      accent: '#F59E0B' 
    },
    { 
      name: 'Verde Naturaleza', 
      description: 'Natural y tranquilo',
      primary: '#16A34A', 
      secondary: '#71717A', 
      accent: '#DC2626' 
    },
    { 
      name: 'Rosa Amor', 
      description: 'Amor y compasión',
      primary: '#EC4899', 
      secondary: '#6B7280', 
      accent: '#059669' 
    },
    { 
      name: 'Marrón Tierra', 
      description: 'Estable y tradicional',
      primary: '#92400E', 
      secondary: '#78716C', 
      accent: '#2563EB' 
    }
  ]

  // Font options with descriptions
  const fontOptions = [
    { value: 'Inter', label: 'Inter (Moderno y Limpio)', preview: 'Inter' },
    { value: 'Georgia', label: 'Georgia (Clásico y Elegante)', preview: 'Georgia' },
    { value: 'Roboto', label: 'Roboto (Amigable y Legible)', preview: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans (Profesional)', preview: 'Open Sans' },
    { value: 'Lora', label: 'Lora (Tradicional)', preview: 'Lora' },
    { value: 'Montserrat', label: 'Montserrat (Moderno y Fuerte)', preview: 'Montserrat' }
  ]

  // Badge style options
  const badgeStyles = [
    { value: 'modern', label: 'Moderno (Redondeado)', preview: 'rounded-full' },
    { value: 'classic', label: 'Clásico (Cuadrado)', preview: 'rounded-sm' },
    { value: 'elegant', label: 'Elegante (Suave)', preview: 'rounded-lg' }
  ]

  useEffect(() => {
    if (session?.user?.church) {
      setChurchData({
        name: session.user.church.name || '',
        address: session.user.church.address || '',
        phone: session.user.church.phone || '',
        email: session.user.church.email || '',
        website: session.user.church.website || '',
        description: session.user.church.description || '',
        logo: session.user.church.logo || ''
      })
    }
  }, [session])

  const handleInputChange = (field: string, value: string) => {
    setChurchData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleThemeChange = (field: string, value: string) => {
    setThemeData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyChurchPreset = (preset: any) => {
    setThemeData(prev => ({
      ...prev,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent
    }))
    toast.success(`🎨 Tema "${preset.name}" aplicado exitosamente`)
  }

  const resetTheme = () => {
    setThemeData({
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B', 
      accentColor: '#10B981',
      primaryFont: 'Inter',
      headingFont: 'Inter',
      badgeStyle: 'modern'
    })
    toast.success('Tema restablecido a valores predeterminados')
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo debe ser menor a 2MB')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'church-logo')

      // Upload to your file upload API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        handleInputChange('logo', data.url)
        toast.success('Logo subido exitosamente')
      } else {
        throw new Error('Error al subir el archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir el logo')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLogo = () => {
    handleInputChange('logo', '')
    toast.success('Logo removido')
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Save both church profile and theme data
      const profileResponse = await fetch('/api/church/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(churchData)
      })

      const themeResponse = await fetch('/api/church/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(themeData)
      })

      if (profileResponse.ok && themeResponse.ok) {
        toast.success('Perfil y tema de la iglesia actualizados exitosamente')
        // Refresh session to get updated data
        window.location.reload()
      } else {
        const profileError = profileResponse.ok ? null : await profileResponse.json()
        const themeError = themeResponse.ok ? null : await themeResponse.json()
        throw new Error(profileError?.message || themeError?.message || 'Error al actualizar')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error al guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Perfil de la Iglesia</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Información Básica
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colores y Diseño
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Church Logo Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Logo de la Iglesia
              </CardTitle>
              <CardDescription>
                Sube el logo oficial de tu iglesia (máx. 2MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Preview */}
              <div className="flex justify-center">
                <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {churchData.logo ? (
                    <>
                      <img
                        src={churchData.logo}
                        alt="Church Logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 w-6 h-6"
                        onClick={handleRemoveLogo}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Sin logo</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button */}
              <div className="text-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="logo-upload"
                  disabled={loading}
                />
                <Button
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Subir Logo
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Formatos soportados: JPG, PNG, GIF<br />
                Tamaño máximo: 2MB
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Church Information Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Iglesia</CardTitle>
              <CardDescription>
                Actualiza la información básica de tu iglesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la Iglesia *</Label>
                  <Input
                    id="name"
                    value={churchData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ej: Iglesia Central"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={churchData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contacto@iglesia.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={churchData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={churchData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.iglesia.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={churchData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, Ciudad, Estado"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={churchData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Breve descripción de la iglesia..."
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving || !churchData.name.trim()}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>

    <TabsContent value="theme" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simplified Theme Settings */}
        <div className="space-y-6">
          {/* Church Branding Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Colores de tu Iglesia
              </CardTitle>
              <CardDescription>
                Selecciona la combinación que mejor represente a tu iglesia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {churchPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyChurchPreset(preset)}
                    className={`p-4 border-2 rounded-xl hover:shadow-md transition-all text-left ${
                      themeData.primaryColor === preset.primary 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        {preset.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Predeterminado
                          </Badge>
                        )}
                      </div>
                      {themeData.primaryColor === preset.primary && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{preset.name}</h3>
                    <p className="text-sm text-gray-600">{preset.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Simple Font Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Fuentes de tu Iglesia
              </CardTitle>
              <CardDescription>
                Selecciona las fuentes que mejor representen a tu iglesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="headingFont">Fuente para Títulos</Label>
                  <Select 
                    value={themeData.headingFont} 
                    onValueChange={(value) => handleThemeChange('headingFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.preview }}>
                            {font.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="primaryFont">Fuente para Texto General</Label>
                  <Select 
                    value={themeData.primaryFont} 
                    onValueChange={(value) => handleThemeChange('primaryFont', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.preview }}>
                            {font.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simple Badge Styles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">🏷️</span>
                Estilo de Insignias
              </CardTitle>
              <CardDescription>
                Selecciona cómo se verán las insignias de tu iglesia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {badgeStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => handleThemeChange('badgeStyle', style.value)}
                    className={`p-4 border-2 rounded-xl hover:shadow-md transition-all text-left ${
                      themeData.badgeStyle === style.value 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          className={`${style.preview}`}
                          style={{ backgroundColor: themeData.primaryColor }}
                        >
                          Pastor
                        </Badge>
                        <div>
                          <p className="font-medium">{style.label}</p>
                          <p className="text-sm text-gray-600">Estilo {style.value}</p>
                        </div>
                      </div>
                      {themeData.badgeStyle === style.value && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Help Info & Reset */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <span className="text-lg">💡</span>
                  <span className="font-medium">Información Importante</span>
                </div>
                <p className="text-sm text-blue-600">
                  Estos colores personalizan solo la marca de tu iglesia.
                  Los colores generales del sistema los controla el administrador de la plataforma.
                </p>
                <Button 
                  variant="outline" 
                  onClick={resetTheme}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Volver al Predeterminado
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simplified Church Preview */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa de tu Iglesia
              </CardTitle>
              <CardDescription>
                Así se verá la marca de tu iglesia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 p-4 border rounded-lg bg-white">
                {/* Church Header Preview */}
                <div 
                  className="p-4 rounded-xl text-white text-center"
                  style={{ backgroundColor: themeData.primaryColor }}
                >
                  <h3 
                    className="font-bold text-xl mb-1"
                    style={{ fontFamily: themeData.headingFont }}
                  >
                    {churchData.name || 'Mi Iglesia'}
                  </h3>
                  <p 
                    className="text-sm opacity-90"
                    style={{ fontFamily: themeData.primaryFont }}
                  >
                    Bienvenidos a nuestra comunidad
                  </p>
                </div>

                {/* Church Roles Preview */}
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Roles en tu iglesia:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        className={`${badgeStyles.find(s => s.value === themeData.badgeStyle)?.preview} text-white`}
                        style={{ backgroundColor: themeData.primaryColor }}
                      >
                        Pastor Principal
                      </Badge>
                      <Badge 
                        className={`${badgeStyles.find(s => s.value === themeData.badgeStyle)?.preview} text-white`}
                        style={{ backgroundColor: themeData.secondaryColor }}
                      >
                        Líder de Ministerio
                      </Badge>
                      <Badge 
                        className={`${badgeStyles.find(s => s.value === themeData.badgeStyle)?.preview} text-white`}
                        style={{ backgroundColor: themeData.accentColor }}
                      >
                        Miembro Activo
                      </Badge>
                    </div>
                  </div>

                  {/* Sample Church Content */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 
                      className="font-semibold mb-2"
                      style={{ 
                        fontFamily: themeData.headingFont,
                        color: themeData.primaryColor 
                      }}
                    >
                      Próximo Servicio
                    </h4>
                    <p 
                      className="text-gray-700 text-sm"
                      style={{ fontFamily: themeData.primaryFont }}
                    >
                      Domingo 10:00 AM - Sala Principal
                    </p>
                    <Button 
                      size="sm"
                      className="mt-2 text-white"
                      style={{ backgroundColor: themeData.accentColor }}
                    >
                      Confirmar Asistencia
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>

    {/* Save Button for All Changes */}
    <div className="flex justify-end pt-4 border-t bg-gray-50 px-6 py-4 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">¿Listo para aplicar los cambios?</p>
          <p className="text-xs text-gray-600">Se guardará la información básica y el tema de tu iglesia</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !churchData.name.trim()}
          size="lg"
          className="min-w-[160px]"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  </Tabs>
    </div>
  )
}
