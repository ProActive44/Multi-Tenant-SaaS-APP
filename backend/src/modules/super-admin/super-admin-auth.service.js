import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import prisma from '../../config/database.js';
import superAdminRepository from './super-admin.repository.js';

// Super Admin authentication service

class SuperAdminAuthService {
    /**
     * Super Admin login
     * @param {string} email
     * @param {string} password
     */
    async login(email, password) {
        // Find super admin by email
        const superAdmin = await superAdminRepository.findByEmail(email);

        if (!superAdmin) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check if super admin is active
        if (!superAdmin.isActive) {
            const error = new Error('Account is disabled');
            error.statusCode = 403;
            throw error;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, superAdmin.passwordHash);

        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Update last login
        await superAdminRepository.updateLastLogin(superAdmin.id);

        // Generate JWT token with SUPER_ADMIN role
        const token = jwt.sign(
            {
                userId: superAdmin.id,
                email: superAdmin.email,
                role: 'SUPER_ADMIN',
                organizationId: null, // CRITICAL: Super Admin has no organization
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        // Remove sensitive data
        delete superAdmin.passwordHash;

        return {
            user: superAdmin,
            token,
        };
    }

    /**
     * Get super admin profile
     * @param {string} userId
     */
    async getProfile(userId) {
        const superAdmin = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        if (!superAdmin || superAdmin.role !== 'SUPER_ADMIN') {
            const error = new Error('Super Admin not found');
            error.statusCode = 404;
            throw error;
        }

        return superAdmin;
    }
}

export default new SuperAdminAuthService();
