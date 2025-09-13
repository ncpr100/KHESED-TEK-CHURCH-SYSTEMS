

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface DonationFormProps {
  categories: Array<{ id: string; name: string }>
  paymentMethods: Array<{ id: string; name: string; isDigital: boolean }>
  onSuccess: () => void
}

interface Member {
  id: string
  firstName: string
  lastName: string
  email?: string
}

export function DonationForm({ categories, paymentMethods, onSuccess }: DonationFormProps) {
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  
  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    memberId: '',
    categoryId: '',
    paymentMethodId: '',
    reference: '',
    notes: '',
    isAnonymous: false,
    donationDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const response = await fetch('/api/members')
      if (!response.ok) throw new Error('Error fetching members')
      const data = await response.json()
      setMembers(data.members || data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleInputChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Si selecciona un miembro, limpiar datos del donante manual
    if (name === 'memberId' && value) {
      setFormData(prev => ({
        ...prev,
        donorName: '',
        donorEmail: '',
        donorPhone: ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('El monto debe ser mayor a cero')
      return
    }

    if (!formData.categoryId) {
      toast.error('Debe seleccionar una categoría')
      return
    }

    if (!formData.paymentMethodId) {
      toast.error('Debe seleccionar un método de pago')
      return
    }

    if (!formData.isAnonymous && !formData.memberId && !formData.donorName) {
      toast.error('Debe proporcionar un nombre del donante o seleccionar un miembro')
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        amount: parseFloat(formData.amount),
        donorName: formData.isAnonymous ? null : formData.donorName,
        donorEmail: formData.isAnonymous ? null : formData.donorEmail,
        donorPhone: formData.isAnonymous ? null : formData.donorPhone,
        memberId: formData.isAnonymous ? null : (formData.memberId === 'none' ? null : formData.memberId || null),
        categoryId: formData.categoryId,
        paymentMethodId: formData.paymentMethodId,
        reference: formData.reference,
        notes: formData.notes,
        isAnonymous: formData.isAnonymous,
        donationDate: formData.donationDate
      }

      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear la donación')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Error al registrar la donación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Monto *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="donationDate">Fecha de Donación *</Label>
          <Input
            id="donationDate"
            type="date"
            value={formData.donationDate}
            onChange={(e) => handleInputChange('donationDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría *</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => handleInputChange('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethodId">Método de Pago *</Label>
          <Select
            value={formData.paymentMethodId}
            onValueChange={(value) => handleInputChange('paymentMethodId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione método de pago" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name} {method.isDigital && '(Digital)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isAnonymous"
          checked={formData.isAnonymous}
          onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
        />
        <Label htmlFor="isAnonymous">Donación Anónima</Label>
      </div>

      {!formData.isAnonymous && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Donante</CardTitle>
            <CardDescription>
              Seleccione un miembro registrado o ingrese los datos manualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="memberId">Miembro Registrado (Opcional)</Label>
              <Select
                value={formData.memberId}
                onValueChange={(value) => handleInputChange('memberId', value)}
                disabled={loadingMembers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar miembro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin miembro asociado</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                      {member.email && ` (${member.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!formData.memberId && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="donorName">Nombre Completo</Label>
                  <Input
                    id="donorName"
                    type="text"
                    placeholder="Nombre del donante"
                    value={formData.donorName}
                    onChange={(e) => handleInputChange('donorName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorEmail">Email</Label>
                  <Input
                    id="donorEmail"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={formData.donorEmail}
                    onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="donorPhone">Teléfono</Label>
                  <Input
                    id="donorPhone"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={formData.donorPhone}
                    onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <Label htmlFor="reference">Referencia de Pago (Opcional)</Label>
        <Input
          id="reference"
          type="text"
          placeholder="Número de transacción, recibo, etc."
          value={formData.reference}
          onChange={(e) => handleInputChange('reference', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Comentarios o información adicional sobre la donación"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Donación'}
        </Button>
      </div>
    </form>
  )
}

