
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StationManager from '@/components/admin/StationManager';
import UserManager from '@/components/admin/UserManager';
import { RadioIcon, Users } from 'lucide-react';

const AdminDashboardPage = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("stations");
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  // Redirect if user is not logged in or not an admin
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="stations" className="flex items-center gap-2">
            <RadioIcon size={16} />
            <span>Manage Stations</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users size={16} />
            <span>Manage Users</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stations" className="p-6 bg-background rounded-lg shadow-sm border">
          <StationManager />
        </TabsContent>
        
        <TabsContent value="users" className="p-6 bg-background rounded-lg shadow-sm border">
          <UserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboardPage;
