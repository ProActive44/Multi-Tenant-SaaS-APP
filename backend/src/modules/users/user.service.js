import bcrypt from 'bcryptjs';
import userRepository from './user.repository.js';

// Business logic layer for user management
// Enforces tenant isolation and role-based permissions

class UserService {
  /**
   * Create user in organization
   * @param {Object} data - User data
   * @param {string} organizationId - From req.tenantId (token), NOT request body
   * @param {Object} creator - User creating this user (from req.user)
   */
  async createUser(data, organizationId, creator) {
    const { email, password, firstName, lastName, role = 'ORG_MEMBER' } = data;

    // Validate organizationId is provided (from token)
    if (!organizationId) {
      const error = new Error('Organization context required to create users');
      error.statusCode = 403;
      throw error;
    }

    // Validate role is organization role (not SUPER_ADMIN)
    const validOrgRoles = ['ORG_OWNER', 'ORG_ADMIN', 'ORG_MEMBER'];
    if (!validOrgRoles.includes(role)) {
      const error = new Error('Invalid role for organization user');
      error.statusCode = 400;
      throw error;
    }

    // Check if email already exists in this organization
    const emailExists = await userRepository.emailExistsInOrganization(
      email,
      organizationId
    );

    if (emailExists) {
      const error = new Error('User with this email already exists in your organization');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with organizationId from token
    const user = await userRepository.createUser(
      {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        isActive: true,
      },
      organizationId // From token, not request body
    );

    return user;
  }

  /**
   * Get users in organization (tenant-scoped)
   * @param {string} organizationId - From req.tenantId
   * @param {Object} options - Query options
   */
  async getUsersByOrganization(organizationId, options = {}) {
    if (!organizationId) {
      const error = new Error('Organization context required');
      error.statusCode = 403;
      throw error;
    }

    return await userRepository.findByOrganization(organizationId, options);
  }

  /**
   * Get user by ID (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - From req.tenantId
   */
  async getUserById(userId, organizationId) {
    if (!organizationId) {
      const error = new Error('Organization context required');
      error.statusCode = 403;
      throw error;
    }

    const user = await userRepository.findByIdInOrganization(userId, organizationId);

    if (!user) {
      const error = new Error('User not found in your organization');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update user (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - From req.tenantId
   * @param {Object} data - Update data
   */
  async updateUser(userId, organizationId, data) {
    if (!organizationId) {
      const error = new Error('Organization context required');
      error.statusCode = 403;
      throw error;
    }

    // Check user exists in organization
    const user = await this.getUserById(userId, organizationId);

    // Validate role if being updated
    if (data.role) {
      const validOrgRoles = ['ORG_OWNER', 'ORG_ADMIN', 'ORG_MEMBER'];
      if (!validOrgRoles.includes(data.role)) {
        const error = new Error('Invalid role for organization user');
        error.statusCode = 400;
        throw error;
      }
    }

    // Hash password if being updated
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }

    // Prevent organizationId from being changed
    delete data.organizationId;

    const result = await userRepository.updateUserInOrganization(
      userId,
      organizationId,
      data
    );

    if (result.count === 0) {
      const error = new Error('User not found in your organization');
      error.statusCode = 404;
      throw error;
    }

    // Return updated user
    return await this.getUserById(userId, organizationId);
  }

  /**
   * Delete user (tenant-scoped)
   * @param {string} userId
   * @param {string} organizationId - From req.tenantId
   * @param {Object} deleter - User performing deletion
   */
  async deleteUser(userId, organizationId, deleter) {
    if (!organizationId) {
      const error = new Error('Organization context required');
      error.statusCode = 403;
      throw error;
    }

    // Check user exists in organization
    const user = await this.getUserById(userId, organizationId);

    // Prevent self-deletion
    if (user.id === deleter.userId) {
      const error = new Error('You cannot delete your own account');
      error.statusCode = 400;
      throw error;
    }

    const result = await userRepository.deleteUserInOrganization(userId, organizationId);

    if (result.count === 0) {
      const error = new Error('User not found in your organization');
      error.statusCode = 404;
      throw error;
    }

    return { message: 'User deleted successfully' };
  }

  /**
   * SUPER_ADMIN ONLY: Get all users across organizations
   * @param {Object} options - Query options
   */
  async getAllUsers(options = {}) {
    return await userRepository.findAllUsers(options);
  }

  /**
   * Toggle user active status
   * @param {string} userId
   * @param {string} organizationId - From req.tenantId
   * @param {boolean} isActive
   */
  async toggleUserStatus(userId, organizationId, isActive) {
    return await this.updateUser(userId, organizationId, { isActive });
  }
}

export default new UserService();
