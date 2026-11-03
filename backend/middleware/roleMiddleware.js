/**
 * Middleware factory to authorize access based on user roles
 * Usage:
 *   router.get('/admin', protect, authorize('admin'), adminHandler);
 *   router.get('/moderator', protect, authorize('admin', 'moderator'), modHandler);
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'user')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Ensure authMiddleware has run and attached req.user
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before role verification.',
      });
    }

    // Check if user's role is included in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};

/**
 * Pre-configured shorthand middleware specifically for admin-only routes
 */
const adminOnly = (req, res, next) => {
  return authorize('admin')(req, res, next);
};

module.exports = authorize;
module.exports.authorize = authorize;
module.exports.adminOnly = adminOnly;
module.exports.roleMiddleware = authorize;
