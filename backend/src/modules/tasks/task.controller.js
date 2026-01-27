import taskService from './task.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';

class TaskController {
    /**
     * Create a new task
     * POST /api/tasks
     */
    async createTask(req, res, next) {
        try {
            const { title, description, priority, dueDate, assigneeIds } = req.body;
            const organizationId = req.tenantId;

            if (!title) {
                const error = new Error('Title is required');
                error.statusCode = 400;
                throw error;
            }

            const task = await taskService.createTask(
                { title, description, priority, dueDate, assigneeIds },
                organizationId,
                req.user
            );

            successResponse(res, task, 'Task created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all tasks
     * GET /api/tasks
     */
    async getTasks(req, res, next) {
        try {
            const organizationId = req.tenantId;
            const result = await taskService.getTasks(organizationId, req.user, req.query);

            paginatedResponse(
                res,
                result.tasks,
                {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 10,
                    total: result.total,
                },
                'Tasks retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get task by ID
     * GET /api/tasks/:id
     */
    async getTaskById(req, res, next) {
        try {
            const { id } = req.params;
            const organizationId = req.tenantId;

            const task = await taskService.getTaskById(id, organizationId, req.user);

            successResponse(res, task, 'Task retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update task
     * PATCH /api/tasks/:id
     */
    async updateTask(req, res, next) {
        try {
            const { id } = req.params;
            const organizationId = req.tenantId;
            const { title, description, priority, status, dueDate, assigneeIds } = req.body;

            // Prevent organizationId update
            if (req.body.organizationId) {
                const error = new Error('Cannot update organizationId');
                error.statusCode = 400;
                throw error;
            }

            const task = await taskService.updateTask(
                id,
                { title, description, priority, status, dueDate, assigneeIds },
                organizationId,
                req.user
            );

            successResponse(res, task, 'Task updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete task
     * DELETE /api/tasks/:id
     */
    async deleteTask(req, res, next) {
        try {
            const { id } = req.params;
            const organizationId = req.tenantId;

            await taskService.deleteTask(id, organizationId, req.user);

            successResponse(res, null, 'Task deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new TaskController();
