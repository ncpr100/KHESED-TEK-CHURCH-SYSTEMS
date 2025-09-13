

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Building2, 
  User, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface ChurchData {
  name: string
  email: string
  address: string
  phone: string
  website: string
  founded: string
  description: string
}

interface AdminData {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface OnboardingData {
  church: ChurchData
  admin: AdminData
}

const STEPS = [
  {
    id: 1,
    title: 'Información de la Iglesia',
    description: 'Datos básicos del tenant/iglesia',
    icon: Building2
  },
  {
    id: 2,
    title: 'Administrador Principal',
    description: 'Usuario admin del tenant',
    icon: User
  },
  {
    id: 3,
    title: 'Confirmación',
    description: 'Revisar y crear tenant',
    icon: CheckCircle
  }
]

export default function TenantOnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    church: {
      name: '',
      email: '',
      address: '',
      phone: '',
      website: '',
      founded: '',
      description: ''
    },
    admin: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  })

  // FINAL-FIX: Ultra-aggressive browser autofill prevention
  useEffect(() => {
    // Generate random field identifiers to prevent browser recognition
    const randomSuffix = Math.random().toString(36).substring(7)
    
    const resetAllFields = () => {
      const cleanData: OnboardingData = {
        church: {
          name: '',
          email: '',
          address: '',
          phone: '',
          website: '',
          founded: '',
          description: ''
        },
        admin: {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        }
      }
      
      setOnboardingData(cleanData)
      setValidationErrors({})
    }

    // Ultra-aggressive DOM monitoring and clearing
    const aggressiveFieldClearing = () => {
      const form = document.querySelector('div[data-church-creation]')
      if (form) {
        const adminInputs = form.querySelectorAll('input[name*="admin"], input[id*="admin"]')
        adminInputs.forEach((input: any) => {
          // Force empty value and prevent autofill
          if (input.value && (
            input.value.includes('soporte@khesed-tek.com') ||
            input.value.includes('tonypilarte@gmail.com') ||
            input.value.includes('Tony Pilarte') ||
            input.value.includes('Nelson Castro')
          )) {
            console.warn(`[HRM-20] Aggressive intervention - blocking contamination: ${input.value}`)
            // Disable field to prevent browser re-contamination during clearing
            input.disabled = true
            input.value = ''
            input.setAttribute('autocomplete', 'new-password')
            input.setAttribute('data-lpignore', 'true')
            input.setAttribute('data-form-type', 'other')
            input.dispatchEvent(new Event('input', { bubbles: true }))
            // Re-enable after brief delay to allow user interaction
            setTimeout(() => { 
              input.disabled = false
              input.focus() // Optional: focus to show field is ready for user input
            }, 100)
          }
        })
      }
    }

    // Continuous monitoring every 100ms for first 5 seconds
    const monitoringInterval = setInterval(aggressiveFieldClearing, 100)
    setTimeout(() => clearInterval(monitoringInterval), 5000)

    // Initial reset with multiple attempts
    resetAllFields()
    const timeouts = [
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 50),
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 150),
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 300),
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 500),
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 1000)
    ]
    
    // Event listeners for autofill prevention
    const handleFormEvents = () => {
      setTimeout(() => { resetAllFields(); aggressiveFieldClearing(); }, 50)
    }
    
    window.addEventListener('focus', handleFormEvents)
    window.addEventListener('blur', handleFormEvents)
    document.addEventListener('DOMContentLoaded', handleFormEvents)
    
    return () => {
      timeouts.forEach(clearTimeout)
      clearInterval(monitoringInterval)
      window.removeEventListener('focus', handleFormEvents)
      window.removeEventListener('blur', handleFormEvents)
      document.removeEventListener('DOMContentLoaded', handleFormEvents)
    }
  }, [])

  const updateChurchData = (field: keyof ChurchData, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      church: {
        ...prev.church,
        [field]: value
      }
    }))
    // Clear validation error for this field
    if (validationErrors[`church.${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`church.${field}`]
        return newErrors
      })
    }
  }

  const updateAdminData = (field: keyof AdminData, value: string) => {
    // SECURITY: Prevent contamination from suspicious sources
    const suspiciousValues = [
      'soporte@khesed-tek.com',
      'tonypilarte@gmail.com',
      'nelson.castro@khesedtek.com',
      'Tony Pilarte',
      'Nelson Castro'
    ]
    
    const isSuspicious = suspiciousValues.some(suspicious => 
      value.toLowerCase().includes(suspicious.toLowerCase())
    )
    
    if (isSuspicious) {
      console.warn(`[SECURITY] Blocked suspicious value injection: ${value}`)
      return // Block the update
    }
    
    setOnboardingData(prev => ({
      ...prev,
      admin: {
        ...prev.admin,
        [field]: value
      }
    }))
    
    // Clear validation error for this field
    if (validationErrors[`admin.${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`admin.${field}`]
        return newErrors
      })
    }
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      if (!onboardingData.church.name.trim()) {
        errors['church.name'] = 'El nombre de la iglesia es requerido'
      }
      if (!onboardingData.church.email.trim()) {
        errors['church.email'] = 'El email de la iglesia es requerido'
      } else if (!/\S+@\S+\.\S+/.test(onboardingData.church.email)) {
        errors['church.email'] = 'El email no es válido'
      }
      if (!onboardingData.church.address.trim()) {
        errors['church.address'] = 'La dirección es requerida'
      }
    }

    if (step === 2) {
      if (!onboardingData.admin.name.trim()) {
        errors['admin.name'] = 'El nombre del administrador es requerido'
      }
      if (!onboardingData.admin.email.trim()) {
        errors['admin.email'] = 'El email del administrador es requerido'
      } else if (!/\S+@\S+\.\S+/.test(onboardingData.admin.email)) {
        errors['admin.email'] = 'El email no es válido'
      }
      if (!onboardingData.admin.password) {
        errors['admin.password'] = 'La contraseña es requerida'
      } else if (onboardingData.admin.password.length < 8) {
        errors['admin.password'] = 'La contraseña debe tener al menos 8 caracteres'
      }
      if (onboardingData.admin.password !== onboardingData.admin.confirmPassword) {
        errors['admin.confirmPassword'] = 'Las contraseñas no coinciden'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(3, prev + 1))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Por favor revisa los datos ingresados')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/platform/churches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: onboardingData.church.name,
          email: onboardingData.church.email,
          address: onboardingData.church.address,
          phone: onboardingData.church.phone,
          website: onboardingData.church.website,
          founded: onboardingData.church.founded ? new Date(onboardingData.church.founded).toISOString() : null,
          description: onboardingData.church.description,
          adminUser: {
            name: onboardingData.admin.name,
            email: onboardingData.admin.email,
            phone: onboardingData.admin.phone,
            password: onboardingData.admin.password
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('¡Iglesia creada exitosamente!')
        router.push('/platform/churches')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al crear la iglesia')
      }
    } catch (error) {
      console.error('Error creating church:', error)
      toast.error('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="church-name">
                  Nombre de la Iglesia *
                </Label>
                <Input
                  id="church-name"
                  value={onboardingData.church.name}
                  onChange={(e) => updateChurchData('name', e.target.value)}
                  placeholder="Ej: Iglesia Central de Fe"
                  className={validationErrors['church.name'] ? 'border-red-500' : ''}
                />
                {validationErrors['church.name'] && (
                  <p className="text-sm text-red-600">{validationErrors['church.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-email">
                  Email de Contacto *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="church-email"
                    type="email"
                    value={onboardingData.church.email}
                    onChange={(e) => updateChurchData('email', e.target.value)}
                    placeholder="contacto@iglesia.com"
                    className={`pl-10 ${validationErrors['church.email'] ? 'border-red-500' : ''}`}
                  />
                </div>
                {validationErrors['church.email'] && (
                  <p className="text-sm text-red-600">{validationErrors['church.email']}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="church-address">
                  Dirección *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="church-address"
                    value={onboardingData.church.address}
                    onChange={(e) => updateChurchData('address', e.target.value)}
                    placeholder="Calle Principal 123, Ciudad, Estado, País"
                    className={`pl-10 ${validationErrors['church.address'] ? 'border-red-500' : ''}`}
                    rows={2}
                  />
                </div>
                {validationErrors['church.address'] && (
                  <p className="text-sm text-red-600">{validationErrors['church.address']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-phone">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="church-phone"
                    value={onboardingData.church.phone}
                    onChange={(e) => updateChurchData('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-website">
                  Sitio Web
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="church-website"
                    value={onboardingData.church.website}
                    onChange={(e) => updateChurchData('website', e.target.value)}
                    placeholder="https://www.iglesia.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="church-founded">
                  Fecha de Fundación
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="church-founded"
                    type="date"
                    value={onboardingData.church.founded}
                    onChange={(e) => updateChurchData('founded', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="church-description">
                  Descripción
                </Label>
                <Textarea
                  id="church-description"
                  value={onboardingData.church.description}
                  onChange={(e) => updateChurchData('description', e.target.value)}
                  placeholder="Breve descripción de la misión y visión de la iglesia..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Usuario Administrador Principal</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Este usuario tendrá permisos completos de administración para la iglesia.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="admin-name">
                  Nombre Completo *
                </Label>
                <Input
                  id="admin-name"
                  name="admin-name-new-church"
                  value={onboardingData.admin.name}
                  onChange={(e) => updateAdminData('name', e.target.value)}
                  placeholder="Ej: Pastor Juan Pérez"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="new-church-admin"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-autocomplete-type="disabled"
                  className={validationErrors['admin.name'] ? 'border-red-500' : ''}
                />
                {validationErrors['admin.name'] && (
                  <p className="text-sm text-red-600">{validationErrors['admin.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">
                  Email *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-email"
                    name="admin-email-new-church"
                    type="email"
                    value={onboardingData.admin.email}
                    onChange={(e) => updateAdminData('email', e.target.value)}
                    placeholder="admin@iglesia.com"
                    className={`pl-10 ${validationErrors['admin.email'] ? 'border-red-500' : ''}`}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="new-church-admin"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    data-no-autofill="true"
                  />
                </div>
                {validationErrors['admin.email'] && (
                  <p className="text-sm text-red-600">{validationErrors['admin.email']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-phone">
                  Teléfono
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="admin-phone"
                    name="admin-phone-new-church"
                    value={onboardingData.admin.phone}
                    onChange={(e) => updateAdminData('phone', e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="pl-10"
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="new-church-admin"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    data-no-autofill="true"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">
                  Contraseña *
                </Label>
                <Input
                  id="admin-password"
                  name="admin-password-new-church"
                  type="password"
                  value={onboardingData.admin.password}
                  onChange={(e) => updateAdminData('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={validationErrors['admin.password'] ? 'border-red-500' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="new-church-admin"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-autocomplete-type="disabled"
                />
                {validationErrors['admin.password'] && (
                  <p className="text-sm text-red-600">{validationErrors['admin.password']}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="admin-confirm-password">
                  Confirmar Contraseña *
                </Label>
                <Input
                  id="admin-confirm-password"
                  name="admin-confirm-password-new-church"
                  type="password"
                  value={onboardingData.admin.confirmPassword}
                  onChange={(e) => updateAdminData('confirmPassword', e.target.value)}
                  placeholder="Confirma la contraseña"
                  className={validationErrors['admin.confirmPassword'] ? 'border-red-500' : ''}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="new-church-admin"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-autocomplete-type="disabled"
                />
                {validationErrors['admin.confirmPassword'] && (
                  <p className="text-sm text-red-600">{validationErrors['admin.confirmPassword']}</p>
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Revisión Final</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Por favor revisa la información antes de crear la iglesia.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Church Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5" />
                    Información de la Iglesia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nombre</p>
                    <p className="text-sm text-gray-900">{onboardingData.church.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{onboardingData.church.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Dirección</p>
                    <p className="text-sm text-gray-900">{onboardingData.church.address}</p>
                  </div>
                  {onboardingData.church.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Teléfono</p>
                      <p className="text-sm text-gray-900">{onboardingData.church.phone}</p>
                    </div>
                  )}
                  {onboardingData.church.website && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Sitio Web</p>
                      <p className="text-sm text-gray-900">{onboardingData.church.website}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Admin Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5" />
                    Administrador Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nombre</p>
                    <p className="text-sm text-gray-900">{onboardingData.admin.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{onboardingData.admin.email}</p>
                  </div>
                  {onboardingData.admin.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Teléfono</p>
                      <p className="text-sm text-gray-900">{onboardingData.admin.phone}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Shield className="h-3 w-3 mr-1" />
                      ADMIN_IGLESIA
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-church-creation="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            Crear Nueva Iglesia
          </h1>
          <p className="text-gray-600 mt-1">
            Wizard de configuración rápida para nuevo tenant
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/platform/churches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      </div>

      {/* Steps Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isCompleted 
                        ? 'bg-green-100 border-green-500 text-green-600' 
                        : isActive 
                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>
        
        <div className="flex items-center gap-3">
          {currentStep < 3 ? (
            <Button onClick={nextStep}>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Crear Iglesia
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

