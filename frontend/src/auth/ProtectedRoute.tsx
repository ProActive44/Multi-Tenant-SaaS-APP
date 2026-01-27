import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="card max-w-md">
                    <h2 className="text-xl font-semibold text-red-600 mb-2">Access Denied</h2>
                    <p className="text-gray-600">
                        You don't have permission to access this page.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
