const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// Enforce authentication & admin role across all routes in this file
router.use(protect, adminOnly);

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregate platform metrics (totals, counts, breakdowns)
 * @access  Private / Admin
 */
router.get('/stats', getStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users with their associated note counts
 * @access  Private / Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role (e.g. promote user to admin or demote to user)
 * @access  Private / Admin
 */
router.patch('/users/:id/role', updateUserRole);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account and cascade delete all their notes
 * @access  Private / Admin
 */
router.delete('/users/:id', deleteUser);

module.exports = router;
