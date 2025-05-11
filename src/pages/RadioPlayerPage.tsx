import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, HeartOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/data/countries';
import { MessageCircle } from 'lucide-react';

const RadioPlayerPage: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations, currentStation, isPlaying, setCurrentStation, togglePlay, toggleFavorite, isFavorite } = useAppContext();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [comment, setComment] = React.useState('');
  const [comments, setComments] = React.useState<any[]>([]);
  const [loadingComments, setLoadingComments] = React.useState(true);
  const [posting, setPosting] = React.useState(false);
  const [commentError, setCommentError] = React.useState<string | null>(null);
  const [myanmarTime, setMyanmarTime] = React.useState('');
  
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
    return <Navigate to="/" />;
  }
  
  const isActiveStation = currentStation?.id === station.id;
  const isStationFavorite = isFavorite(station.id);
  
  const handleFavoriteToggle = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to save favorites",
        variant: "destructive"
      });
      return;
    }
    
    await toggleFavorite(station.id);
  };
  
  // Fetch comments for this station
  React.useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      setCommentError(null);
      const { data, error } = await supabase
        .from('station_comments')
        .select('*, profiles:profiles!station_comments_user_id_fkey(id, name, avatar_url, country, status)')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setComments(data);
      } else {
        setComments([]);
        setCommentError(error ? error.message : 'Unknown error');
        console.error('Error fetching comments:', error);
      }
      setLoadingComments(false);
    };
    if (stationId) fetchComments();
  }, [stationId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    setPosting(true);
    const { error } = await supabase.from('station_comments').insert({
      content: comment,
      station_id: stationId,
      user_id: user.id,
    });
    setPosting(false);
    if (!error) {
      setComment('');
      // Refetch comments
      const { data } = await supabase
        .from('station_comments')
        .select('*, profiles:profiles!station_comments_user_id_fkey(id, name, avatar_url, country, status)')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });
      setComments(data || []);
    } else {
      toast({ title: 'Failed to post comment', variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    const updateMyanmarTime = () => {
      const now = new Date();
      // Myanmar is UTC+6:30
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const mmTime = new Date(utc + (6.5 * 60 * 60 * 1000));
      setMyanmarTime(mmTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateMyanmarTime();
    const interval = setInterval(updateMyanmarTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
          <div className="text-sm text-primary font-mono mt-1">Myanmar Time (MMT): {myanmarTime}</div>
          <p className="text-muted-foreground mt-2">{station.category}</p>
          
          {station.description && (
            <p className="mt-4">{station.description}</p>
          )}
          
          <div className="mt-6 flex flex-wrap gap-3 justify-center md:justify-start">
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
            
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={handleFavoriteToggle}
            >
              {isStationFavorite ? (
                <Heart className="h-5 w-5 fill-primary text-primary" />
              ) : (
                <Heart className="h-5 w-5" />
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
      <Separator />
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span><MessageCircle className="h-5 w-5" /></span> Comments
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
                disabled={posting}
              />
            </div>
            <Button type="submit" variant="secondary" disabled={posting}>
              {posting ? 'Posting...' : 'Post'}
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
          {commentError && (
            <div className="text-red-500 text-xs">Error loading comments: {commentError}</div>
          )}
          {loadingComments ? (
            <p className="text-center text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground">No comments yet. Be the first to comment!</p>
          ) : (
            comments.map((c) => {
              const profile = c.profiles;
              const countryObj = countries.find((ct) => ct.name === profile?.country);
              return (
                <div key={c.id} className="flex gap-3 items-start bg-muted/30 rounded-lg p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{profile?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{profile?.name || 'User'}</span>
                      {countryObj && (
                        <span title={countryObj.name} className="text-lg">{countryObj.emoji}</span>
                      )}
                      {profile?.status && (
                        <span className="ml-2 text-xs text-muted-foreground">{profile.status}</span>
                      )}
                    </div>
                    <div className="text-sm mt-0.5">{c.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RadioPlayerPage;
