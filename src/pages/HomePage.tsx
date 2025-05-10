
import React, { useState } from 'react';
import { StationGrid } from '@/components/StationGrid';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useAppContext } from '@/contexts/AppContext';

const HomePage: React.FC = () => {
  const { stations } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const featuredStations = stations.filter(
    (station) => station.isFeatured && (selectedCategory === 'All' || station.category === selectedCategory)
  );
  
  const regularStations = stations.filter(
    (station) => !station.isFeatured && (selectedCategory === 'All' || station.category === selectedCategory)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <h1 className="text-3xl font-bold">Welcome to Myanmar Radio</h1>
        <p className="text-muted-foreground">
          Discover the best radio stations from Myanmar. Listen to your favorite music, news, and more.
        </p>
      </div>
      
      <CategoryFilter selectedCategory={selectedCategory} onChange={setSelectedCategory} />
      
      {featuredStations.length > 0 && (
        <StationGrid 
          title="Featured Stations" 
          stations={featuredStations}
        />
      )}
      
      <StationGrid 
        title="All Stations" 
        stations={regularStations}
        emptyMessage={`No ${selectedCategory} stations found`}
      />
    </div>
  );
};

export default HomePage;
