import express from 'express';
import superAdminAuthController from './super-admin-auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = express.Router();

/**
 * Super Admin Authentication Routes
 * Base: /api/super-admin/auth
 */

// Login - Public
router.post('/login', superAdminAuthController.login);

// Get profile - Protected (Super Admin only)
router.get('/me', authenticate, superAdminAuthController.getProfile);

export default router;
