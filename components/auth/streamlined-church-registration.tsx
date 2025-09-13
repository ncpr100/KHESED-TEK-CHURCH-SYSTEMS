
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Church, Loader2, Crown, Zap, Package, Building, Users, Settings, Mail, Key } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  description: string
  priceMonthly: string
  priceYearly: string
  maxChurches: number
  maxMembers: number
  maxUsers: number
  sortOrder: number
}

interface RegistrationData {
  churchName: string
  firstName: string
  lastName: string
  email: string
  subscriptionPlan: string
}

export default function StreamlinedChurchRegistration() {
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    churchName: '',
    firstName: '',
    lastName: '',
    email: '',
    subscriptionPlan: 'BÁSICO'
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})

  // Icon mapping for plans
  const PLAN_ICONS = {
    BÁSICO: Crown,
    PROFESIONAL: Zap,
    EMPRESARIAL: Package,
  }

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
      console.warn(`[STREAMLINED-REGISTRATION] Test data blocked on field: ${fieldName}`)
      toast.error('⚠️ Datos de prueba detectados. Campo limpiado automáticamente.')
      return '' // Return empty value instead of test data
    }
    
    return value
  }

  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        const response = await fetch('/api/public/subscription-plans')
        if (response.ok) {
          const plans = await response.json()
          setSubscriptionPlans(plans.sort((a: SubscriptionPlan, b: SubscriptionPlan) => a.sortOrder - b.sortOrder))
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error)
      } finally {
        setPlansLoading(false)
      }
    }

    fetchSubscriptionPlans()
  }, [])

  const updateRegistrationData = (field: keyof RegistrationData, value: string) => {
    const cleanValue = checkForContamination(value, `streamlined-${field}`)
    
    setRegistrationData(prev => ({
      ...prev,
      [field]: cleanValue
    }))
    
    if (error) setError('')
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {}
    
    if (!registrationData.churchName.trim()) errors['churchName'] = true
    if (!registrationData.firstName.trim()) errors['firstName'] = true
    if (!registrationData.lastName.trim()) errors['lastName'] = true
    if (!registrationData.email.trim()) errors['email'] = true
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/auth/request-church-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchName: registrationData.churchName,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          subscriptionPlan: registrationData.subscriptionPlan
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud')
      }

      setSuccess('¡Solicitud enviada exitosamente! Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas con tus credenciales de acceso.')
      toast.success('¡Solicitud enviada exitosamente!')
      
      // Reset form
      setRegistrationData({
        churchName: '',
        firstName: '',
        lastName: '',
        email: '',
        subscriptionPlan: 'BÁSICO'
      })

    } catch (error: any) {
      setError(error.message || 'Error en la solicitud')
      toast.error(error.message || 'Error en la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlan = subscriptionPlans.find(plan => plan.name === registrationData.subscriptionPlan)

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-900">¡Solicitud Enviada!</CardTitle>
              <CardDescription>
                Hemos recibido tu solicitud de cuenta para iglesia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 text-center">
                  {success}
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Próximos Pasos:</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Nuestro equipo revisará tu solicitud</li>
                  <li>• Recibirás un email con credenciales temporales</li>
                  <li>• Podrás cambiar tu contraseña al iniciar sesión</li>
                  <li>• Comenzarás con 14 días de prueba gratuita</li>
                </ul>
              </div>

              <div className="text-center">
                <Link href="/auth/signin" className="text-blue-600 hover:underline">
                  ¿Ya tienes credenciales? Inicia sesión aquí
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-streamlined-registration="true">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="xl" className="text-gray-900" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Solicitar Cuenta para Iglesia</CardTitle>
            <CardDescription>
              Completa el formulario y nuestro equipo te proporcionará credenciales de acceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="streamlined-church-name">Nombre de la Iglesia</Label>
                <Input
                  id="streamlined-church-name"
                  name="streamlined-church-name-unique"
                  value={registrationData.churchName}
                  onChange={(e) => updateRegistrationData('churchName', e.target.value)}
                  required
                  placeholder="Iglesia Central"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="streamlined-registration-form"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-autocomplete-type="disabled"
                  className={validationErrors['churchName'] ? 'border-red-500' : ''}
                />
                {validationErrors['churchName'] && (
                  <p className="text-sm text-red-500">El nombre de la iglesia es requerido</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="streamlined-first-name">Nombre del Contacto</Label>
                  <Input
                    id="streamlined-first-name"
                    name="streamlined-first-name-unique"
                    value={registrationData.firstName}
                    onChange={(e) => updateRegistrationData('firstName', e.target.value)}
                    required
                    placeholder="Juan"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="streamlined-registration-form"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    className={validationErrors['firstName'] ? 'border-red-500' : ''}
                  />
                  {validationErrors['firstName'] && (
                    <p className="text-sm text-red-500">El nombre es requerido</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="streamlined-last-name">Apellido</Label>
                  <Input
                    id="streamlined-last-name"
                    name="streamlined-last-name-unique"
                    value={registrationData.lastName}
                    onChange={(e) => updateRegistrationData('lastName', e.target.value)}
                    required
                    placeholder="Pérez"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="streamlined-registration-form"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    className={validationErrors['lastName'] ? 'border-red-500' : ''}
                  />
                  {validationErrors['lastName'] && (
                    <p className="text-sm text-red-500">El apellido es requerido</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="streamlined-email">Email de Contacto</Label>
                <Input
                  id="streamlined-email"
                  name="streamlined-email-unique"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => updateRegistrationData('email', e.target.value)}
                  required
                  placeholder="pastor@iglesia.com"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="streamlined-registration-form"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  data-autocomplete-type="disabled"
                  className={validationErrors['email'] ? 'border-red-500' : ''}
                />
                {validationErrors['email'] && (
                  <p className="text-sm text-red-500">Email válido es requerido</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Plan de Suscripción Deseado</Label>
                {plansLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-500">Cargando planes...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Select
                      value={registrationData.subscriptionPlan}
                      onValueChange={(value) => updateRegistrationData('subscriptionPlan', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionPlans.map((plan) => {
                          const IconComponent = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || Crown
                          return (
                            <SelectItem key={plan.id} value={plan.name}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                <div>
                                  <span className="font-medium">{plan.displayName}</span>
                                  <span className="text-sm text-gray-500 ml-2">
                                    ${plan.priceMonthly} USD/mes
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>

                    {selectedPlan && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {(() => {
                              const IconComponent = PLAN_ICONS[selectedPlan.name as keyof typeof PLAN_ICONS] || Crown
                              return <IconComponent className="h-5 w-5 text-blue-600" />
                            })()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-blue-900">
                                {selectedPlan.displayName}
                              </h3>
                              <div className="text-right">
                                <div className="text-lg font-bold text-blue-600">
                                  ${selectedPlan.priceMonthly} USD/mes
                                </div>
                                <div className="text-sm text-blue-500 whitespace-nowrap">
                                  ${selectedPlan.priceYearly} USD/año ({(() => {
                                    const monthly = parseFloat(selectedPlan.priceMonthly.replace(/[^0-9.]/g, ''))
                                    const yearly = parseFloat(selectedPlan.priceYearly.replace(/[^0-9.]/g, ''))
                                    const savings = Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
                                    return `${savings}% ahorro`
                                  })()})
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-blue-700 mb-3">{selectedPlan.description}</p>
                            <div className="flex items-center gap-4 text-sm text-blue-600">
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span>{selectedPlan.maxChurches} iglesia{selectedPlan.maxChurches !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{selectedPlan.maxMembers} miembros</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Settings className="h-4 w-4" />
                                <span>{selectedPlan.maxUsers} usuario{selectedPlan.maxUsers !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                      ⭐ Todos los planes incluyen 14 días de prueba gratuita<br />
                      🔑 Las credenciales serán proporcionadas por nuestro equipo<br />
                      💰 Facturación le llegará al correo electrónico
                    </div>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando Solicitud...
                  </>
                ) : (
                  <>
                    <Church className="mr-2 h-4 w-4" />
                    Solicitar Cuenta
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes credenciales?{' '}
                  <Link href="/auth/signin" className="text-blue-600 hover:underline">
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
