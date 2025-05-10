
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

const RadioPlayerPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations, setCurrentStation } = useAppContext();
  
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
  
  const currentStation = stations.find(s => s.id === stationId);
  
  if (!currentStation) {
    return <div className="p-8 text-center">Station not found</div>;
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {currentStation.imageUrl ? (
          <img
            src={currentStation.imageUrl}
            alt={currentStation.name}
            className="w-48 h-48 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold">{currentStation.name}</h1>
          <p className="text-muted-foreground mt-2">{currentStation.category}</p>
          
          {currentStation.description && (
            <p className="mt-4">{currentStation.description}</p>
          )}
          
          <div className="mt-6">
            <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              <span>{currentStation.listeners || 0} listeners</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Player is rendered via the MainLayout component */}
      <div className="h-12 md:hidden"></div>
    </div>
  );
};

export default RadioPlayerPage;
