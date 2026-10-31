import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider } from './context/HospitalContext';
import { LoginPage } from './pages/LoginPage';
import { MainLayout } from './components/layout/MainLayout';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <MainLayout /> : <LoginPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <HospitalProvider>
        <AppContent />
      </HospitalProvider>
    </AuthProvider>
  );
}
