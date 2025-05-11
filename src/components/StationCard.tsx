// import React from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { RadioStation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface StationCardProps {
  station: RadioStation;
  variant?: 'default' | 'compact';
}

export const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  variant = 'default' 
}) => {
  const { currentStation, isPlaying, setCurrentStation, togglePlay, isFavorite, toggleFavorite } = useAppContext();
  const { user } = useAuth();
  
  const isActive = currentStation?.id === station.id;
  
  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      setCurrentStation(station);
    }
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite(station.id);
    }
  };

  if (variant === 'compact') {
    return (
      <Link to={`/radio/${station.id}`} style={{ textDecoration: 'none' }}>
        <Card
          className={cn(
            "flex items-center p-3 gap-3 cursor-pointer transition-all",
            isActive && "border-primary",
            "hover:bg-accent"
          )}
        >
          <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
            <img 
              src={station.imageUrl} 
              alt={station.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{station.name}</p>
            <p className="text-xs text-muted-foreground truncate">{station.category}</p>
          </div>
          {user && (
            <Button
              className="h-8 w-8 shrink-0"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={cn(
                  "h-4 w-4", 
                  isFavorite(station.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                )} 
              />
            </Button>
          )}
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/radio/${station.id}`} style={{ textDecoration: 'none' }}>
      <Card
        className={cn(
          "overflow-hidden cursor-pointer transition-all",
          isActive && "border-primary",
          "hover:shadow-md"
        )}
      >
        <div className="aspect-square relative overflow-hidden bg-muted">
          <img 
            src={station.imageUrl} 
            alt={station.name}
            className="w-full h-full object-cover transition-transform hover:scale-105" 
          />
          {station.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-white">
              Featured
            </Badge>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">{station.name}</h3>
            {user && (
              <Button
                className="h-8 w-8 -mr-2"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4", 
                    isFavorite(station.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )} 
                />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{station.category}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{station.listeners?.toLocaleString()} listeners</p>
            <span className={cn(
              "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-7 px-2",
              isActive && isPlaying ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}>
              {isActive && isPlaying ? "Playing" : "Play"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
