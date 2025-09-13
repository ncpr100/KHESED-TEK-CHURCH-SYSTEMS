
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { SermonAssistant } from '@/components/sermons/sermon-assistant'

import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Eye,
  Sparkles
} from 'lucide-react'
import { formatDate, truncateText } from '@/lib/utils'
// import { Sermon } from '@prisma/client'

interface Sermon {
  id: string
  title: string
  description?: string
  scriptureReference?: string
  scripture?: string
  date: Date
  preacher?: string
  speaker?: string
  tags?: string[]
  youtubeUrl?: string
  audioUrl?: string
  notes?: string
  outline?: string
  content?: string
  createdAt: Date
  updatedAt: Date
}

interface SermonsClientProps {
  userRole: string
  churchId: string
}

export function SermonsClient({ userRole, churchId }: SermonsClientProps) {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [filteredSermons, setFilteredSermons] = useState<Sermon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAssistant, setShowAssistant] = useState(false)
  const [showSpanishAssistant, setShowSpanishAssistant] = useState(false)
  const [viewingSermon, setViewingSermon] = useState<Sermon | null>(null)

  useEffect(() => {
    fetchSermons()
  }, [])

  useEffect(() => {
    filterSermons()
  }, [sermons, searchTerm])

  const fetchSermons = async () => {
    try {
      const response = await fetch('/api/sermons')
      if (response.ok) {
        const data = await response.json()
        setSermons(data)
      }
    } catch (error) {
      console.error('Error fetching sermons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSermons = () => {
    let filtered = sermons

    if (searchTerm) {
      filtered = filtered.filter(sermon =>
        sermon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.scripture?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sermon.speaker?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredSermons(filtered)
  }

  const handleDeleteSermon = async (sermonId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este sermón?')) {
      return
    }

    try {
      const response = await fetch(`/api/sermons/${sermonId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSermons()
      } else {
        alert('Error al eliminar el sermón')
      }
    } catch (error) {
      console.error('Error deleting sermon:', error)
      alert('Error al eliminar el sermón')
    }
  }

  const handleSaveFromAssistant = (sermonData: any) => {
    fetchSermons()
    setShowAssistant(false)
    setShowSpanishAssistant(false)
  }

  if (showSpanishAssistant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Asistente de Sermones</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowSpanishAssistant(false)}
          >
            Volver a Sermones
          </Button>
        </div>
        <SermonAssistant onSave={handleSaveFromAssistant} />
      </div>
    )
  }

  if (showAssistant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Asistente de Sermones (Multilingual)</h1>
          <Button 
            variant="outline" 
            onClick={() => setShowAssistant(false)}
          >
            Volver a Sermones
          </Button>
        </div>
        <SermonAssistant onSave={handleSaveFromAssistant} />
      </div>
    )
  }

  if (viewingSermon) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Ver Sermón</h1>
          <Button 
            variant="outline" 
            onClick={() => setViewingSermon(null)}
          >
            Volver
          </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{viewingSermon.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {viewingSermon.scripture && (
                    <Badge variant="secondary">{viewingSermon.scripture}</Badge>
                  )}
                  {viewingSermon.speaker && (
                    <Badge variant="outline">{viewingSermon.speaker}</Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(viewingSermon.createdAt)}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {viewingSermon.outline && (
                <div>
                  <h3 className="font-semibold mb-2">Bosquejo:</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {viewingSermon.outline}
                    </pre>
                  </div>
                </div>
              )}
              {viewingSermon.content && (
                <div>
                  <h3 className="font-semibold mb-2">Contenido:</h3>
                  <div className="bg-background border rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {viewingSermon.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Sermones</h1>
          <p className="text-muted-foreground">
            Crea y administra sermones con ayuda de IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSpanishAssistant(true)} className="bg-green-600 hover:bg-green-700">
            <Sparkles className="h-4 w-4 mr-2" />
            Asistente IA
          </Button>
          <Button variant="outline" onClick={() => setShowAssistant(true)}>
            <BookOpen className="h-4 w-4 mr-2" />
            Asistente IA (Avanzado)
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, escritura o predicador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sermons Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p>Cargando sermones...</p>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron sermones' : 'No hay sermones creados'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowSpanishAssistant(true)} className="bg-green-600 hover:bg-green-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Crear con IA
              </Button>
              <Button variant="outline" onClick={() => setShowAssistant(true)}>
                <BookOpen className="h-4 w-4 mr-2" />
                Crear con IA (Avanzado)
              </Button>
            </div>
          </div>
        ) : (
          filteredSermons.map((sermon) => (
            <Card key={sermon.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">
                  {sermon.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {sermon.scripture && (
                    <Badge variant="secondary" className="text-xs">
                      {sermon.scripture}
                    </Badge>
                  )}
                  {sermon.speaker && (
                    <Badge variant="outline" className="text-xs">
                      {sermon.speaker}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sermon.content && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {truncateText(sermon.content, 120)}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sermon.createdAt)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingSermon(sermon)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSermon(sermon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
