
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { 
  Plus, 
  Trash2, 
  ChevronUp,
  ChevronDown, 
  Eye, 
  Edit3,
  Settings,
  Palette,
  Type,
  Phone,
  Mail,
  MessageSquare,
  Hash
} from 'lucide-react'
import toast from 'react-hot-toast'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'email' | 'phone' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
  }
}

interface PrayerFormData {
  id?: string
  name: string
  description?: string
  fields: FormField[]
  style: {
    backgroundColor?: string
    primaryColor?: string
    fontFamily?: string
    logoUrl?: string
  }
  isPublic: boolean
  slug?: string
}

interface PrayerFormBuilderProps {
  form?: PrayerFormData
  onSave: (formData: PrayerFormData) => Promise<void>
  onCancel: () => void
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto', icon: Type },
  { value: 'textarea', label: 'Área de texto', icon: MessageSquare },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Teléfono', icon: Phone },
  { value: 'number', label: 'Número', icon: Hash },
  { value: 'select', label: 'Selección', icon: Settings },
  { value: 'radio', label: 'Radio', icon: Settings },
  { value: 'checkbox', label: 'Checkbox', icon: Settings }
]

const DEFAULT_FIELDS: FormField[] = [
  {
    id: 'fullName',
    type: 'text',
    label: 'Nombre completo',
    placeholder: 'Tu nombre completo',
    required: true
  },
  {
    id: 'contact',
    type: 'text',
    label: 'Teléfono o Email',
    placeholder: 'Para enviarte la respuesta',
    required: true
  },
  {
    id: 'category',
    type: 'select',
    label: 'Tipo de oración',
    required: true,
    options: ['Familia', 'Salud', 'Finanzas', 'Crecimiento espiritual', 'Quiero recibir a Jesús']
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'Mensaje adicional (opcional)',
    placeholder: 'Comparte más detalles si deseas...',
    required: false
  }
]

export function PrayerFormBuilder({ form, onSave, onCancel }: PrayerFormBuilderProps) {
  const [formData, setFormData] = useState<PrayerFormData>({
    name: form?.name || '',
    description: form?.description || '',
    fields: form?.fields || DEFAULT_FIELDS,
    style: form?.style || {
      backgroundColor: '#ffffff',
      primaryColor: '#3b82f6',
      fontFamily: 'Inter',
      logoUrl: ''
    },
    isPublic: form?.isPublic ?? true,
    slug: form?.slug
  })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isStyleOpen, setIsStyleOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<FormField | null>(null)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const generateFieldId = () => `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: generateFieldId(),
      type,
      label: `Nuevo campo ${type}`,
      required: false,
      ...(type === 'select' || type === 'radio' ? { options: ['Opción 1', 'Opción 2'] } : {})
    }
    
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }))
  }

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }))
  }

  const removeField = (fieldId: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }))
  }

  const moveField = (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = formData.fields.findIndex(field => field.id === fieldId)
    if (currentIndex === -1) return

    const newFields = [...formData.fields]
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= newFields.length) return

    // Swap the fields
    const temp = newFields[currentIndex]
    newFields[currentIndex] = newFields[targetIndex]
    newFields[targetIndex] = temp

    setFormData(prev => ({
      ...prev,
      fields: newFields
    }))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre del formulario es requerido')
      return
    }

    if (formData.fields.length === 0) {
      toast.error('El formulario debe tener al menos un campo')
      return
    }

    setIsSaving(true)
    try {
      await onSave(formData)
      toast.success('Formulario guardado correctamente')
    } catch (error) {
      toast.error('Error al guardar el formulario')
    } finally {
      setIsSaving(false)
    }
  }

  const FieldIcon = ({ type }: { type: FormField['type'] }) => {
    const iconType = FIELD_TYPES.find(t => t.value === type)
    const Icon = iconType?.icon || Type
    return <Icon className="w-4 h-4" />
  }

  const PreviewForm = () => (
    <div 
      className="max-w-md mx-auto p-6 rounded-lg shadow-lg"
      style={{ 
        backgroundColor: formData.style.backgroundColor,
        color: formData.style.primaryColor === '#ffffff' ? '#000000' : '#333333'
      }}
    >
      {formData.style.logoUrl && (
        <img 
          src={formData.style.logoUrl} 
          alt="Logo" 
          className="w-16 h-16 mx-auto mb-4 object-contain"
        />
      )}
      
      <h2 
        className="text-xl font-bold text-center mb-2"
        style={{ color: formData.style.primaryColor }}
      >
        {formData.name}
      </h2>
      
      {formData.description && (
        <p className="text-sm text-gray-600 text-center mb-6">
          {formData.description}
        </p>
      )}

      <div className="space-y-4">
        {formData.fields.map((field) => (
          <div key={field.id}>
            <Label className="block text-sm font-medium mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {field.type === 'textarea' ? (
              <Textarea 
                placeholder={field.placeholder}
                className="w-full"
                rows={3}
              />
            ) : field.type === 'select' ? (
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || "Selecciona una opción"} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option, idx) => (
                    <SelectItem key={idx} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'radio' ? (
              <div className="space-y-2">
                {field.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input 
                      type="radio" 
                      name={field.id}
                      className="w-4 h-4"
                      style={{ accentColor: formData.style.primaryColor }}
                    />
                    <label className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            ) : field.type === 'checkbox' ? (
              <div className="space-y-2">
                {field.options?.map((option, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4"
                      style={{ accentColor: formData.style.primaryColor }}
                    />
                    <label className="text-sm">{option}</label>
                  </div>
                ))}
              </div>
            ) : (
              <Input 
                type={field.type}
                placeholder={field.placeholder}
                className="w-full"
              />
            )}
          </div>
        ))}
      </div>

      <Button 
        className="w-full mt-6"
        style={{ 
          backgroundColor: formData.style.primaryColor,
          color: formData.style.primaryColor === '#ffffff' ? '#000000' : '#ffffff'
        }}
      >
        Enviar Petición de Oración
      </Button>
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Form Settings Panel */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuración del Formulario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="formName">Nombre del formulario</Label>
              <Input
                id="formName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Peticiones de Oración - Servicio Dominical"
              />
            </div>

            <div>
              <Label htmlFor="formDescription">Descripción</Label>
              <Textarea
                id="formDescription"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción opcional del formulario"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic">Formulario público</Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
            </div>

            <div className="flex gap-2">
              <Dialog open={isStyleOpen} onOpenChange={setIsStyleOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Estilo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Personalizar Estilo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Color principal</Label>
                      <Input
                        type="color"
                        value={formData.style.primaryColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, primaryColor: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>Color de fondo</Label>
                      <Input
                        type="color"
                        value={formData.style.backgroundColor}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, backgroundColor: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>URL del logo</Label>
                      <Input
                        value={formData.style.logoUrl || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, logoUrl: e.target.value }
                        }))}
                        placeholder="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiJgYA4k2bxaBnSxF5K7jSmgPsOivvFCmx8sagnzhSWCGhu9PcLrey_fywc9-Nfaon_685KVgrn5WnXn4xkrIdQrr4JJ1WEOS-qFM4y_I5GbOuJ2VqDt2y3jBcIuuqoNDMV0uuDe-rnQJo/s1600/custom+logo+design.jpg"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsStyleOpen(false)}>Cerrar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Vista previa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Vista previa del formulario</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    <PreviewForm />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Field Types */}
        <Card>
          <CardHeader>
            <CardTitle>Agregar Campo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_TYPES.map((fieldType) => {
                const Icon = fieldType.icon
                return (
                  <Button
                    key={fieldType.value}
                    variant="outline"
                    size="sm"
                    onClick={() => addField(fieldType.value as FormField['type'])}
                    className="flex items-center gap-2 h-auto p-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{fieldType.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Fields Editor */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Campos del formulario</span>
              <Badge variant="secondary">{formData.fields.length} campos</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {formData.fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FieldIcon type={field.type} />
                      <div>
                        <p className="font-medium">{field.label}</p>
                        <p className="text-sm text-gray-500">
                          {FIELD_TYPES.find(t => t.value === field.type)?.label}
                          {field.required && ' • Requerido'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveField(field.id, 'down')}
                        disabled={index === formData.fields.length - 1}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedField(field)
                          setIsFieldDialogOpen(true)
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {formData.fields.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay campos en el formulario</p>
                <p className="text-sm">Agrega campos desde el panel izquierdo</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Formulario'}
          </Button>
        </div>
      </div>

      {/* Field Editor Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campo</DialogTitle>
          </DialogHeader>
          {selectedField && (
            <div className="space-y-4">
              <div>
                <Label>Etiqueta</Label>
                <Input
                  value={selectedField.label}
                  onChange={(e) => {
                    const updatedField = { ...selectedField, label: e.target.value }
                    setSelectedField(updatedField)
                    updateField(selectedField.id, { label: e.target.value })
                  }}
                />
              </div>

              <div>
                <Label>Placeholder</Label>
                <Input
                  value={selectedField.placeholder || ''}
                  onChange={(e) => {
                    const updatedField = { ...selectedField, placeholder: e.target.value }
                    setSelectedField(updatedField)
                    updateField(selectedField.id, { placeholder: e.target.value })
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Campo requerido</Label>
                <Switch
                  checked={selectedField.required}
                  onCheckedChange={(checked) => {
                    const updatedField = { ...selectedField, required: checked }
                    setSelectedField(updatedField)
                    updateField(selectedField.id, { required: checked })
                  }}
                />
              </div>

              {(selectedField.type === 'select' || selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                <div>
                  <Label>Opciones (una por línea)</Label>
                  <Textarea
                    value={selectedField.options?.join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(o => o.trim())
                      const updatedField = { ...selectedField, options }
                      setSelectedField(updatedField)
                      updateField(selectedField.id, { options })
                    }}
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsFieldDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
