import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { RadioStation } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const RadioPlayerPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { setCurrentStation } = useAppContext();
  const [station, setStation] = useState<RadioStation | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('radio_stations')
          .select('*')
          .eq('id', stationId)
          .single();

        if (error) throw error;

        // Map DB fields to our RadioStation type
        const mappedStation: RadioStation = {
          id: data.id,
          name: data.name,
          streamUrl: data.stream_url,
          imageUrl: data.image_url || undefined,
          description: data.description || undefined,
          category: data.category,
          isFeatured: data.is_featured || false,
          listeners: data.listeners || 0,
        };
        
        setStation(mappedStation);
        setCurrentStation(mappedStation);
      } catch (error: any) {
        console.error("Error fetching station:", error);
        toast({
          title: "Error",
          description: "Failed to load radio station",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchStation();
    }

    // Cleanup function
    return () => {
      // We don't set currentStation to null here because we want the player to continue
      // This allows the music to keep playing when navigating away from the page
    };
  }, [stationId, setCurrentStation]);

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading station...</div>;
  }

  if (!station) {
    return <div className="text-center py-12">Station not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <div className="aspect-square rounded-lg overflow-hidden shadow-lg bg-card">
            {station.imageUrl ? (
              <img 
                src={station.imageUrl} 
                alt={station.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/50 to-primary/10">
                <span className="text-4xl font-bold text-primary/80">{station.name[0]}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold mb-3">{station.name}</h1>
          
          <div className="bg-muted inline-block px-3 py-1 rounded-full text-sm font-medium mb-4">
            {station.category}
          </div>
          
          {station.description && (
            <p className="text-muted-foreground mb-6">{station.description}</p>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{station.listeners} listeners</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayerPage;
