
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PermissionsList } from './permissions-list';
import { RolesList } from './roles-list';
import { UserRoleAssignment } from './user-role-assignment';
import { 
  Shield, RefreshCw, AlertTriangle, CheckCircle,
  Settings, Users, Key, Database, BarChart3, Heart,
  UserCheck, BookOpen, Cog, FileText, Plus, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ChurchRole,
  CHURCH_ROLES,
  PERMISSION_TABS,
  ROLE_ACTION_BUTTONS,
  hasTabAccess,
  getAccessibleTabs,
  getRoleConfiguration,
  getActionButtons
} from '@/lib/role-access-control';

interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  isActive: boolean;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  churchId?: string;
  isSystem: boolean;
  priority: number;
  rolePermissions: Array<{
    permission: Permission;
  }>;
  _count: {
    userRoles: number;
    rolePermissions: number;
  };
}

export function PermissionsClient() {
  const { data: session } = useSession() || {};
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [systemInitialized, setSystemInitialized] = useState(false);

  // Initialize activeTab to first accessible tab
  useEffect(() => {
    if (session?.user?.role) {
      const userRole = session.user.role as ChurchRole;
      const accessibleTabs = getAccessibleTabs(userRole);
      if (accessibleTabs.length > 0 && !accessibleTabs.find(t => t.id === activeTab)) {
        setActiveTab(accessibleTabs[0].id);
      }
    }
  }, [session?.user?.role]);

  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [permissionsRes, rolesRes] = await Promise.all([
        fetch('/api/permissions'),
        fetch('/api/roles-advanced')
      ]);

      if (permissionsRes.ok) {
        const permissionsData = await permissionsRes.json();
        setPermissions(permissionsData);
        setSystemInitialized(permissionsData.length > 0);
      }

      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setRoles(rolesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const initializeSystem = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/permissions/seed', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        await loadData();
        setSystemInitialized(true);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al inicializar el sistema');
      }
    } catch (error) {
      console.error('Error initializing system:', error);
      toast.error('Error al inicializar el sistema');
    } finally {
      setLoading(false);
    }
  };

  // Handle role-specific action buttons
  const handleActionButton = async (button: typeof ROLE_ACTION_BUTTONS[0]) => {
    if (button.confirmRequired) {
      const confirmed = confirm(`¿Estás seguro de ejecutar: ${button.label}?`);
      if (!confirmed) return;
    }

    try {
      setLoading(true);
      
      switch (button.action) {
        case 'permissions.create':
          // Handle permission creation
          toast.info('Función de creación de permisos - Implementación pendiente');
          break;
          
        case 'roles.create':
          // Handle role creation
          toast.info('Función de creación de roles - Implementación pendiente');
          break;
          
        case 'user_roles.assign':
          // Handle role assignment
          setActiveTab('assignments');
          break;
          
        case 'ministry.manage':
          // Handle ministry management
          setActiveTab('ministry-roles');
          break;
          
        case 'team.manage':
          // Handle team management
          setActiveTab('team-management');
          break;
          
        case 'audit.read':
          // Handle audit access
          setActiveTab('audit');
          break;
          
        case 'system.emergency_override':
          // Handle emergency override
          toast.warning('Función de anulación de emergencia - Requiere confirmación adicional');
          break;
          
        default:
          toast.info(`Acción ${button.action} - Implementación pendiente`);
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Error al ejecutar la acción');
    } finally {
      setLoading(false);
    }
  };

  // Get user's role configuration
  const userRole = session?.user?.role as ChurchRole
  const roleConfig = getRoleConfiguration(userRole)
  const accessibleTabs = getAccessibleTabs(userRole)
  const actionButtons = getActionButtons(userRole)

  // Basic access check - allow MIEMBRO+ to see at least overview
  if (!userRole || !roleConfig) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Contacta a tu administrador.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Ensure user has at least overview access
  if (accessibleTabs.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tu rol ({roleConfig.displayName}) no tiene acceso a ninguna función de gestión de permisos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Role-Specific Information */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Gestión de Permisos</h1>
            <Badge variant="outline" className="text-sm">
              {roleConfig.displayName}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {roleConfig.description}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Role-specific action buttons */}
          {actionButtons.map((button) => {
            const getIconComponent = (iconName: string) => {
              const icons = {
                Plus, Shield, UserPlus, Heart, Users, FileText, 
                AlertTriangle, Database, RefreshCw, Cog, UserCheck, 
                BookOpen, Key, BarChart3, Settings
              };
              return icons[iconName as keyof typeof icons] || Key;
            };
            const IconComponent = getIconComponent(button.icon);

            if (button.id === 'create-permission' && !systemInitialized && userRole === 'SUPER_ADMIN') {
              return (
                <Button key={button.id} onClick={initializeSystem} disabled={loading}>
                  <Database className="h-4 w-4 mr-2" />
                  Inicializar Sistema
                </Button>
              );
            }

            return (
              <Button 
                key={button.id}
                variant={button.variant}
                onClick={() => handleActionButton(button)}
                disabled={loading}
                title={button.description}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {button.label}
              </Button>
            );
          })}
          
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Role-Specific Status Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Acceso:</strong> {accessibleTabs.length} de {PERMISSION_TABS.length} secciones disponibles
          </AlertDescription>
        </Alert>
        
        {!systemInitialized && userRole === 'SUPER_ADMIN' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sistema no inicializado. Usa "Inicializar Sistema" para comenzar.
            </AlertDescription>
          </Alert>
        )}

        {systemInitialized && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Sistema activo: {permissions.length} permisos, {roles.length} roles
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Permisos</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles del Sistema</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => r.isSystem).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios con Roles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.reduce((sum, role) => sum + role._count.userRoles, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Based Tab System */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-1">
          {accessibleTabs.map((tab) => {
            const getTabIconComponent = (iconName: string) => {
              const icons = {
                BarChart3, Key, Shield, Users, Heart, UserCheck, 
                Settings, BookOpen, Cog, FileText
              };
              return icons[iconName as keyof typeof icons] || Key;
            };
            const IconComponent = getTabIconComponent(tab.icon);

            return (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center gap-2 text-xs sm:text-sm"
                title={tab.description}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Overview Tab - Available to all roles */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Role-Specific Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Tu Rol: {roleConfig.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Descripción</p>
                    <p className="text-sm text-muted-foreground">{roleConfig.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Prioridad</p>
                    <Badge variant="outline">{roleConfig.priority}/100</Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secciones Disponibles</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {accessibleTabs.map(tab => (
                        <Badge key={tab.id} variant="secondary" className="text-xs">
                          {tab.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Permisos</span>
                    <Badge variant="outline">{permissions.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Roles</span>
                    <Badge variant="outline">{roles.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usuarios con Roles</span>
                    <Badge variant="outline">
                      {roles.reduce((sum, role) => sum + role._count.userRoles, 0)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistema Inicializado</span>
                    <Badge variant={systemInitialized ? 'default' : 'secondary'}>
                      {systemInitialized ? 'Sí' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permissions Tab - SUPER_ADMIN only */}
        {hasTabAccess(userRole, 'permissions') && (
          <TabsContent value="permissions">
            <PermissionsList 
              permissions={permissions} 
              onPermissionChange={loadData}
            />
          </TabsContent>
        )}

        {/* Roles Tab - SUPER_ADMIN, ADMIN_IGLESIA */}
        {hasTabAccess(userRole, 'roles') && (
          <TabsContent value="roles">
            <RolesList 
              roles={roles} 
              permissions={permissions}
              onRoleChange={loadData}
            />
          </TabsContent>
        )}

        {/* Assignments Tab - SUPER_ADMIN, ADMIN_IGLESIA */}
        {hasTabAccess(userRole, 'assignments') && (
          <TabsContent value="assignments">
            <UserRoleAssignment 
              roles={roles}
              onAssignmentChange={loadData}
            />
          </TabsContent>
        )}

        {/* Ministry Roles Tab - SUPER_ADMIN, ADMIN_IGLESIA, PASTOR */}
        {hasTabAccess(userRole, 'ministry-roles') && (
          <TabsContent value="ministry-roles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Roles Ministeriales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Heart className="h-4 w-4" />
                    <AlertDescription>
                      Gestión de roles específicos para ministerios de la iglesia - Pastor, Líder de Alabanza, Maestro, etc.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Función de roles ministeriales en desarrollo</p>
                    <p className="text-sm">Disponible para: Pastor, Administrador de Iglesia, Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Team Management Tab - SUPER_ADMIN, ADMIN_IGLESIA, PASTOR, LIDER */}
        {hasTabAccess(userRole, 'team-management') && (
          <TabsContent value="team-management">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Gestión de Equipos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <UserCheck className="h-4 w-4" />
                    <AlertDescription>
                      Administración de equipos ministeriales y grupos de trabajo específicos.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Función de gestión de equipos en desarrollo</p>
                    <p className="text-sm">Disponible para: Líder, Pastor, Administrador de Iglesia, Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Church Settings Tab - SUPER_ADMIN, ADMIN_IGLESIA */}
        {hasTabAccess(userRole, 'church-settings') && (
          <TabsContent value="church-settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración de Iglesia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      Configuraciones específicas de la congregación y políticas internas.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configuración de iglesia en desarrollo</p>
                    <p className="text-sm">Disponible para: Administrador de Iglesia, Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pastoral Access Tab - SUPER_ADMIN, ADMIN_IGLESIA, PASTOR */}
        {hasTabAccess(userRole, 'pastoral-access') && (
          <TabsContent value="pastoral-access">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Acceso Pastoral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <BookOpen className="h-4 w-4" />
                    <AlertDescription>
                      Configuraciones y permisos especiales para el cuidado pastoral.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Acceso pastoral en desarrollo</p>
                    <p className="text-sm">Disponible para: Pastor, Administrador de Iglesia, Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* System Tab - SUPER_ADMIN only */}
        {hasTabAccess(userRole, 'system') && (
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Cog className="h-4 w-4" />
                    <AlertDescription>
                      Configuración avanzada del sistema y parámetros técnicos.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <Cog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configuración del sistema en desarrollo</p>
                    <p className="text-sm">Disponible solo para: Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Audit Tab - SUPER_ADMIN only */}
        {hasTabAccess(userRole, 'audit') && (
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Registro de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Registro detallado de cambios y actividad del sistema.
                    </AlertDescription>
                  </Alert>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Sistema de auditoría en desarrollo</p>
                    <p className="text-sm">Disponible solo para: Super Admin</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
