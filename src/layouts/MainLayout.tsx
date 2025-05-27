import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Player } from '@/components/Player';
import { useAppContext } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import BottomNavBar from '@/components/BottomNavBar';
import MiniPlayer from '@/components/MiniPlayer';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentStation } = useAppContext();
  
  return (
    <div className="h-full flex flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4 lg:px-8 py-6">
          <div className={cn(
            "max-w-6xl mx-auto pb-24",
            currentStation ? "md:pb-28" : "pb-6"
          )}>
            {children}
          </div>
        </ScrollArea>
        
        {currentStation && <Player />}
      </main>
      <MiniPlayer />
      <BottomNavBar />
    </div>
  );
};
