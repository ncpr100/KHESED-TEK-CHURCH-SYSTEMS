
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Mail,
  MessageSquare,
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Zap,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

interface IntegrationsClientProps {
  userRole: string
}

interface IntegrationStatus {
  communication: {
    email: { enabled: boolean; provider: string; configured: boolean }
    sms: { enabled: boolean; provider: string; configured: boolean }
    whatsapp: { enabled: boolean; provider: string; configured: boolean }
  }
  services: {
    mailgun: { enabled: boolean; configured: boolean }
    twilio: { enabled: boolean; configured: boolean }
    whatsapp: { enabled: boolean; configured: boolean }
  }
  environment: {
    mailgun_configured: boolean
    twilio_configured: boolean
    whatsapp_configured: boolean
    providers_enabled: {
      mailgun: boolean
      twilio: boolean
      whatsapp: boolean
    }
  }
}

export function IntegrationsClient({ userRole }: IntegrationsClientProps) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [testLoading, setTestLoading] = useState('')
  const [testResults, setTestResults] = useState<any>(null)
  
  // Test form state
  const [testService, setTestService] = useState('email')
  const [testRecipient, setTestRecipient] = useState('')
  const [testMessage, setTestMessage] = useState('Mensaje de prueba desde Kḥesed-tek')
  const [testSubject, setTestSubject] = useState('Prueba de Integración')

  // Bulk send state
  const [bulkService, setBulkService] = useState('email')
  const [bulkRecipients, setBulkRecipients] = useState('')
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkSubject, setBulkSubject] = useState('')
  const [bulkResults, setBulkResults] = useState<any>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/integrations/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      } else {
        console.error('Failed to fetch status:', response.status, response.statusText)
        // Set default status when API fails
        setStatus({
          communication: {
            email: { enabled: false, provider: 'internal', configured: false },
            sms: { enabled: false, provider: 'none', configured: false },
            whatsapp: { enabled: false, provider: 'none', configured: false }
          },
          services: {
            mailgun: { enabled: false, configured: false },
            twilio: { enabled: false, configured: false },
            whatsapp: { enabled: false, configured: false }
          },
          environment: {
            mailgun_configured: false,
            twilio_configured: false,
            whatsapp_configured: false,
            providers_enabled: {
              mailgun: false,
              twilio: false,
              whatsapp: false
            }
          }
        })
      }
    } catch (error) {
      console.error('Error fetching status:', error)
      // Set default status on network error
      setStatus({
        communication: {
          email: { enabled: false, provider: 'internal', configured: false },
          sms: { enabled: false, provider: 'none', configured: false },
          whatsapp: { enabled: false, provider: 'none', configured: false }
        },
        services: {
          mailgun: { enabled: false, configured: false },
          twilio: { enabled: false, configured: false },
          whatsapp: { enabled: false, configured: false }
        },
        environment: {
          mailgun_configured: false,
          twilio_configured: false,
          whatsapp_configured: false,
          providers_enabled: {
            mailgun: false,
            twilio: false,
            whatsapp: false
          }
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const testIntegration = async () => {
    if (!testRecipient || !testMessage) return
    
    setTestLoading(testService)
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: testService,
          recipient: testRecipient,
          message: testMessage,
          subject: testSubject
        })
      })

      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      console.error('Error testing integration:', error)
      setTestResults({ success: false, error: 'Error de conexión' })
    } finally {
      setTestLoading('')
    }
  }

  const sendBulkMessage = async () => {
    if (!bulkMessage || !bulkRecipients) return

    setTestLoading('bulk')
    try {
      const recipients = bulkRecipients.split('\n').filter(r => r.trim())
      
      const response = await fetch('/api/integrations/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service: bulkService,
          recipients,
          message: bulkMessage,
          subject: bulkSubject
        })
      })

      const result = await response.json()
      setBulkResults(result)
    } catch (error) {
      console.error('Error sending bulk:', error)
      setBulkResults({ success: false, error: 'Error de conexión' })
    } finally {
      setTestLoading('')
    }
  }

  const StatusBadge = ({ enabled, configured }: { enabled: boolean; configured: boolean }) => {
    if (enabled && configured) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>
    }
    if (configured) {
      return <Badge variant="secondary"><AlertTriangle className="w-3 h-3 mr-1" />Configurado</Badge>
    }
    return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />No configurado</Badge>
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando integraciones...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integraciones de Comunicación</h1>
          <p className="text-muted-foreground">
            Configura y administra las integraciones con servicios externos
          </p>
        </div>
        <Button onClick={fetchStatus} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{status?.communication.email.provider}</p>
              </div>
              <StatusBadge 
                enabled={status?.communication.email.enabled || false}
                configured={status?.communication.email.configured || false}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Phone className="h-8 w-8 text-green-500" />
              <div className="flex-1">
                <p className="font-medium">SMS</p>
                <p className="text-sm text-muted-foreground">{status?.communication.sms.provider}</p>
              </div>
              <StatusBadge 
                enabled={status?.communication.sms.enabled || false}
                configured={status?.communication.sms.configured || false}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">{status?.communication.whatsapp.provider}</p>
              </div>
              <StatusBadge 
                enabled={status?.communication.whatsapp.enabled || false}
                configured={status?.communication.whatsapp.configured || false}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList>
          <TabsTrigger value="test">Probar Servicios</TabsTrigger>
          <TabsTrigger value="bulk">Envío Masivo</TabsTrigger>
          <TabsTrigger value="config">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Probar Integraciones
              </CardTitle>
              <CardDescription>
                Envía mensajes de prueba para verificar que las integraciones funcionan correctamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testService">Servicio</Label>
                  <Select value={testService} onValueChange={setTestService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testRecipient">Destinatario</Label>
                  <Input
                    id="testRecipient"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder={testService === 'email' ? 'email@ejemplo.com' : '+57300123456'}
                  />
                </div>
              </div>

              {testService === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="testSubject">Asunto</Label>
                  <Input
                    id="testSubject"
                    value={testSubject}
                    onChange={(e) => setTestSubject(e.target.value)}
                    placeholder="Asunto del mensaje"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="testMessage">Mensaje</Label>
                <Textarea
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Escribe tu mensaje de prueba aquí..."
                />
              </div>

              <Button 
                onClick={testIntegration}
                disabled={testLoading === testService}
                className="w-full"
              >
                {testLoading === testService ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar Prueba
              </Button>

              {testResults && (
                <Alert className={testResults.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  <AlertDescription>
                    {testResults.success ? (
                      <div className="text-green-700">
                        ✅ Mensaje enviado exitosamente via {testResults.provider}
                        {testResults.messageId && <div className="text-sm mt-1">ID: {testResults.messageId}</div>}
                      </div>
                    ) : (
                      <div className="text-red-700">
                        ❌ Error: {testResults.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Envío Masivo
              </CardTitle>
              <CardDescription>
                Envía mensajes a múltiples destinatarios de una vez
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bulkService">Servicio</Label>
                  <Select value={bulkService} onValueChange={setBulkService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bulkService === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="bulkSubject">Asunto</Label>
                  <Input
                    id="bulkSubject"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    placeholder="Asunto del mensaje"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bulkRecipients">Destinatarios (uno por línea)</Label>
                <Textarea
                  id="bulkRecipients"
                  value={bulkRecipients}
                  onChange={(e) => setBulkRecipients(e.target.value)}
                  placeholder={bulkService === 'email' 
                    ? 'email1@ejemplo.com\nemail2@ejemplo.com'
                    : '+57300123456\n+57301234567'
                  }
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulkMessage">Mensaje</Label>
                <Textarea
                  id="bulkMessage"
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <Button 
                onClick={sendBulkMessage}
                disabled={testLoading === 'bulk'}
                className="w-full"
              >
                {testLoading === 'bulk' ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar a Todos
              </Button>

              {bulkResults && (
                <Alert className={bulkResults.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
                  <AlertDescription>
                    {bulkResults.success ? (
                      <div className="text-green-700">
                        ✅ Envío completado: {bulkResults.successful}/{bulkResults.total} mensajes enviados
                      </div>
                    ) : (
                      <div className="text-red-700">
                        ❌ Error en envío masivo: {bulkResults.error}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Variables de Entorno Requeridas
              </CardTitle>
              <CardDescription>
                Configura estas variables en tu archivo .env para habilitar las integraciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mailgun Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Mailgun Email Service
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  MAILGUN_API_KEY="key-xxxxx"<br/>
                  MAILGUN_DOMAIN="mg.tudominio.com"<br/>
                  MAILGUN_FROM_EMAIL="noreply@tudominio.com"<br/>
                  ENABLE_MAILGUN="true"
                </div>
              </div>

              <Separator />

              {/* Twilio Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Twilio SMS/WhatsApp
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  TWILIO_ACCOUNT_SID="ACxxxxx"<br/>
                  TWILIO_AUTH_TOKEN="xxxxx"<br/>
                  TWILIO_PHONE_NUMBER="+1234567890"<br/>
                  ENABLE_TWILIO_SMS="true"
                </div>
              </div>

              <Separator />

              {/* WhatsApp Business Config */}
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp Business API
                </h3>
                <div className="bg-slate-100 p-3 rounded text-sm font-mono text-slate-700">
                  WHATSAPP_BUSINESS_ACCOUNT_ID="xxxxx"<br/>
                  WHATSAPP_ACCESS_TOKEN="xxxxx"<br/>
                  WHATSAPP_PHONE_NUMBER_ID="xxxxx"<br/>
                  WHATSAPP_WEBHOOK_VERIFY_TOKEN="xxxxx"<br/>
                  ENABLE_WHATSAPP="true"
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
