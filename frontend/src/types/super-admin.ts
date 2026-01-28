// Super Admin specific types

export interface SuperAdmin {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'SUPER_ADMIN';
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface SuperAdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        user: SuperAdmin;
        token: string;
    };
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
    plan: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
        users: number;
    };
    users?: OrganizationUser[];
}

export interface OrganizationUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface CreateOrganizationPayload {
    name: string;
    slug: string;
    domain?: string;
    plan?: string;
    ownerEmail: string;
    ownerPassword: string;
    ownerFirstName: string;
    ownerLastName: string;
}

export interface SuperAdminAuthContextType {
    superAdmin: SuperAdmin | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}
