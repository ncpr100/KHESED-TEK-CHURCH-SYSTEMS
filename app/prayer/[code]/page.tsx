
import { notFound } from 'next/navigation'
import { PublicPrayerForm } from '@/components/prayer-wall/PublicPrayerForm'

interface PrayerQRPageProps {
  params: {
    code: string
  }
}

async function getQRCodeData(code: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/prayer-qr-codes/public/${code}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching QR code data:', error)
    return null
  }
}

export default async function PrayerQRPage({ params }: PrayerQRPageProps) {
  const data = await getQRCodeData(params.code)
  
  if (!data?.qrCode) {
    notFound()
  }

  const { qrCode } = data

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PublicPrayerForm 
          formData={qrCode.form}
          qrCodeId={qrCode.id}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PrayerQRPageProps) {
  const data = await getQRCodeData(params.code)
  
  if (!data?.qrCode) {
    return {
      title: 'Formulario de Oración no encontrado'
    }
  }

  const { qrCode } = data

  return {
    title: `${qrCode.form.name} - ${qrCode.form.church.name}`,
    description: qrCode.form.description || 'Comparte tu petición de oración con nosotros',
    openGraph: {
      title: `${qrCode.form.name} - ${qrCode.form.church.name}`,
      description: qrCode.form.description || 'Comparte tu petición de oración con nosotros',
      type: 'website'
    }
  }
}
