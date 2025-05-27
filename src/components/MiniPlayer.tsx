import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ChevronUp } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const MiniPlayer: React.FC = () => {
  const { currentStation, isPlaying, togglePlay } = useAppContext();
  const navigate = useNavigate();

  if (!currentStation) return null;

  return (
    <div className="fixed left-0 right-0 bottom-16 z-40 md:hidden px-2 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-[#18192b] rounded-2xl shadow-lg flex items-center px-3 py-2 pointer-events-auto">
        {/* Station Image */}
        {currentStation.imageUrl ? (
          <img
            src={currentStation.imageUrl}
            alt={currentStation.name}
            className="w-12 h-12 object-cover rounded-xl mr-3"
          />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mr-3">
            <span className="text-muted-foreground text-xs">No Image</span>
          </div>
        )}
        {/* Station Name */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate text-white">{currentStation.name}</div>
        </div>
        {/* Play/Pause */}
        <Button
          size="icon"
          className="rounded-full bg-primary text-primary-foreground mx-2"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </Button>
        {/* Expand */}
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full"
          onClick={() => navigate(`/station/${currentStation.id}`)}
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default MiniPlayer; 