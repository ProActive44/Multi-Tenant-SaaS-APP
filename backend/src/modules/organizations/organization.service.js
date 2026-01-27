import organizationRepository from './organization.repository.js';

// Business logic layer for organizations
// Handles validation, business rules, and orchestration

class OrganizationService {
  async createOrganization(data) {
    const { name, slug, domain, plan = 'free' } = data;

    // Validate slug uniqueness
    const existingOrg = await organizationRepository.findBySlug(slug);
    if (existingOrg) {
      throw new Error('Organization slug already exists');
    }

    // Create organization
    const organization = await organizationRepository.create({
      name,
      slug,
      domain,
      plan,
      status: 'active',
    });

    return organization;
  }

  async getOrganizationById(id) {
    const organization = await organizationRepository.findById(id);
    
    if (!organization) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    return organization;
  }

  async getAllOrganizations(options) {
    return await organizationRepository.findAll(options);
  }

  async updateOrganization(id, data) {
    // Check if organization exists
    await this.getOrganizationById(id);

    // If slug is being updated, check uniqueness
    if (data.slug) {
      const existingOrg = await organizationRepository.findBySlug(data.slug);
      if (existingOrg && existingOrg.id !== id) {
        throw new Error('Organization slug already exists');
      }
    }

    return await organizationRepository.update(id, data);
  }

  async deleteOrganization(id) {
    // Check if organization exists
    await this.getOrganizationById(id);

    return await organizationRepository.delete(id);
  }

  async updateOrganizationPlan(id, plan) {
    const validPlans = ['free', 'pro', 'enterprise'];
    
    if (!validPlans.includes(plan)) {
      throw new Error('Invalid plan type');
    }

    return await this.updateOrganization(id, { plan });
  }

  async suspendOrganization(id) {
    return await this.updateOrganization(id, { status: 'suspended' });
  }

  async activateOrganization(id) {
    return await this.updateOrganization(id, { status: 'active' });
  }
}

export default new OrganizationService();
