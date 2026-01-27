import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSuperAdminAuth } from './SuperAdminAuthContext';

interface SuperAdminProtectedRouteProps {
    children: React.ReactNode;
}

export const SuperAdminProtectedRoute: React.FC<SuperAdminProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useSuperAdminAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // Redirect to super admin login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/super-admin/login" replace />;
    }

    return <>{children}</>;
};
