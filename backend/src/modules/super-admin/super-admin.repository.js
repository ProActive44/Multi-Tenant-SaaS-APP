import prisma from '../../config/database.js';

// Super Admin repository - handles database operations for super admin

class SuperAdminRepository {
    /**
     * Find super admin by email
     * @param {string} email
     */
    async findByEmail(email) {
        return await prisma.user.findFirst({
            where: {
                email,
                role: 'SUPER_ADMIN',
                organizationId: null, // Must not belong to any organization
            },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });
    }

    /**
     * Update last login time
     * @param {string} userId
     */
    async updateLastLogin(userId) {
        return await prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() },
        });
    }
}

export default new SuperAdminRepository();
