
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REOPENED';

export interface TaskAssignee {
    id: string;
    taskId: string;
    userId: string;
    assignedAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role?: string;
    };
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
    organizationId: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    assignees: TaskAssignee[];
    createdBy: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

export interface CreateTaskPayload {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    assigneeIds: string[];
}

export interface UpdateTaskPayload {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    assigneeIds?: string[];
}

export interface TaskFilters {
    search?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    page?: number;
    limit?: number;
}
