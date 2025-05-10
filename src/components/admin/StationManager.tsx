
import React, { useState, useEffect } from 'react';
import { RadioStation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StationForm from './StationForm';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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

const StationManager: React.FC = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentStation, setCurrentStation] = useState<RadioStation | undefined>(undefined);
  const [stationToDelete, setStationToDelete] = useState<RadioStation | null>(null);
  
  const fetchStations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('radio_stations')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      // Map DB fields to our RadioStation type
      const mappedStations: RadioStation[] = data.map(station => ({
        id: station.id,
        name: station.name,
        streamUrl: station.stream_url,
        imageUrl: station.image_url || undefined,
        description: station.description || undefined,
        category: station.category,
        isFeatured: station.is_featured || false,
        listeners: station.listeners || 0,
      }));
      
      setStations(mappedStations);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch stations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStations();
  }, []);
  
  const handleAddNew = () => {
    setCurrentStation(undefined);
    setShowForm(true);
  };
  
  const handleEdit = (station: RadioStation) => {
    setCurrentStation(station);
    setShowForm(true);
  };
  
  const handleDelete = async () => {
    if (!stationToDelete) return;
    
    try {
      const { error } = await supabase
        .from('radio_stations')
        .delete()
        .eq('id', stationToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: "Station Deleted",
        description: `${stationToDelete.name} has been deleted successfully.`,
      });
      
      // Remove from local state
      setStations(prev => prev.filter(s => s.id !== stationToDelete.id));
      
      // Close modal
      setStationToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete station",
        variant: "destructive",
      });
    }
  };
  
  const handleFormSubmit = () => {
    setShowForm(false);
    fetchStations();
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setCurrentStation(undefined);
  };

  if (loading && stations.length === 0) {
    return <p className="text-center py-8">Loading stations...</p>;
  }
  
  if (showForm) {
    return (
      <div className="p-6 bg-background rounded-lg shadow-sm border">
        <StationForm 
          station={currentStation} 
          onSubmit={handleFormSubmit} 
          onCancel={handleFormCancel} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Radio Stations</h2>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <PlusCircle size={16} />
          <span>Add New Station</span>
        </Button>
      </div>
      
      {stations.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <h3 className="text-xl font-medium mb-2">No Stations Yet</h3>
          <p className="text-muted-foreground mb-4">Add your first radio station to get started</p>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <PlusCircle size={16} />
            <span>Add New Station</span>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map((station, index) => (
                <TableRow key={station.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell>{station.category}</TableCell>
                  <TableCell className="text-center">
                    {station.isFeatured ? 'Yes' : 'No'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(station)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setStationToDelete(station)}
                        className="text-destructive hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!stationToDelete} onOpenChange={() => setStationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{stationToDelete?.name}" and remove it from all users' favorites.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StationManager;
