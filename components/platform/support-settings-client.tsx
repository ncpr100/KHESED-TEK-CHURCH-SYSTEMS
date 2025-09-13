
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Save, Phone, Mail, Building, MapPin, Globe, Clock, MessageCircle, ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

interface ContactInfo {
  id: string
  whatsappNumber: string
  whatsappUrl: string
  email: string
  schedule: string
  companyName: string
  location: string
  website: string
}

interface User {
  id: string
  role: string
  isActive: boolean
  email: string
  name?: string | null
}

interface Props {
  user: User
}

export default function SupportSettingsClient({ user }: Props) {
  const { toast } = useToast()
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    id: 'default',
    whatsappNumber: '+57 300 KHESED (543733)',
    whatsappUrl: 'https://wa.me/573003435733',
    email: 'soporte@khesedtek.com',
    schedule: 'Lun-Vie 8AM-8PM (Colombia)',
    companyName: 'Khesed-tek Systems',
    location: 'Bogotá, Colombia',
    website: 'https://khesedtek.com'
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch contact info on component mount
  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    setLoading(true)
    try {
      // Add cache-busting query parameter to prevent stale data
      const response = await fetch(`/api/support-contact?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
      } else {
        toast({
          title: "Error",
          description: "Error al cargar información de contacto",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching contact info:', error)
      toast({
        title: "Error",
        description: "Error al conectar con el servidor",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // WORKAROUND: Detect if running on localhost and force local API calls
      const isLocalDev = typeof window !== 'undefined' && 
                        (window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1')
      
      const apiUrl = isLocalDev 
        ? `${window.location.protocol}//${window.location.host}/api/support-contact`
        : '/api/support-contact'
      
      console.log('🔍 API URL Override:', { isLocalDev, apiUrl, hostname: window.location.hostname })

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo)
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || `HTTP ${response.status}: Error al actualizar`)
      }

      const result = await response.json()
      
      // SUCCESS: Show notification and update UI
      toast({
        title: "✅ Cambios Guardados",
        description: "La información de contacto se actualizó exitosamente",
        duration: 5000
      })
      
      // Force refresh for ContactInfoCard components across all tabs
      localStorage.setItem('contact-info-updated', Date.now().toString())
      window.dispatchEvent(new CustomEvent('contactInfoUpdated'))
      
      // Clear all caches and re-fetch to ensure UI sync
      if ('caches' in window) {
        caches.delete('next-data')
      }
      
      // Re-fetch with cache busting
      await fetchContactInfo()
      
      console.log('✅ Support contact info updated successfully:', result.data)
    } catch (error: any) {
      console.error('Error saving contact info:', error)
      
      // Enhanced error handling for different failure types
      let errorTitle = "Error"
      let errorDescription = "Error al conectar con el servidor"
      
      if (error.message) {
        if (error.message.includes('NO_SESSION')) {
          errorTitle = "Sesión Expirada"
          errorDescription = "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        } else if (error.message.includes('INSUFFICIENT_ROLE')) {
          errorTitle = "Permisos Insuficientes"  
          errorDescription = "No tienes permisos de SUPER_ADMIN. Contacta al administrador del sistema."
        } else if (error.message.includes('NO_USER_DATA')) {
          errorTitle = "Error de Autenticación"
          errorDescription = "Datos de usuario no válidos. Intenta cerrar sesión y volver a entrar."
        } else {
          errorDescription = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
        duration: 10000 // Extended duration for critical errors
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Auto-generate WhatsApp URL when number changes
  const handleWhatsAppNumberChange = (value: string) => {
    const cleanNumber = value.replace(/[^\d]/g, '') // Remove non-digits
    const whatsappUrl = cleanNumber.length > 0 ? `https://wa.me/${cleanNumber}` : ''
    
    setContactInfo(prev => ({
      ...prev,
      whatsappNumber: value,
      whatsappUrl: whatsappUrl
    }))
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Cargando configuración...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/platform/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">⚙️ Configuración de Soporte</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <Shield className="h-4 w-4" />
            <span>Validado como SUPER_ADMIN</span>
          </div>
          <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
            Usuario: {user.email} | ID: {user.id}
          </div>
        </div>
        <p className="text-muted-foreground">
          Edite la información de contacto que aparece en el centro de ayuda y sitio web
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Contacto Directo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                Contacto Directo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={contactInfo.whatsappNumber}
                  onChange={(e) => handleWhatsAppNumberChange(e.target.value)}
                  placeholder="+57 300 KHESED (543733)"
                />
                <p className="text-xs text-muted-foreground">
                  URL generada: {contactInfo.whatsappUrl}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="soporte@khesedtek.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horario
                </Label>
                <Input
                  id="schedule"
                  value={contactInfo.schedule}
                  onChange={(e) => handleInputChange('schedule', e.target.value)}
                  placeholder="Lun-Vie 8AM-8PM (Colombia)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información Empresarial */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Información Empresarial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </Label>
                <Input
                  id="company"
                  value={contactInfo.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Khesed-tek Systems"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </Label>
                <Input
                  id="location"
                  value={contactInfo.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Bogotá, Colombia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sitio Web Corporativo
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={contactInfo.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://khesedtek.com"
                />
                <p className="text-xs text-muted-foreground">
                  Este será el sitio web predeterminado mostrado en la información de contacto
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Card */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>👀 Vista Previa</CardTitle>
              <p className="text-sm text-muted-foreground">
                Así verán los usuarios esta información en el centro de ayuda:
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                      📞 Contacto Directo
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>WhatsApp:</strong> {contactInfo.whatsappNumber}</p>
                      <p><strong>Email:</strong> {contactInfo.email}</p>
                      <p><strong>Horario:</strong> {contactInfo.schedule}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                      🏢 Información Empresarial
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Empresa:</strong> {contactInfo.companyName}</p>
                      <p><strong>Ubicación:</strong> {contactInfo.location}</p>
                      <p><strong>Web:</strong> {contactInfo.website}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="min-w-[150px]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Cambios
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
