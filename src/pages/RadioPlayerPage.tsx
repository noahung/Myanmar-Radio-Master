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
    <div className="flex flex-col items-center w-full max-w-md mx-auto pt-6 pb-4 px-2">
      {/* Player Card */}
      <div className="relative w-full bg-[#18192b] rounded-3xl shadow-xl flex flex-col items-center p-6 mb-8">
        {/* Favorite Icon */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-4 right-4 p-2 rounded-full bg-background/60 hover:bg-background/80 transition-colors"
        >
          {isStationFavorite ? (
            <Heart className="h-6 w-6 text-primary fill-primary" />
          ) : (
            <Heart className="h-6 w-6 text-muted-foreground" />
          )}
        </button>
        {/* Station Image */}
        {station.imageUrl ? (
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-48 h-48 object-cover rounded-2xl shadow-lg mb-6"
          />
        ) : (
          <div className="w-48 h-48 bg-muted rounded-2xl flex items-center justify-center mb-6">
            <span className="text-muted-foreground">No Image</span>
          </div>
        )}
        {/* Station Name */}
        <h1 className="text-3xl font-bold text-center mb-1">{station.name}</h1>
        {/* Myanmar Time */}
        <div className="text-sm text-primary font-mono mb-1">Myanmar Time (MMT): {myanmarTime}</div>
        {/* Category */}
        <div className="mb-2">
          <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">{station.category}</span>
        </div>
        {/* Description */}
        {station.description && (
          <p className="text-center text-muted-foreground text-sm mb-4">{station.description}</p>
        )}
        {/* Player Controls */}
        <div className="w-full flex flex-col items-center mt-2">
          <div className="flex items-center justify-center gap-8 w-full mt-4 mb-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-primary text-primary-foreground shadow-lg w-16 h-16 flex items-center justify-center text-3xl"
              onClick={() => {
                if (isActiveStation) {
                  togglePlay();
                } else {
                  setCurrentStation(station);
                }
              }}
            >
              {isActiveStation && isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
            </Button>
          </div>
        </div>
        {/* Listeners */}
        <div className="mt-6">
          <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            <span>{station.listeners || 0} listeners</span>
          </div>
        </div>
      </div>
      <Separator />
      <div className="w-full max-w-xl bg-[#18192b] rounded-2xl shadow-lg p-4 mt-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <span><MessageCircle className="h-5 w-5" /></span> Comments
        </h2>
        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6 sticky bottom-0 z-10 bg-[#18192b] p-2 rounded-xl">
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
                className="bg-background rounded-lg px-3 py-2"
              />
            </div>
            <Button type="submit" variant="secondary" disabled={posting} className="rounded-lg px-4">
              {posting ? '...' : 'Post'}
            </Button>
          </form>
        ) : (
          <div className="bg-muted/50 rounded-lg p-4 text-center mb-6">
            <p className="text-muted-foreground">Sign in to join the conversation</p>
            <Button variant="link" className="mt-2" asChild>
              <a href="/login">Sign In</a>
            </Button>
          </div>
        )}
        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
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
                <div key={c.id} className="flex gap-3 items-start bg-background/60 rounded-lg p-3">
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
