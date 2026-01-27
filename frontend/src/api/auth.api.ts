import axiosInstance from './axios';
import type { LoginCredentials, LoginResponse, ApiResponse, User, PaginatedResponse, CreateUserPayload } from '../types/auth';

// Auth API endpoints
export const authApi = {
    // Login
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    // Get current user profile
    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await axiosInstance.get<ApiResponse<User>>('/auth/me');
        return response.data;
    },
};

// Users API endpoints
export const usersApi = {
    // Get users in organization
    getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
        const response = await axiosInstance.get<PaginatedResponse<User>>(
            `/users?page=${page}&limit=${limit}`
        );
        return response.data;
    },

    // Get current user
    getCurrentUser: async (): Promise<ApiResponse<User>> => {
        const response = await axiosInstance.get<ApiResponse<User>>('/users/me');
        return response.data;
    },

    // Create user
    createUser: async (payload: CreateUserPayload): Promise<ApiResponse<User>> => {
        const response = await axiosInstance.post<ApiResponse<User>>('/users', payload);
        return response.data;
    },

    // Delete user
    deleteUser: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
        const response = await axiosInstance.delete<ApiResponse<{ message: string }>>(`/users/${userId}`);
        return response.data;
    },

    // Toggle user status
    toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<User>> => {
        const response = await axiosInstance.patch<ApiResponse<User>>(
            `/users/${userId}/status`,
            { isActive }
        );
        return response.data;
    },
};
