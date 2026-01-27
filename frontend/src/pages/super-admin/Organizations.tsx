import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '../../components/SuperAdminLayout';
import { superAdminOrgApi } from '../../api/super-admin.api';
import type { Organization } from '../../types/super-admin';

export const Organizations: React.FC = () => {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const navigate = useNavigate();
    const limit = 10;

    // Fetch organizations
    const fetchOrganizations = async () => {
        setIsLoading(true);
        setError('');

        try {
            const response = await superAdminOrgApi.listOrganizations(page, limit, search, statusFilter);
            setOrganizations(response.data);
            setTotal(response.pagination.total);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load organizations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [page, search, statusFilter]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleViewOrganization = (id: string) => {
        navigate(`/super-admin/organizations/${id}`);
    };

    const handleEnableOrganization = async (id: string, name: string) => {
        if (!confirm(`Enable organization "${name}"?`)) return;

        try {
            await superAdminOrgApi.enableOrganization(id);
            fetchOrganizations();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to enable organization');
        }
    };

    const handleDisableOrganization = async (id: string, name: string) => {
        if (!confirm(`Disable organization "${name}"? Users will not be able to login.`)) return;

        try {
            await superAdminOrgApi.disableOrganization(id);
            fetchOrganizations();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to disable organization');
        }
    };

    const handleDeleteOrganization = async (id: string, name: string) => {
        if (!confirm(`DELETE organization "${name}"? This will permanently delete all users and data. This action cannot be undone.`)) return;

        try {
            await superAdminOrgApi.deleteOrganization(id);
            fetchOrganizations();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete organization');
        }
    };

    const totalPages = Math.ceil(total / limit);

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

    return (
        <SuperAdminLayout>
            <div className="p-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
                            <p className="text-gray-600 mt-1">Manage all organizations in the system</p>
                        </div>
                        <button
                            onClick={() => navigate('/super-admin/organizations/create')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Organization
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {organizations.filter(o => o.status === 'active').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Suspended</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {organizations.filter(o => o.status === 'suspended').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Current Page</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {page} / {totalPages || 1}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or slug..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Organizations Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center gap-3 text-gray-600">
                                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading organizations...</span>
                            </div>
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <p className="text-gray-600 font-medium">No organizations found</p>
                            <p className="text-sm text-gray-500 mt-1">Create your first organization to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Organization
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Plan
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Users
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {organizations.map((org) => (
                                        <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{org.name}</p>
                                                    <p className="text-sm text-gray-500">{org.slug}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(org.plan)}`}>
                                                    {org.plan.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(org.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${org.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                    {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {org._count?.users || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(org.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleViewOrganization(org.id)}
                                                        className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    {org.status === 'active' ? (
                                                        <button
                                                            onClick={() => handleDisableOrganization(org.id, org.name)}
                                                            className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
                                                        >
                                                            Disable
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleEnableOrganization(org.id, org.name)}
                                                            className="text-green-600 hover:text-green-800 font-medium transition-colors"
                                                        >
                                                            Enable
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteOrganization(org.id, org.name)}
                                                        className="text-red-600 hover:text-red-800 font-medium transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                                    <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                                    <span className="font-medium">{total}</span> organizations
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-sm text-gray-700">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
};
