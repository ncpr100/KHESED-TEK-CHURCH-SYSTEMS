
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, Mail, Building, MapPin, Globe, Clock, RefreshCw } from 'lucide-react'

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

export default function ContactInfoCard() {
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchContactInfo()
    
    // Listen for contact info updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'contact-info-updated') {
        fetchContactInfo()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom events for same-tab updates
    const handleContactUpdate = () => {
      fetchContactInfo()
    }
    
    window.addEventListener('contactInfoUpdated', handleContactUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('contactInfoUpdated', handleContactUpdate)
    }
  }, [])

  const fetchContactInfo = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true)
    
    try {
      // Add cache-busting query parameter to prevent stale data
      const response = await fetch(`/api/support-contact?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setContactInfo(data)
        console.log('✅ ContactInfoCard: Fetched latest data:', data)
      } else {
        console.error('ContactInfoCard: Failed to fetch contact info:', response.status)
      }
    } catch (error) {
      console.error('ContactInfoCard: Error fetching contact info:', error)
      // Use default values if fetch fails
    } finally {
      if (showRefreshIndicator) setIsRefreshing(false)
    }
  }

  const handleManualRefresh = () => {
    fetchContactInfo(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Información de Contacto</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contacto Directo */}
          <div>
            <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacto Directo
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">WhatsApp:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => window.open(contactInfo.whatsappUrl, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {contactInfo.whatsappNumber}
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium">Email:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => window.location.href = `mailto:${contactInfo.email}`}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {contactInfo.email}
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium">Horario:</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {contactInfo.schedule}
                </p>
              </div>
            </div>
          </div>

          {/* Información Empresarial */}
          <div>
            <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Información Empresarial
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Empresa:</p>
                <p className="text-sm text-muted-foreground">{contactInfo.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Ubicación:</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {contactInfo.location}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Web:</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => window.open(contactInfo.website, '_blank')}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {contactInfo.website}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
