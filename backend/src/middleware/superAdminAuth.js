// Super Admin authorization middleware
// Ensures only SUPER_ADMIN role can access protected routes

/**
 * Require Super Admin role
 * Must be used after authenticate middleware
 */
export const requireSuperAdmin = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
        });
    }

    // Check if user is SUPER_ADMIN
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Super Admin access required',
        });
    }

    // Check that organizationId is null (super admin must not belong to any org)
    if (req.user.organizationId !== null) {
        return res.status(403).json({
            success: false,
            message: 'Invalid Super Admin account',
        });
    }

    next();
};

/**
 * Block Super Admin from organization routes
 * Use this on org routes to prevent super admin access
 */
export const blockSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'SUPER_ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'Super Admin cannot access organization routes',
        });
    }

    next();
};
