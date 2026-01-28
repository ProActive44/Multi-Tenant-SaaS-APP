import userService from './user.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';

// Controller layer - handles HTTP requests/responses for user management

class UserController {
  /**
   * Create user in organization
   * POST /api/users
   * Requires: ORG_OWNER or ORG_ADMIN role
   */
  async createUser(req, res, next) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        const error = new Error('Missing required fields: email, password, firstName, lastName');
        error.statusCode = 400;
        throw error;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const error = new Error('Invalid email format');
        error.statusCode = 400;
        throw error;
      }

      // Validate password strength
      if (password.length < 6) {
        const error = new Error('Password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
      }

      // CRITICAL: organizationId comes from req.tenantId (token), NOT request body
      // This prevents users from creating users in other organizations
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required. SUPER_ADMIN cannot create organization users.');
        error.statusCode = 403;
        throw error;
      }

      // Reject if organizationId is in request body (security)
      if (req.body.organizationId) {
        const error = new Error('organizationId cannot be specified in request body');
        error.statusCode = 400;
        throw error;
      }

      const user = await userService.createUser(
        { email, password, firstName, lastName, role },
        organizationId,
        req.user
      );

      successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users in organization
   * GET /api/users
   * Returns only users from authenticated user's organization
   */
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, isActive } = req.query;

      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        role,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      };

      // For SUPER_ADMIN: Allow optional organizationId filter
      if (req.user.role === 'SUPER_ADMIN') {
        const { organizationId } = req.query;
        const result = await userService.getAllUsers({
          ...options,
          organizationId,
        });

        return paginatedResponse(
          res,
          result.users,
          { page: options.page, limit: options.limit, total: result.total },
          'Users retrieved successfully'
        );
      }

      // For ORG users: Use tenantId from token
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required');
        error.statusCode = 403;
        throw error;
      }

      const result = await userService.getUsersByOrganization(organizationId, options);

      paginatedResponse(
        res,
        result.users,
        { page: options.page, limit: options.limit, total: result.total },
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current authenticated user
   * GET /api/users/me
   */
  async getCurrentUser(req, res, next) {
    try {
      // For organization users
      if (req.tenantId) {
        const user = await userService.getUserById(req.user.userId, req.tenantId);
        return successResponse(res, user, 'User profile retrieved successfully');
      }

      // For SUPER_ADMIN (no tenantId)
      if (req.user.role === 'SUPER_ADMIN') {
        // Return basic user info from token
        const userInfo = {
          id: req.user.userId,
          email: req.user.email,
          role: req.user.role,
          organizationId: null,
        };
        return successResponse(res, userInfo, 'User profile retrieved successfully');
      }

      const error = new Error('Unable to retrieve user profile');
      error.statusCode = 500;
      throw error;
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required');
        error.statusCode = 403;
        throw error;
      }

      const user = await userService.getUserById(id, organizationId);
      successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user
   * PATCH /api/users/:id
   * Requires: ORG_OWNER or ORG_ADMIN role
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required');
        error.statusCode = 403;
        throw error;
      }

      // Reject if organizationId is in request body (security)
      if (req.body.organizationId) {
        const error = new Error('organizationId cannot be modified');
        error.statusCode = 400;
        throw error;
      }

      const user = await userService.updateUser(id, organizationId, req.body);
      successResponse(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   * Requires: ORG_OWNER or ORG_ADMIN role
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required');
        error.statusCode = 403;
        throw error;
      }

      const result = await userService.deleteUser(id, organizationId, req.user);
      successResponse(res, result, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status
   * PATCH /api/users/:id/status
   * Requires: ORG_OWNER or ORG_ADMIN role
   */
  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const organizationId = req.tenantId;

      if (!organizationId) {
        const error = new Error('Organization context required');
        error.statusCode = 403;
        throw error;
      }

      if (typeof isActive !== 'boolean') {
        const error = new Error('isActive must be a boolean');
        error.statusCode = 400;
        throw error;
      }

      const user = await userService.toggleUserStatus(id, organizationId, isActive);
      successResponse(res, user, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
