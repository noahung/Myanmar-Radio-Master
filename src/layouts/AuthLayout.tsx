
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AuthLayout: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="h-full">
      <Outlet />
    </div>
  );
};
