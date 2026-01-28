import bcrypt from 'bcryptjs';
import prisma from '../../config/database.js';
import superAdminOrgRepository from './super-admin-org.repository.js';

// Super Admin organization management service

class SuperAdminOrgService {
    /**
     * Create organization with owner
     * @param {Object} orgData - Organization data
     * @param {Object} ownerData - Owner user data
     */
    async createOrganizationWithOwner(orgData, ownerData) {
        const { name, slug, domain, plan = 'free' } = orgData;
        const { email, password, firstName, lastName } = ownerData;

        // Validate slug uniqueness
        const slugExists = await superAdminOrgRepository.slugExists(slug);
        if (slugExists) {
            const error = new Error('Organization slug already exists');
            error.statusCode = 409;
            throw error;
        }

        // Check if email already exists
        const emailExists = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
        });

        if (emailExists) {
            const error = new Error('Email already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create organization and owner in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create organization
            const organization = await tx.organization.create({
                data: {
                    name,
                    slug,
                    domain,
                    plan,
                    status: 'active',
                },
            });

            // Create owner user
            const owner = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    role: 'ORG_OWNER',
                    organizationId: organization.id,
                    isActive: true,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
            });

            return { organization, owner };
        });

        return result;
    }

    /**
     * List organizations
     * @param {Object} options - Query options
     */
    async listOrganizations(options) {
        return await superAdminOrgRepository.listOrganizations(options);
    }

    /**
     * Get organization details
     * @param {string} organizationId
     */
    async getOrganizationDetails(organizationId) {
        const organization = await superAdminOrgRepository.getOrganizationById(organizationId);

        if (!organization) {
            const error = new Error('Organization not found');
            error.statusCode = 404;
            throw error;
        }

        return organization;
    }

    /**
     * Update organization
     * @param {string} organizationId
     * @param {Object} data - Update data
     */
    async updateOrganization(organizationId, data) {
        // Check if organization exists
        const exists = await superAdminOrgRepository.getOrganizationById(organizationId);
        if (!exists) {
            const error = new Error('Organization not found');
            error.statusCode = 404;
            throw error;
        }

        // If updating slug, check uniqueness
        if (data.slug) {
            const slugExists = await superAdminOrgRepository.slugExists(data.slug, organizationId);
            if (slugExists) {
                const error = new Error('Organization slug already exists');
                error.statusCode = 409;
                throw error;
            }
        }

        return await superAdminOrgRepository.updateOrganization(organizationId, data);
    }

    /**
     * Enable organization
     * @param {string} organizationId
     */
    async enableOrganization(organizationId) {
        return await this.updateOrganization(organizationId, { status: 'active' });
    }

    /**
     * Disable organization
     * @param {string} organizationId
     */
    async disableOrganization(organizationId) {
        return await this.updateOrganization(organizationId, { status: 'suspended' });
    }

    /**
     * Delete organization
     * @param {string} organizationId
     */
    async deleteOrganization(organizationId) {
        // Check if organization exists
        const exists = await superAdminOrgRepository.getOrganizationById(organizationId);
        if (!exists) {
            const error = new Error('Organization not found');
            error.statusCode = 404;
            throw error;
        }

        // Delete organization (will cascade delete users)
        await superAdminOrgRepository.deleteOrganization(organizationId);

        return { message: 'Organization deleted successfully' };
    }
}

export default new SuperAdminOrgService();
