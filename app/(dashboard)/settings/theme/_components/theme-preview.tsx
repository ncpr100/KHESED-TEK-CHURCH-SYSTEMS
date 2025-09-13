
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Calendar, Users, TrendingUp, Heart, MessageSquare } from 'lucide-react'

interface ThemePreviewProps {
  theme: any
}

export function ThemePreview({ theme }: ThemePreviewProps) {
  return (
    <div 
      className="p-6 border rounded-lg space-y-6 bg-background text-foreground"
      style={{
        // Apply custom CSS variables for preview
        '--preview-primary': theme.primaryColor || 'var(--primary)',
        '--preview-secondary': theme.secondaryColor || 'var(--secondary)',
        '--preview-accent': theme.accentColor || 'var(--accent)',
        '--preview-background': theme.backgroundColor || 'var(--background)',
        '--preview-foreground': theme.foregroundColor || 'var(--foreground)',
        '--preview-border': theme.borderColor || 'var(--border)',
        '--preview-radius': theme.borderRadius || 'var(--radius)',
        fontFamily: theme.fontFamily || 'var(--font-inter)',
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold" style={{ fontFamily: theme.fontFamily }}>
            {theme.brandName || 'Iglesia Central Ejemplo'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Vista previa del tema: {theme.themeName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary"
            style={{
              backgroundColor: `hsl(${theme.primaryColor || 'var(--primary)'})`,
              color: `hsl(${theme.backgroundColor || 'var(--background)'})`
            }}
          >
            {theme.themeMode === 'light' ? 'Claro' : theme.themeMode === 'dark' ? 'Oscuro' : 'Automático'}
          </Badge>
          <Button 
            size="sm"
            style={{
              backgroundColor: `hsl(${theme.primaryColor || 'var(--primary)'})`,
              color: `hsl(${theme.backgroundColor || 'var(--background)'})`
            }}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border" style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">348</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Este Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Próximo: Servicio Dominical
            </p>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donaciones</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              +8% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border" style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>
              Las últimas actividades en la iglesia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  Juan Díaz se registró para el retiro
                </p>
                <p className="text-sm text-muted-foreground">
                  hace 2 horas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback 
                  style={{
                    backgroundColor: `hsl(${theme.accentColor || 'var(--accent)'})`,
                  }}
                >
                  MC
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  María González hizo una donación
                </p>
                <p className="text-sm text-muted-foreground">
                  hace 4 horas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border" style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Servicio Dominical</span>
                <Badge variant="outline">Domingo</Badge>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">
                85% de asistencia esperada
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estudio Bíblico</span>
                <Badge variant="outline">Miércoles</Badge>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground">
                65% de inscripciones completadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t" 
           style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
        <Button 
          size="sm"
          style={{
            backgroundColor: `hsl(${theme.primaryColor || 'var(--primary)'})`,
            color: `hsl(${theme.backgroundColor || 'var(--background)'})`
          }}
        >
          Primario
        </Button>
        <Button 
          variant="secondary" 
          size="sm"
          style={{
            backgroundColor: `hsl(${theme.secondaryColor || 'var(--secondary)'})`
          }}
        >
          Secundario
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          style={{
            borderColor: `hsl(${theme.borderColor || 'var(--border)'})`
          }}
        >
          Outline
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
        >
          Ghost
        </Button>
        {theme.destructiveColor && (
          <Button 
            variant="destructive" 
            size="sm"
            style={{
              backgroundColor: `hsl(${theme.destructiveColor})`
            }}
          >
            Destructivo
          </Button>
        )}
      </div>

      {/* Typography Sample */}
      <div className="space-y-2 pt-4 border-t" 
           style={{ borderColor: `hsl(${theme.borderColor || 'var(--border)'})` }}>
        <h4 className="font-bold text-lg" style={{ fontFamily: theme.fontFamily }}>
          Tipografía de Ejemplo
        </h4>
        <p className="text-muted-foreground" style={{ fontFamily: theme.fontFamily }}>
          Este es un ejemplo de cómo se ve el texto con la configuración actual. 
          La familia de fuente seleccionada es: <code className="bg-muted px-1 rounded text-xs">
            {theme.fontFamily || 'Inter'}
          </code>
        </p>
        {theme.compactMode && (
          <Badge variant="secondary" className="text-xs">
            Modo Compacto Activado
          </Badge>
        )}
      </div>
    </div>
  )
}
