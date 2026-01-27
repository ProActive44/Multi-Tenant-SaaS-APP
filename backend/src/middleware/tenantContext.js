// MULTI-TENANCY MIDDLEWARE
// Extracts and validates tenant context from authenticated requests
// This will be enhanced when we implement authentication

export const tenantContext = async (req, res, next) => {
  try {
    // After auth is implemented, this will extract organizationId from JWT
    // For now, this is a placeholder that demonstrates the pattern
    
    // Future implementation:
    // const { organizationId } = req.user; // from JWT payload
    // req.tenantId = organizationId;
    
    // Validate tenant exists and is active
    // const org = await prisma.organization.findUnique({
    //   where: { id: organizationId },
    //   select: { id: true, status: true }
    // });
    
    // if (!org || org.status !== 'active') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Organization not found or inactive'
    //   });
    // }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Helper function to ensure all queries are tenant-scoped
export const getTenantFilter = (tenantId) => {
  return { organizationId: tenantId };
};
