'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Shield,
  Smartphone,
  Mail,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  QrCode,
  Copy,
  Key
} from 'lucide-react'
import { cn } from '@/lib/utils'
import QRCode from 'qrcode'

interface TwoFactorAuthProps {
  userId: string
  isEnabled?: boolean
  onStatusChange?: (enabled: boolean) => void
}

interface BackupCode {
  code: string
  used: boolean
}

export function TwoFactorAuth({ userId, isEnabled = false, onStatusChange }: TwoFactorAuthProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(isEnabled)
  const [setupMode, setSetupMode] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [verificationMethod, setVerificationMethod] = useState<'app' | 'sms' | 'email'>('app')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (setupSecret) {
      generateQRCode()
    }
  }, [setupSecret])

  const generateQRCode = async () => {
    try {
      const otpauthUrl = `otpauth://totp/Khesed-Tek:${userId}?secret=${setupSecret}&issuer=Khesed-Tek Church Management`
      const qrCode = await QRCode.toDataURL(otpauthUrl)
      setQrCodeUrl(qrCode)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const startSetup = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        setSetupSecret(data.secret)
        setSetupMode(true)
      } else {
        setError('Error al configurar 2FA')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const verifySetup = async () => {
    if (verificationCode.length !== 6) {
      setError('Código de verificación debe tener 6 dígitos')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          secret: setupSecret,
          code: verificationCode,
          method: verificationMethod,
          phoneNumber: verificationMethod === 'sms' ? phoneNumber : undefined,
          email: verificationMethod === 'email' ? email : undefined
        })
      })

      if (response.ok) {
        const data = await response.json()
        setIs2FAEnabled(true)
        setBackupCodes(data.backupCodes)
        setSetupMode(false)
        setSuccess('2FA activado exitosamente')
        onStatusChange?.(true)
      } else {
        const data = await response.json()
        setError(data.message || 'Código de verificación inválido')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const disable2FA = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: verificationCode })
      })

      if (response.ok) {
        setIs2FAEnabled(false)
        setSetupMode(false)
        setVerificationCode('')
        setSuccess('2FA desactivado exitosamente')
        onStatusChange?.(false)
      } else {
        const data = await response.json()
        setError(data.message || 'Código de verificación inválido')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const generateNewBackupCodes = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        const data = await response.json()
        setBackupCodes(data.backupCodes)
        setSuccess('Nuevos códigos de respaldo generados')
      }
    } catch (error) {
      setError('Error al generar códigos de respaldo')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copiado al portapapeles')
  }

  const handleVerificationInput = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const digits = value.slice(0, 6).split('')
      const newCode = digits.join('')
      setVerificationCode(newCode)
      
      // Focus last input
      inputRefs.current[Math.min(5, digits.length - 1)]?.focus()
      return
    }

    // Single digit input
    const digits = verificationCode.split('')
    digits[index] = value
    const newCode = digits.join('')
    setVerificationCode(newCode)

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  if (setupMode) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurar Autenticación en Dos Pasos
          </CardTitle>
          <CardDescription>
            Agrega una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Method Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Método de verificación</label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={verificationMethod === 'app' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setVerificationMethod('app')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                App Autenticador (Recomendado)
              </Button>
              <Button
                variant={verificationMethod === 'sms' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setVerificationMethod('sms')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                SMS
              </Button>
              <Button
                variant={verificationMethod === 'email' ? 'default' : 'outline'}
                className="justify-start"
                onClick={() => setVerificationMethod('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Phone Number Input for SMS */}
          {verificationMethod === 'sms' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Número de teléfono</label>
              <Input
                type="tel"
                placeholder="+57 300 123 4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          {/* Email Input for Email verification */}
          {verificationMethod === 'email' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* QR Code for App */}
          {verificationMethod === 'app' && qrCodeUrl && (
            <div className="space-y-3">
              <div className="text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  Escanea este código con tu app autenticadora
                </p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="text-xs font-mono text-center break-all">
                  {setupSecret}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => copyToClipboard(setupSecret)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar clave manual
                </Button>
              </div>
            </div>
          )}

          {/* Verification Code Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium">
              Código de verificación (6 dígitos)
            </label>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-mono"
                  value={verificationCode[index] || ''}
                  onChange={(e) => handleVerificationInput(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSetupMode(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={verifySetup}
              disabled={loading || verificationCode.length !== 6}
              className="flex-1"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Activar 2FA'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Autenticación en Dos Pasos
          <Badge variant={is2FAEnabled ? 'success' : 'secondary'}>
            {is2FAEnabled ? 'Activado' : 'Desactivado'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {is2FAEnabled 
            ? 'Tu cuenta está protegida con 2FA'
            : 'Agrega una capa extra de seguridad a tu cuenta'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!is2FAEnabled ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              La autenticación en dos pasos añade una capa extra de seguridad 
              requiriendo un código adicional al iniciar sesión.
            </div>
            <Button onClick={startSetup} disabled={loading} className="w-full">
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Activar 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Tu cuenta está protegida. Ingresa tu código de verificación para desactivar 2FA.
            </div>
            
            {/* Backup Codes Management */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Gestionar códigos de respaldo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Códigos de respaldo</DialogTitle>
                  <DialogDescription>
                    Usa estos códigos para acceder si pierdes tu dispositivo de 2FA
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((backup, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-2 rounded font-mono text-sm border",
                          backup.used ? "bg-muted text-muted-foreground line-through" : "bg-background"
                        )}
                      >
                        {backup.code}
                      </div>
                    ))}
                  </div>
                  <Button onClick={generateNewBackupCodes} disabled={loading}>
                    Generar nuevos códigos
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Verification for disabling */}
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Código de verificación para desactivar
              </label>
              <div className="flex gap-2 justify-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-mono"
                    value={verificationCode[index] || ''}
                    onChange={(e) => handleVerificationInput(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={disable2FA}
              disabled={loading || verificationCode.length !== 6}
              variant="destructive"
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Desactivar 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}