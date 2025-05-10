
import React, { createContext, useContext, useState, useEffect } from 'react';
import { RadioStation } from '../types';
import { mockStations } from '../data/mockData';

interface AppContextType {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  volume: number;
  favorites: string[];
  setCurrentStation: (station: RadioStation) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<RadioStation[]>(mockStations);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const savedFavorites = localStorage.getItem('favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFavorite = (stationId: string) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(stationId)) {
        return prevFavorites.filter(id => id !== stationId);
      } else {
        return [...prevFavorites, stationId];
      }
    });
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
