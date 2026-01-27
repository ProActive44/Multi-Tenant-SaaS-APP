import React, { createContext, useContext, useState, useEffect } from 'react';
import { superAdminAuthApi } from '../api/super-admin.api';
import type { SuperAdmin, SuperAdminAuthContextType } from '../types/super-admin';

// Create context
const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

// SuperAdminAuthProvider component
export const SuperAdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('superAdminToken');
        const storedSuperAdmin = localStorage.getItem('superAdmin');

        if (storedToken && storedSuperAdmin) {
            setToken(storedToken);
            setSuperAdmin(JSON.parse(storedSuperAdmin));
        }

        setIsLoading(false);
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        try {
            const response = await superAdminAuthApi.login(email, password);

            if (response.success) {
                const { user, token } = response.data;

                // Verify user is actually SUPER_ADMIN
                if (user.role !== 'SUPER_ADMIN') {
                    throw new Error('Invalid credentials');
                }

                // Store in state
                setSuperAdmin(user);
                setToken(token);

                // Store in localStorage
                localStorage.setItem('superAdminToken', token);
                localStorage.setItem('superAdmin', JSON.stringify(user));
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error: any) {
            // Clear any existing auth data
            logout();

            // Re-throw with user-friendly message
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    };

    // Logout function
    const logout = () => {
        setSuperAdmin(null);
        setToken(null);
        localStorage.removeItem('superAdminToken');
        localStorage.removeItem('superAdmin');
    };

    const value: SuperAdminAuthContextType = {
        superAdmin,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!superAdmin,
        isLoading,
    };

    return <SuperAdminAuthContext.Provider value={value}>{children}</SuperAdminAuthContext.Provider>;
};

// Custom hook to use super admin auth context
export const useSuperAdminAuth = (): SuperAdminAuthContextType => {
    const context = useContext(SuperAdminAuthContext);
    if (context === undefined) {
        throw new Error('useSuperAdminAuth must be used within a SuperAdminAuthProvider');
    }
    return context;
};
