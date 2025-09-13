
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Church, Loader2, Eye, EyeOff, Crown, Zap, Package, Building, Users, Settings } from 'lucide-react'
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
  password: string
  confirmPassword: string
  subscriptionPlan: string
}

export default function FreshSignupForm() {
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    churchName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'BÁSICO'
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({})
  
  const router = useRouter()

  // Icon mapping for plans
  const PLAN_ICONS = {
    BÁSICO: Crown,
    PROFESIONAL: Zap,
    EMPRESARIAL: Package,
  }

  // Anti-contamination measures built-in from the start
  useEffect(() => {
    const preventContamination = () => {
      const cleanFields = [
        'fresh-church-name-reg', 'fresh-first-name-reg', 'fresh-last-name-reg',
        'fresh-email-reg', 'fresh-password-reg', 'fresh-confirm-password-reg'
      ]
      
      cleanFields.forEach(fieldId => {
        const field = document.getElementById(fieldId) as HTMLInputElement
        if (field && field.value && (
          field.value.includes('admin@khesed-tek.com') || // Only confirmed non-legit
          field.value.includes('test@example.com') ||
          field.value.includes('demo@demo.com')
          // REMOVED: soporte@khesed-tek.com - LEGITIMATE support email
          // REMOVED: Nelson Castro - PLATFORM OWNER/SUPER_ADMIN
          // REMOVED: Tony Pilarte - REAL CLIENT
        )) {
          console.warn(`[FRESH-REGISTRATION] Test data blocked on field: ${fieldId}`)
          field.value = ''
          field.dispatchEvent(new Event('input', { bubbles: true }))
        }
      })
    }

    const interval = setInterval(preventContamination, 200)
    return () => clearInterval(interval)
  }, [])

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
    // EMERGENCY CORRECTION - Only blocking ACTUAL test data
    if (value.includes('admin@khesed-tek.com') || // Only confirmed non-legit
        value.includes('test@example.com') || 
        value.includes('demo@demo.com')) {
        // REMOVED: soporte@khesed-tek.com - LEGITIMATE support email
        // REMOVED: Nelson Castro - PLATFORM OWNER/SUPER_ADMIN
        // REMOVED: Tony Pilarte, Tony, Pilarte - all legitimate client data
      console.warn(`[FRESH-REGISTRATION] Blocked test data value: ${value}`)
      return // Don't update state with test values
    }
    
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
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
    if (!registrationData.password.trim()) errors['password'] = true
    if (registrationData.password !== registrationData.confirmPassword) {
      errors['confirmPassword'] = true
    }
    if (registrationData.password.length < 8) {
      errors['password'] = true
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchName: registrationData.churchName,
          firstName: registrationData.firstName,
          lastName: registrationData.lastName,
          email: registrationData.email,
          password: registrationData.password,
          subscriptionPlan: registrationData.subscriptionPlan
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      toast.success('¡Registro exitoso! Iniciando sesión...')

      // Auto login after successful registration
      const result = await signIn('credentials', {
        email: registrationData.email,
        password: registrationData.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('Registro exitoso, pero error al iniciar sesión. Intenta iniciar sesión manualmente.')
        router.push('/auth/signin')
      }
    } catch (error: any) {
      setError(error.message || 'Error en el registro')
      toast.error(error.message || 'Error en el registro')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedPlan = subscriptionPlans.find(plan => plan.name === registrationData.subscriptionPlan)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" data-fresh-registration="true">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Church className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Kḥesed-tek</h1>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Registra tu iglesia y comienza a gestionar tus miembros
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
                <Label htmlFor="fresh-church-name-reg">Nombre de la Iglesia</Label>
                <Input
                  id="fresh-church-name-reg"
                  name="fresh-church-name-registration-unique"
                  value={registrationData.churchName}
                  onChange={(e) => updateRegistrationData('churchName', e.target.value)}
                  required
                  placeholder="Iglesia Central"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="fresh-registration-form"
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
                  <Label htmlFor="fresh-first-name-reg">Nombre</Label>
                  <Input
                    id="fresh-first-name-reg"
                    name="fresh-first-name-registration-unique"
                    value={registrationData.firstName}
                    onChange={(e) => updateRegistrationData('firstName', e.target.value)}
                    required
                    placeholder="Juan"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="fresh-registration-form"
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
                  <Label htmlFor="fresh-last-name-reg">Apellido</Label>
                  <Input
                    id="fresh-last-name-reg"
                    name="fresh-last-name-registration-unique"
                    value={registrationData.lastName}
                    onChange={(e) => updateRegistrationData('lastName', e.target.value)}
                    required
                    placeholder="Pérez"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="fresh-registration-form"
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
                <Label htmlFor="fresh-email-reg">Email</Label>
                <Input
                  id="fresh-email-reg"
                  name="fresh-email-registration-unique"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => updateRegistrationData('email', e.target.value)}
                  required
                  placeholder="admin@iglesia.com"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-form="fresh-registration-form"
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
              
              <div className="space-y-2">
                <Label htmlFor="fresh-password-reg">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="fresh-password-reg"
                    name="fresh-password-registration-unique"
                    type={showPassword ? 'text' : 'password'}
                    value={registrationData.password}
                    onChange={(e) => updateRegistrationData('password', e.target.value)}
                    required
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="fresh-registration-form"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    className={validationErrors['password'] ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors['password'] && (
                  <p className="text-sm text-red-500">Contraseña de mínimo 8 caracteres requerida</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fresh-confirm-password-reg">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="fresh-confirm-password-reg"
                    name="fresh-confirm-password-registration-unique"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registrationData.confirmPassword}
                    onChange={(e) => updateRegistrationData('confirmPassword', e.target.value)}
                    required
                    placeholder="Repite la contraseña"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form="fresh-registration-form"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                    data-autocomplete-type="disabled"
                    className={validationErrors['confirmPassword'] ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors['confirmPassword'] && (
                  <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Plan de Suscripción</Label>
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
                      💰 Precios en USD - Facturación manual por administrador
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
                    Registrando...
                  </>
                ) : (
                  <>
                    <Church className="mr-2 h-4 w-4" />
                    Crear Cuenta
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{' '}
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
