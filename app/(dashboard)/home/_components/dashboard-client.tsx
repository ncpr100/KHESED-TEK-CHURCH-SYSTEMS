
'use client'

import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  BookOpen, 
  Calendar, 
  UserPlus,
  Plus,
  ArrowRight,
  TrendingUp,
  Heart,
  UserCheck,
  Phone,
  Globe,
  Clock,
  CheckCircle,
  Target,
  Zap,
  BarChart3,
  UserX
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface DashboardClientProps {
  stats: {
    totalMembers: number
    totalSermons: number
    upcomingEvents: number
    newMembersThisMonth: number
    totalVolunteers: number
    totalCheckIns: number
    pendingFollowUps: number
    childrenPresent: number
    websiteRequests: number
    pendingWebsiteRequests: number
    existingWebsites: number
    // Visitor analytics
    averageEngagementScore: number
    automationSuccessRate: number
    firstTimeVisitorsThisMonth: number
    returningVisitorsCount: number
    firstTimeVisitorsCount: number
    completedFollowUpsThisMonth: number
    followUpCompletionRate: number
  }
  recentMembers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string | null
    createdAt: Date
  }>
  recentSermons: Array<{
    id: string
    title: string
    scripture: string | null
    createdAt: Date
  }>
  recentCheckIns: Array<{
    id: string
    firstName: string
    lastName: string
    isFirstTime: boolean
    checkedInAt: Date
  }>
  recentWebsiteRequests: Array<{
    id: string
    requestType: string
    projectName: string
    status: string
    priority: string
    estimatedPrice: number | null
    createdAt: Date
  }>
  userRole: string
}

export function DashboardClient({ 
  stats, 
  recentMembers, 
  recentSermons,
  recentCheckIns, 
  recentWebsiteRequests,
  userRole 
}: DashboardClientProps) {
  const canManageMembers = ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR', 'LIDER'].includes(userRole)
  const canCreateSermons = ['SUPER_ADMIN', 'ADMIN_IGLESIA', 'PASTOR'].includes(userRole)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de tu iglesia
        </p>
      </div>

      {/* Primary Stats - Core Church Operations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Miembros"
          value={stats.totalMembers}
          icon={Users}
          description="Miembros activos"
          trend={stats.newMembersThisMonth > 0 ? `+${stats.newMembersThisMonth} este mes` : undefined}
          index={0}
        />
        <StatsCard
          title="Voluntarios"
          value={stats.totalVolunteers}
          icon={Heart}
          description="Voluntarios activos"
          index={1}
        />
        <StatsCard
          title="Eventos y Sermones"
          value={stats.upcomingEvents + stats.totalSermons}
          icon={Calendar}
          description={`${stats.upcomingEvents} eventos, ${stats.totalSermons} sermones`}
          index={2}
        />
        <StatsCard
          title="Sitio Web"
          value={stats.existingWebsites > 0 ? 1 : stats.websiteRequests}
          icon={Globe}
          description={stats.existingWebsites > 0 ? "Sitio activo" : "Solicitudes"}
          trend={stats.pendingWebsiteRequests > 0 ? `${stats.pendingWebsiteRequests} pendiente(s)` : stats.existingWebsites > 0 ? "✅ Publicado" : undefined}
          index={3}
        />
      </div>

      {/* Secondary Stats - Daily Operations */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Check-ins Hoy"
          value={stats.totalCheckIns}
          icon={UserCheck}
          description="Visitantes registrados"
          trend={stats.firstTimeVisitorsThisMonth > 0 ? `${stats.firstTimeVisitorsThisMonth} nuevos este mes` : undefined}
          index={0}
        />
        <StatsCard
          title="Niños Presentes"
          value={stats.childrenPresent}
          icon={Users}
          description="En instalaciones"
          index={1}
        />
        <StatsCard
          title="Seguimientos"
          value={stats.pendingFollowUps}
          icon={Phone}
          description={`${stats.completedFollowUpsThisMonth} completados este mes`}
          trend={stats.pendingFollowUps > 0 ? "⚠️ Requiere atención" : "✅ Al día"}
          index={2}
        />
        <StatsCard
          title="Participación"
          value={stats.averageEngagementScore}
          icon={Target}
          description="Puntuación promedio"
          trend={stats.averageEngagementScore >= 70 ? "🎯 Excelente" : stats.averageEngagementScore >= 50 ? "⚡ Bueno" : "📈 Mejorar"}
          index={3}
        />
      </div>

      {/* Visitor Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Análisis de Visitantes</h2>
        </div>


        {/* Visitor Breakdown Card */}
        <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BarChart3 className="h-5 w-5" />
              Desglose de Visitantes
            </CardTitle>
            <CardDescription>Análisis de tipos de visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.firstTimeVisitorsCount}</p>
                <p className="text-sm text-muted-foreground">Primera Vez</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.returningVisitorsCount}</p>
                <p className="text-sm text-muted-foreground">Recurrentes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">{stats.completedFollowUpsThisMonth}</p>
                <p className="text-sm text-muted-foreground">Seguimientos Exitosos</p>
              </div>
            </div>
            
            {(stats.firstTimeVisitorsThisMonth > 0 || stats.firstTimeVisitorsCount > 0 || stats.averageEngagementScore > 0) ? (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">
                    {stats.firstTimeVisitorsThisMonth > 0 
                      ? `${stats.firstTimeVisitorsThisMonth} nuevos visitantes este mes`
                      : stats.firstTimeVisitorsCount > 0 
                      ? `${stats.firstTimeVisitorsCount} visitantes registrados`
                      : "Sistema de visitor analytics activado"
                    }
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.automationSuccessRate > 70 
                    ? "¡Excelente trabajo conectando con visitantes!" 
                    : stats.automationSuccessRate > 0
                    ? "Considera revisar los flujos de automatización para mejorar el engagement."
                    : "Comienza registrando visitantes para ver analytics detallados."
                  }
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-600" />
                  <p className="text-sm font-medium text-gray-800">
                    Sistema de Análisis de Visitantes Listo
                  </p>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Registra visitantes en la sección Check-ins para comenzar a ver métricas de engagement y automatización.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Miembros Recientes</CardTitle>
              <CardDescription>Últimos miembros registrados</CardDescription>
            </div>
            {canManageMembers && (
              <Link href="/members">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentMembers?.length > 0 ? (
              <div className="space-y-4">
                {recentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email || 'Sin email'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(member.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/members">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos los miembros
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay miembros registrados</p>
                {canManageMembers && (
                  <Link href="/members">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar primer miembro
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sermons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Sermones Recientes</CardTitle>
              <CardDescription>Últimos sermones creados</CardDescription>
            </div>
            {canCreateSermons && (
              <Link href="/sermons">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentSermons?.length > 0 ? (
              <div className="space-y-4">
                {recentSermons.map((sermon) => (
                  <div key={sermon.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">
                        {sermon.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {sermon.scripture && (
                          <Badge variant="secondary" className="text-xs">
                            {sermon.scripture}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDate(sermon.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/sermons">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos los sermones
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay sermones creados</p>
                {canCreateSermons && (
                  <Link href="/sermons">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primer sermón
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Check-ins Recientes</CardTitle>
              <CardDescription>Últimos visitantes registrados</CardDescription>
            </div>
            {canManageMembers && (
              <Link href="/check-ins">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {recentCheckIns?.length > 0 ? (
              <div className="space-y-4">
                {recentCheckIns.map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {checkIn.firstName} {checkIn.lastName}
                        {checkIn.isFirstTime && (
                          <Badge variant="default" className="text-xs">Primera vez</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(checkIn.checkedInAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/check-ins">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todos los check-ins
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay check-ins registrados</p>
                {canManageMembers && (
                  <Link href="/check-ins">
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar primer visitante
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Website Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Solicitudes de Sitio</CardTitle>
              <CardDescription>Estado de sitios web</CardDescription>
            </div>
            <Link href="/website-requests">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.existingWebsites > 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="font-medium text-green-800">¡Sitio Web Activo!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Tu iglesia ya tiene un sitio web publicado
                </p>
                <Link href="/website-requests">
                  <Button variant="outline" size="sm">
                    <Globe className="h-4 w-4 mr-2" />
                    Solicitar Mejoras
                  </Button>
                </Link>
              </div>
            ) : recentWebsiteRequests?.length > 0 ? (
              <div className="space-y-4">
                {recentWebsiteRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {request.projectName}
                        <Badge 
                          variant={request.status === 'pending' ? 'secondary' : request.status === 'in_progress' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {request.status === 'pending' ? 'Pendiente' : 
                           request.status === 'in_progress' ? 'En Progreso' :
                           request.status === 'completed' ? 'Completado' : request.status}
                        </Badge>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.requestType} • {formatDate(request.createdAt)}
                      </p>
                    </div>
                    {request.estimatedPrice && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          ${request.estimatedPrice}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <Link href="/website-requests">
                  <Button variant="ghost" size="sm" className="w-full">
                    Ver todas las solicitudes
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes sitio web</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Solicita un sitio web profesional para tu iglesia
                </p>
                <Link href="/website-requests">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Solicitar Sitio Web
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Insights */}
      {stats.totalMembers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumen de Crecimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalMembers}
                </p>
                <p className="text-sm text-muted-foreground">Miembros Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.newMembersThisMonth}
                </p>
                <p className="text-sm text-muted-foreground">Nuevos este Mes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalSermons}
                </p>
                <p className="text-sm text-muted-foreground">Sermones Creados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
