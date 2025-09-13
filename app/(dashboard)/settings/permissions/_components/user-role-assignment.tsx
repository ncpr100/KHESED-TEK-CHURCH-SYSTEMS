
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Trash2, Users, 
  UserPlus, MoreHorizontal 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  priority: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserRole {
  id: string;
  user: User;
  role: Role;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

interface UserRoleAssignmentProps {
  roles: Role[];
  onAssignmentChange: () => void;
}

export function UserRoleAssignment({ roles, onAssignmentChange }: UserRoleAssignmentProps) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    loadUsers();
    loadUserRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadUserRoles = async () => {
    try {
      // En una implementación real, esto cargaría las asignaciones de roles
      // Por ahora, simularemos con datos vacíos
      setUserRoles([]);
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const filteredUserRoles = userRoles.filter(userRole => {
    const searchLower = searchTerm.toLowerCase();
    return userRole.user.name.toLowerCase().includes(searchLower) ||
           userRole.user.email.toLowerCase().includes(searchLower) ||
           userRole.role.name.toLowerCase().includes(searchLower);
  });

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !selectedRole) {
      toast.error('Selecciona un usuario y un rol');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          roleId: selectedRole,
        }),
      });

      if (response.ok) {
        toast.success('Rol asignado correctamente');
        setDialogOpen(false);
        setSelectedUser('');
        setSelectedRole('');
        loadUserRoles();
        onAssignmentChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al asignar el rol');
      }
    } catch (error) {
      toast.error('Error al asignar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userRole: UserRole) => {
    if (!confirm(`¿Estás seguro de remover el rol "${userRole.role.name}" del usuario "${userRole.user.name}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/user-roles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userRole.user.id,
          roleId: userRole.role.id,
        }),
      });

      if (response.ok) {
        toast.success('Rol removido correctamente');
        loadUserRoles();
        onAssignmentChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al remover el rol');
      }
    } catch (error) {
      toast.error('Error al remover el rol');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignación de Roles a Usuarios
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Asignar Rol a Usuario</DialogTitle>
                <DialogDescription>
                  Selecciona un usuario y el rol que deseas asignarle
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleAssignRole} className="space-y-4">
                <div>
                  <Label htmlFor="user">Usuario</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="outline" className="ml-2">Sistema</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Asignando...' : 'Asignar Rol'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar asignaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Tipo de Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Asignación</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUserRoles.length > 0 ? (
                filteredUserRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell className="font-medium">
                      {userRole.user.name}
                    </TableCell>
                    <TableCell>
                      {userRole.user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{userRole.role.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userRole.role.isSystem ? 'default' : 'secondary'}>
                        {userRole.role.isSystem ? 'Sistema' : 'Personalizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userRole.isActive ? 'default' : 'secondary'}>
                        {userRole.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(userRole.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleRemoveRole(userRole)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remover Rol
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay asignaciones de roles. Los usuarios siguen usando el sistema de roles básico.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Información sobre Roles</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Los usuarios tienen un rol básico asignado directamente (SUPER_ADMIN, ADMIN_IGLESIA, PASTOR, etc.). 
            El sistema avanzado de roles permite asignar roles adicionales con permisos específicos.
          </p>
          <p className="text-sm text-muted-foreground">
            Los permisos se evalúan combinando el rol básico del usuario con cualquier rol avanzado asignado.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
