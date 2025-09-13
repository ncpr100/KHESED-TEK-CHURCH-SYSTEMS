
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function PermissionsManual() {
  return (
    <div className="container mx-auto p-6">
      <Link href="/help/manual/complete">
        <Button variant="outline" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Manual
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Manual: Usuarios y Permisos</h1>
          <p className="text-muted-foreground">Gestión de accesos y roles</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>🛡️ Sistema de Usuarios y Permisos - Manual Completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Esta guía explica el sistema jerárquico de roles de la iglesia y cómo gestionar permisos de manera segura y eficiente.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <h4 className="font-semibold">🔐 Niveles</h4>
                <p className="text-xl font-bold text-red-600">5</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h4 className="font-semibold">⏱️ Tiempo</h4>
                <p className="text-xl font-bold text-green-600">12 min</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">🎯 Nivel</h4>
                <p className="text-lg font-bold text-purple-600">Avanzado</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <h4 className="font-semibold">👤 Rol Mínimo</h4>
                <p className="text-lg font-bold text-orange-600">ADMIN</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 1: Role Hierarchy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
              Jerarquía de Roles de la Iglesia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-red-700">🔴 SUPER_ADMIN</h4>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Prioridad: 100</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Acceso total al sistema y configuración global</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">✅ Puede hacer:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestionar todos los usuarios</li>
                      <li>• Configurar el sistema completo</li>
                      <li>• Acceder a auditorías</li>
                      <li>• Anulación de emergencia</li>
                      <li>• Gestión de plataforma</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">🔍 Pestañas Disponibles:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Resumen, Permisos, Roles</li>
                      <li>• Asignaciones, Sistema</li>
                      <li>• Auditoría (todas)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 bg-orange-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-orange-700">🟠 ADMIN_IGLESIA</h4>
                  <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded">Prioridad: 80</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Gestión completa de la iglesia y usuarios</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">✅ Puede hacer:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestionar miembros y voluntarios</li>
                      <li>• Crear y asignar roles</li>
                      <li>• Configurar iglesia</li>
                      <li>• Ver reportes financieros</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">❌ No puede:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Acceso a configuración de sistema</li>
                      <li>• Gestión de plataforma</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-700">🔵 PASTOR</h4>
                  <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">Prioridad: 60</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Supervisión ministerial y gestión pastoral</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">✅ Puede hacer:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestionar ministerios</li>
                      <li>• Acceso pastoral especial</li>
                      <li>• Ver estadísticas ministeriales</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">❌ No puede:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestión de usuarios</li>
                      <li>• Configuración financiera</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-green-500 pl-4 bg-green-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-green-700">🟢 LIDER</h4>
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Prioridad: 40</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Gestión de ministerios específicos y equipos</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">✅ Puede hacer:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestionar su equipo</li>
                      <li>• Ver información de miembros</li>
                      <li>• Crear eventos de ministerio</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">❌ No puede:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Crear roles</li>
                      <li>• Asignar permisos</li>
                      <li>• Configurar iglesia</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-gray-500 pl-4 bg-gray-50 p-3 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-700">⚫ MIEMBRO</h4>
                  <span className="text-xs bg-gray-600 text-white px-2 py-1 rounded">Prioridad: 20</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Acceso básico de consulta y participación</p>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-semibold">✅ Puede hacer:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Ver eventos y servicios</li>
                      <li>• Leer sermones</li>
                      <li>• Actualizar su perfil personal</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold">❌ No puede:</p>
                    <ul className="ml-4 text-muted-foreground space-y-1">
                      <li>• Gestionar otros usuarios</li>
                      <li>• Ver información financiera</li>
                      <li>• Configurar sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Permission Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
              Gestión de Permisos del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔧 Configuración Inicial</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>2.1.</strong> Solo SUPER_ADMIN puede inicializar el sistema</p>
                  <p><strong>2.2.</strong> Vaya a <code>Configuración → Permisos</code></p>
                  <p><strong>2.3.</strong> Haga clic en "🗄️ Inicializar Sistema"</p>
                  <p><strong>2.4.</strong> El sistema creará automáticamente:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Permisos base para todos los recursos</li>
                    <li>• Roles predefinidos de la iglesia</li>
                    <li>• Asignaciones por defecto</li>
                  </ul>
                  <p><strong>2.5.</strong> Verifique que aparezca "Sistema activo: X permisos, X roles"</p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">⚠️ Importante</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Solo ejecute una vez:</strong> La inicialización no se puede deshacer</li>
                  <li>• <strong>Backup recomendado:</strong> Antes de cualquier cambio mayor</li>
                  <li>• <strong>Cambios inmediatos:</strong> Los permisos aplican instantáneamente</li>
                  <li>• <strong>Usuarios activos:</strong> Pueden perder acceso si cambia su rol</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Tab Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
              Control de Acceso a Pestañas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">📑 Sistema de Pestañas por Rol</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-red-600 mb-2">🔴 SUPER_ADMIN</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 📊 Resumen</li>
                    <li>• 🔑 Permisos</li>
                    <li>• 🛡️ Roles</li>
                    <li>• 👥 Asignaciones</li>
                    <li>• ⚙️ Sistema</li>
                    <li>• 📄 Auditoría</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-orange-600 mb-2">🟠 ADMIN_IGLESIA</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 📊 Resumen</li>
                    <li>• 🛡️ Roles</li>
                    <li>• 👥 Asignaciones</li>
                    <li>• ⚙️ Configuración Iglesia</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-blue-600 mb-2">🔵 PASTOR</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• 📊 Resumen</li>
                    <li>• ❤️ Roles Ministeriales</li>
                    <li>• 📖 Acceso Pastoral</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: User Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
              Asignación de Roles a Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">👥 Proceso de Asignación</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>4.1.</strong> En Permisos, vaya a la pestaña "Asignaciones"</p>
                  <p><strong>4.2.</strong> Haga clic en "👤 Asignar Rol"</p>
                  <p><strong>4.3.</strong> Seleccione el usuario de la lista</p>
                  <p><strong>4.4.</strong> Escoja el rol apropiado:</p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• Considere las responsabilidades del usuario</li>
                    <li>• Use el principio de menor privilegio</li>
                    <li>• Verifique que puede gestionar roles de menor prioridad</li>
                  </ul>
                  <p><strong>4.5.</strong> Confirme la asignación</p>
                  <p><strong>4.6.</strong> El usuario recibe acceso inmediatamente</p>
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🎯 Mejores Prácticas</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Principio de menor privilegio:</strong> Asigne el rol mínimo necesario</li>
                  <li>• <strong>Revisión periódica:</strong> Evalúe roles cada 6 meses</li>
                  <li>• <strong>Documentar cambios:</strong> Anote razones de cambios</li>
                  <li>• <strong>Capacitación:</strong> Explique nuevos accesos al usuario</li>
                  <li>• <strong>Prueba:</strong> Verifique que el usuario puede acceder correctamente</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Role-Specific Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
              Botones y Acciones por Rol
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔘 Botones Dinámicos</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>El sistema muestra botones según su rol:</strong></p>
                  <ul className="ml-4 space-y-2 text-muted-foreground">
                    <li>• <strong>"➕ Crear Permiso":</strong> Solo SUPER_ADMIN</li>
                    <li>• <strong>"🛡️ Crear Rol":</strong> SUPER_ADMIN + ADMIN_IGLESIA</li>
                    <li>• <strong>"👤 Asignar Rol":</strong> SUPER_ADMIN + ADMIN_IGLESIA</li>
                    <li>• <strong>"❤️ Gestionar Ministerio":</strong> Hasta PASTOR</li>
                    <li>• <strong>"👥 Gestionar Equipo":</strong> Hasta LIDER</li>
                    <li>• <strong>"📄 Ver Auditoría":</strong> Solo SUPER_ADMIN</li>
                    <li>• <strong>"⚠️ Anulación Emergencia":</strong> Solo SUPER_ADMIN</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">⚡ Funciones de Botones</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Al hacer clic en cada botón:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Crear Permiso:</strong> Abre formulario de nuevo permiso</li>
                    <li>• <strong>Crear Rol:</strong> Abre formulario de nuevo rol</li>
                    <li>• <strong>Asignar Rol:</strong> Cambia a pestaña de asignaciones</li>
                    <li>• <strong>Gestionar Ministerio:</strong> Va a roles ministeriales</li>
                    <li>• <strong>Gestionar Equipo:</strong> Va a gestión de equipos</li>
                    <li>• <strong>Ver Auditoría:</strong> Cambia a pestaña de auditoría</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Security Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
              Mejores Prácticas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">🔒 Seguridad de Roles</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Recomendaciones generales:</strong></p>
                  <ul className="ml-4 space-y-1 text-muted-foreground">
                    <li>• <strong>Mínimo 2 ADMIN_IGLESIA:</strong> En caso de emergencia</li>
                    <li>• <strong>1 Solo SUPER_ADMIN:</strong> Máximo control</li>
                    <li>• <strong>Rotación de líderes:</strong> Cambie cada 2 años</li>
                    <li>• <strong>Capacitación obligatoria:</strong> Antes de asignar roles</li>
                    <li>• <strong>Monitoreo regular:</strong> Revise logs de actividad</li>
                  </ul>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">🚨 Señales de Alerta</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Intentos de acceso no autorizado</li>
                  <li>• Cambios frecuentes de roles</li>
                  <li>• Actividad fuera de horario normal</li>
                  <li>• Múltiples fallas de autenticación</li>
                  <li>• Modificaciones inesperadas de datos</li>
                </ul>
                <div className="mt-3 p-2 bg-white rounded border-l-4 border-red-400">
                  <p className="text-xs"><strong>🚨 En caso de compromiso:</strong> Use "Anulación de Emergencia" para revocar todos los accesos temporalmente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 7: Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
              Solución de Problemas Comunes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">❌ "No tienes permisos para acceder a esta sección"</h4>
                <p className="text-muted-foreground mb-2">
                  <strong>Causa:</strong> Su rol no tiene acceso a esa funcionalidad específica.
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Solución:</strong> Contacte a su ADMIN_IGLESIA o SUPER_ADMIN para solicitar el rol apropiado.
                </p>
                <p className="text-xs text-blue-600">→ Verifique su rol actual en Configuración → Perfil</p>
              </div>
              
              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">❌ "No puedo asignar roles a otros usuarios"</h4>
                <p className="text-muted-foreground mb-2">
                  <strong>Causa:</strong> Solo puede asignar roles de menor prioridad que el suyo.
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Solución:</strong> Un usuario con rol superior debe hacer la asignación.
                </p>
                <p className="text-xs text-blue-600">→ Ejemplo: LIDER (40) no puede asignar PASTOR (60)</p>
              </div>

              <div className="border rounded-lg p-3">
                <h4 className="font-semibold text-red-600 mb-2">❌ "Los botones no aparecen"</h4>
                <p className="text-muted-foreground mb-2">
                  <strong>Causa:</strong> Su rol no tiene acceso a esas acciones específicas.
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Solución:</strong> Revise la matriz de acceso y solicite el rol adecuado si necesario.
                </p>
                <p className="text-xs text-blue-600">→ Ver: Tabla de botones disponibles por rol arriba</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Referencia Rápida de Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Acción</th>
                    <th className="text-center p-2">SUPER_ADMIN</th>
                    <th className="text-center p-2">ADMIN_IGLESIA</th>
                    <th className="text-center p-2">PASTOR</th>
                    <th className="text-center p-2">LIDER</th>
                    <th className="text-center p-2">MIEMBRO</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b">
                    <td className="p-2">Ver permisos del sistema</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gestionar roles</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Asignar roles</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gestionar ministerios</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2">Gestionar equipos</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr>
                    <td className="p-2">Ver información personal</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
