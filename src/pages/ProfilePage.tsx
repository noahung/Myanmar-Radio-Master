
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Flag } from 'lucide-react';
import { countries } from '@/data/countries';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [country, setCountry] = useState(user?.country || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCountry(user.country || '');
    }
  }, [user]);
  
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
        .update({ 
          name,
          country 
        })
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
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !user) return;
    
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    setIsUploading(true);
    
    try {
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update avatar",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  
  return (
    <div className="max-w-md mx-auto space-y-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className="w-24 h-24">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name || ""} />
            ) : (
              <AvatarFallback className="text-xl">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          
          <label 
            htmlFor="avatar-upload" 
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <span className="sr-only">Upload new avatar</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </label>
          
          <input 
            type="file" 
            id="avatar-upload" 
            className="sr-only" 
            accept="image/*" 
            onChange={handleAvatarChange}
            disabled={isUploading}
          />
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <h2 className="font-medium text-lg">{user?.name || 'Anonymous User'}</h2>
            {user?.country && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Flag className="h-4 w-4 mr-1" />
                <span>{user.country}</span>
              </div>
            )}
          </div>
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
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country
          </label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="">Not specified</SelectItem>
              {countries.map(country => (
                <SelectItem key={country.code} value={country.name}>
                  {country.emoji} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button type="submit" disabled={isUpdating || isUploading} className="w-full">
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
