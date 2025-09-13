
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Building2 } from 'lucide-react'

interface CreateChurchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateChurchDialog({ open, onOpenChange, onSuccess }: CreateChurchDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    founded: '',
    description: '',
    adminUser: {
      name: '',
      email: '',
      password: 'cambiarpassword123',
      phone: ''
    }
  })

  // FINAL-FIX: Ultra-aggressive autofill prevention for dialog
  useEffect(() => {
    if (open) {
      const cleanFormData = {
        name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        founded: '',
        description: '',
        adminUser: {
          name: '',
          email: '',
          password: 'cambiarpassword123',
          phone: ''
        }
      }
      setFormData(cleanFormData)
      
      // Ultra-aggressive dialog field clearing
      const aggressiveDialogClearing = () => {
        const dialog = document.querySelector('[role="dialog"]')
        if (dialog) {
          const adminInputs = dialog.querySelectorAll('input[name*="adminUser"]')
          adminInputs.forEach((input: any) => {
            if (input.value && (
              input.value.includes('admin@khesed-tek.com') || // Only confirmed non-legit
              input.value.includes('test@example.com') ||
              input.value.includes('demo@demo.com')
              // REMOVED: soporte@khesed-tek.com - LEGITIMATE support email
              // REMOVED: Tony Pilarte - REAL CLIENT
              // REMOVED: Nelson Castro - PLATFORM OWNER
            )) {
              console.warn(`[FINAL-FIX DIALOG] Blocked test data: ${input.value}`)
              input.value = ''
              input.setAttribute('autocomplete', 'new-password')
              input.dispatchEvent(new Event('input', { bubbles: true }))
            }
          })
        }
      }

      // Multiple cleanup attempts
      setTimeout(() => { setFormData(cleanFormData); aggressiveDialogClearing(); }, 50)
      setTimeout(() => { setFormData(cleanFormData); aggressiveDialogClearing(); }, 150)
      setTimeout(() => { setFormData(cleanFormData); aggressiveDialogClearing(); }, 300)
      
      // Continuous monitoring for first 3 seconds
      const interval = setInterval(aggressiveDialogClearing, 100)
      setTimeout(() => clearInterval(interval), 3000)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/platform/churches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          website: '',
          founded: '',
          description: '',
          adminUser: {
            name: '',
            email: '',
            password: 'cambiarpassword123',
            phone: ''
          }
        })
      } else {
        const error = await response.json()
        alert(error.message || 'Error al crear la iglesia')
      }
    } catch (error) {
      console.error('Error creating church:', error)
      alert('Error al crear la iglesia')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // EMERGENCY CORRECTION: Only block ACTUAL test data
    const actualTestDataValues = [
      'admin@khesed-tek.com', // Only confirmed non-legit
      'test@example.com',
      'demo@demo.com'
      // REMOVED: soporte@khesed-tek.com - LEGITIMATE support email
      // REMOVED: nelson.castro@khesedtek.com - NELSON'S LEGITIMATE EMAIL
      // REMOVED: Nelson Castro - PLATFORM OWNER/SUPER_ADMIN
      // REMOVED: Tony Pilarte - REAL CLIENT
    ]
    
    const isTestData = actualTestDataValues.some(testValue => 
      value.toLowerCase().includes(testValue.toLowerCase())
    )
    
    if (isTestData && field.includes('adminUser')) {
      console.warn(`[SECURITY] Blocked test data injection in dialog: ${value}`)
      return // Block the update for admin fields only
    }
    
    if (field.startsWith('adminUser.')) {
      const adminField = field.replace('adminUser.', '')
      setFormData(prev => ({
        ...prev,
        adminUser: {
          ...prev.adminUser,
          [adminField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Nueva Iglesia
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la Iglesia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Información de la Iglesia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre de la Iglesia *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ej: Iglesia Central"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Institucional *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@iglesia.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Dirección completa de la iglesia"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <Label htmlFor="website">Sitio Web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.iglesia.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="founded">Fecha de Fundación</Label>
              <Input
                id="founded"
                type="date"
                value={formData.founded}
                onChange={(e) => handleInputChange('founded', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción de la iglesia, misión, visión..."
                rows={3}
              />
            </div>
          </div>

          {/* Información del Administrador */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Administrador de la Iglesia</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminName">Nombre Completo *</Label>
                <Input
                  id="adminName"
                  name="admin-name-dialog"
                  value={formData.adminUser.name}
                  onChange={(e) => handleInputChange('adminUser.name', e.target.value)}
                  placeholder="María González"
                  autoComplete="off"
                  data-form="church-creation"
                  required
                />
              </div>

              <div>
                <Label htmlFor="adminEmail">Email del Admin *</Label>
                <Input
                  id="adminEmail"
                  name="admin-email-dialog"
                  type="email"
                  value={formData.adminUser.email}
                  onChange={(e) => handleInputChange('adminUser.email', e.target.value)}
                  placeholder="admin@iglesia.com"
                  autoComplete="off"
                  data-form="church-creation"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="adminPhone">Teléfono del Admin</Label>
                <Input
                  id="adminPhone"
                  name="admin-phone-dialog"
                  value={formData.adminUser.phone}
                  onChange={(e) => handleInputChange('adminUser.phone', e.target.value)}
                  placeholder="+57 300 123 4567"
                  autoComplete="off"
                  data-form="church-creation"
                />
              </div>

              <div>
                <Label htmlFor="adminPassword">Contraseña Temporal</Label>
                <Input
                  id="adminPassword"
                  value={formData.adminUser.password}
                  onChange={(e) => handleInputChange('adminUser.password', e.target.value)}
                  placeholder="Contraseña temporal"
                />
                <p className="text-xs text-gray-500 mt-1">
                  El administrador deberá cambiar esta contraseña en su primer acceso
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Iglesia'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
