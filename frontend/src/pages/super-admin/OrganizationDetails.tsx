import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '../../components/SuperAdminLayout';
import { superAdminOrgApi } from '../../api/super-admin.api';
import type { Organization } from '../../types/super-admin';

export const OrganizationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchOrganization();
        }
    }, [id]);

    const fetchOrganization = async () => {
        if (!id) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await superAdminOrgApi.getOrganization(id);
            setOrganization(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load organization');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnableOrganization = async () => {
        if (!id || !organization) return;
        if (!confirm(`Enable organization "${organization.name}"?`)) return;

        try {
            await superAdminOrgApi.enableOrganization(id);
            fetchOrganization();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to enable organization');
        }
    };

    const handleDisableOrganization = async () => {
        if (!id || !organization) return;
        if (!confirm(`Disable organization "${organization.name}"? Users will not be able to login.`)) return;

        try {
            await superAdminOrgApi.disableOrganization(id);
            fetchOrganization();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to disable organization');
        }
    };

    const handleDeleteOrganization = async () => {
        if (!id || !organization) return;
        if (!confirm(`DELETE organization "${organization.name}"? This will permanently delete all users and data. This action cannot be undone.`)) return;

        try {
            await superAdminOrgApi.deleteOrganization(id);
            navigate('/super-admin/organizations');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete organization');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'suspended':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case 'free':
                return 'bg-gray-100 text-gray-800';
            case 'pro':
                return 'bg-blue-100 text-blue-800';
            case 'enterprise':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'ORG_OWNER':
                return 'bg-purple-100 text-purple-800';
            case 'ORG_ADMIN':
                return 'bg-blue-100 text-blue-800';
            case 'ORG_MEMBER':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <SuperAdminLayout>
                <div className="p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="inline-flex items-center gap-3 text-gray-600">
                            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Loading organization...</span>
                        </div>
                    </div>
                </div>
            </SuperAdminLayout>
        );
    }

    if (error || !organization) {
        return (
            <SuperAdminLayout>
                <div className="p-8">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <p className="text-red-700">{error || 'Organization not found'}</p>
                        <button
                            onClick={() => navigate('/super-admin/organizations')}
                            className="mt-4 text-red-600 hover:text-red-800 font-medium"
                        >
                            ← Back to Organizations
                        </button>
                    </div>
                </div>
            </SuperAdminLayout>
        );
    }

    const owner = organization.users?.find(u => u.role === 'ORG_OWNER');

    return (
        <SuperAdminLayout>
            <div className="p-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => navigate('/super-admin/organizations')}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                            <p className="text-gray-600 mt-1">Organization Details</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {organization.status === 'active' ? (
                                <button
                                    onClick={handleDisableOrganization}
                                    className="px-4 py-2 text-orange-600 border border-orange-600 rounded-lg hover:bg-orange-50 font-medium transition-colors"
                                >
                                    Disable
                                </button>
                            ) : (
                                <button
                                    onClick={handleEnableOrganization}
                                    className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
                                >
                                    Enable
                                </button>
                            )}
                            <button
                                onClick={handleDeleteOrganization}
                                className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Organization Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Information</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Name</p>
                                    <p className="text-base text-gray-900">{organization.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Slug</p>
                                    <p className="text-base text-gray-900 font-mono">{organization.slug}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Domain</p>
                                    <p className="text-base text-gray-900">{organization.domain || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Plan</p>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(organization.plan)}`}>
                                        {organization.plan.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(organization.status)}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${organization.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                                    <p className="text-base text-gray-900">{organization.users?.length || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                                    <p className="text-base text-gray-900">
                                        {new Date(organization.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Last Updated</p>
                                    <p className="text-base text-gray-900">
                                        {new Date(organization.updatedAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Users List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Users ({organization.users?.length || 0})</h2>
                            </div>
                            {organization.users && organization.users.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Role
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                    Last Login
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {organization.users.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                                <span className="text-blue-700 font-medium text-sm">
                                                                    {user.firstName[0]}{user.lastName[0]}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {user.firstName} {user.lastName}
                                                                </p>
                                                                <p className="text-sm text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                            {user.role === 'ORG_OWNER' ? 'Owner' : user.role === 'ORG_ADMIN' ? 'Admin' : 'Member'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-gray-600'}`}></span>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {user.lastLoginAt
                                                            ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })
                                                            : 'Never'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600">No users found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Owner Info */}
                        {owner && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization Owner</h2>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                                        <span className="text-purple-700 font-medium">
                                            {owner.firstName[0]}{owner.lastName[0]}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {owner.firstName} {owner.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{owner.email}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className={`font-medium ${owner.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                                            {owner.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Last Login:</span>
                                        <span className="text-gray-900">
                                            {owner.lastLoginAt
                                                ? new Date(owner.lastLoginAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })
                                                : 'Never'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Created:</span>
                                        <span className="text-gray-900">
                                            {new Date(owner.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Active Users</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {organization.users?.filter(u => u.isActive).length || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Admins</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {organization.users?.filter(u => u.role === 'ORG_ADMIN' || u.role === 'ORG_OWNER').length || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Members</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {organization.users?.filter(u => u.role === 'ORG_MEMBER').length || 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};
