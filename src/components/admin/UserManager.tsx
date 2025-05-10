
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

interface Profile {
  id: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

interface UserWithRole {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at?: string;
}

const UserManager: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userToPromote, setUserToPromote] = useState<UserWithRole | null>(null);
  const [userToDemote, setUserToDemote] = useState<UserWithRole | null>(null);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First, get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) throw profilesError;
      
      // Get user emails from auth metadata - this requires admin access
      // In a production app, you'd use a Supabase Edge Function for this
      // For now, we'll use a placeholder email format
      
      // Get all user roles
      const { data: roleData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'admin');
        
      if (rolesError) throw rolesError;
      
      // Create a set of admin user IDs for easy lookup
      const adminIds = new Set(roleData.map(role => role.user_id));
      
      // Combine the data - format emails based on ID since we can't access actual emails
      // In a real app with proper backend access, you'd get real emails
      const combinedUsers: UserWithRole[] = profiles.map((profile: Profile) => ({
        id: profile.id,
        email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder email
        name: profile.name || 'Anonymous User',
        avatar_url: profile.avatar_url,
        role: adminIds.has(profile.id) ? 'admin' : 'user',
        created_at: profile.created_at
      }));
      
      setUsers(combinedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToAdmin = async () => {
    if (!userToPromote) return;
    
    try {
      // Check if they already have the admin role
      const { data, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userToPromote.id)
        .eq('role', 'admin');
        
      if (checkError) throw checkError;
      
      // If they don't have the admin role, add it
      if (data.length === 0) {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userToPromote.id,
            role: 'admin'
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `${userToPromote.name || userToPromote.email} is now an admin.`,
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userToPromote.id ? { ...user, role: 'admin' } : user
      ));
      
      setUserToPromote(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to promote user",
        variant: "destructive",
      });
    }
  };
  
  const removeAdminRole = async () => {
    if (!userToDemote) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDemote.id)
        .eq('role', 'admin');
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${userToDemote.name || userToDemote.email} is no longer an admin.`,
      });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userToDemote.id ? { ...user, role: 'user' } : user
      ));
      
      setUserToDemote(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin role",
        variant: "destructive",
      });
    }
  };
  
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      (user.email?.toLowerCase().includes(query) || false) ||
      (user.name?.toLowerCase().includes(query) || false)
    );
  });

  if (loading && users.length === 0) {
    return <p className="text-center py-8">Loading users...</p>;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {searchQuery ? 'No users match your search' : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.name || ""} />
                      ) : (
                        <AvatarFallback>
                          {user.name ? user.name[0].toUpperCase() : 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="font-medium">{user.name || 'Anonymous User'}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {user.role === 'admin' ? (
                        <>
                          <ShieldAlert size={16} className="text-destructive" />
                          <span>Admin</span>
                        </>
                      ) : (
                        <span>User</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-right">
                    {user.role === 'admin' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUserToDemote(user)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        Remove Admin
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUserToPromote(user)}
                        className="flex items-center gap-1"
                      >
                        <Shield size={14} />
                        <span>Make Admin</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Promote to Admin Dialog */}
      <AlertDialog open={!!userToPromote} onOpenChange={() => setUserToPromote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make this user an Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will give {userToPromote?.name || userToPromote?.email} full administrative privileges,
              including the ability to manage stations and other users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={promoteToAdmin}>
              Make Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Remove Admin Dialog */}
      <AlertDialog open={!!userToDemote} onOpenChange={() => setUserToDemote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin privileges?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove administrative privileges from {userToDemote?.name || userToDemote?.email}.
              They will no longer be able to manage stations or users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeAdminRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManager;
