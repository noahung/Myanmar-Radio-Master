
import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import { toast } from 'sonner';

interface AudioContextType {
  audioRef: React.RefObject<HTMLAudioElement>;
  isBuffering: boolean;
  duration: number;
  currentTime: number;
  sleepTimerId: number | null;
  setSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  remainingSleepTime: number | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentStation, isPlaying, volume, togglePlay } = useAppContext();
  const [isBuffering, setIsBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sleepTimerId, setSleepTimerId] = useState<number | null>(null);
  const [remainingSleepTime, setRemainingSleepTime] = useState<number | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      audio.src = currentStation.streamUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(error => {
          console.error("Error playing audio:", error);
          togglePlay();
          toast.error("Failed to play station. Please try again.");
        });
      }
    } else {
      audio.pause();
      audio.src = '';
    }

    return () => {
      audio.pause();
    };
  }, [currentStation, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsBuffering(false);
    const handlePause = () => setIsBuffering(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };
    const handleError = () => {
      setIsBuffering(false);
      toast.error("Error streaming this station. Please try again later.");
      togglePlay();
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const setSleepTimer = (minutes: number) => {
    cancelSleepTimer();
    
    const endTime = Date.now() + minutes * 60 * 1000;
    setRemainingSleepTime(minutes * 60);
    
    const timerId = window.setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      
      if (remaining <= 0) {
        cancelSleepTimer();
        togglePlay();
        toast.info("Sleep timer ended. Playback stopped.");
      } else {
        setRemainingSleepTime(remaining);
      }
    }, 1000);
    
    setSleepTimerId(timerId);
    toast.success(`Sleep timer set for ${minutes} minutes`);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerId) {
      clearInterval(sleepTimerId);
      setSleepTimerId(null);
      setRemainingSleepTime(null);
      toast.info("Sleep timer cancelled");
    }
  };

  return (
    <AudioContext.Provider value={{
      audioRef,
      isBuffering,
      duration,
      currentTime,
      sleepTimerId,
      setSleepTimer,
      cancelSleepTimer,
      remainingSleepTime,
    }}>
      <audio ref={audioRef} preload="auto" />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioContext = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
};
