import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, Mail, Users, Shield, Eye, Settings, UserCheck, UserX, Clock, MoreVertical, Filter, Download } from 'lucide-react';
import AdminNavbar from '@/components/AdminNavbar';
import { useSupabase } from '@/supabase';
import { userService } from '@/supabase/users';

const AdminUsers = () => {
  const { executeQuery } = useSupabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await executeQuery(() => userService.getUsers());
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const customerUsers = users.filter(u => u.role === 'customer').length;

  const stats = [
    { title: 'Total Users', value: totalUsers.toString(), change: '+3', icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { title: 'Active Users', value: activeUsers.toString(), change: '+2', icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-50' },
    { title: 'Customers', value: customerUsers.toString(), change: '+1', icon: UserX, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { title: 'Admin Users', value: adminUsers.toString(), change: '0', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-green-100 text-green-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AdminNavbar />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage team members and their permissions</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4" />
                  <span>Invite User</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>Invite New User</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-name" className="text-sm font-medium">Full Name</Label>
                    <Input id="invite-name" placeholder="Enter full name" className="border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-email" className="text-sm font-medium">Email Address</Label>
                    <Input id="invite-email" type="email" placeholder="user@example.com" className="border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-role" className="text-sm font-medium">Role</Label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full Access</SelectItem>
                        <SelectItem value="customer">Customer - Order Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-department" className="text-sm font-medium">Department</Label>
                    <Select>
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administration">Administration</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invite-message" className="text-sm font-medium">Welcome Message (Optional)</Label>
                    <Textarea 
                      id="invite-message" 
                      placeholder="Add a personal welcome message..." 
                      className="border-gray-200 resize-none" 
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsInviteDialogOpen(false)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600">
                    <Mail className="w-4 h-4" />
                    <span>Send Invite</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`border-0 shadow-lg ${stat.bgColor} relative overflow-hidden`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-1">+{stat.change} this month</p>
                    </div>
                    <div className={`p-3 rounded-full bg-white/50 ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">Team Members ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-100">
                  <TableHead className="font-semibold text-gray-700">User</TableHead>
                  <TableHead className="font-semibold text-gray-700">Role & Department</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Last Activity</TableHead>
                  <TableHead className="font-semibold text-gray-700">Permissions</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`font-semibold text-white ${
                            user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                            user.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                            user.role === 'support' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                            'bg-gradient-to-br from-purple-500 to-indigo-600'
                          }`}>
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <p className="text-sm text-gray-500">{user.department}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'active' ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-900">{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                          <p className="text-xs text-gray-500">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.permissions?.slice(0, 2).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs mr-1">
                            {permission.replace('_', ' ').toUpperCase()}
                          </Badge>
                        )) || <Badge variant="outline" className="text-xs">No permissions</Badge>}
                        {user.permissions && user.permissions.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{user.permissions.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className={`font-semibold text-white text-lg ${
                                    user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-600' :
                                    user.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-purple-600' :
                                    user.role === 'support' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                    'bg-gradient-to-br from-purple-500 to-indigo-600'
                                  }`}>
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h2 className="text-xl font-bold">{user.name}</h2>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 mt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                  <CardContent className="p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">Role Information</h3>
                                    <p className="text-blue-800">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
                                    <p className="text-sm text-blue-600">{user.department}</p>
                                  </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                  <CardContent className="p-4">
                                    <h3 className="font-semibold text-green-900 mb-2">Account Status</h3>
                                    <p className="text-green-800">{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</p>
                                    <p className="text-sm text-green-600">Last login: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</p>
                                  </CardContent>
                                </Card>
                              </div>
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Permissions & Access</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {user.permissions?.map((permission, index) => (
                                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        <span className="text-sm">{permission.replace('_', ' ').toUpperCase()}</span>
                                      </div>
                                    )) || <p className="text-gray-500">No permissions assigned</p>}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-gray-50">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="flex items-center space-x-2">
                              <Edit className="w-4 h-4" />
                              <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center space-x-2">
                              <Settings className="w-4 h-4" />
                              <span>Manage Permissions</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center space-x-2">
                              <Mail className="w-4 h-4" />
                              <span>Send Message</span>
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem className="flex items-center space-x-2 text-orange-600">
                                <UserX className="w-4 h-4" />
                                <span>Deactivate User</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="flex items-center space-x-2 text-green-600">
                                <UserCheck className="w-4 h-4" />
                                <span>Activate User</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="flex items-center space-x-2 text-red-600">
                              <Trash2 className="w-4 h-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminUsers;