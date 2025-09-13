
/**
 * Bible Search Component
 * Provides Bible search functionality with subscription-based features
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Search, Star, BookOpen } from 'lucide-react'
import { toast } from 'sonner'

interface BibleSearchProps {
  onVerseSelect?: (verse: string) => void
}

interface BibleSubscription {
  hasSubscription: boolean
  subscription: any
  plans: any[]
  upgradeUrl: string
}

export function PremiumBibleSearch({ onVerseSelect }: BibleSearchProps) {
  const [reference, setReference] = useState('')
  const [version, setVersion] = useState('RVR1960')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [subscription, setSubscription] = useState<BibleSubscription | null>(null)
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

  const handleSearch = async () => {
    if (!reference.trim()) {
      toast.error('Por favor ingresa una referencia bíblica')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bible-premium/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, version })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data.verse)
        if (onVerseSelect) {
          onVerseSelect(reference)
        }
        
        if (data.authenticated) {
          toast.success('Versículo encontrado via API premium')
        } else {
          toast.info('Actualiza para acceso completo')
        }
      } else {
        toast.error(data.error || 'Error al buscar versículo')
      }
    } catch (error) {
      toast.error('Error de conexión')
      console.error('Search error:', error)
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

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Búsqueda Bíblica
            {subscription?.hasSubscription && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Suscripción Activa
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onClick={handleSearch}
                  disabled={loading || !reference.trim()}
                  size="sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="version">Versión Bíblica</Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RVR1960">Reina Valera 1960</SelectItem>
                  <SelectItem value="RVC">Reina Valera Contemporánea</SelectItem>
                  <SelectItem value="NVI">Nueva Versión Internacional</SelectItem>
                  <SelectItem value="TLA">Traducción en Lenguaje Actual</SelectItem>
                  <SelectItem value="ESV">English Standard Version</SelectItem>
                  <SelectItem value="KJV">King James Version</SelectItem>
                  <SelectItem value="NIV">New International Version</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Result */}
          {result && (
            <Card className="mt-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {reference} - {result.versionName}
                  </CardTitle>
                  <Badge variant={result.authenticated ? "default" : "secondary"}>
                    {result.authenticated ? "API Auténtica" : "Acceso Limitado"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed">{result.text}</p>
                <div className="mt-4 text-sm text-muted-foreground">
                  Fuente: {result.source} • {result.authenticated ? "Autenticado" : "Versión gratuita"}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Prompts for Free Users */}
      {!subscription?.hasSubscription && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BookOpen className="h-5 w-5" />
              Mejora tu Búsqueda Bíblica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscription?.plans?.map((plan: any) => (
                <Card key={plan.id} className="relative">
                  {plan.id === 'bible-pro' && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Más Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/mes</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {plan.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    <Button 
                      className="w-full mt-4"
                      variant={plan.id === 'bible-pro' ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      Seleccionar {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Con la suscripción avanzada tendrás acceso a:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Versiones españolas múltiples</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Versiones inglesas incluidas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Comparación ilimitada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Contenido auténtico</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
