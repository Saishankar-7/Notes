const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// All note routes require authentication
router.use(protect);

/**
 * @route   GET /api/notes
 * @desc    Get all notes for authenticated user (with optional search & category filter)
 * @access  Private
 *
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
router.route('/').get(getNotes).post(createNote);

/**
 * @route   PATCH /api/notes/:id/pin
 * @desc    Toggle pin status for a note
 * @access  Private
 */
router.patch('/:id/pin', togglePinNote);

/**
 * @route   GET /api/notes/:id
 * @desc    Get single note by ID
 * @access  Private
 *
 * @route   PUT /api/notes/:id
 * @desc    Update an existing note
 * @access  Private
 *
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note
 * @access  Private
 */
router
  .route('/:id')
  .get(getNoteById)
  .put(updateNote)
  .delete(deleteNote);

module.exports = router;
