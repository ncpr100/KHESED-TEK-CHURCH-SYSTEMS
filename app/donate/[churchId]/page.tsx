
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { PublicDonationForm } from '@/components/donations/public-donation-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Shield, Award } from 'lucide-react'

interface PublicDonatePageProps {
  params: {
    churchId: string
  }
  searchParams: {
    campaign?: string
  }
}

export default async function PublicDonatePage({ params, searchParams }: PublicDonatePageProps) {
  // Get church information
  const church = await prisma.church.findUnique({
    where: { 
      id: params.churchId,
      isActive: true 
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      address: true,
      phone: true,
      email: true,
      website: true
    }
  })

  if (!church) {
    notFound()
  }

  // Get donation categories
  const categories = await prisma.donationCategory.findMany({
    where: {
      churchId: params.churchId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      description: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Get campaign if specified
  let campaign = null
  if (searchParams.campaign) {
    campaign = await prisma.donationCampaign.findFirst({
      where: {
        slug: searchParams.campaign,
        churchId: params.churchId,
        isActive: true,
        isPublic: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        goalAmount: true,
        currentAmount: true,
        currency: true,
        coverImage: true,
        endDate: true,
        categoryId: true
      }
    })
  }

  // Get active campaigns
  const campaigns = await prisma.donationCampaign.findMany({
    where: {
      churchId: params.churchId,
      isActive: true,
      isPublic: true
    },
    select: {
      id: true,
      title: true,
      description: true,
      goalAmount: true,
      currentAmount: true,
      currency: true,
      slug: true,
      coverImage: true
    },
    take: 3,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {church.logo ? (
              <img 
                src={church.logo} 
                alt={church.name} 
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
            ) : (
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{church.name}</h1>
              <p className="text-gray-600">Donaciones Online</p>
            </div>
          </div>
          {church.description && (
            <p className="text-gray-700 max-w-2xl mx-auto">{church.description}</p>
          )}
        </div>

        {/* Campaign Section if specified */}
        {campaign && (
          <div className="mb-8">
            <Card className="overflow-hidden">
              {campaign.coverImage && (
                <div className="h-48 bg-cover bg-center" 
                     style={{ backgroundImage: `url(${campaign.coverImage})` }}>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                {campaign.description && (
                  <CardDescription className="text-base">
                    {campaign.description}
                  </CardDescription>
                )}
              </CardHeader>
              {campaign.goalAmount && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progreso</span>
                      <span>
                        ${campaign.currentAmount.toLocaleString()} de ${campaign.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                      {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% completado
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Realizar Donación
                </CardTitle>
                <CardDescription>
                  Tu generosidad hace la diferencia en nuestra comunidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PublicDonationForm
                  church={church}
                  categories={categories}
                  campaigns={campaigns}
                  preselectedCampaign={campaign}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Shield className="h-5 w-5" />
                  Donación Segura
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Encriptación SSL de 256 bits</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Procesamiento seguro PSE y Nequi</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p>Recibo automático por email</p>
                </div>
              </CardContent>
            </Card>

            {/* Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Award className="h-5 w-5" />
                  Tu Impacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-600">
                  Cada donación contribuye directamente a los ministerios y programas 
                  que transforman vidas en nuestra comunidad.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Programas Sociales</span>
                    <span className="font-medium">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ministerios</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infraestructura</span>
                    <span className="font-medium">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {church.address && (
                  <p className="text-gray-600">{church.address}</p>
                )}
                {church.phone && (
                  <p className="text-gray-600">{church.phone}</p>
                )}
                {church.email && (
                  <p className="text-gray-600">{church.email}</p>
                )}
                {church.website && (
                  <a 
                    href={church.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    Visitar sitio web
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PublicDonatePageProps) {
  const church = await prisma.church.findUnique({
    where: { 
      id: params.churchId,
      isActive: true 
    },
    select: {
      name: true,
      description: true
    }
  })

  if (!church) {
    return {
      title: 'Iglesia no encontrada',
      description: 'La iglesia solicitada no existe o no está disponible.'
    }
  }

  return {
    title: `Donaciones - ${church.name}`,
    description: church.description || `Realiza una donación segura a ${church.name}`,
  }
}
