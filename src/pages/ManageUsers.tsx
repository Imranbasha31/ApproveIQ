import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS, UserRole } from '@/types/leave';
import { 
  Search, 
  User, 
  Mail, 
  Building,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/services/api';
import { PREDEFINED_USERS } from '@/contexts/AuthContext';

const getRoleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'default';
    case 'principal': return 'success';
    case 'hod': return 'warning';
    case 'advisor': return 'pending';
    default: return 'secondary';
  }
};

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  username?: string;
}

export default function ManageUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as string,
    department: '',
    username: '',
    password: '',
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getUsers();
      setUsers(data);
    } catch {
      // Fallback to predefined users
      setUsers(PREDEFINED_USERS.map(({ password, ...u }) => u));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'student', department: '', username: '', password: '' });
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || '',
      username: user.username || '',
      password: '',
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({ title: 'Validation Error', description: 'Name, email, and role are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        await apiClient.updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
        });
        toast({ title: 'User updated', description: `${formData.name} has been updated successfully.` });
      } else {
        await apiClient.createUser({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          username: formData.username || formData.email.split('@')[0],
          password: formData.password || undefined,
        });
        toast({ title: 'User created', description: `${formData.name} has been added successfully.` });
      }
      setDialogOpen(false);
      await loadUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save user.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setSaving(true);
    try {
      await apiClient.deleteUser(userToDelete.id);
      toast({ title: 'User deleted', description: `${userToDelete.name} has been removed.` });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await loadUsers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete user.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Manage Users</h1>
          <p className="text-muted-foreground mt-1">Add, edit, and manage system users</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">All Users ({users.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role as UserRole)}>
                      {ROLE_LABELS[user.role as UserRole] || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.department ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building className="h-4 w-4" />
                        {user.department}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => openDeleteDialog(user)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user details below.' : 'Fill in the details to create a new user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Auto-generated from email if empty"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="advisor">Class Advisor</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{userToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
