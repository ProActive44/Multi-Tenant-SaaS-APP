import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import authRepository from './auth.repository.js';

// Authentication service - handles business logic for auth operations

class AuthService {
  /**
   * Register a new user
   * @param {Object} data - User registration data
   * @param {string} data.email
   * @param {string} data.password
   * @param {string} data.firstName
   * @param {string} data.lastName
   * @param {string} data.role - SUPER_ADMIN, ORG_OWNER, ORG_ADMIN, ORG_MEMBER
   * @param {string} [data.organizationId] - Required for ORG_* roles, null for SUPER_ADMIN
   */
  async register(data) {
    const { email, password, firstName, lastName, role, organizationId } = data;

    // Validate role and organizationId combination
    if (role === 'SUPER_ADMIN' && organizationId) {
      throw new Error('SUPER_ADMIN cannot be associated with an organization');
    }

    if (role !== 'SUPER_ADMIN' && !organizationId) {
      throw new Error('Organization users must have an organizationId');
    }

    // Check if user already exists
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('User with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // If organizationId provided, verify organization exists and is active
    if (organizationId) {
      const organization = await authRepository.findOrganizationById(organizationId);
      if (!organization) {
        const error = new Error('Organization not found');
        error.statusCode = 404;
        throw error;
      }
      if (organization.status !== 'active') {
        const error = new Error('Organization is not active');
        error.statusCode = 403;
        throw error;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await authRepository.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      organizationId: organizationId || null,
    });

    // Generate JWT
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Login user
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await authRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Check if user is active
    if (!user.isActive) {
      const error = new Error('Account is inactive');
      error.statusCode = 403;
      throw error;
    }

    // For organization users, check if organization is active
    if (user.organizationId) {
      const organization = await authRepository.findOrganizationById(user.organizationId);
      if (!organization || organization.status !== 'active') {
        const error = new Error('Organization is not active');
        error.statusCode = 403;
        throw error;
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Update last login
    await authRepository.updateLastLogin(user.id);

    // Generate JWT
    const token = this.generateToken(user);

    // Return user without password hash
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || null,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const err = new Error('Token expired');
        err.statusCode = 401;
        throw err;
      }
      const err = new Error('Invalid token');
      err.statusCode = 401;
      throw err;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId
   */
  async getUserById(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export default new AuthService();
