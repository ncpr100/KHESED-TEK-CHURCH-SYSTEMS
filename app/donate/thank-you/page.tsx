
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, XCircle, Home, Receipt, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentStatus {
  paymentId: string
  reference: string
  status: string
  amount: number
  currency: string
  donorName: string
  donorEmail: string
  churchName: string
  categoryName?: string
  createdAt: string
  completedAt?: string
  hasDonation: boolean
}

export default function ThankYouPage() {
  const searchParams = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const paymentId = searchParams?.get('payment_id') || searchParams?.get('paymentId')
  const reference = searchParams?.get('reference')
  const churchId = searchParams?.get('church')

  useEffect(() => {
    if (paymentId || reference) {
      checkPaymentStatus()
    } else {
      setError('No se encontró información del pago')
      setLoading(false)
    }
  }, [paymentId, reference])

  const checkPaymentStatus = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (paymentId) params.append('paymentId', paymentId)
      if (reference) params.append('reference', reference)

      const response = await fetch(`/api/online-payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPaymentStatus(data)
      } else {
        setError(data.error || 'Error verificando el estado del pago')
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          title: '¡Donación Exitosa!',
          message: 'Tu donación se ha procesado correctamente. Gracias por tu generosidad.'
        }
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          title: 'Pago en Proceso',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.'
        }
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          title: 'Pago Fallido',
          message: 'No pudimos procesar tu pago. Por favor, intenta nuevamente.'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          title: 'Pago Cancelado',
          message: 'El pago fue cancelado. Puedes intentar nuevamente cuando gustes.'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          title: 'Estado Desconocido',
          message: 'Verificando el estado de tu pago...'
        }
    }
  }

  const handleShare = async () => {
    if (navigator.share && paymentStatus) {
      try {
        await navigator.share({
          title: `Donación a ${paymentStatus.churchName}`,
          text: `Acabo de realizar una donación de ${formatCurrency(paymentStatus.amount)} a ${paymentStatus.churchName}`,
          url: window.location.origin + `/donate/${churchId}`
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      toast.success('URL copiada al portapapeles')
      navigator.clipboard.writeText(window.location.origin + `/donate/${churchId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verificando estado del pago...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(paymentStatus.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <Card className="mb-6">
            <CardContent className="text-center p-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusInfo.bgColor} mb-4`}>
                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{statusInfo.title}</h1>
              <p className="text-gray-600 mb-6">{statusInfo.message}</p>
              
              {paymentStatus.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700">
                    📧 Se ha enviado un recibo a <strong>{paymentStatus.donorEmail}</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Detalles de la Donación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Referencia:</span>
                <span className="font-medium">{paymentStatus.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium text-lg">
                  {formatCurrency(paymentStatus.amount, paymentStatus.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Iglesia:</span>
                <span className="font-medium">{paymentStatus.churchName}</span>
              </div>
              {paymentStatus.categoryName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoría:</span>
                  <span className="font-medium">{paymentStatus.categoryName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Donante:</span>
                <span className="font-medium">{paymentStatus.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">
                  {formatDate(paymentStatus.completedAt || paymentStatus.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${statusInfo.color}`}>
                  {paymentStatus.status === 'completed' ? 'Completado' :
                   paymentStatus.status === 'pending' ? 'Pendiente' :
                   paymentStatus.status === 'failed' ? 'Fallido' : 'Cancelado'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.href = `/donate/${churchId}`}
              variant="outline"
              className="w-full"
            >
              Nueva Donación
            </Button>
            
            <Button 
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="default"
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Button>
          </div>

          {/* Additional Info */}
          {paymentStatus.status === 'completed' && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Tu impacto</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Gracias a tu donación de <strong>{formatCurrency(paymentStatus.amount)}</strong>, 
                  estás contribuyendo directamente a los ministerios y programas que transforman 
                  vidas en nuestra comunidad.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💙 <strong>¡Tu generosidad marca la diferencia!</strong> 
                    Cada donación nos ayuda a continuar nuestro trabajo de servicio y amor en la comunidad.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Retry for failed payments */}
          {paymentStatus.status === 'failed' && (
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Si el problema persiste, puedes contactarnos o intentar con otro método de pago.
                </p>
                <Button 
                  onClick={() => window.location.href = `/donate/${churchId}`}
                  className="w-full"
                >
                  Intentar Nuevamente
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
