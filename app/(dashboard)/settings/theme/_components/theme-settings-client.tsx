
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { Palette, Type, Layout, Settings, Undo2, Save, Eye } from 'lucide-react'
import { ColorPicker } from './color-picker'
import { ThemePreview } from './theme-preview'

interface ThemePreference {
  id: string
  themeName: string
  themeMode: 'light' | 'dark' | 'auto'
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  destructiveColor?: string
  backgroundColor?: string
  foregroundColor?: string
  cardColor?: string
  cardForegroundColor?: string
  borderColor?: string
  mutedColor?: string
  mutedForegroundColor?: string
  fontFamily?: string
  fontSize?: 'small' | 'medium' | 'large' | 'xl'
  borderRadius?: string
  compactMode: boolean
  logoUrl?: string
  faviconUrl?: string
  brandName?: string
  isPublic: boolean
}

const DEFAULT_COLORS = {
  light: {
    primary: '220.9 39.3% 11%',
    secondary: '220 14.3% 95.9%',
    accent: '220 14.3% 95.9%',
    destructive: '0 84.2% 60.2%',
    background: '0 0% 100%',
    foreground: '224 71.4% 4.1%',
    card: '0 0% 100%',
    cardForeground: '224 71.4% 4.1%',
    border: '220 13% 91%',
    muted: '220 14.3% 95.9%',
    mutedForeground: '220 8.9% 46.1%',
  },
  dark: {
    primary: '210 20% 98%',
    secondary: '215 27.9% 16.9%',
    accent: '215 27.9% 16.9%',
    destructive: '0 62.8% 30.6%',
    background: '224 71.4% 4.1%',
    foreground: '210 20% 98%',
    card: '224 71.4% 4.1%',
    cardForeground: '210 20% 98%',
    border: '215 27.9% 16.9%',
    muted: '215 27.9% 16.9%',
    mutedForeground: '217.9 10.6% 64.9%',
  }
}

export function ThemeSettingsClient() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [themePreference, setThemePreference] = useState<ThemePreference | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // SUPER_ADMIN only access control
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-muted-foreground">
              Esta configuración está disponible solo para Super Administradores de la plataforma.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Para personalizar los colores de su iglesia, visite: Perfil de la Iglesia → Colores y Diseño
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    fetchThemePreferences()
  }, [session])

  const fetchThemePreferences = async () => {
    try {
      const response = await fetch('/api/theme-preferences')
      if (response.ok) {
        const data = await response.json()
        setThemePreference(data)
      }
    } catch (error) {
      console.error('Error fetching theme preferences:', error)
      toast.error('Error al cargar configuración de tema')
    } finally {
      setLoading(false)
    }
  }

  const saveThemePreferences = async () => {
    if (!themePreference) return

    setSaving(true)
    try {
      const response = await fetch('/api/theme-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themePreference),
      })

      if (response.ok) {
        toast.success('Configuración de tema guardada exitosamente')
        // Apply theme changes dynamically
        applyThemeChanges()
      } else {
        toast.error('Error al guardar configuración de tema')
      }
    } catch (error) {
      console.error('Error saving theme preferences:', error)
      toast.error('Error al guardar configuración de tema')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = async () => {
    try {
      const response = await fetch('/api/theme-preferences', {
        method: 'DELETE',
      })

      if (response.ok) {
        const data = await response.json()
        setThemePreference(data)
        toast.success('Tema restablecido a valores por defecto')
        applyThemeChanges()
      } else {
        toast.error('Error al restablecer tema')
      }
    } catch (error) {
      console.error('Error resetting theme:', error)
      toast.error('Error al restablecer tema')
    }
  }

  const applyThemeChanges = () => {
    if (!themePreference) return

    const root = document.documentElement
    const mode = themePreference.themeMode === 'auto' ? 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : 
      themePreference.themeMode

    // Apply theme mode
    root.classList.remove('light', 'dark')
    root.classList.add(mode)

    // Apply custom colors if they exist
    const colors = mode === 'dark' ? DEFAULT_COLORS.dark : DEFAULT_COLORS.light

    if (themePreference.primaryColor) {
      root.style.setProperty('--primary', themePreference.primaryColor)
    } else {
      root.style.setProperty('--primary', colors.primary)
    }

    if (themePreference.secondaryColor) {
      root.style.setProperty('--secondary', themePreference.secondaryColor)
    } else {
      root.style.setProperty('--secondary', colors.secondary)
    }

    if (themePreference.accentColor) {
      root.style.setProperty('--accent', themePreference.accentColor)
    } else {
      root.style.setProperty('--accent', colors.accent)
    }

    if (themePreference.backgroundColor) {
      root.style.setProperty('--background', themePreference.backgroundColor)
    } else {
      root.style.setProperty('--background', colors.background)
    }

    if (themePreference.borderRadius) {
      root.style.setProperty('--radius', themePreference.borderRadius)
    } else {
      root.style.setProperty('--radius', '0.5rem')
    }

    // Apply font family
    if (themePreference.fontFamily) {
      document.body.style.fontFamily = themePreference.fontFamily
    }

    // Apply compact mode
    if (themePreference.compactMode) {
      root.classList.add('compact-mode')
    } else {
      root.classList.remove('compact-mode')
    }
  }

  const updateThemePreference = (key: keyof ThemePreference, value: any) => {
    if (!themePreference) return
    
    setThemePreference(prev => ({
      ...prev!,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!themePreference) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar configuración de tema</h1>
          <Button onClick={fetchThemePreferences}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración de Tema</h1>
          <p className="text-muted-foreground">
            Personaliza la apariencia y colores del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa'}
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefault}
            className="gap-2"
          >
            <Undo2 className="h-4 w-4" />
            Restablecer
          </Button>
          <Button
            onClick={saveThemePreferences}
            disabled={saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      {/* Theme Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Vista Previa del Tema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ThemePreview theme={themePreference} />
          </CardContent>
        </Card>
      )}

      {/* Theme Configuration */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="gap-2 cursor-pointer">
            <Palette className="h-4 w-4" />
            Colores
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2 cursor-pointer">
            <Type className="h-4 w-4" />
            Tipografía
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2 cursor-pointer">
            <Layout className="h-4 w-4" />
            Diseño
          </TabsTrigger>
          <TabsTrigger value="general" className="gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Colores</CardTitle>
              <CardDescription>
                Personaliza los colores principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="space-y-2">
                <Label>Modo de Tema</Label>
                <Select
                  value={themePreference.themeMode}
                  onValueChange={(value: 'light' | 'dark' | 'auto') => 
                    updateThemePreference('themeMode', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="auto">Automático</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Color Customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Color Primario"
                  value={themePreference.primaryColor}
                  onChange={(value) => updateThemePreference('primaryColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.primary : DEFAULT_COLORS.light.primary}
                />
                <ColorPicker
                  label="Color Secundario"
                  value={themePreference.secondaryColor}
                  onChange={(value) => updateThemePreference('secondaryColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.secondary : DEFAULT_COLORS.light.secondary}
                />
                <ColorPicker
                  label="Color de Acento"
                  value={themePreference.accentColor}
                  onChange={(value) => updateThemePreference('accentColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.accent : DEFAULT_COLORS.light.accent}
                />
                <ColorPicker
                  label="Color Destructivo"
                  value={themePreference.destructiveColor}
                  onChange={(value) => updateThemePreference('destructiveColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.destructive : DEFAULT_COLORS.light.destructive}
                />
                <ColorPicker
                  label="Color de Fondo"
                  value={themePreference.backgroundColor}
                  onChange={(value) => updateThemePreference('backgroundColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.background : DEFAULT_COLORS.light.background}
                />
                <ColorPicker
                  label="Color de Texto"
                  value={themePreference.foregroundColor}
                  onChange={(value) => updateThemePreference('foregroundColor', value)}
                  defaultValue={themePreference.themeMode === 'dark' ? 
                    DEFAULT_COLORS.dark.foreground : DEFAULT_COLORS.light.foreground}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Tipografía</CardTitle>
              <CardDescription>
                Personaliza las fuentes y tamaños de texto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Familia de Fuente</Label>
                  <Select
                    value={themePreference.fontFamily || 'Inter'}
                    onValueChange={(value) => updateThemePreference('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Tamaño de Fuente</Label>
                  <Select
                    value={themePreference.fontSize || 'medium'}
                    onValueChange={(value: 'small' | 'medium' | 'large' | 'xl') => 
                      updateThemePreference('fontSize', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                      <SelectItem value="xl">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Diseño</CardTitle>
              <CardDescription>
                Personaliza el diseño y espaciado del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Radio de Bordes</Label>
                  <Select
                    value={themePreference.borderRadius || '0.5rem'}
                    onValueChange={(value) => updateThemePreference('borderRadius', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sin bordes redondeados</SelectItem>
                      <SelectItem value="0.25rem">Pequeño</SelectItem>
                      <SelectItem value="0.5rem">Mediano</SelectItem>
                      <SelectItem value="0.75rem">Grande</SelectItem>
                      <SelectItem value="1rem">Extra Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce el espaciado entre elementos
                    </p>
                  </div>
                  <Switch
                    checked={themePreference.compactMode}
                    onCheckedChange={(checked) => 
                      updateThemePreference('compactMode', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General</CardTitle>
              <CardDescription>
                Configuraciones generales del tema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nombre del Tema</Label>
                <Input
                  value={themePreference.themeName}
                  onChange={(e) => updateThemePreference('themeName', e.target.value)}
                  placeholder="Mi tema personalizado"
                />
              </div>

              <div className="space-y-2">
                <Label>Nombre de Marca Personalizado</Label>
                <Input
                  value={themePreference.brandName || ''}
                  onChange={(e) => updateThemePreference('brandName', e.target.value)}
                  placeholder="Nombre personalizado para la iglesia"
                />
              </div>

              <div className="space-y-2">
                <Label>URL del Logo Personalizado</Label>
                <Input
                  value={themePreference.logoUrl || ''}
                  onChange={(e) => updateThemePreference('logoUrl', e.target.value)}
                  placeholder="https://i.ytimg.com/vi/LoVDO6Sh7-0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAX8g6lcAgzd2tewZmqPykp_1LXgg"
                />
              </div>

              <div className="space-y-2">
                <Label>URL del Favicon Personalizado</Label>
                <Input
                  value={themePreference.faviconUrl || ''}
                  onChange={(e) => updateThemePreference('faviconUrl', e.target.value)}
                  placeholder="https://upload.wikimedia.org/wikipedia/commons/2/22/Wikipedia_favicon_in_Firefox_on_KDE_%282023%29.png"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tema Público</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir que otros usuarios copien este tema
                  </p>
                </div>
                <Switch
                  checked={themePreference.isPublic}
                  onCheckedChange={(checked) => 
                    updateThemePreference('isPublic', checked)
                  }
                />
              </div>

              {themePreference.isPublic && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Público</Badge>
                    <span className="text-sm text-muted-foreground">
                      Este tema está disponible para otros usuarios
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
