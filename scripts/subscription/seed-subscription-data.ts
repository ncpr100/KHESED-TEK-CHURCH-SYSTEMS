

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSubscriptionData() {
  console.log('🎯 Seeding subscription data...')

  try {
    // Create Plan Features
    console.log('📋 Creating plan features...')
    
    const features = await Promise.all([
      // Core Features (BÁSICO)
      prisma.planFeature.upsert({
        where: { key: 'members_management' },
        update: {},
        create: {
          key: 'members_management',
          name: 'Gestión de Miembros',
          description: 'Administración completa de miembros de la iglesia',
          category: 'core'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'events_management' },
        update: {},
        create: {
          key: 'events_management',
          name: 'Gestión de Eventos',
          description: 'Creación y administración de eventos',
          category: 'core'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'donations_basic' },
        update: {},
        create: {
          key: 'donations_basic',
          name: 'Donaciones Básicas',
          description: 'Sistema básico de registro de donaciones',
          category: 'core'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'basic_reports' },
        update: {},
        create: {
          key: 'basic_reports',
          name: 'Reportes Básicos',
          description: 'Reportes simples de miembros y donaciones',
          category: 'core'
        }
      }),

      // Advanced Features (PROFESIONAL)
      prisma.planFeature.upsert({
        where: { key: 'analytics_dashboard' },
        update: {},
        create: {
          key: 'analytics_dashboard',
          name: 'Dashboard de Analytics',
          description: 'Dashboard completo con métricas y gráficos',
          category: 'advanced'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'automation_rules' },
        update: {},
        create: {
          key: 'automation_rules',
          name: 'Automatizaciones',
          description: 'Reglas de automatización y triggers',
          category: 'advanced'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'advanced_reports' },
        update: {},
        create: {
          key: 'advanced_reports',
          name: 'Reportes Avanzados',
          description: 'Reportes personalizados y programables',
          category: 'advanced'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'communications' },
        update: {},
        create: {
          key: 'communications',
          name: 'Sistema de Comunicaciones',
          description: 'Envío masivo de emails y notificaciones',
          category: 'advanced'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'volunteer_management' },
        update: {},
        create: {
          key: 'volunteer_management',
          name: 'Gestión de Voluntarios',
          description: 'Administración completa de voluntarios',
          category: 'advanced'
        }
      }),

      // Enterprise Features
      prisma.planFeature.upsert({
        where: { key: 'api_access' },
        update: {},
        create: {
          key: 'api_access',
          name: 'Acceso a API',
          description: 'API completa para integraciones personalizadas',
          category: 'enterprise'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'multi_church' },
        update: {},
        create: {
          key: 'multi_church',
          name: 'Multi-Iglesia',
          description: 'Gestión de múltiples iglesias desde una cuenta',
          category: 'enterprise'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'custom_branding' },
        update: {},
        create: {
          key: 'custom_branding',
          name: 'Marca Personalizada',
          description: 'Personalización completa de marca y colores',
          category: 'enterprise'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'priority_support' },
        update: {},
        create: {
          key: 'priority_support',
          name: 'Soporte Prioritario',
          description: 'Soporte 24/7 con respuesta prioritaria',
          category: 'enterprise'
        }
      }),
      prisma.planFeature.upsert({
        where: { key: 'advanced_integrations' },
        update: {},
        create: {
          key: 'advanced_integrations',
          name: 'Integraciones Avanzadas',
          description: 'Integraciones con sistemas externos',
          category: 'enterprise'
        }
      })
    ])

    console.log(`✅ Created ${features.length} plan features`)

    // Create Subscription Plans
    console.log('💳 Creating subscription plans...')

    const basicFeatures = [
      'members_management',
      'events_management', 
      'donations_basic',
      'basic_reports'
    ]

    const professionalFeatures = [
      ...basicFeatures,
      'analytics_dashboard',
      'automation_rules',
      'advanced_reports',
      'communications',
      'volunteer_management'
    ]

    const enterpriseFeatures = [
      ...professionalFeatures,
      'api_access',
      'multi_church',
      'custom_branding',
      'priority_support',
      'advanced_integrations'
    ]

    const plans = await Promise.all([
      // BÁSICO Plan - CORRECTED PRICING
      prisma.subscriptionPlan.upsert({
        where: { name: 'BÁSICO' },
        update: {
          priceMonthly: '25,000', // Direct string input
          priceYearly: '270,000', // Direct string input
          features: basicFeatures
        },
        create: {
          name: 'BÁSICO',
          displayName: 'Plan Básico',
          description: 'Perfecto para iglesias pequeñas que necesitan funcionalidades esenciales',
          priceMonthly: '25,000', // Direct string input
          priceYearly: '270,000', // Direct string input
          maxChurches: 1,
          maxMembers: 100,
          maxUsers: 3,
          features: basicFeatures,
          sortOrder: 1
        }
      }),

      // PROFESIONAL Plan - CORRECTED PRICING
      prisma.subscriptionPlan.upsert({
        where: { name: 'PROFESIONAL' },
        update: {
          priceMonthly: '75,000', // Direct string input
          priceYearly: '810,000', // Direct string input
          features: professionalFeatures
        },
        create: {
          name: 'PROFESIONAL',
          displayName: 'Plan Profesional',
          description: 'Para iglesias medianas con necesidades avanzadas de gestión y analytics',
          priceMonthly: '75,000', // Direct string input
          priceYearly: '810,000', // Direct string input
          maxChurches: 1,
          maxMembers: 500,
          maxUsers: 10,
          features: professionalFeatures,
          sortOrder: 2
        }
      }),

      // ENTERPRISE Plan - CORRECTED PRICING
      prisma.subscriptionPlan.upsert({
        where: { name: 'ENTERPRISE' },
        update: {
          priceMonthly: '150,000', // Direct string input
          priceYearly: '1620,000', // Direct string input
          features: enterpriseFeatures
        },
        create: {
          name: 'ENTERPRISE',
          displayName: 'Plan Enterprise',
          description: 'Para organizaciones grandes con múltiples iglesias y necesidades personalizadas',
          priceMonthly: '150,000', // Direct string input
          priceYearly: '1620,000', // Direct string input
          maxChurches: 999,
          maxMembers: 99999,
          maxUsers: 50,
          features: enterpriseFeatures,
          sortOrder: 3
        }
      })
    ])

    console.log(`✅ Created ${plans.length} subscription plans`)

    // Create Subscription Add-ons
    console.log('🔧 Creating subscription add-ons...')

    const addons = await Promise.all([
      // SMS Notifications
      prisma.subscriptionAddon.upsert({
        where: { key: 'sms_notifications' },
        update: {},
        create: {
          key: 'sms_notifications',
          name: 'Notificaciones SMS',
          description: 'Envío de notificaciones por SMS a miembros',
          priceMonthly: '0', // Direct string input
          billingType: 'PER_USE',
          pricePerUnit: '50', // Direct string input
          unit: 'SMS'
        }
      }),

      // WhatsApp Integration
      prisma.subscriptionAddon.upsert({
        where: { key: 'whatsapp_integration' },
        update: {},
        create: {
          key: 'whatsapp_integration',
          name: 'Integración WhatsApp',
          description: 'Integración completa con WhatsApp Business API',
          priceMonthly: '50,000', // Direct string input
          priceYearly: '540,000', // Direct string input
          billingType: 'MONTHLY'
        }
      }),

      // Custom Branding
      prisma.subscriptionAddon.upsert({
        where: { key: 'custom_branding' },
        update: {},
        create: {
          key: 'custom_branding',
          name: 'Marca Personalizada',
          description: 'Personalización completa de colores, logo y marca',
          priceMonthly: '30,000', // Direct string input
          priceYearly: '324,000', // Direct string input
          billingType: 'MONTHLY'
        }
      }),

      // Advanced Analytics
      prisma.subscriptionAddon.upsert({
        where: { key: 'advanced_analytics' },
        update: {},
        create: {
          key: 'advanced_analytics',
          name: 'Analytics Avanzados',
          description: 'Dashboards personalizados y métricas detalladas',
          priceMonthly: '40,000', // Direct string input
          priceYearly: '432,000', // Direct string input
          billingType: 'MONTHLY'
        }
      }),

      // Priority Support
      prisma.subscriptionAddon.upsert({
        where: { key: 'priority_support' },
        update: {},
        create: {
          key: 'priority_support',
          name: 'Soporte Prioritario',
          description: 'Soporte 24/7 con respuesta en menos de 2 horas',
          priceMonthly: '60,000', // Direct string input
          priceYearly: '648,000', // Direct string input
          billingType: 'MONTHLY'
        }
      })
    ])

    console.log(`✅ Created ${addons.length} subscription add-ons`)

    console.log('✅ Subscription data seeded successfully!')
    console.log('')
    console.log('📊 PRICING SUMMARY (CORRECTED):')
    console.log('├── BÁSICO: $25.00 USD/mes ($270.00 USD/año)')
    console.log('├── PROFESIONAL: $75.00 USD/mes ($810.00 USD/año)')
    console.log('└── ENTERPRISE: $150.00 USD/mes ($1,620.00 USD/año)')
    console.log('')
    console.log('🔧 ADD-ONS AVAILABLE:')
    console.log('├── SMS Notifications: $0.50 COP por SMS')
    console.log('├── WhatsApp Integration: $50,000 COP/mes')
    console.log('├── Custom Branding: $30,000 COP/mes')
    console.log('├── Advanced Analytics: $40,000 COP/mes')
    console.log('└── Priority Support: $60,000 COP/mes')

  } catch (error) {
    console.error('❌ Error seeding subscription data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  seedSubscriptionData()
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seedSubscriptionData

