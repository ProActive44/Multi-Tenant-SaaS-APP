// User roles in the system
export type UserRole = 'SUPER_ADMIN' | 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_MEMBER';

// Organization info
export interface Organization {
    id: string;
    name: string;
    slug: string;
    status?: string;
}

// User object
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string | null;
    organization?: Organization;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt?: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Login response from API
export interface LoginResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

// API response wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Paginated response
export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Create user payload
export interface CreateUserPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
}

// Auth context type
export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}
