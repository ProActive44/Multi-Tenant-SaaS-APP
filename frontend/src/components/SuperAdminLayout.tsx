import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '../auth/SuperAdminAuthContext';

interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    const { superAdmin, logout } = useSuperAdminAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/super-admin/login');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
                {/* Logo/Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SA</span>
                        </div>
                        <div>
                            <span className="font-semibold text-white">Super Admin</span>
                            <p className="text-xs text-gray-400">System Management</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link
                        to="/super-admin/organizations"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/super-admin/organizations')
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Organizations
                    </Link>

                    <Link
                        to="/super-admin/organizations/create"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/super-admin/organizations/create')
                                ? 'bg-red-600 text-white'
                                : 'text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Organization
                    </Link>
                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-gray-700 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                                {superAdmin?.firstName?.[0]}{superAdmin?.lastName?.[0]}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {superAdmin?.firstName} {superAdmin?.lastName}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{superAdmin?.email}</p>
                        </div>
                    </div>

                    <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Super Admin
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
};
