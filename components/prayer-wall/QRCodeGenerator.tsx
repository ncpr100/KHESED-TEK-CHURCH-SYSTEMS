
'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Download, Eye, Settings, Palette, QrCode } from 'lucide-react'
import QRCodeReact from 'react-qr-code'
import * as QRCodeLib from 'qrcode'
import toast from 'react-hot-toast'

interface QRCodeDesign {
  size: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  backgroundColor: string
  foregroundColor: string
  logo?: string
  logoSize: number
  margin: number
}

interface PrayerForm {
  id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
}

interface QRCodeData {
  id?: string
  name: string
  description?: string
  formId: string
  code?: string
  design: QRCodeDesign
  isActive: boolean
  scanCount?: number
  lastScan?: string
}

interface QRCodeGeneratorProps {
  qrCode?: QRCodeData
  forms: PrayerForm[]
  onSave: (qrCodeData: QRCodeData) => Promise<void>
  onCancel: () => void
}

const DEFAULT_DESIGN: QRCodeDesign = {
  size: 256,
  errorCorrectionLevel: 'M',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  logoSize: 0.2,
  margin: 4
}

export function QRCodeGenerator({ qrCode, forms, onSave, onCancel }: QRCodeGeneratorProps) {
  const [qrCodeData, setQRCodeData] = useState<QRCodeData>({
    name: qrCode?.name || '',
    description: qrCode?.description || '',
    formId: qrCode?.formId || '',
    code: qrCode?.code || '',
    design: qrCode?.design || DEFAULT_DESIGN,
    isActive: qrCode?.isActive ?? true
  })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [qrCodeUrl, setQRCodeUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selectedForm = forms.find(f => f.id === qrCodeData.formId)

  useEffect(() => {
    if (qrCodeData.code) {
      // In production, this would be your domain
      const baseUrl = window.location.origin
      setQRCodeUrl(`${baseUrl}/prayer/${qrCodeData.code}`)
    }
  }, [qrCodeData.code])

  const generateQRCode = async () => {
    if (!qrCodeUrl) return

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      await QRCodeLib.toCanvas(canvas, qrCodeUrl, {
        errorCorrectionLevel: qrCodeData.design.errorCorrectionLevel,
        width: qrCodeData.design.size,
        margin: qrCodeData.design.margin,
        color: {
          dark: qrCodeData.design.foregroundColor,
          light: qrCodeData.design.backgroundColor
        }
      })

      // Add logo if provided
      if (qrCodeData.design.logo) {
        const ctx = canvas.getContext('2d')
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const logoSize = qrCodeData.design.size * qrCodeData.design.logoSize
          const x = (qrCodeData.design.size - logoSize) / 2
          const y = (qrCodeData.design.size - logoSize) / 2
          
          // Add white background for logo
          ctx!.fillStyle = '#ffffff'
          ctx!.fillRect(x - 10, y - 10, logoSize + 20, logoSize + 20)
          
          ctx!.drawImage(img, x, y, logoSize, logoSize)
        }
        img.src = qrCodeData.design.logo
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('Error al generar el código QR')
    }
  }

  useEffect(() => {
    if (qrCodeUrl && canvasRef.current) {
      generateQRCode()
    }
  }, [qrCodeUrl, qrCodeData.design])

  const downloadQRCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${qrCodeData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handleSave = async () => {
    if (!qrCodeData.name.trim()) {
      toast.error('El nombre del código QR es requerido')
      return
    }

    if (!qrCodeData.formId) {
      toast.error('Debe seleccionar un formulario')
      return
    }

    setIsSaving(true)
    try {
      await onSave(qrCodeData)
      toast.success('Código QR guardado correctamente')
    } catch (error) {
      toast.error('Error al guardar el código QR')
    } finally {
      setIsSaving(false)
    }
  }

  const QRCodePreview = () => (
    <div className="flex flex-col items-center space-y-4">
      <div 
        className="p-4 rounded-lg shadow-lg"
        style={{ backgroundColor: qrCodeData.design.backgroundColor }}
      >
        <QRCodeReact
          value={qrCodeUrl || 'https://ejemplo.com'}
          size={qrCodeData.design.size}
          bgColor={qrCodeData.design.backgroundColor}
          fgColor={qrCodeData.design.foregroundColor}
          level={qrCodeData.design.errorCorrectionLevel}
        />
      </div>
      
      {qrCode && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Escaneado {qrCodeData.scanCount || 0} veces
          </p>
          {qrCodeData.lastScan && (
            <p className="text-xs text-gray-500">
              Último escaneo: {new Date(qrCodeData.lastScan).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Configuración del Código QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="qrName">Nombre del código QR</Label>
              <Input
                id="qrName"
                value={qrCodeData.name}
                onChange={(e) => setQRCodeData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: QR Servicio Dominical - Peticiones"
              />
            </div>

            <div>
              <Label htmlFor="qrDescription">Descripción</Label>
              <Textarea
                id="qrDescription"
                value={qrCodeData.description || ''}
                onChange={(e) => setQRCodeData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional del código QR"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="formSelect">Formulario asociado</Label>
              <Select
                value={qrCodeData.formId}
                onValueChange={(value) => setQRCodeData(prev => ({ ...prev, formId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un formulario" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      <div>
                        <div className="font-medium">{form.name}</div>
                        {form.description && (
                          <div className="text-sm text-gray-500">{form.description}</div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedForm && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Formulario seleccionado:</p>
                <p className="text-sm text-blue-700">{selectedForm.name}</p>
                <p className="text-xs text-blue-600 mt-1">
                  URL: /prayer-form/{selectedForm.slug}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Design Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Diseño del QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tamaño</Label>
                <Select
                  value={qrCodeData.design.size.toString()}
                  onValueChange={(value) => setQRCodeData(prev => ({
                    ...prev,
                    design: { ...prev.design, size: parseInt(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128px</SelectItem>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nivel de corrección</Label>
                <Select
                  value={qrCodeData.design.errorCorrectionLevel}
                  onValueChange={(value: 'L' | 'M' | 'Q' | 'H') => setQRCodeData(prev => ({
                    ...prev,
                    design: { ...prev.design, errorCorrectionLevel: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Bajo (L)</SelectItem>
                    <SelectItem value="M">Medio (M)</SelectItem>
                    <SelectItem value="Q">Alto (Q)</SelectItem>
                    <SelectItem value="H">Muy alto (H)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Color de fondo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={qrCodeData.design.backgroundColor}
                    onChange={(e) => setQRCodeData(prev => ({
                      ...prev,
                      design: { ...prev.design, backgroundColor: e.target.value }
                    }))}
                    className="w-12 h-8"
                  />
                  <Input
                    value={qrCodeData.design.backgroundColor}
                    onChange={(e) => setQRCodeData(prev => ({
                      ...prev,
                      design: { ...prev.design, backgroundColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label>Color del código</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={qrCodeData.design.foregroundColor}
                    onChange={(e) => setQRCodeData(prev => ({
                      ...prev,
                      design: { ...prev.design, foregroundColor: e.target.value }
                    }))}
                    className="w-12 h-8"
                  />
                  <Input
                    value={qrCodeData.design.foregroundColor}
                    onChange={(e) => setQRCodeData(prev => ({
                      ...prev,
                      design: { ...prev.design, foregroundColor: e.target.value }
                    }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Logo (URL)</Label>
              <Input
                value={qrCodeData.design.logo || ''}
                onChange={(e) => setQRCodeData(prev => ({
                  ...prev,
                  design: { ...prev.design, logo: e.target.value }
                }))}
                placeholder="https://i.pinimg.com/originals/0e/14/4c/0e144ca05ee70479dcd63915d1fb3ad0.jpg"
              />
            </div>

            {qrCodeData.design.logo && (
              <div>
                <Label>Tamaño del logo ({Math.round(qrCodeData.design.logoSize * 100)}%)</Label>
                <input
                  type="range"
                  min="0.1"
                  max="0.4"
                  step="0.05"
                  value={qrCodeData.design.logoSize}
                  onChange={(e) => setQRCodeData(prev => ({
                    ...prev,
                    design: { ...prev.design, logoSize: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ampliar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <QRCodePreview />
          </CardContent>
        </Card>

        {qrCodeUrl && (
          <Card>
            <CardHeader>
              <CardTitle>URL del código QR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-mono break-all">{qrCodeUrl}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText(qrCodeUrl)
                  toast.success('URL copiada al portapapeles')
                }}
              >
                Copiar URL
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Código QR'}
          </Button>
        </div>
      </div>

      {/* Hidden canvas for download */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width={qrCodeData.design.size}
        height={qrCodeData.design.size}
      />

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista previa del código QR</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <QRCodePreview />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsPreviewOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
