
/**
 * Bible Comparison Component
 * Allows comparing multiple Bible versions with subscription-based access
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, BookOpen, Star } from 'lucide-react'
import { toast } from 'sonner'

interface BibleComparisonProps {
  onVerseSelect?: (verse: string) => void
  initialVerse?: string
}

const BIBLE_VERSIONS = [
  // Spanish versions
  { id: 'RVR1960', name: 'Reina Valera 1960', language: 'es', popular: true },
  { id: 'RVC', name: 'Reina Valera Contemporánea', language: 'es' },
  { id: 'NVI', name: 'Nueva Versión Internacional', language: 'es', popular: true },
  { id: 'TLA', name: 'Traducción en Lenguaje Actual', language: 'es' },
  { id: 'PDT', name: 'Palabra de Dios para Todos', language: 'es' },
  { id: 'NTV', name: 'Nueva Traducción Viviente', language: 'es' },
  { id: 'NBLA', name: 'Nueva Biblia de las Américas', language: 'es' },
  
  // English versions
  { id: 'ESV', name: 'English Standard Version', language: 'en', popular: true },
  { id: 'KJV', name: 'King James Version', language: 'en', popular: true },
  { id: 'NIV', name: 'New International Version', language: 'en' },
  { id: 'AMPC', name: 'Amplified Bible', language: 'en' },
]

export function PremiumBibleComparison({ onVerseSelect, initialVerse = '' }: BibleComparisonProps) {
  const [reference, setReference] = useState(initialVerse)
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['RVR1960', 'ESV'])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/bible-premium/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

  const handleVersionToggle = (versionId: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(v => v !== versionId)
      } else {
        return [...prev, versionId].slice(0, subscription?.hasSubscription ? 10 : 3)
      }
    })
  }

  const handleCompare = async () => {
    if (!reference.trim()) {
      toast.error('Por favor ingresa una referencia bíblica')
      return
    }

    if (selectedVersions.length === 0) {
      toast.error('Por favor selecciona al menos una versión')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bible-premium/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, versions: selectedVersions })
      })

      const data = await response.json()
      
      if (data.success) {
        setResults(data.versions)
        if (onVerseSelect) {
          onVerseSelect(reference)
        }
        
        if (data.authenticated) {
          toast.success(`Comparación completada: ${data.totalVersions} versiones`)
        } else {
          toast.info('Actualiza para comparar más versiones')
        }
      } else {
        toast.error(data.error || 'Error al comparar versiones')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Compare error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/bible-premium/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upgrade', planId })
      })

      const data = await response.json()
      
      if (data.success) {
        window.location.href = data.redirectUrl
      } else {
        toast.error('Error al procesar actualización')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Upgrade error:', error)
    }
  }

  if (loadingSubscription) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Verificando suscripción...</span>
        </CardContent>
      </Card>
    )
  }

  const maxVersions = subscription?.hasSubscription ? 10 : 3

  return (
    <div className="space-y-6">
      {/* Comparison Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Comparación de Versiones
            {subscription?.hasSubscription && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Suscripción Activa
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reference">Referencia Bíblica</Label>
            <div className="flex gap-2">
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej: Santiago 3:12, Juan 3:16"
                className="flex-1"
              />
              <Button 
                onClick={handleCompare}
                disabled={loading || !reference.trim() || selectedVersions.length === 0}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <BookOpen className="h-4 w-4 mr-2" />
                )}
                Comparar
              </Button>
            </div>
          </div>

          {/* Version Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Versiones a Comparar</Label>
              <Badge variant="secondary">
                {selectedVersions.length}/{maxVersions} seleccionadas
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {BIBLE_VERSIONS.map((version) => {
                const isSelected = selectedVersions.includes(version.id)
                const canSelect = isSelected || selectedVersions.length < maxVersions
                
                return (
                  <div key={version.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={version.id}
                      checked={isSelected}
                      disabled={!canSelect}
                      onCheckedChange={() => handleVersionToggle(version.id)}
                    />
                    <Label 
                      htmlFor={version.id} 
                      className={`flex-1 cursor-pointer ${!canSelect ? 'text-muted-foreground' : ''}`}
                    >
                      <span className="flex items-center gap-2">
                        {version.name}
                        {version.popular && <Star className="h-3 w-3 text-yellow-500" />}
                        <Badge variant="outline" className="text-xs">
                          {version.language}
                        </Badge>
                      </span>
                    </Label>
                  </div>
                )
              })}
            </div>
            
            {!subscription?.hasSubscription && selectedVersions.length >= 3 && (
              <p className="text-sm text-muted-foreground mt-2">
                Actualiza tu suscripción para comparar hasta 10 versiones simultáneamente
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comparación: {reference}</h3>
          <div className="grid grid-cols-1 gap-4">
            {results.map((verse, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {verse.versionName} ({verse.version})
                    </CardTitle>
                    <Badge variant={verse.authenticated ? "default" : "secondary"}>
                      {verse.authenticated ? "API Auténtica" : "Limitado"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed mb-2">{verse.text}</p>
                  <div className="text-sm text-muted-foreground">
                    {verse.book} {verse.chapter}:{verse.verse} • Fuente: {verse.source}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!subscription?.hasSubscription && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BookOpen className="h-5 w-5" />
              Mejora tus Comparaciones Bíblicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="mb-4">
                Compara hasta <strong>10 versiones simultáneamente</strong> con acceso avanzado
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-sm">Versiones españolas múltiples</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-sm">Versiones inglesas incluidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-sm">Contenido auténtico</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span className="text-sm">Comparaciones ilimitadas</span>
                </div>
              </div>

              {subscription?.plans && (
                <div className="flex justify-center gap-4">
                  {subscription.plans.filter((plan: any) => plan.id === 'bible-pro').map((plan: any) => (
                    <Button 
                      key={plan.id}
                      size="lg"
                      onClick={() => handleUpgrade(plan.id)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Actualizar a {plan.name} - ${plan.price}/mes
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
