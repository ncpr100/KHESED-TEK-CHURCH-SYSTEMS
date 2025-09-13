
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Save, BookOpen, Lightbulb, Search, Book } from 'lucide-react'
import { PremiumBibleSearch } from './premium-bible-search'
import { PremiumBibleComparison } from './premium-bible-comparison'

import { toast } from 'sonner'

interface SermonAssistantProps {
  onSave?: (sermonData: any) => void
}



export function SermonAssistant({ onSave }: SermonAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [activeTab, setActiveTab] = useState('generator')
  const [sermonSections, setSermonSections] = useState({
    introduction: '',
    biblicalContext: '',
    mainPoints: ['', '', ''],
    conclusion: '',
    outline: ''
  })
  const [formData, setFormData] = useState({
    topic: '',
    scripture: '',
    audience: 'general',
    duration: '30',
    language: 'es',
    title: '',
    bibleVersion: 'RVR1960'
  })



  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Por favor ingresa un tema para el sermón')
      return
    }

    setIsGenerating(true)
    setGeneratedContent('')

    try {
      const response = await fetch('/api/sermons/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          scripture: formData.scripture,
          audience: formData.audience,
          duration: formData.duration,
          language: formData.language,
        }),
      })

      if (!response.ok) {
        throw new Error('Error generando el sermón')
      }

      const data = await response.json()
      if (data.content) {
        setGeneratedContent(data.content)
        
        // Parse sections for enhanced editing
        parseSermonSections(data.content)
        
        // Switch to editing tab after generation
        setActiveTab('editor')
      } else {
        throw new Error('No se recibió contenido válido')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error generando el sermón. Por favor intenta de nuevo.')
    } finally {
      setIsGenerating(false)
    }
  }

  const parseSermonSections = (content: string) => {
    // Basic parsing - enhanced for better section detection
    const sections = {
      introduction: '',
      biblicalContext: '',
      mainPoints: ['', '', ''],
      conclusion: '',
      outline: ''
    }
    
    // Extract different sections based on common patterns
    const introMatch = content.match(/INTRODUCCIÓN[\s\S]*?(?=CONTEXTO|PUNTOS|CONCLUSIÓN|$)/i)
    if (introMatch) sections.introduction = introMatch[0].replace(/INTRODUCCIÓN\s*/i, '').trim()
    
    const contextMatch = content.match(/CONTEXTO[\s\S]*?(?=PUNTOS|CONCLUSIÓN|ESQUEMA|$)/i)
    if (contextMatch) sections.biblicalContext = contextMatch[0].replace(/CONTEXTO[^:]*:?\s*/i, '').trim()
    
    const conclusionMatch = content.match(/CONCLUSIÓN[\s\S]*?(?=ESQUEMA|$)/i)
    if (conclusionMatch) sections.conclusion = conclusionMatch[0].replace(/CONCLUSIÓN[^:]*:?\s*/i, '').trim()
    
    const outlineMatch = content.match(/ESQUEMA[\s\S]*$/i)
    if (outlineMatch) sections.outline = outlineMatch[0].replace(/ESQUEMA[^:]*:?\s*/i, '').trim()
    
    setSermonSections(sections)
  }

  const reconstructSermon = () => {
    let reconstructed = ''
    
    if (sermonSections.introduction) {
      reconstructed += `INTRODUCCIÓN\n\n${sermonSections.introduction}\n\n`
    }
    
    if (sermonSections.biblicalContext) {
      reconstructed += `CONTEXTO BÍBLICO Y PACTUAL\n\n${sermonSections.biblicalContext}\n\n`
    }
    
    reconstructed += `PUNTOS PRINCIPALES\n\n`
    sermonSections.mainPoints.forEach((point, index) => {
      if (point.trim()) {
        reconstructed += `${index + 1}. ${point}\n\n`
      }
    })
    
    if (sermonSections.conclusion) {
      reconstructed += `CONCLUSIÓN REFORMADA\n\n${sermonSections.conclusion}\n\n`
    }
    
    if (sermonSections.outline) {
      reconstructed += `ESQUEMA ESTRUCTURAL\n\n${sermonSections.outline}\n`
    }
    
    return reconstructed
  }

  const updateSection = (section: string, content: string) => {
    setSermonSections(prev => ({
      ...prev,
      [section]: content
    }))
    
    // Update the main content
    setGeneratedContent(reconstructSermon())
  }

  const updateMainPoint = (index: number, content: string) => {
    const newPoints = [...sermonSections.mainPoints]
    newPoints[index] = content
    setSermonSections(prev => ({
      ...prev,
      mainPoints: newPoints
    }))
    
    // Update the main content
    setGeneratedContent(reconstructSermon())
  }

  const handleScriptureSelect = (verse: string) => {
    setFormData(prev => ({ ...prev, scripture: verse }))
  }

  const handleSave = async () => {
    if (!generatedContent.trim() || !formData.title.trim()) {
      toast.error('Por favor genera un sermón y agrega un título antes de guardar')
      return
    }

    try {
      const response = await fetch('/api/sermons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          content: generatedContent,
          scripture: formData.scripture,
          topic: formData.topic,
        }),
      })

      if (!response.ok) {
        throw new Error('Error guardando el sermón')
      }

      toast.success('Sermón guardado exitosamente')
      setGeneratedContent('')
      setFormData({
        topic: '',
        scripture: '',
        audience: 'general',
        duration: '30',
        language: 'es',
        title: '',
        bibleVersion: 'RVR1960'
      })

      if (onSave) {
        const data = await response.json()
        onSave(data)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error guardando el sermón. Por favor intenta de nuevo.')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Asistente de Sermones Reformado con IA
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Teología del Pacto
            </Badge>
            <Badge variant="outline" className="text-xs">🌐 APIs Bíblicas Externas</Badge>
            <Badge variant="outline" className="text-xs">66 Libros • 31,000+ Versículos</Badge>
            <Badge variant="outline" className="text-xs">18 Versiones</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generador IA
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="bible-premium" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                Búsqueda Bíblica
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic">Tema del Sermón *</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="Ej: La gracia soberana de Dios"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="scripture">Pasaje Bíblico</Label>
                    <div className="flex gap-2">
                      <Input
                        id="scripture"
                        value={formData.scripture}
                        onChange={(e) => setFormData(prev => ({ ...prev, scripture: e.target.value }))}
                        placeholder="Ej: Juan 3:16, 1 thessalonians 5:23-24"
                        className="flex-1"
                      />

                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="bibleVersion">Versión Bíblica</Label>
                    <Select value={formData.bibleVersion} onValueChange={(value) => setFormData(prev => ({ ...prev, bibleVersion: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="RVR1960">Reina Valera 1960</SelectItem>
                        <SelectItem value="RVC">Reina Valera Contemporánea</SelectItem>
                        <SelectItem value="NVI">Nueva Versión Internacional</SelectItem>
                        <SelectItem value="TLA">Traducción en Lenguaje Actual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="audience">Audiencia</Label>
                    <Select value={formData.audience} onValueChange={(value) => setFormData(prev => ({ ...prev, audience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar audiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Congregación General</SelectItem>
                        <SelectItem value="jovenes">Jóvenes</SelectItem>
                        <SelectItem value="adultos">Adultos</SelectItem>
                        <SelectItem value="nuevos-creyentes">Nuevos Creyentes</SelectItem>
                        <SelectItem value="matrimonios">Matrimonios</SelectItem>
                        <SelectItem value="liderazgo">Liderazgo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="duration">Duración</Label>
                    <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="20">20 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !formData.topic.trim()}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? 'Generando Sermón Reformado...' : 'Generar Sermón con IA'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              {generatedContent ? (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Título del Sermón *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ingresa un título poderoso para tu sermón"
                      className="text-lg font-semibold"
                    />
                  </div>

                  <Tabs defaultValue="sections" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sections">Edición por Secciones</TabsTrigger>
                      <TabsTrigger value="full">Texto Completo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sections" className="space-y-4">
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Introducción</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={sermonSections.introduction}
                              onChange={(e) => updateSection('introduction', e.target.value)}
                              placeholder="Captura la atención, conecta con la vida cotidiana..."
                              rows={4}
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Contexto Bíblico y Pactual</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={sermonSections.biblicalContext}
                              onChange={(e) => updateSection('biblicalContext', e.target.value)}
                              placeholder="Trasfondo histórico, ubicación en el pacto de gracia..."
                              rows={5}
                            />
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Puntos Principales</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {sermonSections.mainPoints.map((point, index) => (
                              <div key={index}>
                                <Label>Punto {index + 1}</Label>
                                <Textarea
                                  value={point}
                                  onChange={(e) => updateMainPoint(index, e.target.value)}
                                  placeholder={`Desarrolla tu punto principal ${index + 1}...`}
                                  rows={4}
                                />
                              </div>
                            ))}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Conclusión Reformada</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Textarea
                              value={sermonSections.conclusion}
                              onChange={(e) => updateSection('conclusion', e.target.value)}
                              placeholder="Exalta la gracia soberana, llamado a la fe y obediencia..."
                              rows={4}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="full">
                      <div>
                        <Label>Contenido Completo</Label>
                        <Textarea
                          value={generatedContent}
                          onChange={(e) => setGeneratedContent(e.target.value)}
                          rows={20}
                          className="font-mono text-sm mt-2"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-4">
                    <Button onClick={handleSave} size="lg">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Sermón
                    </Button>

                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay sermón para editar</h3>
                  <p className="text-muted-foreground mb-4">
                    Genera un sermón primero usando la pestaña "Generador IA"
                  </p>
                  <Button onClick={() => setActiveTab('generator')}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ir al Generador
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="bible-premium" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Premium Bible Search */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Búsqueda Bíblica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PremiumBibleSearch 
                      onVerseSelect={(verse) => setFormData(prev => ({ ...prev, scripture: verse }))}
                    />
                  </CardContent>
                </Card>

                {/* Premium Bible Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="h-5 w-5" />
                      Comparación de Versiones
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PremiumBibleComparison 
                      initialVerse={formData.scripture}
                      onVerseSelect={(verse) => setFormData(prev => ({ ...prev, scripture: verse }))}
                    />
                  </CardContent>
                </Card>

                {/* Feature Highlight */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="text-center py-6">
                    <Book className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Funciones Bíblicas Avanzadas</h3>
                    <p className="text-muted-foreground mb-4">
                      Accede a múltiples versiones bíblicas con contenido auténtico verificado
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Versiones españolas múltiples</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Versiones inglesas incluidas</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Comparación de versiones</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span>Contenido auténtico</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
