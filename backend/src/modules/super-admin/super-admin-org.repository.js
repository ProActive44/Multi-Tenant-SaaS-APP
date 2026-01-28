import prisma from '../../config/database.js';

// Super Admin organization repository

class SuperAdminOrgRepository {
    /**
     * Create organization
     * @param {Object} data - Organization data
     */
    async createOrganization(data) {
        return await prisma.organization.create({
            data,
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                plan: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    /**
     * List all organizations with pagination and search
     * @param {Object} options - Query options
     */
    async listOrganizations(options = {}) {
        const { page = 1, limit = 10, search, status } = options;
        const skip = (page - 1) * limit;

        const where = {
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { slug: { contains: search, mode: 'insensitive' } },
                ],
            }),
            ...(status && { status }),
        };

        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    domain: true,
                    plan: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: { users: true },
                    },
                },
            }),
            prisma.organization.count({ where }),
        ]);

        return { organizations, total };
    }

    /**
     * Get organization by ID with details
     * @param {string} organizationId
     */
    async getOrganizationById(organizationId) {
        return await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                plan: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                users: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        role: true,
                        isActive: true,
                        lastLoginAt: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { users: true },
                },
            },
        });
    }

    /**
     * Update organization
     * @param {string} organizationId
     * @param {Object} data - Update data
     */
    async updateOrganization(organizationId, data) {
        return await prisma.organization.update({
            where: { id: organizationId },
            data,
            select: {
                id: true,
                name: true,
                slug: true,
                domain: true,
                plan: true,
                status: true,
                updatedAt: true,
            },
        });
    }

    /**
     * Delete organization (and cascade delete users)
     * @param {string} organizationId
     */
    async deleteOrganization(organizationId) {
        return await prisma.organization.delete({
            where: { id: organizationId },
        });
    }

    /**
     * Check if slug exists
     * @param {string} slug
     * @param {string} excludeId - Optional organization ID to exclude from check
     */
    async slugExists(slug, excludeId = null) {
        const org = await prisma.organization.findFirst({
            where: {
                slug,
                ...(excludeId && { id: { not: excludeId } }),
            },
            select: { id: true },
        });
        return !!org;
    }
}

export default new SuperAdminOrgRepository();
