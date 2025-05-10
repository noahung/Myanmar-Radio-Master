
import React, { useState } from 'react';
import { StationCard } from './StationCard';
import { RadioStation } from '@/types';

interface StationGridProps {
  stations: RadioStation[];
  title?: string;
  emptyMessage?: string;
}

export const StationGrid: React.FC<StationGridProps> = ({ 
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}
    </div>
  );
};
