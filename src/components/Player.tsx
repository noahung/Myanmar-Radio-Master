
import React, { useState } from 'react';
import { 
  Play, Pause, Volume2, Volume1, VolumeX, Clock, X 
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/contexts/AppContext';
import { useAudioContext } from '@/contexts/AudioContext';
import { cn } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

export const Player: React.FC = () => {
  const { currentStation, isPlaying, volume, togglePlay, setVolume } = useAppContext();
  const { isBuffering, sleepTimerId, setSleepTimer, cancelSleepTimer, remainingSleepTime } = useAudioContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };
  
  const setTimerOption = (minutes: number) => {
    setSleepTimer(minutes);
    setDialogOpen(false);
  };

  if (!currentStation) {
    return null;
  }

  return (
    <div className="border-t bg-card p-4 flex items-center gap-4 h-24">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
          <img
            src={currentStation.imageUrl}
            alt={currentStation.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="font-semibold truncate">{currentStation.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {currentStation.description}
          </p>
          {isBuffering && <p className="text-xs text-primary animate-pulse">Buffering...</p>}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={togglePlay}
          className="h-10 w-10 rounded-full"
        >
          {isPlaying ? 
            <Pause className="h-5 w-5" /> : 
            <Play className="h-5 w-5" />
          }
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "hidden sm:flex",
              volume === 0 && "text-muted-foreground"
            )}
            onClick={() => setVolume(volume === 0 ? 0.5 : 0)}
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <div className="w-24 hidden sm:block">
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className={cn(remainingSleepTime && "text-primary")}
            >
              <Clock className="h-4 w-4" />
              {remainingSleepTime && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  {Math.ceil(remainingSleepTime / 60)}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Sleep Timer</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 py-4">
              {[5, 15, 30, 45, 60, 90].map((minutes) => (
                <Button 
                  key={minutes} 
                  variant="outline"
                  onClick={() => setTimerOption(minutes)}
                >
                  {minutes} minutes
                </Button>
              ))}
            </div>
            {sleepTimerId && (
              <div className="flex justify-between items-center py-2">
                <div>
                  <p className="text-sm font-medium">Active Timer</p>
                  <p className="text-xs text-muted-foreground">
                    {remainingSleepTime ? formatTime(remainingSleepTime) : 'None'}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={cancelSleepTimer}>
                  Cancel Timer
                </Button>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
