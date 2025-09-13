
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Heart, Send, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormField {
  id: string
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'email' | 'phone' | 'number'
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface PrayerCategory {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
}

interface FormData {
  id: string
  name: string
  description?: string
  fields: FormField[]
  style: {
    backgroundColor?: string
    primaryColor?: string
    fontFamily?: string
    logoUrl?: string
  }
  categories: PrayerCategory[]
  church: {
    id: string
    name: string
    logo?: string
    description?: string
  }
}

interface PublicPrayerFormProps {
  formData: FormData
  qrCodeId?: string
  onSubmissionComplete?: () => void
}

export function PublicPrayerForm({ formData, qrCodeId, onSubmissionComplete }: PublicPrayerFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Validate required fields
    formData.fields.forEach(field => {
      if (field.required && !formValues[field.id]?.toString().trim()) {
        errors[field.id] = `${field.label} es requerido`
      }
    })

    // Validate category selection (always required)
    if (!selectedCategory) {
      errors.category = 'Debe seleccionar un tipo de oración'
    }

    // Validate email format
    const emailFields = formData.fields.filter(f => f.type === 'email')
    emailFields.forEach(field => {
      const value = formValues[field.id]
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.id] = 'Email no válido'
      }
    })

    // Validate phone format
    const phoneFields = formData.fields.filter(f => f.type === 'phone')
    phoneFields.forEach(field => {
      const value = formValues[field.id]
      if (value && !/^[\d\s\-\+\(\)]{7,}$/.test(value.replace(/\s/g, ''))) {
        errors[field.id] = 'Teléfono no válido'
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare submission data
      const submissionData = {
        fullName: formValues.fullName || formValues.name || 'Anónimo',
        phone: formValues.phone || formValues.telefono || formValues.contact,
        email: formValues.email || formValues.correo,
        categoryId: selectedCategory,
        message: formValues.message || formValues.mensaje || formValues.details,
        preferredContact: formValues.email ? 'email' : 'sms',
        isAnonymous: !formValues.fullName && !formValues.name,
        priority: 'normal',
        churchId: formData.church.id,
        formId: formData.id,
        qrCodeId: qrCodeId
      }

      // Handle contact field (could be phone or email)
      if (formValues.contact && !submissionData.phone && !submissionData.email) {
        if (formValues.contact.includes('@')) {
          submissionData.email = formValues.contact
          submissionData.preferredContact = 'email'
        } else {
          submissionData.phone = formValues.contact
          submissionData.preferredContact = 'sms'
        }
      }

      const response = await fetch('/api/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        setIsSubmitted(true)
        toast.success('¡Petición enviada! Recibirás una respuesta pronto.')
        onSubmissionComplete?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al enviar la petición')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Error al enviar la petición. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }))

    // Clear validation error when user starts typing
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }))
    }
  }

  const renderField = (field: FormField) => {
    const hasError = !!validationErrors[field.id]
    
    const baseClassName = `w-full ${hasError ? 'border-red-500' : ''}`

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={baseClassName}
              rows={4}
            />
            {hasError && <p className="text-sm text-red-500">{validationErrors[field.id]}</p>}
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger className={baseClassName}>
                <SelectValue placeholder={field.placeholder || "Selecciona una opción"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-red-500">{validationErrors[field.id]}</p>}
          </div>
        )

      case 'radio':
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                  <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && <p className="text-sm text-red-500">{validationErrors[field.id]}</p>}
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-3">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(formValues[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues = formValues[field.id] || []
                      if (checked) {
                        handleFieldChange(field.id, [...currentValues, option])
                      } else {
                        handleFieldChange(field.id, currentValues.filter((v: string) => v !== option))
                      }
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-red-500">{validationErrors[field.id]}</p>}
          </div>
        )

      default:
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={baseClassName}
            />
            {hasError && <p className="text-sm text-red-500">{validationErrors[field.id]}</p>}
          </div>
        )
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              ¡Petición Enviada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu petición de oración ha sido recibida. Recibirás una respuesta personalizada muy pronto.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Iglesia:</strong> {formData.church.name}
              </p>
              {formData.church.description && (
                <p className="text-sm text-blue-700 mt-1">
                  {formData.church.description}
                </p>
              )}
            </div>
            <Button
              onClick={() => window.close()}
              variant="outline"
            >
              Cerrar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card
        style={{ 
          backgroundColor: formData.style.backgroundColor || '#ffffff'
        }}
      >
        <CardHeader className="text-center">
          {formData.church.logo && (
            <img 
              src={formData.church.logo} 
              alt={`Logo ${formData.church.name}`}
              className="w-16 h-16 mx-auto mb-4 object-contain rounded-lg"
            />
          )}
          
          <CardTitle 
            className="text-xl font-bold"
            style={{ color: formData.style.primaryColor || '#3b82f6' }}
          >
            <Heart className="w-6 h-6 inline mr-2" />
            {formData.name}
          </CardTitle>
          
          {formData.description && (
            <p className="text-sm text-gray-600 mt-2">
              {formData.description}
            </p>
          )}

          <div className="bg-gray-50 rounded-lg p-3 mt-4">
            <p className="text-sm font-medium text-gray-700">
              {formData.church.name}
            </p>
            {formData.church.description && (
              <p className="text-xs text-gray-600 mt-1">
                {formData.church.description}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Prayer Category Selection */}
            <div className="space-y-3">
              <Label>
                Tipo de oración <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {formData.categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedCategory === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      if (validationErrors.category) {
                        setValidationErrors(prev => ({ ...prev, category: '' }))
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          selectedCategory === category.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedCategory === category.id && (
                          <div className="w-full h-full bg-white rounded-full scale-50"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-gray-600">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {validationErrors.category && (
                <p className="text-sm text-red-500">{validationErrors.category}</p>
              )}
            </div>

            {/* Dynamic Form Fields */}
            {formData.fields.map(renderField)}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: formData.style.primaryColor || '#3b82f6',
                color: '#ffffff'
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Petición de Oración
                </div>
              )}
            </Button>

            {/* Privacy Note */}
            <div className="bg-gray-50 rounded-lg p-3 mt-4">
              <p className="text-xs text-gray-600 text-center">
                Tu información será tratada con confidencialidad y solo será usada para responder a tu petición de oración.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
