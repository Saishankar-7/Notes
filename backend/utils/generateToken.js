const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token for authenticated user sessions
 * @param {string} id - The MongoDB User ObjectId
 * @param {string} role - The user role ('user' | 'admin')
 * @returns {string} Signed JWT token
 */
const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;
