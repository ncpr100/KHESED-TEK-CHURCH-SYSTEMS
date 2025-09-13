

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Building,
  Settings,
  Package,
  Crown,
  Zap
} from 'lucide-react'
// Removed formatPrice import - using direct string display

interface SubscriptionPlan {
  id: string
  name: string
  displayName: string
  description: string | null
  priceMonthly: string // Changed to string for direct input/display
  priceYearly: string | null // Changed to string for direct input/display
  maxChurches: number
  maxMembers: number
  maxUsers: number
  features: string[]
  isActive: boolean
  sortOrder: number
}

interface PlanFeature {
  id: string
  key: string
  name: string
  description: string | null
  category: string
  isActive: boolean
}

interface SubscriptionAddon {
  id: string
  key: string
  name: string
  description: string | null
  priceMonthly: string // Changed to string for direct input/display
  priceYearly: string | null // Changed to string for direct input/display
  billingType: string
  pricePerUnit: string | null // Changed to string for direct input/display
  unit: string | null
  isActive: boolean
}

// formatPrice now imported from @/lib/currency for dynamic currency support

const PLAN_ICONS = {
  BÁSICO: Crown,
  PROFESIONAL: Zap,
  ENTERPRISE: Package,
}

export function SubscriptionManagement() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('plans')
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [features, setFeatures] = useState<PlanFeature[]>([])
  const [addons, setAddons] = useState<SubscriptionAddon[]>([])
  const [loading, setLoading] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [editingFeature, setEditingFeature] = useState<PlanFeature | null>(null)
  const [editingAddon, setEditingAddon] = useState<SubscriptionAddon | null>(null)
  const [platformCurrency, setPlatformCurrency] = useState('USD')

  useEffect(() => {
    fetchData()
  }, [])

  // Refetch data when platform currency changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Check if platform currency has changed
      fetch('/api/platform/settings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`API Error: ${res.status}`)
          return res.json()
        })
        .then(data => {
          if (data.currency !== platformCurrency) {
            console.log('🔄 Currency changed, refreshing subscription data...')
            fetchData()
          }
        })
        .catch(console.error)
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [platformCurrency])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [plansRes, featuresRes, addonsRes, settingsRes] = await Promise.all([
        fetch('/api/platform/subscription-plans'),
        fetch('/api/platform/plan-features'),
        fetch('/api/platform/subscription-addons'),
        fetch('/api/platform/settings', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ])

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setPlans(plansData)
      }

      if (featuresRes.ok) {
        const featuresData = await featuresRes.json()
        setFeatures(featuresData)
      }

      if (addonsRes.ok) {
        const addonsData = await addonsRes.json()
        setAddons(addonsData)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setPlatformCurrency(settingsData.currency || 'COP')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      const method = editingPlan ? 'PUT' : 'POST'
      const url = '/api/platform/subscription-plans'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        toast.success(`Plan ${editingPlan ? 'actualizado' : 'creado'} exitosamente`)
        setEditingPlan(null)
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al guardar el plan')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      toast.error('Error de conexión')
    }
  }

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este plan?')) return

    try {
      const response = await fetch(`/api/platform/subscription-plans?id=${planId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Plan eliminado exitosamente')
        fetchData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Error al eliminar el plan')
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('Error de conexión')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gestión de Suscripciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="plans">Planes</TabsTrigger>
              <TabsTrigger value="features">Características</TabsTrigger>
              <TabsTrigger value="addons">Complementos</TabsTrigger>
            </TabsList>

            {/* Plans Tab */}
            <TabsContent value="plans" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Planes de Suscripción</h3>
                <Button onClick={() => setEditingPlan({} as SubscriptionPlan)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Plan
                </Button>
              </div>

              {/* Controlled Dialog for Plan Creation/Editing */}
              <Dialog open={editingPlan !== null} onOpenChange={(open) => !open && setEditingPlan(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPlan?.id ? 'Editar Plan' : 'Nuevo Plan'}
                    </DialogTitle>
                  </DialogHeader>
                  <PlanForm
                    plan={editingPlan}
                    features={features}
                    currency={platformCurrency}
                    onSave={handleSavePlan}
                    onCancel={() => setEditingPlan(null)}
                  />
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-3">
                {plans.map((plan) => {
                  const IconComponent = PLAN_ICONS[plan.name as keyof typeof PLAN_ICONS] || Package
                  return (
                    <Card key={plan.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                          </div>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          ${plan.priceMonthly}/mes
                        </div>
                        {plan.priceYearly && (
                          <div className="text-sm text-gray-600">
                            ${plan.priceYearly}/año
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-gray-600">{plan.description}</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>Hasta {plan.maxChurches} iglesia{plan.maxChurches > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Hasta {plan.maxMembers} miembros</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span>Hasta {plan.maxUsers} usuarios</span>
                          </div>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingPlan(plan)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Características del Plan</h3>
                <Button onClick={() => setEditingFeature({} as PlanFeature)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Característica
                </Button>
              </div>

              {/* Controlled Dialog for Feature Creation/Editing */}
              <Dialog open={editingFeature !== null} onOpenChange={(open) => !open && setEditingFeature(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingFeature?.id ? 'Editar Característica' : 'Nueva Característica'}
                    </DialogTitle>
                  </DialogHeader>
                  <FeatureForm
                    feature={editingFeature}
                    onSave={async (data) => {
                      // Handle feature save
                      const method = editingFeature?.id ? 'PUT' : 'POST'
                      const response = await fetch('/api/platform/plan-features', {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      })
                      
                      if (response.ok) {
                        toast.success(`Característica ${editingFeature?.id ? 'actualizada' : 'creada'} exitosamente`)
                        setEditingFeature(null)
                        fetchData()
                      }
                    }}
                    onCancel={() => setEditingFeature(null)}
                  />
                </DialogContent>
              </Dialog>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Clave</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Categoría</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {features.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-mono">{feature.key}</TableCell>
                          <TableCell>{feature.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{feature.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={feature.isActive ? "default" : "secondary"}>
                              {feature.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingFeature(feature)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  if (confirm('¿Eliminar esta característica?')) {
                                    const response = await fetch(`/api/platform/plan-features?id=${feature.id}`, {
                                      method: 'DELETE'
                                    })
                                    if (response.ok) {
                                      toast.success('Característica eliminada')
                                      fetchData()
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addons Tab */}
            <TabsContent value="addons" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Complementos de Suscripción</h3>
                <Button onClick={() => setEditingAddon({} as SubscriptionAddon)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Complemento
                </Button>
              </div>

              {/* Controlled Dialog for Addon Creation/Editing */}
              <Dialog open={editingAddon !== null} onOpenChange={(open) => !open && setEditingAddon(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddon?.id ? 'Editar Complemento' : 'Nuevo Complemento'}
                    </DialogTitle>
                  </DialogHeader>
                  <AddonForm
                    addon={editingAddon}
                    currency={platformCurrency}
                    onSave={async (data) => {
                      // Handle addon save
                      const method = editingAddon?.id ? 'PUT' : 'POST'
                      const response = await fetch('/api/platform/subscription-addons', {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      })
                      
                      if (response.ok) {
                        toast.success(`Complemento ${editingAddon?.id ? 'actualizado' : 'creado'} exitosamente`)
                        setEditingAddon(null)
                        fetchData()
                      }
                    }}
                    onCancel={() => setEditingAddon(null)}
                  />
                </DialogContent>
              </Dialog>

              <div className="grid gap-4 md:grid-cols-2">
                {addons.map((addon) => (
                  <Card key={addon.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{addon.name}</CardTitle>
                        <Badge variant={addon.isActive ? "default" : "secondary"}>
                          {addon.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {addon.billingType === 'PER_USE' ? (
                          `$${addon.pricePerUnit || '0'} por ${addon.unit}`
                        ) : (
                          `$${addon.priceMonthly}/mes`
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{addon.description}</p>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditingAddon(addon)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={async () => {
                            if (confirm('¿Eliminar este complemento?')) {
                              const response = await fetch(`/api/platform/subscription-addons?id=${addon.id}`, {
                                method: 'DELETE'
                              })
                              if (response.ok) {
                                toast.success('Complemento eliminado')
                                fetchData()
                              }
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Plan Form Component
function PlanForm({ 
  plan, 
  features, 
  currency,
  onSave, 
  onCancel 
}: {
  plan: SubscriptionPlan | null
  features: PlanFeature[]
  currency: string
  onSave: (data: Partial<SubscriptionPlan>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(() => {
    return {
      name: plan?.name || '',
      displayName: plan?.displayName || '',
      description: plan?.description || '',
      priceMonthly: plan?.priceMonthly || '',  // Direct string display
      priceYearly: plan?.priceYearly || '',    // Direct string display
      maxChurches: plan?.maxChurches || 1,
      maxMembers: plan?.maxMembers || 100,
      maxUsers: plan?.maxUsers || 5,
      features: plan?.features || [],
      isActive: plan?.isActive ?? true,
      sortOrder: plan?.sortOrder || 0
    }
  })

  // Update form data when plan changes
  useEffect(() => {
    if (plan) {
      setFormData(prev => ({
        ...prev,
        priceMonthly: plan.priceMonthly || '',  // Direct string display
        priceYearly: plan.priceYearly || '',    // Direct string display
      }))
    }
  }, [plan])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Nombre del Plan *</Label>
          <Select
            value={formData.name}
            onValueChange={(value) => setFormData({ ...formData, name: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BÁSICO">BÁSICO</SelectItem>
              <SelectItem value="PROFESIONAL">PROFESIONAL</SelectItem>
              <SelectItem value="ENTERPRISE">ENTERPRISE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Nombre de Visualización *</Label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="Ej: Plan Básico"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del plan..."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Precio Mensual *</Label>
          <Input
            type="text"
            value={formData.priceMonthly}
            onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
            placeholder="25,000"
          />
        </div>

        <div className="space-y-2">
          <Label>Precio Anual</Label>
          <Input
            type="text"
            value={formData.priceYearly}
            onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
            placeholder="270,000"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Máximo Iglesias</Label>
          <Input
            type="number"
            value={formData.maxChurches}
            onChange={(e) => setFormData({ ...formData, maxChurches: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Máximo Miembros</Label>
          <Input
            type="number"
            value={formData.maxMembers}
            onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Máximo Usuarios Admin</Label>
          <Input
            type="number"
            value={formData.maxUsers}
            onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Plan Activo</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => {
          // Pass string values directly - no conversion needed
          const saveData = {
            ...formData,
            id: plan?.id,
            priceMonthly: formData.priceMonthly, // Direct string save
            priceYearly: formData.priceYearly || null // Direct string save
          }
          onSave(saveData)
        }} className="flex-1">
          {plan ? 'Actualizar' : 'Crear'} Plan
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// Feature Form Component
function FeatureForm({ 
  feature, 
  onSave, 
  onCancel 
}: {
  feature: PlanFeature | null
  onSave: (data: Partial<PlanFeature>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    key: feature?.key || '',
    name: feature?.name || '',
    description: feature?.description || '',
    category: feature?.category || 'core',
    isActive: feature?.isActive ?? true
  })

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Clave *</Label>
          <Input
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="analytics"
          />
        </div>

        <div className="space-y-2">
          <Label>Categoría</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="core">Básico</SelectItem>
              <SelectItem value="advanced">Avanzado</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Analytics Avanzados"
        />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción de la característica..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Característica Activa</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave({ ...formData, id: feature?.id })} className="flex-1">
          {feature ? 'Actualizar' : 'Crear'} Característica
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

// Addon Form Component
function AddonForm({ 
  addon, 
  currency,
  onSave, 
  onCancel 
}: {
  addon: SubscriptionAddon | null
  currency: string
  onSave: (data: Partial<SubscriptionAddon>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(() => {
    return {
      key: addon?.key || '',
      name: addon?.name || '',
      description: addon?.description || '',
      priceMonthly: addon?.priceMonthly || '',     // Direct string display
      priceYearly: addon?.priceYearly || '',       // Direct string display
      billingType: addon?.billingType || 'MONTHLY',
      pricePerUnit: addon?.pricePerUnit || '',     // Direct string display
      unit: addon?.unit || '',
      isActive: addon?.isActive ?? true
    }
  })

  // Update form data when addon changes
  useEffect(() => {
    if (addon) {
      setFormData(prev => ({
        ...prev,
        priceMonthly: addon.priceMonthly || '',     // Direct string display
        priceYearly: addon.priceYearly || '',       // Direct string display
        pricePerUnit: addon.pricePerUnit || '',     // Direct string display
      }))
    }
  }, [addon])

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Clave *</Label>
          <Input
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            placeholder="sms_notifications"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo de Facturación</Label>
          <Select
            value={formData.billingType}
            onValueChange={(value) => setFormData({ ...formData, billingType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MONTHLY">Mensual</SelectItem>
              <SelectItem value="YEARLY">Anual</SelectItem>
              <SelectItem value="PER_USE">Por Uso</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Nombre *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Notificaciones SMS"
        />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción del complemento..."
        />
      </div>

      {formData.billingType === 'PER_USE' ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Precio por Unidad *</Label>
            <Input
              type="text"
              value={formData.pricePerUnit}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
              placeholder="1,500"
            />
          </div>
          <div className="space-y-2">
            <Label>Unidad *</Label>
            <Input
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="SMS"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Precio Mensual *</Label>
            <Input
              type="text"
              value={formData.priceMonthly}
              onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
              placeholder="25,000"
            />
          </div>
          {formData.billingType === 'YEARLY' && (
            <div className="space-y-2">
              <Label>Precio Anual</Label>
              <Input
                type="text"
                value={formData.priceYearly}
                onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                placeholder="270,000"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Complemento Activo</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => {
          // Pass string values directly - no conversion needed
          const saveData = {
            ...formData,
            id: addon?.id,
            priceMonthly: formData.priceMonthly,        // Direct string save
            priceYearly: formData.priceYearly || null,   // Direct string save
            pricePerUnit: formData.pricePerUnit || null  // Direct string save
          }
          onSave(saveData)
        }} className="flex-1">
          {addon ? 'Actualizar' : 'Crear'} Complemento
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

