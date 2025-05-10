
import React from 'react';
import { StationGrid } from '@/components/StationGrid';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const { stations, favorites } = useAppContext();
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md mx-auto">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign in to see your favorites</h1>
          <p className="text-muted-foreground mb-6">
            Create an account or sign in to keep track of your favorite stations
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const favoriteStations = stations.filter(station => 
    favorites.includes(station.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 items-start">
        <h1 className="text-3xl font-bold">Your Favorites</h1>
        <p className="text-muted-foreground">
          Here are all the stations you've added to your favorites
        </p>
      </div>
      
      <StationGrid
        stations={favoriteStations}
        emptyMessage="You haven't added any favorite stations yet"
      />
      
      {favoriteStations.length === 0 && (
        <div className="text-center pt-8">
          <Button asChild>
            <Link to="/discover">Discover Stations</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
