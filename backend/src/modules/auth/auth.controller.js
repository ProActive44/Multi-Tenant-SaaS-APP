import authService from './auth.service.js';
import { successResponse } from '../../utils/response.js';

// Controller layer - handles HTTP requests/responses for authentication

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, role, organizationId } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName || !role) {
        const error = new Error('Missing required fields');
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

      // Validate password strength (minimum 6 characters)
      if (password.length < 6) {
        const error = new Error('Password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
      }

      // Validate role
      const validRoles = ['SUPER_ADMIN', 'ORG_OWNER', 'ORG_ADMIN', 'ORG_MEMBER'];
      if (!validRoles.includes(role)) {
        const error = new Error('Invalid role');
        error.statusCode = 400;
        throw error;
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        role,
        organizationId,
      });

      successResponse(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        const error = new Error('Email and password are required');
        error.statusCode = 400;
        throw error;
      }

      const result = await authService.login({ email, password });

      successResponse(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req, res, next) {
    try {
      // req.user is set by authenticate middleware
      const user = await authService.getUserById(req.user.userId);

      successResponse(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
