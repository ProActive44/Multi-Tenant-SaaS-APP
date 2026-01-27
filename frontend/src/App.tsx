import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import { SuperAdminAuthProvider } from './auth/SuperAdminAuthContext';
import { AppRoutes } from './routes/AppRoutes';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SuperAdminAuthProvider>
        <AppRoutes />
      </SuperAdminAuthProvider>
    </AuthProvider>
  );
};

export default App;

