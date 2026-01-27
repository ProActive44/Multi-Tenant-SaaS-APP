import prisma from '../../config/database.js';

// Data access layer for organizations
// Handles all database operations

class OrganizationRepository {
  async create(data) {
    return await prisma.organization.create({
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        plan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id) {
    return await prisma.organization.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        plan: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findBySlug(slug) {
    return await prisma.organization.findUnique({
      where: { slug },
    });
  }

  async findAll(options = {}) {
    const { page = 1, limit = 10, status } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.organization.count({ where }),
    ]);

    return { organizations, total };
  }

  async update(id, data) {
    return await prisma.organization.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        slug: true,
        domain: true,
        plan: true,
        status: true,
        updatedAt: true,
      },
    });
  }

  async delete(id) {
    return await prisma.organization.delete({
      where: { id },
    });
  }
}

export default new OrganizationRepository();
