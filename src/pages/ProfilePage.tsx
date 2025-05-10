
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Redirect if not logged in
  if (!isLoading && !user) {
    return <Navigate to="/login" />;
  }
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-24 h-24">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user.name || ""} />
          ) : (
            <AvatarFallback className="text-xl">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="text-center">
          <h2 className="font-medium text-lg">{user?.name || 'Anonymous User'}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      
      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Display Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
          />
        </div>
        
        <Button type="submit" disabled={isUpdating} className="w-full">
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
