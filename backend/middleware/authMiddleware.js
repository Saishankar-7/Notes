const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate requests via JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in the Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header string "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user document to req.user (excluding password hash)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Authorization denied.',
        });
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token is invalid or expired.',
      });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no Bearer token provided.',
    });
  }
};

// Export to support both named and default imports
module.exports = protect;
module.exports.protect = protect;
module.exports.authMiddleware = protect;
