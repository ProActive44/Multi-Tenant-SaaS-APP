import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { SuperAdminProtectedRoute } from '../auth/SuperAdminProtectedRoute';
import { Login } from '../pages/Login';
import { Users } from '../pages/Users';
import { CreateUser } from '../pages/CreateUser';
import { EditUser } from '../pages/EditUser';
import { TaskList } from '../pages/tasks/TaskList';
import { CreateTask } from '../pages/tasks/CreateTask';
import { EditTask } from '../pages/tasks/EditTask';
import { SuperAdminLogin } from '../pages/super-admin/SuperAdminLogin';
import { Organizations } from '../pages/super-admin/Organizations';
import { CreateOrganization } from '../pages/super-admin/CreateOrganization';
import { OrganizationDetails } from '../pages/super-admin/OrganizationDetails';

export const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Organization User Routes */}
                <Route path="/login" element={<Login />} />

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

                <Route
                    path="/users/edit/:id"
                    element={
                        <ProtectedRoute allowedRoles={['ORG_OWNER', 'ORG_ADMIN']}>
                            <EditUser />
                        </ProtectedRoute>
                    }
                />

                {/* Task Routes */}
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <TaskList />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks/create"
                    element={
                        <ProtectedRoute allowedRoles={['ORG_OWNER', 'ORG_ADMIN']}>
                            <CreateTask />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/tasks/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditTask />
                        </ProtectedRoute>
                    }
                />

                {/* Super Admin Routes */}
                <Route path="/super-admin/login" element={<SuperAdminLogin />} />

                <Route
                    path="/super-admin/organizations"
                    element={
                        <SuperAdminProtectedRoute>
                            <Organizations />
                        </SuperAdminProtectedRoute>
                    }
                />

                <Route
                    path="/super-admin/organizations/create"
                    element={
                        <SuperAdminProtectedRoute>
                            <CreateOrganization />
                        </SuperAdminProtectedRoute>
                    }
                />

                <Route
                    path="/super-admin/organizations/:id"
                    element={
                        <SuperAdminProtectedRoute>
                            <OrganizationDetails />
                        </SuperAdminProtectedRoute>
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

