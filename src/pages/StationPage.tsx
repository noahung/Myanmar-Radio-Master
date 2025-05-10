
import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { StationGrid } from '@/components/StationGrid';

const StationPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations, currentStation, isPlaying, togglePlay, setCurrentStation, toggleFavorite, isFavorite } = useAppContext();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  
  // Find the station
  const station = stations.find(s => s.id === stationId);
  
  // Redirect if station not found
  if (!station) {
    return <Navigate to="/discover" />;
  }
  
  const isCurrentStation = currentStation?.id === station.id;
  
  const handlePlay = () => {
    if (isCurrentStation) {
      togglePlay();
    } else {
      setCurrentStation(station);
    }
  };
  
  const handleFavorite = () => {
    if (user) {
      toggleFavorite(station.id);
    } else {
      toast.error("You must be signed in to add favorites");
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Listen to ${station.name} on Myanmar Radio`,
        text: station.description,
        url: window.location.href,
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Station link copied to clipboard");
    }
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // This will be replaced with Supabase implementation
    toast.success("Comment feature coming soon!");
    setComment('');
  };
  
  // Find related stations (same category)
  const relatedStations = stations
    .filter(s => s.id !== station.id && s.category === station.category)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img 
              src={station.imageUrl} 
              alt={station.name}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>
        
        <div className="md:w-2/3 space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{station.name}</h1>
            <p className="text-muted-foreground">{station.category}</p>
          </div>
          
          <p className="text-base">{station.description}</p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{station.listeners?.toLocaleString()} listeners</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              size="lg"
              className="gap-2"
              onClick={handlePlay}
            >
              {isCurrentStation && isPlaying ? (
                <>
                  <Pause className="h-5 w-5" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" /> Play
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleFavorite}
            >
              <Heart className={isFavorite(station.id) ? "fill-primary text-primary" : ""} />
            </Button>
            
            <Button 
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleShare}
            >
              <Share2 />
            </Button>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" /> Comments
        </h2>
        
        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.charAt(0) || user.email.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <Button type="submit" variant="secondary">
              Post
            </Button>
          </form>
        ) : (
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-muted-foreground">Sign in to join the conversation</p>
            <Button variant="link" className="mt-2" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">Comments coming soon</p>
        </div>
      </div>
      
      {relatedStations.length > 0 && (
        <>
          <Separator />
          <StationGrid
            title="Similar Stations"
            stations={relatedStations}
          />
        </>
      )}
    </div>
  );
};

export default StationPage;
