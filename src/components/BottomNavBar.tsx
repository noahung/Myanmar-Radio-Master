import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Favourites', icon: Heart, path: '/favorites', auth: true },
  { label: 'Profile', icon: User, path: '/profile' },
];

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex justify-around items-center h-16 md:hidden shadow-lg">
      {navItems.map((item) => {
        if (item.auth && !user) return null;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavBar; 