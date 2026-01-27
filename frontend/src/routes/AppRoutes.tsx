import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { Login } from '../pages/Login';
import { Users } from '../pages/Users';
import { CreateUser } from '../pages/CreateUser';

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/users/create"
                    element={
                        <ProtectedRoute allowedRoles={['ORG_OWNER', 'ORG_ADMIN']}>
                            <CreateUser />
                        </ProtectedRoute>
                    }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/users" replace />} />

                {/* 404 - Redirect to users */}
                <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
