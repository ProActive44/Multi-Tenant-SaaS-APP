import taskRepository from './task.repository.js';
import userRepository from '../users/user.repository.js';

class TaskService {
    /**
     * Create a new task
     * @param {Object} data - Task data
     * @param {string} organizationId - From token
     * @param {Object} user - Authenticated user
     */
    async createTask(data, organizationId, user) {
        const { title, description, priority, dueDate, assigneeIds = [] } = data;

        // RBAC: Only ORG_ADMIN and ORG_OWNER can create tasks (acting as Managers)
        if (!['ORG_ADMIN', 'ORG_OWNER'].includes(user.role)) {
            // If the user role is ORG_MEMBER, they cannot create tasks.
            const error = new Error('Permission denied: Only Admins/Owners can create tasks');
            error.statusCode = 403;
            throw error;
        }

        // Validate assignees belong to organization
        if (assigneeIds.length > 0) {
            const validAssignees = await userRepository.findByOrganization(organizationId);
            const validIds = new Set(validAssignees.users.map(u => u.id));

            const invalidIds = assigneeIds.filter(id => !validIds.has(id));
            if (invalidIds.length > 0) {
                const error = new Error(`Invalid assignees: Users ${invalidIds.join(', ')} do not belong to this organization`);
                error.statusCode = 400;
                throw error;
            }
        }

        return await taskRepository.create({
            title,
            description,
            priority,
            status: 'OPEN',
            dueDate: dueDate ? new Date(dueDate) : null,
            organizationId,
            createdById: user.userId
        }, assigneeIds);
    }

    /**
     * Get all tasks
     * @param {string} organizationId
     * @param {Object} user
     * @param {Object} query
     */
    async getTasks(organizationId, user, query) {
        const { page = 1, limit = 10, search, status, priority } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const filters = { search, status, priority };

        // RBAC: ORG_MEMBER can only see tasks assigned to them OR created by them
        if (user.role === 'ORG_MEMBER') {
            // We need to filter by (assignedTo = user.id OR createdBy = user.id)
            // The repository `findAll` supports `assignedTo` OR `createdBy` but usually AND.
            // I might need to adjust repository or handle this logic.
            // Let's adjust the repository call or pass a special flag.
            // For now, let's assume ORG_MEMBER sees assigned tasks.
            // "USER: View tasks assigned to them"
            filters.assignedTo = user.userId;
            // Also they should see tasks they created (if they could create, but they can't). 
            // But if they were demoted, maybe? 
            // Let's strictly follow "View tasks assigned to them".
        }

        return await taskRepository.findAll(organizationId, filters, { skip, take });
    }

    /**
     * Get task by ID
     */
    async getTaskById(id, organizationId, user) {
        const task = await taskRepository.findById(id);

        if (!task) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            throw error;
        }

        if (task.organizationId !== organizationId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            throw error;
        }

        // RBAC Check for View
        if (user.role === 'ORG_MEMBER') {
            const isAssigned = task.assignees.some(a => a.userId === user.userId);
            const isCreator = task.createdById === user.userId;
            if (!isAssigned && !isCreator) {
                const error = new Error('Access denied: You are not assigned to this task');
                error.statusCode = 403;
                throw error;
            }
        }

        return task;
    }

    /**
     * Update task
     */
    async updateTask(id, data, organizationId, user) {
        const task = await this.getTaskById(id, organizationId, user);

        const isCreator = task.createdById === user.userId;
        const isAssigned = task.assignees.some(a => a.userId === user.userId);
        const isAdmin = ['ORG_ADMIN', 'ORG_OWNER'].includes(user.role);

        // Permission Logic
        // 1. Update Status
        if (data.status) {
            // "Only task creator OR ANY assigned user can mark task as COMPLETED"
            // "Assigned users can update status to IN_PROGRESS or COMPLETED"
            // "Only task creator can Reopen a COMPLETED task"

            if (data.status === 'COMPLETED') {
                if (!isCreator && !isAssigned && !isAdmin) {
                    throw new Error('Permission denied: Only creator or assignee can complete task');
                }
            }

            if (data.status === 'REOPENED') {
                // If current status is COMPLETED, only creator (or admin) can reopen
                if (task.status === 'COMPLETED' && !isCreator && !isAdmin) {
                    throw new Error('Permission denied: Only creator can reopen a completed task');
                }
            }

            // General status update check
            if (!isCreator && !isAssigned && !isAdmin) {
                throw new Error('Permission denied: You cannot update this task status');
            }
        }

        // 2. Update Details (Title, Description, Priority, DueDate, Assignees)
        const isUpdatingDetails = data.title || data.description || data.priority || data.dueDate || data.assigneeIds;
        if (isUpdatingDetails) {
            // "Only task creator can Edit task details" (and Admins)
            if (!isCreator && !isAdmin) {
                const error = new Error('Permission denied: Only creator can edit task details');
                error.statusCode = 403;
                throw error;
            }
        }

        // Validate new assignees if provided
        if (data.assigneeIds) {
            const validAssignees = await userRepository.findByOrganization(organizationId);
            const validIds = new Set(validAssignees.users.map(u => u.id));
            const invalidIds = data.assigneeIds.filter(id => !validIds.has(id));
            if (invalidIds.length > 0) {
                const error = new Error(`Invalid assignees: Users ${invalidIds.join(', ')} do not belong to this organization`);
                error.statusCode = 400;
                throw error;
            }
        }

        // Send email notification (mock)
        if (data.status === 'COMPLETED') {
            console.log(`[EMAIL] Task "${task.title}" marked as COMPLETED. Notifying assignees...`);
        }
        if (data.assigneeIds) {
            console.log(`[EMAIL] Task "${task.title}" reassigned. Notifying new assignees...`);
        }

        return await taskRepository.update(id, {
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        }, data.assigneeIds);
    }

    /**
     * Delete task
     */
    async deleteTask(id, organizationId, user) {
        const task = await this.getTaskById(id, organizationId, user);

        const isCreator = task.createdById === user.userId;
        const isAdmin = ['ORG_ADMIN', 'ORG_OWNER'].includes(user.role);

        if (!isCreator && !isAdmin) {
            const error = new Error('Permission denied: Only creator or admin can delete tasks');
            error.statusCode = 403;
            throw error;
        }

        return await taskRepository.delete(id);
    }
}

export default new TaskService();
