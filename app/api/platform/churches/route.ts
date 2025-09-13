
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail, emailQueue } from '@/lib/email'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Solo SUPER_ADMIN puede acceder a gestión de plataforma
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      where.isActive = status === 'active'
    }

    // Obtener iglesias con datos agregados
    const [churches, total] = await Promise.all([
      db.church.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              users: true,
              members: true,
              events: true,
              donations: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.church.count({ where })
    ])

    // Calcular estadísticas para cada iglesia
    const churchesWithStats = await Promise.all(
      churches.map(async (church) => {
        const [totalDonations, activeUsers] = await Promise.all([
          db.donation.aggregate({
            where: { churchId: church.id },
            _sum: { amount: true }
          }),
          db.user.count({
            where: { churchId: church.id, isActive: true }
          })
        ])

        return {
          ...church,
          stats: {
            totalMembers: church._count.members,
            activeUsers,
            totalEvents: church._count.events,
            totalDonations: totalDonations._sum.amount || 0
          }
        }
      })
    )

    return NextResponse.json({
      churches: churchesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching churches:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      address,
      phone,
      email,
      website,
      founded,
      description,
      adminUser
    } = body

    // Validaciones
    if (!name || !email || !adminUser?.email || !adminUser?.name) {
      return NextResponse.json(
        { message: 'Campos requeridos: name, email, adminUser.email, adminUser.name' },
        { status: 400 }
      )
    }

    // Verificar que el email del admin no exista
    const existingUser = await db.user.findUnique({
      where: { email: adminUser.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email del administrador ya está registrado' },
        { status: 400 }
      )
    }

    // Crear iglesia y usuario admin en una transacción
    const result = await db.$transaction(async (tx) => {
      // Crear iglesia
      const church = await tx.church.create({
        data: {
          name,
          address,
          phone,
          email,
          website,
          founded: founded ? new Date(founded) : null,
          description,
          isActive: true
        }
      })

      // Crear usuario administrador
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(adminUser.password || 'cambiarpassword123', 12)

      const admin = await tx.user.create({
        data: {
          name: adminUser.name,
          email: adminUser.email,
          password: hashedPassword,
          role: 'ADMIN_IGLESIA',
          churchId: church.id,
          isActive: true,
          emailVerified: new Date()
        }
      })

      // Crear miembro correspondiente
      await tx.member.create({
        data: {
          firstName: adminUser.name.split(' ')[0] || adminUser.name,
          lastName: adminUser.name.split(' ').slice(1).join(' ') || '',
          email: adminUser.email,
          phone: adminUser.phone || '',
          churchId: church.id,
          userId: admin.id,
          membershipDate: new Date(),
          isActive: true
        }
      })

      // Log de actividad
      await tx.notification.create({
        data: {
          title: 'Nueva iglesia creada',
          message: `Iglesia "${name}" creada por SUPER_ADMIN`,
          type: 'info',
          churchId: church.id,
          isRead: false
        }
      })

      return { church, admin }
    })

    // Send welcome email with temporary password to the new admin
    const temporaryPassword = adminUser.password || 'cambiarpassword123'
    const welcomeEmailContent = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .credentials { background: #f8f9fa; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>¡Bienvenido a Kḥesed-tek!</h1>
          </div>
          <div class="content">
            <h2>Hola ${adminUser.name},</h2>
            
            <p>Tu cuenta de administrador ha sido creada exitosamente para la iglesia <strong>${name}</strong>.</p>
            
            <div class="credentials">
              <h3>📧 Credenciales de Acceso:</h3>
              <p><strong>Usuario:</strong> ${adminUser.email}</p>
              <p><strong>Contraseña temporal:</strong> <code>${temporaryPassword}</code></p>
              <p><strong>URL de acceso:</strong> <a href="${process.env.NEXTAUTH_URL}">${process.env.NEXTAUTH_URL}</a></p>
            </div>
            
            <div class="warning">
              <h3>⚠️ Importante:</h3>
              <p>Por razones de seguridad, <strong>debes cambiar esta contraseña temporal</strong> en tu primer inicio de sesión.</p>
              <p>Ve a <strong>Perfil > Cambiar Contraseña</strong> una vez que ingreses al sistema.</p>
            </div>
            
            <h3>🚀 Primeros Pasos:</h3>
            <ol>
              <li>Inicia sesión con las credenciales proporcionadas</li>
              <li>Cambia tu contraseña temporal</li>
              <li>Configura el perfil de tu iglesia</li>
              <li>Comienza a agregar miembros y usuarios</li>
            </ol>
            
            <p>Si tienes preguntas, contacta al soporte técnico en <a href="mailto:soporte@khesed-tek.com">soporte@khesed-tek.com</a></p>
            
            <p>¡Bienvenido a la familia Kḥesed-tek!</p>
          </div>
          <div class="footer">
            <p>Kḥesed-tek Church Management Systems</p>
            <p>Sistema completo de gestión para iglesias</p>
          </div>
        </body>
      </html>
    `

    // Send email asynchronously (don't block the response)
    emailQueue.add({
      to: adminUser.email,
      subject: `🎉 Bienvenido a Kḥesed-tek - Credenciales de ${name}`,
      html: welcomeEmailContent,
      churchName: name,
      userName: adminUser.name
    }).catch(error => {
      console.error('Error sending welcome email:', error)
    })

    return NextResponse.json({
      message: 'Iglesia creada exitosamente',
      church: result.church,
      admin: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating church:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
