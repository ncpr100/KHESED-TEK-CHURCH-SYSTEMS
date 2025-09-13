
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
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Search, Edit, Trash2, Key, 
  Filter, MoreHorizontal 
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

interface PermissionsListProps {
  permissions: Permission[];
  onPermissionChange: () => void;
}

export function PermissionsList({ permissions, onPermissionChange }: PermissionsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    resource: '',
    action: '',
    isActive: true,
  });

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesResource = !selectedResource || permission.resource === selectedResource;
    return matchesSearch && matchesResource;
  });

  const resources = [...new Set(permissions.map(p => p.resource))];

  const openEditDialog = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      description: permission.description || '',
      resource: permission.resource,
      action: permission.action,
      isActive: permission.isActive,
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPermission(null);
    setFormData({
      name: '',
      description: '',
      resource: '',
      action: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingPermission 
        ? `/api/permissions/${editingPermission.id}`
        : '/api/permissions';
      
      const method = editingPermission ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingPermission ? 'Permiso actualizado' : 'Permiso creado');
        setDialogOpen(false);
        onPermissionChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el permiso');
      }
    } catch (error) {
      toast.error('Error al guardar el permiso');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (permission: Permission) => {
    if (!confirm(`¿Estás seguro de eliminar el permiso "${permission.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/permissions/${permission.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Permiso eliminado');
        onPermissionChange();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el permiso');
      }
    } catch (error) {
      toast.error('Error al eliminar el permiso');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Permisos del Sistema
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Permiso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPermission ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
                </DialogTitle>
                <DialogDescription>
                  {editingPermission 
                    ? 'Modifica los detalles del permiso'
                    : 'Define un nuevo permiso para el sistema'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: members.read"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Activo</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción del permiso"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="resource">Recurso</Label>
                    <Input
                      id="resource"
                      value={formData.resource}
                      onChange={(e) => setFormData({...formData, resource: e.target.value})}
                      placeholder="Ej: members, events, donations"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="action">Acción</Label>
                    <Input
                      id="action"
                      value={formData.action}
                      onChange={(e) => setFormData({...formData, action: e.target.value})}
                      placeholder="Ej: read, write, delete, manage"
                      required
                    />
                  </div>
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
              placeholder="Buscar permisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">Todos los recursos</option>
              {resources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    {permission.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission.resource}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{permission.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={permission.isActive ? 'default' : 'secondary'}>
                      {permission.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {permission.description || '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(permission)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(permission)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredPermissions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron permisos
          </div>
        )}
      </CardContent>
    </Card>
  );
}
