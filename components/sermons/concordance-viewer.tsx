
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Link, Tag, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface CrossReference {
  reference: string
  text: string
  book: string
  chapter: number
  verse: number
  relevanceScore: number
  connectionType: 'direct' | 'thematic' | 'prophetic' | 'typological'
}

interface TopicalReference {
  topic: string
  references: {
    reference: string
    text: string
    book: string
    chapter: number
    verse: number
  }[]
  relatedTopics: string[]
}

interface ConcordanceViewerProps {
  initialVerse?: string
  onReferenceSelect?: (reference: string) => void
}

export function ConcordanceViewer({ initialVerse = '', onReferenceSelect }: ConcordanceViewerProps) {
  const [verseReference, setVerseReference] = useState(initialVerse)
  const [crossReferences, setCrossReferences] = useState<CrossReference[]>([])
  const [topicalReferences, setTopicalReferences] = useState<TopicalReference[]>([])
  const [isLoadingCross, setIsLoadingCross] = useState(false)
  const [isLoadingTopical, setIsLoadingTopical] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const handleSearchCrossReferences = async () => {
    if (!verseReference.trim()) {
      toast.error('Por favor ingresa una referencia bíblica')
      return
    }

    setIsLoadingCross(true)
    try {
      const response = await fetch('/api/bible/cross-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: verseReference
        }),
      })

      if (!response.ok) {
        throw new Error('Error al buscar referencias cruzadas')
      }

      const data = await response.json()
      setCrossReferences(data.crossReferences || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al buscar referencias cruzadas')
    } finally {
      setIsLoadingCross(false)
    }
  }

  const handleSearchTopical = async () => {
    if (!verseReference.trim()) {
      toast.error('Por favor ingresa una referencia bíblica')
      return
    }

    setIsLoadingTopical(true)
    try {
      const response = await fetch('/api/bible/topical-concordance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: verseReference
        }),
      })

      if (!response.ok) {
        throw new Error('Error al buscar concordancia temática')
      }

      const data = await response.json()
      setTopicalReferences(data.topicalReferences || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al buscar concordancia temática')
    } finally {
      setIsLoadingTopical(false)
    }
  }

  const handleReferenceClick = (reference: string) => {
    if (onReferenceSelect) {
      onReferenceSelect(reference)
    }
  }

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'direct': return 'bg-blue-100 text-blue-800'
      case 'thematic': return 'bg-green-100 text-green-800'
      case 'prophetic': return 'bg-purple-100 text-purple-800'
      case 'typological': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConnectionTypeLabel = (type: string) => {
    switch (type) {
      case 'direct': return 'Referencia Directa'
      case 'thematic': return 'Temática'
      case 'prophetic': return 'Profética'
      case 'typological': return 'Tipológica'
      default: return 'Relacionada'
    }
  }

  useEffect(() => {
    if (initialVerse && initialVerse !== verseReference) {
      setVerseReference(initialVerse)
    }
  }, [initialVerse])

  // Auto-search when verse reference changes (with debounce to prevent excessive calls)
  useEffect(() => {
    if (verseReference.trim() && verseReference.length > 3) {
      const timeoutId = setTimeout(() => {
        handleSearchCrossReferences()
        handleSearchTopical()
      }, 500)
      
      return () => clearTimeout(timeoutId)
    }
  }, [verseReference])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Concordancia Bíblica
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ej: Juan 3:16, Salmos 23:1, Génesis 1:1"
            value={verseReference}
            onChange={(e) => setVerseReference(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchCrossReferences()
                handleSearchTopical()
              }
            }}
          />
          <Button 
            onClick={() => {
              handleSearchCrossReferences()
              handleSearchTopical()
            }} 
            disabled={isLoadingCross || isLoadingTopical}
          >
            {(isLoadingCross || isLoadingTopical) ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Tabs defaultValue="cross-references" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cross-references" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Referencias Cruzadas
            </TabsTrigger>
            <TabsTrigger value="topical" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Concordancia Temática
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cross-references" className="space-y-4">
            {isLoadingCross ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : crossReferences.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto space-y-4">
                <div className="space-y-3 pr-4">
                  {crossReferences
                    .sort((a, b) => b.relevanceScore - a.relevanceScore)
                    .map((ref, index) => (
                      <Card key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Button
                              variant="link"
                              className="p-0 h-auto font-semibold text-blue-600"
                              onClick={() => handleReferenceClick(ref.reference)}
                            >
                              {ref.reference}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Button>
                            <div className="flex items-center gap-2">
                              <Badge className={getConnectionTypeColor(ref.connectionType)}>
                                {getConnectionTypeLabel(ref.connectionType)}
                              </Badge>
                              <Badge variant="outline">
                                {Math.round(ref.relevanceScore * 100)}% relevante
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {ref.text}
                          </p>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingresa una referencia para ver las conexiones bíblicas</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="topical" className="space-y-4">
            {isLoadingTopical ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : topicalReferences.length > 0 ? (
              <div className="max-h-[400px] overflow-y-auto">
                <div className="space-y-4 pr-4">
                  {topicalReferences.map((topical, topicIndex) => (
                    <Card key={topicIndex} className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Tag className="h-5 w-5 text-blue-600" />
                            {topical.topic}
                          </h3>
                          <Badge variant="secondary">
                            {topical.references.length} referencia{topical.references.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {topical.references.map((ref, refIndex) => (
                            <div key={refIndex} className="bg-gray-50 p-3 rounded-lg">
                              <Button
                                variant="link"
                                className="p-0 h-auto font-medium text-blue-600 mb-1"
                                onClick={() => handleReferenceClick(ref.reference)}
                              >
                                {ref.reference}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                              <p className="text-sm text-gray-600">
                                {ref.text}
                              </p>
                            </div>
                          ))}
                        </div>

                        {topical.relatedTopics.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-sm text-gray-500 mb-2">Temas relacionados:</p>
                            <div className="flex flex-wrap gap-1">
                              {topical.relatedTopics.map((relatedTopic, relIndex) => (
                                <Badge 
                                  key={relIndex} 
                                  variant="outline" 
                                  className="text-xs cursor-pointer hover:bg-gray-100"
                                  onClick={() => setSelectedTopic(relatedTopic)}
                                >
                                  {relatedTopic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingresa una referencia para ver los temas relacionados</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
