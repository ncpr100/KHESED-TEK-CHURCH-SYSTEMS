
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Globe, 
  Edit, 
  Eye, 
  Settings, 
  Trash2, 
  ExternalLink, 
  Plus,
  MoreHorizontal 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface Website {
  id: string
  name: string
  slug: string
  description?: string
  theme: string
  primaryColor: string
  secondaryColor: string
  isPublished: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  pages: Array<{
    id: string
    title: string
    slug: string
    isHomePage: boolean
    isPublished: boolean
  }>
  funnels: Array<{
    id: string
    name: string
    type: string
    isActive: boolean
  }>
  _count: {
    pages: number
    funnels: number
  }
}

export function WebsiteList() {
  const { data: session } = useSession() || {}
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWebsites()
  }, [])

  const fetchWebsites = async () => {
    try {
      const response = await fetch('/api/websites')
      if (!response.ok) {
        throw new Error('Error al cargar sitios web')
      }
      const data = await response.json()
      setWebsites(data)
    } catch (error) {
      console.error('Error fetching websites:', error)
      toast.error('Error al cargar los sitios web')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteWebsite = async (websiteId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este sitio web? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el sitio web')
      }

      toast.success('Sitio web eliminado correctamente')
      fetchWebsites() // Refrescar lista
    } catch (error) {
      console.error('Error deleting website:', error)
      toast.error('Error al eliminar el sitio web')
    }
  }

  const toggleWebsiteStatus = async (websiteId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/websites/${websiteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Error al cambiar el estado del sitio web')
      }

      toast.success(`Sitio web ${!currentStatus ? 'publicado' : 'despublicado'} correctamente`)
      fetchWebsites() // Refrescar lista
    } catch (error) {
      console.error('Error toggling website status:', error)
      toast.error('Error al cambiar el estado del sitio web')
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (websites.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tienes sitios web aún</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Crea tu primer sitio web profesional para tu iglesia con nuestro constructor intuitivo.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Mi Primer Sitio Web
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {websites.map((website) => (
        <Card key={website.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{website.name}</CardTitle>
                  <Badge 
                    variant={website.isPublished ? 'default' : 'secondary'}
                  >
                    {website.isPublished ? 'Publicado' : 'Borrador'}
                  </Badge>
                </div>
                <CardDescription>
                  {website.description || 'Sin descripción'}
                </CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>URL: /{website.slug}</span>
                  <span>•</span>
                  <span>
                    Actualizado{' '}
                    {formatDistanceToNow(new Date(website.updatedAt), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Sitio
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    Vista Previa
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => toggleWebsiteStatus(website.id, website.isPublished)}
                  >
                    {website.isPublished ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Despublicar
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Publicar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleDeleteWebsite(website.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{website._count.pages} páginas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="h-4 w-4" />
                  <span>{website._count.funnels} funnels</span>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: website.primaryColor }}
                  />
                  <span>Tema: {website.theme}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
