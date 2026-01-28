import axiosInstance from './axios';
import type { ApiResponse, PaginatedResponse } from '../types/auth';
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilters } from '../types/task';

export const taskApi = {
    // Create task
    createTask: async (payload: CreateTaskPayload): Promise<ApiResponse<Task>> => {
        const response = await axiosInstance.post<ApiResponse<Task>>('/tasks', payload);
        return response.data;
    },

    // Get all tasks
    getTasks: async (filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> => {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.status) params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);

        const response = await axiosInstance.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
        return response.data;
    },

    // Get task by ID
    getTaskById: async (id: string): Promise<ApiResponse<Task>> => {
        const response = await axiosInstance.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data;
    },

    // Update task
    updateTask: async (id: string, payload: UpdateTaskPayload): Promise<ApiResponse<Task>> => {
        const response = await axiosInstance.patch<ApiResponse<Task>>(`/tasks/${id}`, payload);
        return response.data;
    },

    // Delete task
    deleteTask: async (id: string): Promise<ApiResponse<null>> => {
        const response = await axiosInstance.delete<ApiResponse<null>>(`/tasks/${id}`);
        return response.data;
    },
};
