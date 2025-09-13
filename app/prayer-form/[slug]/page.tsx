
import { notFound } from 'next/navigation'
import { PublicPrayerForm } from '@/components/prayer-wall/PublicPrayerForm'

interface PrayerFormPageProps {
  params: {
    slug: string
  }
}

async function getFormData(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/prayer-forms/public/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching form data:', error)
    return null
  }
}

export default async function PrayerFormPage({ params }: PrayerFormPageProps) {
  const data = await getFormData(params.slug)
  
  if (!data?.form) {
    notFound()
  }

  const { form } = data

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <PublicPrayerForm 
          formData={form}
        />
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PrayerFormPageProps) {
  const data = await getFormData(params.slug)
  
  if (!data?.form) {
    return {
      title: 'Formulario de Oración no encontrado'
    }
  }

  const { form } = data

  return {
    title: `${form.name} - ${form.church.name}`,
    description: form.description || 'Comparte tu petición de oración con nosotros',
    openGraph: {
      title: `${form.name} - ${form.church.name}`,
      description: form.description || 'Comparte tu petición de oración con nosotros',
      type: 'website'
    }
  }
}
