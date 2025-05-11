import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, LogOut, LogIn, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { countries } from '@/data/countries';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
  ];

  if (user) {
    navItems.push({ icon: Heart, label: 'Favorites', path: '/favorites' });
  }

  if (user?.role === 'admin') {
    navItems.push({ icon: Heart, label: 'Admin', path: '/admin' });
  }

  const sidebarContent = (
    <>
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 mb-6" onClick={closeSidebar}>
          <img src="/RadioM-logo.png" alt="RadioM Logo" className="w-16 h-16 object-contain" />
        </Link>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg transition-colors",
                isActive(item.path)
                  ? "bg-secondary text-foreground"
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-6">
        {user ? (
          <div className="space-y-4">
            <Link to="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'} 
                  alt="User avatar"
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate flex items-center gap-2">
                  {user.name || 'User'}
                  {user.country && (
                    <span title={user.country} className="ml-1">
                      {(() => {
                        const c = countries.find(c => c.name === user.country);
                        return c ? c.emoji : '';
                      })()}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                {user.status && (
                  <p className="text-xs text-muted-foreground truncate">{user.status}</p>
                )}
              </div>
            </Link>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2 justify-center"
              onClick={() => {
                signOut();
                closeSidebar();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2 justify-center"
            onClick={closeSidebar}
            asChild
          >
            <Link to="/login">
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {isMobile ? (
        <div
          className={cn(
            "fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={toggleSidebar} />
          <div className="relative w-64 h-full bg-background border-r flex flex-col">
            {sidebarContent}
          </div>
        </div>
      ) : (
        <div className="w-64 h-full border-r flex flex-col shrink-0">
          {sidebarContent}
        </div>
      )}
    </>
  );
};
