

'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  Download,
  Users,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface MemberImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

interface ImportResult {
  success: boolean
  imported: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    field: string
    value: any
    error: string
  }>
}

export function MemberImportDialog({ open, onOpenChange, onImportComplete }: MemberImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [updateExisting, setUpdateExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
      ]

      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Tipo de archivo no válido. Use Excel (.xlsx, .xls) o CSV (.csv)')
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('El archivo debe ser menor a 10MB')
        return
      }

      setFile(selectedFile)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('updateExisting', updateExisting.toString())

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/members/import', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error en la importación')
      }

      setImportResult(result)

      if (result.success) {
        toast.success(`Importación completada: ${result.imported} nuevos, ${result.updated} actualizados`)
      } else {
        toast.warning(`Importación parcial: ${result.imported + result.updated} procesados, ${result.failed} fallaron`)
      }

    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Error en la importación')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleComplete = () => {
    setFile(null)
    setImportResult(null)
    setUpdateExisting(false)
    onImportComplete()
    onOpenChange(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadTemplate = () => {
    const csvTemplate = `firstName,lastName,email,phone,address,city,state,zipCode,birthDate,membershipDate,baptismDate,gender,maritalStatus,occupation,notes
Juan,Pérez,juan@email.com,555-0123,"Calle 123, #45",Bogotá,Cundinamarca,110111,1985-05-15,2020-01-15,2020-02-20,Masculino,Casado,Ingeniero,Líder de jóvenes
María,García,maria@email.com,555-0124,"Carrera 67, #89",Medellín,Antioquia,050001,1990-08-20,2021-03-10,2021-04-15,Femenino,Soltera,Doctora,Ministerio de niños`

    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'plantilla_miembros.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Importar Miembros
          </DialogTitle>
          <DialogDescription>
            Importe miembros desde archivos Excel (.xlsx, .xls) o CSV (.csv)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions & Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Instrucciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Campos Reconocidos:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Requeridos:</strong> firstName, lastName (o "name")</li>
                    <li>• <strong>Contacto:</strong> email, phone, address, city, state, zipCode</li>
                    <li>• <strong>Personal:</strong> birthDate, gender, maritalStatus, occupation</li>
                    <li>• <strong>Iglesia:</strong> membershipDate, baptismDate, notes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Formatos Soportados:</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• <strong>Fechas:</strong> YYYY-MM-DD, DD/MM/YYYY</li>
                    <li>• <strong>Género:</strong> Masculino/M/H, Femenino/F/W</li>
                    <li>• <strong>Nombres:</strong> "Juan Pérez" se divide automáticamente</li>
                    <li>• <strong>Límite:</strong> 1000 registros máximo</li>
                  </ul>
                </div>
              </div>

              <Separator />
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Descargue una plantilla de ejemplo para comenzar
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar Plantilla CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seleccionar Archivo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Seleccionar
                </Button>
              </div>

              {file && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null)
                        setImportResult(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateExisting"
                  checked={updateExisting}
                  onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
                />
                <Label htmlFor="updateExisting" className="text-sm">
                  Actualizar miembros existentes (busca por email o nombre completo)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="font-medium">Procesando importación...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground">
                    Validando datos y creando registros de miembros
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Import Results */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  Resultados de la Importación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">
                      {importResult.imported}
                    </div>
                    <div className="text-sm text-green-600">Nuevos</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">
                      {importResult.updated}
                    </div>
                    <div className="text-sm text-blue-600">Actualizados</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-700">
                      {importResult.failed}
                    </div>
                    <div className="text-sm text-red-600">Fallaron</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-700">
                      {importResult.imported + importResult.updated + importResult.failed}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Errores Encontrados ({importResult.errors.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTitle className="text-sm">
                            Fila {error.row} - {error.field}
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            {error.error}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {importResult.errors.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          ...y {importResult.errors.length - 10} errores más
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {importResult ? (
              <>
                <Button variant="outline" onClick={() => setImportResult(null)}>
                  Nueva Importación
                </Button>
                <Button onClick={handleComplete} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Completar
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {isUploading ? 'Importando...' : 'Iniciar Importación'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

