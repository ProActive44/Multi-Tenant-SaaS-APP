import prisma from '../../config/database.js';

// Data access layer for authentication

class AuthRepository {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Create new user
   */
  async createUser(data) {
    return await prisma.user.create({
      data,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Find organization by ID
   */
  async findOrganizationById(organizationId) {
    return await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
    });
  }
}

export default new AuthRepository();
