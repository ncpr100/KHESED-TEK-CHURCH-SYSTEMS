
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

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    churchName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    subscriptionPlan: 'BÁSICO', // Default to basic plan
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)
  
  const router = useRouter()

  // Icon mapping for plans (same as SUPER_ADMIN)
  const PLAN_ICONS = {
    BÁSICO: Crown,
    PROFESIONAL: Zap,
    ENTERPRISE: Package,
  }

  // Fetch subscription plans from database (same source as SUPER_ADMIN via public API)
  const fetchSubscriptionPlans = async () => {
    try {
      setPlansLoading(true)
      const response = await fetch('/api/public/subscription-plans')
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans')
      }
      
      const data = await response.json()
      // Public API already filters for active plans, no need to filter again
      setSubscriptionPlans(data)
      console.log('📋 Loaded subscription plans for registration:', data.length)
      
      // Set default to first active plan if available
      if (data.length > 0 && !formData.subscriptionPlan) {
        setFormData(prev => ({ ...prev, subscriptionPlan: data[0].name }))
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error)
      setError('Error cargando planes de suscripción')
    } finally {
      setPlansLoading(false)
    }
  }

  // Load plans on component mount
  useEffect(() => {
    fetchSubscriptionPlans()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validations
    if (!formData.churchName.trim()) {
      setError('El nombre de la iglesia es requerido')
      setIsLoading(false)
      return
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Nombre y apellido son requeridos')
      setIsLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('El email es requerido')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchName: formData.churchName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          subscriptionPlan: formData.subscriptionPlan,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro')
      }

      // Automatically sign in the user after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.ok) {
        router.push('/dashboard')
      } else {
        setError('Registro exitoso, pero error al iniciar sesión. Intenta iniciar sesión manualmente.')
      }
    } catch (error: any) {
      setError(error.message || 'Error en el registro')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
              <div className="space-y-2">
                <Label htmlFor="churchName">Nombre de la Iglesia</Label>
                <Input
                  id="churchName"
                  value={formData.churchName}
                  onChange={(e) => handleChange('churchName', e.target.value)}
                  required
                  placeholder="Iglesia Central"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                    placeholder="Juan"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                    placeholder="Pérez"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="admin@iglesia.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionPlan">Plan de Suscripción</Label>
                {plansLoading ? (
                  <div className="flex items-center justify-center p-4 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">Cargando planes...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.subscriptionPlan}
                    onValueChange={(value) => handleChange('subscriptionPlan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan" />
                    </SelectTrigger>
                    <SelectContent className="min-w-[400px]">
                      {subscriptionPlans.map((plan) => {
                        const IconComponent = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || Package
                        return (
                          <SelectItem key={plan.id} value={plan.name}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-3">
                                <IconComponent className="h-5 w-5 text-blue-500" />
                                <div className="flex flex-col">
                                  <span className="font-medium text-base">{plan.displayName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {plan.maxMembers} miembros • {plan.maxUsers} usuarios
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-blue-600">${plan.priceMonthly}</div>
                                <div className="text-xs text-blue-500">USD/mes</div>
                              </div>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✨ Todos los planes incluyen 14 días de prueba gratuita</div>
                  <div className="flex items-center gap-1 text-blue-600">
                    🇺🇸 <span className="font-medium">Precios en USD</span> - Facturación manual por administrador
                  </div>
                </div>
              </div>

              {/* Selected Plan Preview Card - Synced with SUPER_ADMIN data */}
              {!plansLoading && formData.subscriptionPlan && (
                <div className="mt-4">
                  {(() => {
                    const selectedPlan = subscriptionPlans.find(p => p.name === formData.subscriptionPlan)
                    if (!selectedPlan) return null
                    
                    const IconComponent = PLAN_ICONS[selectedPlan.name as keyof typeof PLAN_ICONS] || Package
                    
                    return (
                      <Card className="border-blue-200 bg-blue-50/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-5 w-5 text-blue-600" />
                              <CardTitle className="text-lg text-blue-700">{selectedPlan.displayName}</CardTitle>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">
                                ${selectedPlan.priceMonthly} USD/mes
                              </div>
                              {selectedPlan.priceYearly && (
                                <div className="text-sm text-blue-600 whitespace-nowrap">
                                  ${selectedPlan.priceYearly} USD/año ({(() => {
                                    const monthly = parseFloat(selectedPlan.priceMonthly.replace(/[^0-9.]/g, ''))
                                    const yearly = parseFloat(selectedPlan.priceYearly.replace(/[^0-9.]/g, ''))
                                    const savings = Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100)
                                    return `${savings}% ahorro`
                                  })()})
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-gray-700 mb-3">{selectedPlan.description}</p>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-blue-500" />
                              <span className="text-xs">
                                {selectedPlan.maxChurches} iglesia{selectedPlan.maxChurches > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-xs">{selectedPlan.maxMembers} miembros</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings className="h-4 w-4 text-blue-500" />
                              <span className="text-xs">{selectedPlan.maxUsers} usuarios</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })()}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear Cuenta
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">¿Ya tienes una cuenta? </span>
                <Link
                  href="/auth/signin"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Inicia sesión aquí
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
