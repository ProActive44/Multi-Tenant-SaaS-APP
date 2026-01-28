import prisma from '../config/database.js';

// MULTI-TENANCY MIDDLEWARE
// Extracts and validates tenant context from authenticated requests

export const tenantContext = async (req, res, next) => {
  try {
    // This middleware should be used AFTER authenticate middleware
    // req.user should be set by authenticate middleware
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // SUPER_ADMIN users don't have organization context
    if (req.user.role === 'SUPER_ADMIN') {
      req.tenantId = null;
      return next();
    }

    // For organization users, extract and validate organizationId
    const organizationId = req.user.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        success: false,
        message: 'Organization context required',
      });
    }

    // Validate organization exists and is active
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, status: true },
    });

    if (!org) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found',
      });
    }

    if (org.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Organization is not active',
      });
    }

    // Attach tenant ID to request
    req.tenantId = organizationId;

    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to ensure all queries are tenant-scoped
export const getTenantFilter = (tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required for scoped queries');
  }
  return { organizationId: tenantId };
};

