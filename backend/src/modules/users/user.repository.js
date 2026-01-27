import prisma from '../../config/database.js';

// Data access layer for user management
// All queries are tenant-scoped

class UserRepository {
  /**
   * Create user within a specific organization
   * @param {Object} data - User data
   * @param {string} organizationId - Organization ID (from token, not request)
   */
  async createUser(data, organizationId) {
    return await prisma.user.create({
      data: {
        ...data,
        organizationId, // Enforced from token
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Find users by organization (tenant-scoped)
   * @param {string} organizationId - Organization ID from token
   * @param {Object} options - Query options (pagination, filters)
   */
  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 10, role, isActive } = options;
    const skip = (page - 1) * limit;

    const where = {
      organizationId, // CRITICAL: Tenant isolation
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Find user by ID within organization (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - Organization ID from token
   */
  async findByIdInOrganization(userId, organizationId) {
    return await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId, // CRITICAL: Tenant isolation
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Update user within organization (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - Organization ID from token
   * @param {Object} data - Update data
   */
  async updateUserInOrganization(userId, organizationId, data) {
    return await prisma.user.updateMany({
      where: {
        id: userId,
        organizationId, // CRITICAL: Tenant isolation
      },
      data,
    });
  }

  /**
   * Delete user within organization (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - Organization ID from token
   */
  async deleteUserInOrganization(userId, organizationId) {
    return await prisma.user.deleteMany({
      where: {
        id: userId,
        organizationId, // CRITICAL: Tenant isolation
      },
    });
  }

  /**
   * Check if email exists in organization
   * @param {string} email
   * @param {string} organizationId
   */
  async emailExistsInOrganization(email, organizationId) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        organizationId,
      },
      select: { id: true },
    });
    return !!user;
  }

  /**
   * SUPER_ADMIN ONLY: List all users with optional organization filter
   * @param {Object} options - Query options
   */
  async findAllUsers(options = {}) {
    const { page = 1, limit = 10, organizationId, role, isActive } = options;
    const skip = (page - 1) * limit;

    const where = {
      ...(organizationId && { organizationId }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}

export default new UserRepository();
