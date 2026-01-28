import express from 'express';
import superAdminOrgController from './super-admin-org.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSuperAdmin } from '../../middleware/superAdminAuth.js';

const router = express.Router();

/**
 * Super Admin Organization Management Routes
 * Base: /api/super-admin/organizations
 * All routes require Super Admin authentication
 */

// Apply authentication and super admin authorization to all routes
router.use(authenticate, requireSuperAdmin);

// Create organization with owner
router.post('/', superAdminOrgController.createOrganization);

// List organizations
router.get('/', superAdminOrgController.listOrganizations);

// Get organization details
router.get('/:id', superAdminOrgController.getOrganization);

// Update organization
router.patch('/:id', superAdminOrgController.updateOrganization);

// Enable organization
router.patch('/:id/enable', superAdminOrgController.enableOrganization);

// Disable organization
router.patch('/:id/disable', superAdminOrgController.disableOrganization);

// Delete organization
router.delete('/:id', superAdminOrgController.deleteOrganization);

export default router;
