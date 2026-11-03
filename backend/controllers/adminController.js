const User = require('../models/User');
const Note = require('../models/Note');

/**
 * @desc    Get aggregate platform metrics (totals, counts, breakdowns)
 * @route   GET /api/admin/stats
 * @access  Private / Admin
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUserCount = await User.countDocuments({ role: 'user' });
    const totalNotes = await Note.countDocuments();
    const pinnedNotesCount = await Note.countDocuments({ isPinned: true });

    // Recent 5 registered users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        regularUserCount,
        totalNotes,
        pinnedNotesCount,
      },
      recentUsers,
    });
  } catch (error) {
    console.error('[AdminController: getStats]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving admin statistics.',
    });
  }
};

/**
 * @desc    Get all registered users with their associated note count
 * @route   GET /api/admin/users
 * @access  Private / Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // Attach note counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const noteCount = await Note.countDocuments({ user: u._id });
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          noteCount,
          createdAt: u.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: usersWithStats.length,
      users: usersWithStats,
    });
  } catch (error) {
    console.error('[AdminController: getAllUsers]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving user list.',
    });
  }
};

/**
 * @desc    Change user role (e.g. promote user to admin or demote to user)
 * @route   PATCH /api/admin/users/:id/role
 * @access  Private / Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be either 'user' or 'admin'.",
      });
    }

    // Safety guard: Admin cannot change their own role to prevent accidental lockout
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot alter your own admin role.',
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}' successfully.`,
      user,
    });
  } catch (error) {
    console.error('[AdminController: updateUserRole]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating user role.',
    });
  }
};

/**
 * @desc    Delete user account and cascade delete all their notes
 * @route   DELETE /api/admin/users/:id
 * @access  Private / Admin
 */
const deleteUser = async (req, res) => {
  try {
    // Safety guard: Admin cannot delete their own account
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Security protection: You cannot delete your own admin account.',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Cascade delete: Remove all notes belonging to this user
    await Note.deleteMany({ user: user._id });

    // Remove user
    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' and all associated notes deleted successfully.`,
      id: req.params.id,
    });
  } catch (error) {
    console.error('[AdminController: deleteUser]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting user.',
    });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
