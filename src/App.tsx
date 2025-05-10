
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RadioPlayerPage from './pages/RadioPlayerPage';
import FavoritesPage from './pages/FavoritesPage';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { MainLayout } from './layouts/MainLayout';
import Index from './pages/Index';
import AdminDashboardPage from './pages/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/index" element={<Index />} />
            <Route path="/" element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            } />
            <Route path="/radio/:stationId" element={
              <MainLayout>
                <RadioPlayerPage />
              </MainLayout>
            } />
            <Route path="/favorites" element={
              <MainLayout>
                <FavoritesPage />
              </MainLayout>
            } />
            <Route path="/login" element={
              <MainLayout>
                <LoginPage />
              </MainLayout>
            } />
            <Route path="/register" element={
              <MainLayout>
                <RegisterPage />
              </MainLayout>
            } />
             <Route path="/profile" element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            } />
            <Route path="/admin" element={
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            } />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
