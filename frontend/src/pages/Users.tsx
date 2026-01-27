import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { usersApi } from '../api/auth.api';
import type { User } from '../types/auth';

export const Users: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const { user: currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const limit = 10;

    // Check if user can create users (ORG_OWNER or ORG_ADMIN)
    const canCreateUsers = currentUser?.role === 'ORG_OWNER' || currentUser?.role === 'ORG_ADMIN';

    // Fetch users
    const fetchUsers = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await usersApi.getUsers(page, limit);
            setUsers(response.data);
            setTotal(response.pagination.total);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleCreateUser = () => {
        navigate('/users/create');
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!canCreateUsers) return;

        try {
            await usersApi.toggleUserStatus(userId, !currentStatus);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (!canCreateUsers) return;

        if (!confirm(`Are you sure you want to delete ${userEmail}?`)) {
            return;
        }

        try {
            await usersApi.deleteUser(userId);
            fetchUsers(); // Refresh list
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                            {currentUser?.organization && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {currentUser.organization.name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{currentUser?.role}</p>
                            </div>
                            <button onClick={handleLogout} className="btn btn-secondary">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Actions */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">
                            Total: {total} user{total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {canCreateUsers && (
                        <button onClick={handleCreateUser} className="btn btn-primary">
                            + Create User
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="card">
                        <p className="text-center text-gray-600">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="card">
                        <p className="text-center text-gray-600">No users found.</p>
                    </div>
                ) : (
                    <>
                        {/* Users Table */}
                        <div className="card overflow-hidden p-0">
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Last Login</th>
                                            {canCreateUsers && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="font-medium">
                                                    {user.firstName} {user.lastName}
                                                </td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="text-gray-500">
                                                    {user.lastLoginAt
                                                        ? new Date(user.lastLoginAt).toLocaleDateString()
                                                        : 'Never'}
                                                </td>
                                                {canCreateUsers && (
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                                disabled={user.id === currentUser?.id}
                                                            >
                                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id, user.email)}
                                                                className="text-sm text-red-600 hover:text-red-800"
                                                                disabled={user.id === currentUser?.id}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex justify-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn btn-secondary disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};
