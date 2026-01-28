import prisma from '../../config/database.js';

class TaskRepository {
    /**
     * Create a new task with assignees
     * @param {Object} taskData - Task data including organizationId and createdById
     * @param {Array<string>} assigneeIds - List of user IDs to assign
     */
    async create(taskData, assigneeIds = []) {
        const { title, description, priority, status, dueDate, organizationId, createdById } = taskData;

        return await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status,
                dueDate,
                organizationId,
                createdById,
                assignees: {
                    create: assigneeIds.map((userId) => ({
                        userId,
                    })),
                },
            },
            include: {
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Find all tasks for an organization with filters
     * @param {string} organizationId
     * @param {Object} filters - { status, priority, assignedTo, createdBy, search }
     * @param {Object} pagination - { skip, take }
     */
    async findAll(organizationId, filters = {}, pagination = {}) {
        const { status, priority, assignedTo, createdBy, search } = filters;
        const { skip, take } = pagination;

        const where = {
            organizationId,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(createdBy && { createdById: createdBy }),
            ...(assignedTo && {
                assignees: {
                    some: {
                        userId: assignedTo,
                    },
                },
            }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take,
                orderBy: { updatedAt: 'desc' },
                include: {
                    assignees: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            prisma.task.count({ where }),
        ]);

        return { tasks, total };
    }

    /**
     * Find a task by ID
     * @param {string} id
     */
    async findById(id) {
        return await prisma.task.findUnique({
            where: { id },
            include: {
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
    }

    /**
     * Update a task
     * @param {string} id
     * @param {Object} data
     * @param {Array<string>} assigneeIds - Optional list of new assignee IDs (replaces old ones)
     */
    async update(id, data, assigneeIds = null) {
        const updateData = { ...data };

        // Handle assignee updates if provided
        if (assigneeIds) {
            updateData.assignees = {
                deleteMany: {}, // Remove existing assignees
                create: assigneeIds.map((userId) => ({
                    userId,
                })),
            };
        }

        return await prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                assignees: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }

    /**
     * Delete a task
     * @param {string} id
     */
    async delete(id) {
        return await prisma.task.delete({
            where: { id },
        });
    }
}

export default new TaskRepository();
