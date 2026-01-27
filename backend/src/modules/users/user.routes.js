import express from 'express';
import userController from './user.controller.js';
import { authenticate, authorize, requireOrganization } from '../../middleware/authenticate.js';
import { tenantContext } from '../../middleware/tenantContext.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============================================
// PUBLIC USER ROUTES (All authenticated users)
// ============================================

/**
 * Get current authenticated user
 * Available to all authenticated users
 */
router.get('/me', userController.getCurrentUser);

// ============================================
// ORGANIZATION USER ROUTES
// Requires organization membership (not SUPER_ADMIN)
// ============================================

/**
 * Create user in organization
 * Only ORG_OWNER and ORG_ADMIN can create users
 * organizationId comes from req.tenantId (token), NOT request body
 */
router.post(
  '/',
  requireOrganization,
  tenantContext,
  authorize('ORG_OWNER', 'ORG_ADMIN'),
  userController.createUser
);

/**
 * Get users in organization
 * All organization members can view users in their org
 * SUPER_ADMIN can view all users with optional organizationId filter
 */
router.get('/', userController.getUsers);

/**
 * Get user by ID (tenant-scoped)
 * All organization members can view users in their org
 */
router.get(
  '/:id',
  requireOrganization,
  tenantContext,
  userController.getUserById
);

/**
 * Update user (tenant-scoped)
 * Only ORG_OWNER and ORG_ADMIN can update users
 */
router.patch(
  '/:id',
  requireOrganization,
  tenantContext,
  authorize('ORG_OWNER', 'ORG_ADMIN'),
  userController.updateUser
);

/**
 * Delete user (tenant-scoped)
 * Only ORG_OWNER and ORG_ADMIN can delete users
 */
router.delete(
  '/:id',
  requireOrganization,
  tenantContext,
  authorize('ORG_OWNER', 'ORG_ADMIN'),
  userController.deleteUser
);

/**
 * Toggle user active status (tenant-scoped)
 * Only ORG_OWNER and ORG_ADMIN can toggle status
 */
router.patch(
  '/:id/status',
  requireOrganization,
  tenantContext,
  authorize('ORG_OWNER', 'ORG_ADMIN'),
  userController.toggleUserStatus
);

export default router;
