
'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, Search, Edit, Trash2, Shield, 
  Filter, MoreHorizontal, Users 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

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

interface RolesListProps {
  roles: Role[];
  permissions: Permission[];
  onRoleChange: () => void;
}

export function RolesList({ roles, permissions, onRoleChange }: RolesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 50,
    isActive: true,
  });

  const filteredRoles = roles.filter(role => {
    return role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (role.description?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      priority: role.priority,
      isActive: true, // Los roles siempre están activos en este sistema
    });
    setSelectedPermissions(role.rolePermissions.map(rp => rp.permission.id));
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      priority: 50,
      isActive: true,
    });
    setSelectedPermissions([]);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingRole 
        ? `/api/roles-advanced/${editingRole.id}`
        : '/api/roles-advanced';
      
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          permissions: selectedPermissions,
        }),
      });

      if (response.ok) {
        toast.success(editingRole ? 'Rol actualizado' : 'Rol creado');
        setDialogOpen(false);
        onRoleChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el rol');
      }
    } catch (error) {
      toast.error('Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error('No se pueden eliminar roles del sistema');
      return;
    }

    if (role._count.userRoles > 0) {
      toast.error('No se puede eliminar un rol que tiene usuarios asignados');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roles-advanced/${role.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Rol eliminado');
        onRoleChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el rol');
      }
    } catch (error) {
      toast.error('Error al eliminar el rol');
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles del Sistema
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </DialogTitle>
                <DialogDescription>
                  {editingRole 
                    ? 'Modifica los detalles del rol y sus permisos'
                    : 'Define un nuevo rol y asigna permisos'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre del Rol</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ej: Coordinador de Eventos"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Prioridad (0-100)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Descripción del rol y sus responsabilidades"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Asignación de permisos */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Permisos del Rol</Label>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                      <div key={resource} className="mb-6 last:mb-0">
                        <h4 className="font-medium text-sm uppercase text-muted-foreground mb-3">
                          {resource}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {resourcePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={selectedPermissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                              />
                              <Label 
                                htmlFor={permission.id}
                                className="text-sm cursor-pointer flex-1"
                              >
                                <span className="font-medium">{permission.action}</span>
                                {permission.description && (
                                  <span className="text-muted-foreground block text-xs">
                                    {permission.description}
                                  </span>
                                )}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPermissions.length} permisos seleccionados
                  </p>
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
                    {loading ? 'Guardando...' : 'Guardar'}
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
              placeholder="Buscar roles..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Usuarios</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    {role.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={role.isSystem ? 'default' : 'outline'}>
                      {role.isSystem ? 'Sistema' : 'Personalizado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {role._count.rolePermissions} permisos
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{role._count.userRoles}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    <p className="truncate">
                      {role.description || '-'}
                    </p>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(role)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <DropdownMenuItem 
                            onClick={() => handleDelete(role)}
                            className="text-destructive"
                            disabled={role._count.userRoles > 0}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron roles
          </div>
        )}
      </CardContent>
    </Card>
  );
}
