
import React from 'react';
import { StationCard } from './StationCard';
import { RadioStation } from '@/types';

interface StationListProps {
  stations: RadioStation[];
  title?: string;
  emptyMessage?: string;
}

export const StationList: React.FC<StationListProps> = ({ 
  stations, 
  title, 
  emptyMessage = "No stations found"
}) => {
  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      
      {stations.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
};
