
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Building2, User, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface OrganizationDetails {
  orgName: string
  contactEmail: string
  address: string
  phone: string
  website: string
  established: string
  description: string
}

interface PrimaryUser {
  fullName: string
  email: string
  phone: string
  // Removed password fields - using temporary password generation via API
}

interface WizardData {
  organization: OrganizationDetails
  primaryUser: PrimaryUser
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

export default function FreshChurchWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  const [wizardData, setWizardData] = useState<WizardData>({
    organization: {
      orgName: '',
      contactEmail: '',
      address: '',
      phone: '',
      website: '',
      established: '',
      description: ''
    },
    primaryUser: {
      fullName: '',
      email: '',
      phone: ''
      // Removed password fields - API will generate temporary password
    }
  })

  // EMERGENCY CORRECTION - Only blocking ACTUAL test data
  const checkForContamination = (value: string, fieldName: string) => {
    const actualTestData = [
      'admin@khesed-tek.com', // Confirmed not legit
      'test@example.com',
      'demo@demo.com'
      // REMOVED: soporte@khesed-tek.com - LEGITIMATE support email
      // REMOVED: Nelson Castro - PLATFORM OWNER/SUPER_ADMIN
      // REMOVED: Tony Pilarte - REAL CLIENT
    ]
    
    const isTestData = actualTestData.some(testValue => 
      value.toLowerCase().includes(testValue.toLowerCase())
    )
    
    if (isTestData) {
      console.warn(`[FRESH-WIZARD] Test data blocked on field: ${fieldName}`)
      toast.error('⚠️ Datos de prueba detectados. Campo limpiado automáticamente.')
      return '' // Return empty value instead of test data
    }
    
    return value
  }

  const updateOrganization = (field: keyof OrganizationDetails, value: string) => {
    const cleanValue = checkForContamination(value, `org-${field}`)
    
    setWizardData(prev => ({
      ...prev,
      organization: {
        ...prev.organization,
        [field]: cleanValue
      }
    }))
  }

  const updatePrimaryUser = (field: keyof PrimaryUser, value: string) => {
    const cleanValue = checkForContamination(value, `user-${field}`)
    
    setWizardData(prev => ({
      ...prev,
      primaryUser: {
        ...prev.primaryUser,
        [field]: cleanValue
      }
    }))
  }

  const validateStep = (step: number): boolean => {
    const errors: Record<string, boolean> = {}
    
    if (step === 1) {
      if (!wizardData.organization.orgName.trim()) errors['org.name'] = true
      if (!wizardData.organization.contactEmail.trim()) errors['org.email'] = true
      if (!wizardData.organization.address.trim()) errors['org.address'] = true
    }
    
    if (step === 2) {
      if (!wizardData.primaryUser.fullName.trim()) errors['user.name'] = true
      if (!wizardData.primaryUser.email.trim()) errors['user.email'] = true
      // Removed password validation - using temporary password generation
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(2)) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/platform/churches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: wizardData.organization.orgName,
          email: wizardData.organization.contactEmail,
          address: wizardData.organization.address,
          phone: wizardData.organization.phone,
          website: wizardData.organization.website,
          founded: wizardData.organization.established,
          description: wizardData.organization.description,
          adminUser: {
            name: wizardData.primaryUser.fullName,
            email: wizardData.primaryUser.email,
            phone: wizardData.primaryUser.phone
            // No password - API will generate temporary password: 'cambiarpassword123'
          }
        }),
      })

      if (response.ok) {
        toast.success('¡Iglesia creada exitosamente!')
        // Reset form
        setWizardData({
          organization: {
            orgName: '', contactEmail: '', address: '', phone: '',
            website: '', established: '', description: ''
          },
          primaryUser: {
            fullName: '', email: '', phone: ''
          }
        })
        setCurrentStep(1)
      } else {
        const errorData = await response.json()
        toast.error(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error creating church:', error)
      toast.error('Error al crear la iglesia')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="org-name-fresh">Nombre de la Iglesia *</Label>
          <Input
            id="org-name-fresh"
            name="organization-name-unique"
            value={wizardData.organization.orgName}
            onChange={(e) => updateOrganization('orgName', e.target.value)}
            placeholder="Ej: Iglesia Central de Fe"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form="fresh-org-wizard"
            data-lpignore="true"
            data-1p-ignore="true" 
            data-form-type="other"
            data-autocomplete-type="disabled"
            className={validationErrors['org.name'] ? 'border-red-500' : ''}
          />
          {validationErrors['org.name'] && (
            <p className="text-sm text-red-500">El nombre de la iglesia es requerido</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email-fresh">Email de Contacto *</Label>
          <Input
            id="contact-email-fresh"
            name="organization-contact-unique"
            type="email"
            value={wizardData.organization.contactEmail}
            onChange={(e) => updateOrganization('contactEmail', e.target.value)}
            placeholder="contacto@iglesia.com"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            data-form="fresh-org-wizard"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            data-autocomplete-type="disabled"
            className={validationErrors['org.email'] ? 'border-red-500' : ''}
          />
          {validationErrors['org.email'] && (
            <p className="text-sm text-red-500">El email de la iglesia es requerido</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address-fresh">Dirección *</Label>
        <Textarea
          id="address-fresh"
          name="organization-address-unique"
          value={wizardData.organization.address}
          onChange={(e) => updateOrganization('address', e.target.value)}
          placeholder="Calle Principal 123, Ciudad, Estado, País"
          autoComplete="off"
          spellCheck="false"
          data-form="fresh-org-wizard"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          className={validationErrors['org.address'] ? 'border-red-500' : ''}
        />
        {validationErrors['org.address'] && (
          <p className="text-sm text-red-500">La dirección es requerida</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone-fresh">Teléfono</Label>
          <Input
            id="phone-fresh"
            name="organization-phone-unique"
            value={wizardData.organization.phone}
            onChange={(e) => updateOrganization('phone', e.target.value)}
            placeholder="+57 300 123 4567"
            autoComplete="off"
            data-form="fresh-org-wizard"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website-fresh">Sitio Web</Label>
          <Input
            id="website-fresh"
            name="organization-website-unique"
            value={wizardData.organization.website}
            onChange={(e) => updateOrganization('website', e.target.value)}
            placeholder="https://www.iglesia.com"
            autoComplete="off"
            data-form="fresh-org-wizard"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="established-fresh">Fecha de Fundación</Label>
        <Input
          id="established-fresh"
          name="organization-founded-unique"
          type="date"
          value={wizardData.organization.established}
          onChange={(e) => updateOrganization('established', e.target.value)}
          autoComplete="off"
          data-form="fresh-org-wizard"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description-fresh">Descripción</Label>
        <Textarea
          id="description-fresh"
          name="organization-description-unique"
          value={wizardData.organization.description}
          onChange={(e) => updateOrganization('description', e.target.value)}
          placeholder="Breve descripción de la misión y visión de la iglesia..."
          autoComplete="off"
          spellCheck="false"
          data-form="fresh-org-wizard"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <User className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Usuario Administrador Principal</h3>
            <p className="text-sm text-amber-700">
              Este usuario tendrá permisos completos de administración para la iglesia.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="primary-user-name-fresh">Nombre Completo *</Label>
          <Input
            id="primary-user-name-fresh"
            name="primary-administrator-name-unique"
            value={wizardData.primaryUser.fullName}
            onChange={(e) => updatePrimaryUser('fullName', e.target.value)}
            placeholder="Ej: Pastor Juan Pérez"
            autoComplete="new-password"
            autoCapitalize="off"
            spellCheck="false"
            data-form="fresh-user-wizard"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            data-autocomplete-type="disabled"
            className={validationErrors['user.name'] ? 'border-red-500' : ''}
          />
          {validationErrors['user.name'] && (
            <p className="text-sm text-red-500">El nombre del administrador es requerido</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="primary-user-email-fresh">Email *</Label>
          <Input
            id="primary-user-email-fresh"
            name="primary-administrator-email-unique"
            type="email"
            value={wizardData.primaryUser.email}
            onChange={(e) => updatePrimaryUser('email', e.target.value)}
            placeholder="admin@iglesia.com"
            autoComplete="new-password"
            autoCapitalize="off"
            spellCheck="false"
            data-form="fresh-user-wizard"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            data-autocomplete-type="disabled"
            data-no-autofill="true"
            className={validationErrors['user.email'] ? 'border-red-500' : ''}
          />
          {validationErrors['user.email'] && (
            <p className="text-sm text-red-500">El email del administrador es requerido</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="primary-user-phone-fresh">Teléfono</Label>
        <Input
          id="primary-user-phone-fresh"
          name="primary-administrator-phone-unique"
          value={wizardData.primaryUser.phone}
          onChange={(e) => updatePrimaryUser('phone', e.target.value)}
          placeholder="+57 300 123 4567"
          autoComplete="new-password"
          data-form="fresh-user-wizard"
          data-lpignore="true"
          data-1p-ignore="true"
          data-form-type="other"
          data-autocomplete-type="disabled"
          data-no-autofill="true"
        />
      </div>

      {/* Password fields removed - API generates temporary password: 'cambiarpassword123' */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-sm font-medium">Contraseña Temporal</span>
        </div>
        <p className="text-sm text-blue-600 mt-1">
          Se generará una contraseña temporal automáticamente. El administrador deberá cambiarla en su primer inicio de sesión.
        </p>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Revisión Final</h3>
            <p className="text-sm text-blue-700">
              Por favor revisa la información antes de crear la iglesia.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-lg">Información de la Iglesia</h3>
          </div>
          
          <div className="space-y-3 pl-7">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm">{wizardData.organization.orgName || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm">{wizardData.organization.contactEmail || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Dirección</p>
              <p className="text-sm">{wizardData.organization.address || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teléfono</p>
              <p className="text-sm">{wizardData.organization.phone || 'No especificado'}</p>
            </div>
            {wizardData.organization.website && (
              <div>
                <p className="text-sm font-medium text-gray-600">Sitio Web</p>
                <p className="text-sm">{wizardData.organization.website}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="font-medium text-lg">Administrador Principal</h3>
          </div>
          
          <div className="space-y-3 pl-7">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre</p>
              <p className="text-sm">{wizardData.primaryUser.fullName || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-sm">{wizardData.primaryUser.email || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Teléfono</p>
              <p className="text-sm">{wizardData.primaryUser.phone || 'No especificado'}</p>
            </div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ ADMIN_IGLESIA
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-fresh-church-wizard="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Crear Nueva Iglesia
          </h1>
          <p className="text-gray-600">Wizard de configuración rápida para nuevo tenant</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep > step.id ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gray-400 ml-4" />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={handleNext}
            className="flex items-center space-x-2"
          >
            <span>Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>{isLoading ? 'Creando...' : 'Crear Iglesia'}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
