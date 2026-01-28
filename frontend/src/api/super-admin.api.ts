import superAdminAxios from './super-admin-axios';
import type {
    SuperAdminLoginResponse,
    SuperAdmin,
    Organization,
    CreateOrganizationPayload,
} from '../types/super-admin';
import type { ApiResponse, PaginatedResponse } from '../types/auth';

// Super Admin API client

export const superAdminAuthApi = {
    // Login
    login: async (email: string, password: string): Promise<SuperAdminLoginResponse> => {
        const response = await superAdminAxios.post<SuperAdminLoginResponse>('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    // Get profile
    getProfile: async (): Promise<ApiResponse<SuperAdmin>> => {
        const response = await superAdminAxios.get<ApiResponse<SuperAdmin>>('/auth/me');
        return response.data;
    },
};

export const superAdminOrgApi = {
    // Create organization with owner
    createOrganization: async (payload: CreateOrganizationPayload): Promise<ApiResponse<{ organization: Organization; owner: any }>> => {
        const response = await superAdminAxios.post<ApiResponse<{ organization: Organization; owner: any }>>('/organizations', payload);
        return response.data;
    },

    // List organizations
    listOrganizations: async (page = 1, limit = 10, search?: string, status?: string): Promise<PaginatedResponse<Organization>> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search }),
            ...(status && { status }),
        });

        const response = await superAdminAxios.get<PaginatedResponse<Organization>>(`/organizations?${params}`);
        return response.data;
    },

    // Get organization details
    getOrganization: async (id: string): Promise<ApiResponse<Organization>> => {
        const response = await superAdminAxios.get<ApiResponse<Organization>>(`/organizations/${id}`);
        return response.data;
    },

    // Update organization
    updateOrganization: async (id: string, data: Partial<Organization>): Promise<ApiResponse<Organization>> => {
        const response = await superAdminAxios.patch<ApiResponse<Organization>>(`/organizations/${id}`, data);
        return response.data;
    },

    // Enable organization
    enableOrganization: async (id: string): Promise<ApiResponse<Organization>> => {
        const response = await superAdminAxios.patch<ApiResponse<Organization>>(`/organizations/${id}/enable`);
        return response.data;
    },

    // Disable organization
    disableOrganization: async (id: string): Promise<ApiResponse<Organization>> => {
        const response = await superAdminAxios.patch<ApiResponse<Organization>>(`/organizations/${id}/disable`);
        return response.data;
    },

    // Delete organization
    deleteOrganization: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await superAdminAxios.delete<ApiResponse<{ message: string }>>(`/organizations/${id}`);
        return response.data;
    },
};
