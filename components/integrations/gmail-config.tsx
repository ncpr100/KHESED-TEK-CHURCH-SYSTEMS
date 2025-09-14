'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface GmailConfigProps {
  userRole: string
}

interface GmailStatus {
  enabled: boolean
  configured: boolean
  config: {
    fromEmail: string
    clientId: string
  }
}

export function GmailConfig({ userRole }: GmailConfigProps) {
  const [status, setStatus] = useState<GmailStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [testSubject, setTestSubject] = useState('')
  const [testing, setTesting] = useState(false)
  const [authUrl, setAuthUrl] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [exchangingCode, setExchangingCode] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchGmailStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/integrations/gmail')
      const data = await response.json()

      if (response.ok) {
        setStatus(data.status)
      } else {
        toast.error(data.error || 'Error al obtener estado de Gmail')
      }
    } catch (error) {
      console.error('Error fetching Gmail status:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const getAuthUrl = async () => {
    try {
      const response = await fetch('/api/integrations/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAuthUrl' })
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setAuthUrl(data.authUrl)
        toast.success('URL de autorización generada')
      } else {
        toast.error(data.error || 'Error al generar URL')
      }
    } catch (error) {
      console.error('Error getting auth URL:', error)
      toast.error('Error de conexión')
    }
  }

  const exchangeAuthCode = async () => {
    if (!authCode.trim()) {
      toast.error('Por favor ingrese el código de autorización')
      return
    }

    try {
      setExchangingCode(true)
      const response = await fetch('/api/integrations/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'exchangeCode', authCode })
      })
      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Tokens obtenidos exitosamente')
        setAuthCode('')
        fetchGmailStatus()
      } else {
        toast.error(data.error || 'Error al intercambiar código')
      }
    } catch (error) {
      console.error('Error exchanging code:', error)
      toast.error('Error de conexión')
    } finally {
      setExchangingCode(false)
    }
  }

  const refreshToken = async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/integrations/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh' })
      })
      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Token renovado exitosamente')
        fetchGmailStatus()
      } else {
        toast.error(data.error || 'Error al renovar token')
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      toast.error('Error de conexión')
    } finally {
      setRefreshing(false)
    }
  }

  const testGmail = async () => {
    if (!testEmail.trim()) {
      toast.error('Por favor ingrese un email de prueba')
      return
    }

    try {
      setTesting(true)
      const response = await fetch('/api/integrations/gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          testEmail,
          subject: testSubject || 'Prueba Gmail API - Khesed-tek',
          message: testMessage
        })
      })
      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Email de prueba enviado exitosamente')
        setTestEmail('')
        setTestMessage('')
        setTestSubject('')
      } else {
        toast.error(data.message || 'Error al enviar email de prueba')
      }
    } catch (error) {
      console.error('Error testing Gmail:', error)
      toast.error('Error de conexión')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    if (userRole === 'SUPER_ADMIN') {
      fetchGmailStatus()
    }
  }, [userRole])

  if (userRole !== 'SUPER_ADMIN') {
    return (
      <Alert>
        <AlertDescription>
          Solo SUPER_ADMIN puede configurar Gmail API
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando configuración de Gmail...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Estado de Gmail API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Configurado:</span>
              {status?.configured ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Sí
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  No
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Habilitado:</span>
              {status?.enabled ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactivo
                </Badge>
              )}
            </div>

            {status?.config?.fromEmail && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium">Email configurado:</span>
                <p className="text-sm text-muted-foreground">{status.config.fromEmail}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={fetchGmailStatus} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar Estado
            </Button>

            {status?.configured && (
              <Button onClick={refreshToken} variant="outline" size="sm" disabled={refreshing}>
                {refreshing ? 'Renovando...' : 'Renovar Token'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* OAuth Setup */}
      {!status?.configured && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración OAuth2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Para configurar Gmail API, necesita obtener credenciales OAuth2 desde Google Cloud Console.
              </AlertDescription>
            </Alert>

            {!authUrl ? (
              <Button onClick={getAuthUrl} className="w-full">
                Generar URL de Autorización
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">URL de Autorización:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={authUrl} readOnly className="text-xs" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(authUrl)
                        toast.success('URL copiada')
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => window.open(authUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Código de Autorización:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="Pegue el código obtenido de Google..."
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value)}
                    />
                    <Button onClick={exchangeAuthCode} disabled={exchangingCode}>
                      {exchangingCode ? 'Intercambiando...' : 'Intercambiar'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Email */}
      {status?.configured && (
        <Card>
          <CardHeader>
            <CardTitle>Probar Envío de Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email de destino:</label>
              <Input
                placeholder="test@ejemplo.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                disabled={testing}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Asunto (opcional):</label>
              <Input
                placeholder="Asunto del email de prueba"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                disabled={testing}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mensaje personalizado (opcional):</label>
              <Textarea
                placeholder="Mensaje personalizado para la prueba..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                disabled={testing}
              />
            </div>

            <Button onClick={testGmail} disabled={testing || !testEmail.trim()}>
              {testing ? 'Enviando...' : 'Enviar Email de Prueba'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}