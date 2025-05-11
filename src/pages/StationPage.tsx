import * as React from 'react';
import { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { countries } from '@/data/countries';

const StationPage: React.FC = () => {
  console.log('STATION PAGE RENDERED');
  const { stationId } = useParams<{ stationId: string }>();
  const { stations, currentStation, isPlaying, togglePlay, setCurrentStation, toggleFavorite, isFavorite } = useAppContext();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  
  // Find the station
  const station = stations.find(s => s.id === stationId);
  
  // Debug block for station info
  const debugInfo = (
    <div style={{ background: '#fff0f0', color: '#b00', border: '2px solid #b00', padding: 12, marginBottom: 16, zIndex: 9999 }}>
      <b>DEBUG</b><br />
      <div><b>stationId:</b> {String(stationId)}</div>
      <div><b>station:</b> {station ? JSON.stringify(station, null, 2) : 'null'}</div>
      <div><b>comments.length:</b> {comments.length}</div>
      {commentError && <div style={{ color: '#b00' }}>Comment error: {commentError}</div>}
    </div>
  );
  
  // Redirect if station not found
  if (!station) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Station not found</h2>
        {debugInfo}
        <p className="text-muted-foreground">No station matches this ID.</p>
      </div>
    );
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
      toast.error('Failed to post comment');
    }
  };
  
  // Find related stations (same category)
  const relatedStations = stations
    .filter(s => s.id !== station.id && s.category === station.category)
    .slice(0, 5);

  return (
    <>
      <div style={{background:'lime',color:'black',padding:20,fontSize:24,textAlign:'center',zIndex:99999}}>HELLO FROM STATION PAGE</div>
      <div style={{background:'red',color:'white',padding:20,fontSize:24,textAlign:'center',zIndex:99999}}>STATION PAGE RENDERED</div>
      <div className="space-y-8">
        {debugInfo}
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
            {/* Debug: Show raw comments data */}
            <div className="mt-4 p-2 bg-muted text-xs rounded overflow-x-auto">
              <div><b>Raw comments data:</b></div>
              <pre>{JSON.stringify(comments, null, 2)}</pre>
            </div>
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
    </>
  );
};

export default StationPage;
