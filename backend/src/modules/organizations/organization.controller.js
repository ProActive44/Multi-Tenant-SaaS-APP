import organizationService from './organization.service.js';
import { successResponse, paginatedResponse } from '../../utils/response.js';

// Controller layer - handles HTTP requests/responses
// Delegates business logic to service layer

class OrganizationController {
  async createOrganization(req, res, next) {
    try {
      const organization = await organizationService.createOrganization(req.body);
      successResponse(res, organization, 'Organization created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const organization = await organizationService.getOrganizationById(id);
      successResponse(res, organization, 'Organization retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllOrganizations(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        status,
      };

      const { organizations, total } = await organizationService.getAllOrganizations(options);
      
      paginatedResponse(
        res,
        organizations,
        { page: options.page, limit: options.limit, total },
        'Organizations retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const organization = await organizationService.updateOrganization(id, req.body);
      successResponse(res, organization, 'Organization updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteOrganization(req, res, next) {
    try {
      const { id } = req.params;
      await organizationService.deleteOrganization(id);
      successResponse(res, null, 'Organization deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async updatePlan(req, res, next) {
    try {
      const { id } = req.params;
      const { plan } = req.body;
      const organization = await organizationService.updateOrganizationPlan(id, plan);
      successResponse(res, organization, 'Organization plan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async suspendOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const organization = await organizationService.suspendOrganization(id);
      successResponse(res, organization, 'Organization suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  async activateOrganization(req, res, next) {
    try {
      const { id } = req.params;
      const organization = await organizationService.activateOrganization(id);
      successResponse(res, organization, 'Organization activated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new OrganizationController();
