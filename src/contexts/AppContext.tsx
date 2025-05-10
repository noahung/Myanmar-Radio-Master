
import React, { createContext, useContext, useState, useEffect } from 'react';
import { RadioStation } from '../types';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface AppContextType {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  favorites: string[];
  isLoadingStations: boolean;
  setCurrentStation: (station: RadioStation) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleFavorite: (stationId: string) => Promise<void>;
  isFavorite: (stationId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);

  // Fetch stations from Supabase
  useEffect(() => {
    const fetchStations = async () => {
      setIsLoadingStations(true);
      try {
        const { data, error } = await supabase
          .from('radio_stations')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

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
      } catch (error) {
        console.error('Error fetching stations:', error);
        toast({
          title: 'Error',
          description: 'Failed to load radio stations',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchStations();

    // Set up realtime subscription for stations
    const channel = supabase
      .channel('public:radio_stations')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'radio_stations' 
      }, (payload) => {
        // Refetch stations when changes occur
        fetchStations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch user's favorites when user changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavorites([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_favorites')
          .select('station_id')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        const favoriteIds = data.map(item => item.station_id);
        setFavorites(favoriteIds);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [user]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavorite = async (stationId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save favorites',
      });
      return;
    }

    try {
      if (favorites.includes(stationId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('station_id', stationId);

        if (error) throw error;

        setFavorites(prevFavorites => prevFavorites.filter(id => id !== stationId));
        toast({
          title: 'Station Removed',
          description: 'Removed from your favorites',
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            station_id: stationId
          });

        if (error) throw error;

        setFavorites(prevFavorites => [...prevFavorites, stationId]);
        toast({
          title: 'Station Added',
          description: 'Added to your favorites',
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (stationId: string) => {
    return favorites.includes(stationId);
  };

  return (
    <AppContext.Provider value={{
      stations,
      currentStation,
      isPlaying,
      volume,
      favorites,
      isLoadingStations,
      setCurrentStation,
      togglePlay,
      setVolume,
      toggleFavorite,
      isFavorite,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
