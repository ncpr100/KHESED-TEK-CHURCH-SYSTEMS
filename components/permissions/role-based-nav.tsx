
/**
 * Role-Based Navigation Component
 * Reusable component for role-specific UI controls
 * Updated: September 1, 2025
 */

'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, AlertTriangle, Users, Heart, UserCheck, 
  Settings, BookOpen, Cog, FileText, Key, BarChart3,
  Plus, UserPlus, Database, RefreshCw
} from 'lucide-react';
import {
  ChurchRole,
  CHURCH_ROLES,
  ActionButton,
  getAccessibleTabs,
  getRoleConfiguration,
  getActionButtons,
  hasTabAccess
} from '@/lib/role-access-control';

interface RoleBasedNavProps {
  showRoleInfo?: boolean
  showActionButtons?: boolean
  onActionClick?: (action: string) => void
  className?: string
}

export function RoleBasedNav({ 
  showRoleInfo = true, 
  showActionButtons = true,
  onActionClick,
  className = ""
}: RoleBasedNavProps) {
  const { data: session } = useSession() || {};
  
  const userRole = session?.user?.role as ChurchRole;
  const roleConfig = getRoleConfiguration(userRole);
  const accessibleTabs = getAccessibleTabs(userRole);
  const actionButtons = getActionButtons(userRole);

  // No session or invalid role
  if (!userRole || !roleConfig) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Rol no reconocido. Contacta a tu administrador.
        </AlertDescription>
      </Alert>
    );
  }

  const handleActionClick = (button: ActionButton) => {
    if (onActionClick) {
      onActionClick(button.action);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      Shield, Users, Heart, UserCheck, Settings, BookOpen, 
      Cog, FileText, Key, BarChart3, Plus, UserPlus, 
      Database, RefreshCw, AlertTriangle
    };
    return icons[iconName as keyof typeof icons] || Key;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Role Information Card */}
      {showRoleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Tu Acceso: {roleConfig.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Descripción del Rol</p>
                <p className="text-sm text-muted-foreground">{roleConfig.description}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Nivel de Prioridad</p>
                <Badge variant="outline">{roleConfig.priority}/100</Badge>
              </div>
              
              <div>
                <p className="text-sm font-medium">Secciones Disponibles ({accessibleTabs.length})</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {accessibleTabs.map(tab => (
                    <Badge key={tab.id} variant="secondary" className="text-xs">
                      {tab.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {roleConfig.restrictedActions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-600">Acciones Restringidas</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roleConfig.restrictedActions.map(action => (
                      <Badge key={action} variant="outline" className="text-xs border-orange-200">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {roleConfig.emergencyOverride && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    <strong>Privilegio Especial:</strong> Anulación de emergencia habilitada
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-Specific Action Buttons */}
      {showActionButtons && actionButtons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {actionButtons.map((button) => {
                const IconComponent = getIconComponent(button.icon);
                
                return (
                  <Button
                    key={button.id}
                    variant={button.variant}
                    onClick={() => handleActionClick(button)}
                    className="justify-start h-auto p-3"
                    title={button.description}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{button.label}</p>
                        <p className="text-xs text-muted-foreground">{button.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-2xl font-bold text-primary">{accessibleTabs.length}</p>
          <p className="text-xs text-muted-foreground">Secciones</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-2xl font-bold text-primary">{actionButtons.length}</p>
          <p className="text-xs text-muted-foreground">Acciones</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-2xl font-bold text-primary">{roleConfig.priority}</p>
          <p className="text-xs text-muted-foreground">Prioridad</p>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <p className="text-2xl font-bold text-primary">
            {roleConfig.emergencyOverride ? '✓' : '✗'}
          </p>
          <p className="text-xs text-muted-foreground">Override</p>
        </div>
      </div>
    </div>
  );
}

// Utility component for role-specific button groups
interface RoleButtonGroupProps {
  userRole: ChurchRole
  onAction: (action: string) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline' | 'ghost'
}

export function RoleButtonGroup({ 
  userRole, 
  onAction, 
  size = 'default',
  variant = 'outline'
}: RoleButtonGroupProps) {
  const actionButtons = getActionButtons(userRole);
  
  if (actionButtons.length === 0) return null;

  const getIconComponent = (iconName: string) => {
    const icons = {
      Plus, Shield, UserPlus, Heart, Users, FileText, 
      AlertTriangle, Database, RefreshCw, Cog, UserCheck, 
      BookOpen, Key, BarChart3, Settings
    };
    return icons[iconName as keyof typeof icons] || Key;
  };

  return (
    <div className="flex flex-wrap gap-2">
      {actionButtons.map((button) => {
        const IconComponent = getIconComponent(button.icon);
        
        return (
          <Button
            key={button.id}
            variant={variant}
            size={size}
            onClick={() => onAction(button.action)}
            title={button.description}
          >
            <IconComponent className="h-4 w-4 mr-2" />
            {button.label}
          </Button>
        );
      })}
    </div>
  );
}

// Permission check component for conditional rendering
interface PermissionGuardProps {
  requiredRoles: ChurchRole[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function PermissionGuard({ requiredRoles, fallback, children }: PermissionGuardProps) {
  const { data: session } = useSession() || {};
  const userRole = session?.user?.role as ChurchRole;
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return fallback || null;
  }
  
  return <>{children}</>;
}
