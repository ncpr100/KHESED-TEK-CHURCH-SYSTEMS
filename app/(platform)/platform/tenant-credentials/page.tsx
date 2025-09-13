

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import {
  Key,
  Plus,
  Send,
  Eye,
  RefreshCw,
  Mail,
  Building2,
  Calendar,
  Shield,
  Copy,
  CheckCircle
} from 'lucide-react'

interface TenantCredentials {
  id: string
  churchId: string
  loginEmail: string
  isFirstLogin: boolean
  sentAt?: string
  lastSentAt?: string
  createdAt: string
  church: {
    id: string
    name: string
    email: string
    isActive: boolean
  }
  creator: {
    id: string
    name: string
  }
}

interface Church {
  id: string
  name: string
  email: string
}

export default function TenantCredentialsPage() {
  const { data: session } = useSession()
  const [credentials, setCredentials] = useState<TenantCredentials[]>([])
  const [churches, setChurches] = useState<Church[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [generatedPassword, setGeneratedPassword] = useState('')

  const [newCredentials, setNewCredentials] = useState({
    churchId: '',
    loginEmail: '',
    tempPassword: '',
    sendEmail: true
  })

  useEffect(() => {
    if (session?.user?.role === 'SUPER_ADMIN') {
      fetchCredentials()
      fetchChurches()
    }
  }, [session])

  const fetchCredentials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/platform/tenant-credentials')
      if (response.ok) {
        const data = await response.json()
        setCredentials(data)
      } else {
        toast.error('Error al cargar credenciales')
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
      toast.error('Error de conexión')
    }
    setLoading(false)
  }

  const fetchChurches = async () => {
    try {
      const response = await fetch('/api/platform/churches')
      if (response.ok) {
        const data = await response.json()
        setChurches(data.churches || [])
      }
    } catch (error) {
      console.error('Error fetching churches:', error)
    }
  }

  const createCredentials = async () => {
    try {
      const response = await fetch('/api/platform/tenant-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCredentials)
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Credenciales generadas exitosamente')
        setGeneratedPassword(data.credentials.tempPassword)
        setCreateDialogOpen(false)
        fetchCredentials()
        setNewCredentials({
          churchId: '',
          loginEmail: '',
          tempPassword: '',
          sendEmail: true
        })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al generar credenciales')
      }
    } catch (error) {
      console.error('Error creating credentials:', error)
      toast.error('Error de conexión')
    }
  }

  const resendCredentials = async (churchId: string) => {
    try {
      const response = await fetch(`/api/platform/tenant-credentials/${churchId}/resend`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Credenciales reenviadas exitosamente')
        setGeneratedPassword(data.newPassword)
        fetchCredentials()
      } else {
        toast.error('Error al reenviar credenciales')
      }
    } catch (error) {
      console.error('Error resending credentials:', error)
      toast.error('Error de conexión')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setNewCredentials(prev => ({ ...prev, tempPassword: password }))
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
            <p className="text-muted-foreground">
              Solo usuarios SUPER_ADMIN pueden acceder a la gestión de credenciales.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Credenciales de Tenants</h1>
          <p className="text-muted-foreground">Gestión de acceso para iglesias registradas</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generar Credenciales
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generar Credenciales de Acceso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Iglesia</Label>
                  <select
                    value={newCredentials.churchId}
                    onChange={(e) => {
                      const selectedChurch = churches.find(c => c.id === e.target.value)
                      setNewCredentials(prev => ({ 
                        ...prev, 
                        churchId: e.target.value,
                        loginEmail: selectedChurch?.email || ''
                      }))
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar iglesia</option>
                    {churches.map((church) => (
                      <option key={church.id} value={church.id}>
                        {church.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Email de Acceso</Label>
                  <Input
                    type="email"
                    value={newCredentials.loginEmail}
                    onChange={(e) => setNewCredentials(prev => ({ ...prev, loginEmail: e.target.value }))}
                    placeholder="admin@iglesia.com"
                  />
                </div>

                <div>
                  <Label>Contraseña Temporal</Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={newCredentials.tempPassword}
                      onChange={(e) => setNewCredentials(prev => ({ ...prev, tempPassword: e.target.value }))}
                      placeholder="Contraseña generada automáticamente"
                    />
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={newCredentials.sendEmail}
                    onChange={(e) => setNewCredentials(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  />
                  <Label htmlFor="sendEmail">Enviar credenciales por email</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createCredentials} 
                    disabled={!newCredentials.churchId || !newCredentials.loginEmail}
                  >
                    Generar Credenciales
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchCredentials}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Generated Password Display */}
      {generatedPassword && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-green-800">Contraseña Generada</h3>
                <p className="text-sm text-green-600">Guarda esta contraseña - no se mostrará nuevamente</p>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-1 rounded border">{generatedPassword}</code>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(generatedPassword, 'Contraseña')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credentials List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credenciales Generadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Cargando credenciales...</p>
            </div>
          ) : credentials.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay credenciales generadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <div key={cred.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{cred.church.name}</h3>
                        <Badge className={cred.church.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                          {cred.church.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                        {cred.isFirstLogin && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Primer Acceso Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Email:</strong> {cred.loginEmail}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Creada: {new Date(cred.createdAt).toLocaleDateString()}
                        </span>
                        {cred.lastSentAt && (
                          <span className="flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            Último envío: {new Date(cred.lastSentAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Creado por: {cred.creator.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resendCredentials(cred.churchId)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Reenviar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(cred.loginEmail, 'Email')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar Email
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

