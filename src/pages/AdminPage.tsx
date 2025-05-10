
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StationList } from '@/components/StationList';
import { useAppContext } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { stations } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Redirect if not admin
  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }
  
  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    station.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your radio stations, users, and application settings
        </p>
      </div>
      
      <Tabs defaultValue="stations">
        <TabsList>
          <TabsTrigger value="stations">Stations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stations" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search stations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Add Station</Button>
          </div>
          
          <StationList
            stations={filteredStations}
            emptyMessage="No stations found matching your search"
          />
        </TabsContent>
        
        <TabsContent value="users">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">User management coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Settings panel coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
