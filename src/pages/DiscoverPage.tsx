
import React, { useState, useEffect } from 'react';
import { StationGrid } from '@/components/StationGrid';
import { Input } from '@/components/ui/input';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useAppContext } from '@/contexts/AppContext';
import { Search } from 'lucide-react';

const DiscoverPage: React.FC = () => {
  const { stations } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredStations, setFilteredStations] = useState(stations);

  useEffect(() => {
    const filtered = stations.filter(station => {
      const matchesCategory = selectedCategory === 'All' || station.category === selectedCategory;
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    setFilteredStations(filtered);
  }, [searchQuery, selectedCategory, stations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <h1 className="text-3xl font-bold">Discover Stations</h1>
        <div className="w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search stations by name or description..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <CategoryFilter selectedCategory={selectedCategory} onChange={setSelectedCategory} />
      
      <StationGrid
        stations={filteredStations}
        emptyMessage="No stations found matching your search"
      />
    </div>
  );
};

export default DiscoverPage;
