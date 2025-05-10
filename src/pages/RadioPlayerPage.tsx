
import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';

const RadioPlayerPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations, currentStation, isPlaying, setCurrentStation, togglePlay } = useAppContext();
  
  useEffect(() => {
    if (stationId) {
      const station = stations.find(s => s.id === stationId);
      if (station) {
        setCurrentStation(station);
      }
    }
    
    return () => {
      // When component unmounts, don't stop the player
      // This allows for continuous playback when navigating between pages
    };
  }, [stationId, stations, setCurrentStation]);
  
  const station = stations.find(s => s.id === stationId);
  
  if (!station) {
    return <Navigate to="/discover" />;
  }
  
  const isActiveStation = currentStation?.id === station.id;
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {station.imageUrl ? (
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{station.name}</h1>
          <p className="text-muted-foreground mt-2">{station.category}</p>
          
          {station.description && (
            <p className="mt-4">{station.description}</p>
          )}
          
          <div className="mt-6">
            <Button 
              size="lg"
              className="gap-2"
              onClick={() => {
                if (isActiveStation) {
                  togglePlay();
                } else {
                  setCurrentStation(station);
                }
              }}
            >
              {isActiveStation && isPlaying ? (
                <>
                  <Pause className="h-5 w-5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Play
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              <span>{station.listeners || 0} listeners</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioPlayerPage;
