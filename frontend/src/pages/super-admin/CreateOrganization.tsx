import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SuperAdminLayout } from '../../components/SuperAdminLayout';
import { superAdminOrgApi } from '../../api/super-admin.api';

export const CreateOrganization: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        domain: '',
        plan: 'free',
        ownerEmail: '',
        ownerPassword: '',
        ownerFirstName: '',
        ownerLastName: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await superAdminOrgApi.createOrganization(formData);
            navigate('/super-admin/organizations');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/super-admin/organizations');
    };

    return (
        <SuperAdminLayout>
            <div className="p-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Organization</h1>
                            <p className="text-gray-600 mt-1">Set up a new organization with an owner account</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-3xl">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Organization Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Organization Details
                                </h3>

                                <div className="space-y-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Organization Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                            placeholder="Acme Corporation"
                                            required
                                        />
                                    </div>

                                    {/* Slug */}
                                    <div>
                                        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                            Slug <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="slug"
                                            name="slug"
                                            type="text"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow font-mono"
                                            placeholder="acme-corporation"
                                            pattern="[a-z0-9-]+"
                                            required
                                        />
                                        <p className="mt-2 text-sm text-gray-500">Lowercase letters, numbers, and hyphens only</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Domain */}
                                        <div>
                                            <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                                                Custom Domain
                                            </label>
                                            <input
                                                id="domain"
                                                name="domain"
                                                type="text"
                                                value={formData.domain}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                                placeholder="acme.com"
                                            />
                                        </div>

                                        {/* Plan */}
                                        <div>
                                            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-2">
                                                Plan <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                id="plan"
                                                name="plan"
                                                value={formData.plan}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                                required
                                            >
                                                <option value="free">Free</option>
                                                <option value="pro">Pro</option>
                                                <option value="enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Owner Account */}
                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Owner Account
                                </h3>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <div>
                                            <label htmlFor="ownerFirstName" className="block text-sm font-medium text-gray-700 mb-2">
                                                First Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="ownerFirstName"
                                                name="ownerFirstName"
                                                type="text"
                                                value={formData.ownerFirstName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                                placeholder="John"
                                                required
                                            />
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label htmlFor="ownerLastName" className="block text-sm font-medium text-gray-700 mb-2">
                                                Last Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="ownerLastName"
                                                name="ownerLastName"
                                                type="text"
                                                value={formData.ownerLastName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                                placeholder="Doe"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="ownerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="ownerEmail"
                                            name="ownerEmail"
                                            type="email"
                                            value={formData.ownerEmail}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                            placeholder="owner@acme.com"
                                            required
                                        />
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="ownerPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="ownerPassword"
                                            name="ownerPassword"
                                            type="password"
                                            value={formData.ownerPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-shadow"
                                            placeholder="Minimum 6 characters"
                                            minLength={6}
                                            required
                                        />
                                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            Owner will be created with ORG_OWNER role
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-500/30"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating Organization...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Create Organization
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 text-gray-700 font-medium bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
};
