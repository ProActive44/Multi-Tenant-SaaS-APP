import superAdminOrgService from './super-admin-org.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';

// Super Admin organization management controller

class SuperAdminOrgController {
    /**
     * Create organization with owner
     * POST /api/super-admin/organizations
     */
    async createOrganization(req, res, next) {
        try {
            const { name, slug, domain, plan, ownerEmail, ownerPassword, ownerFirstName, ownerLastName } = req.body;

            // Validate required fields
            if (!name || !slug || !ownerEmail || !ownerPassword || !ownerFirstName || !ownerLastName) {
                const error = new Error('Missing required fields');
                error.statusCode = 400;
                throw error;
            }

            // Validate slug format (lowercase, alphanumeric, hyphens)
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(slug)) {
                const error = new Error('Slug must be lowercase alphanumeric with hyphens only');
                error.statusCode = 400;
                throw error;
            }

            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(ownerEmail)) {
                const error = new Error('Invalid email format');
                error.statusCode = 400;
                throw error;
            }

            // Validate password
            if (ownerPassword.length < 6) {
                const error = new Error('Password must be at least 6 characters');
                error.statusCode = 400;
                throw error;
            }

            const result = await superAdminOrgService.createOrganizationWithOwner(
                { name, slug, domain, plan },
                { email: ownerEmail, password: ownerPassword, firstName: ownerFirstName, lastName: ownerLastName }
            );

            successResponse(res, result, 'Organization created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * List organizations
     * GET /api/super-admin/organizations
     */
    async listOrganizations(req, res, next) {
        try {
            const { page = 1, limit = 10, search, status } = req.query;

            const options = {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                search,
                status,
            };

            const result = await superAdminOrgService.listOrganizations(options);

            paginatedResponse(
                res,
                result.organizations,
                { page: options.page, limit: options.limit, total: result.total },
                'Organizations retrieved successfully'
            );
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get organization details
     * GET /api/super-admin/organizations/:id
     */
    async getOrganization(req, res, next) {
        try {
            const { id } = req.params;

            const organization = await superAdminOrgService.getOrganizationDetails(id);

            successResponse(res, organization, 'Organization retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update organization
     * PATCH /api/super-admin/organizations/:id
     */
    async updateOrganization(req, res, next) {
        try {
            const { id } = req.params;
            const { name, slug, domain, plan } = req.body;

            // Validate slug format if provided
            if (slug) {
                const slugRegex = /^[a-z0-9-]+$/;
                if (!slugRegex.test(slug)) {
                    const error = new Error('Slug must be lowercase alphanumeric with hyphens only');
                    error.statusCode = 400;
                    throw error;
                }
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (slug) updateData.slug = slug;
            if (domain !== undefined) updateData.domain = domain;
            if (plan) updateData.plan = plan;

            const organization = await superAdminOrgService.updateOrganization(id, updateData);

            successResponse(res, organization, 'Organization updated successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Enable organization
     * PATCH /api/super-admin/organizations/:id/enable
     */
    async enableOrganization(req, res, next) {
        try {
            const { id } = req.params;

            const organization = await superAdminOrgService.enableOrganization(id);

            successResponse(res, organization, 'Organization enabled successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Disable organization
     * PATCH /api/super-admin/organizations/:id/disable
     */
    async disableOrganization(req, res, next) {
        try {
            const { id } = req.params;

            const organization = await superAdminOrgService.disableOrganization(id);

            successResponse(res, organization, 'Organization disabled successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete organization
     * DELETE /api/super-admin/organizations/:id
     */
    async deleteOrganization(req, res, next) {
        try {
            const { id } = req.params;

            const result = await superAdminOrgService.deleteOrganization(id);

            successResponse(res, result, 'Organization deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

export default new SuperAdminOrgController();
