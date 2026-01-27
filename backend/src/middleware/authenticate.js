import authService from '../modules/auth/auth.service.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    // For organization users, set tenantId for backward compatibility
    if (decoded.organizationId) {
      req.tenantId = decoded.organizationId;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware - Check if user has required role
 * @param {string[]} allowedRoles - Array of allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

/**
 * Require organization context
 * Ensures user belongs to an organization (not SUPER_ADMIN)
 */
export const requireOrganization = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (!req.user.organizationId) {
    return res.status(403).json({
      success: false,
      message: 'This endpoint requires organization membership',
    });
  }

  next();
};

/**
 * Require SUPER_ADMIN role
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
  }

  next();
};
