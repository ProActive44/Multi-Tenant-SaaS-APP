import superAdminAuthService from './super-admin-auth.service.js';
import { successResponse } from '../../utils/response.js';

// Super Admin authentication controller

class SuperAdminAuthController {
    /**
     * Super Admin login
     * POST /api/super-admin/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                const error = new Error('Email and password are required');
                error.statusCode = 400;
                throw error;
            }

            // Authenticate
            const result = await superAdminAuthService.login(email, password);

            successResponse(res, result, 'Login successful', 200);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get super admin profile
     * GET /api/super-admin/auth/me
     */
    async getProfile(req, res, next) {
        try {
            const superAdmin = await superAdminAuthService.getProfile(req.user.userId);
            successResponse(res, superAdmin, 'Profile retrieved successfully', 200);
        } catch (error) {
            next(error);
        }
    }
}

export default new SuperAdminAuthController();
