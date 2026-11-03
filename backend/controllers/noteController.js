const Note = require('../models/Note');

/**
 * @desc    Get all notes for authenticated user (with optional search & category filter)
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    const { search, category } = req.query;

    // Filter strictly scoped to the logged-in user
    const query = { user: req.user._id };

    // Search filter across title or content
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category.trim() !== '' && category.toLowerCase() !== 'all') {
      query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
    }

    // Pinned notes appear first, followed by newest updated
    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    console.error('[NoteController: getNotes]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving notes.',
    });
  }
};

/**
 * @desc    Get a single note by ID (must belong to authenticated user)
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Verify ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this note.',
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('[NoteController: getNoteById]', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving note.',
    });
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res) => {
  try {
    const { title, content, category, tags, isPinned, color } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and content for the note.',
      });
    }

    // Clean tags array if sent as string or array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      content: content.trim(),
      category: category ? category.trim() : 'General',
      tags: processedTags,
      isPinned: Boolean(isPinned),
      color: color || '#ffffff',
    });

    return res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      note,
    });
  } catch (error) {
    console.error('[NoteController: createNote]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating note.',
    });
  }
};

/**
 * @desc    Update an existing note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Verify ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this note.',
      });
    }

    const { title, content, category, tags, isPinned, color } = req.body;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (category !== undefined) note.category = category.trim();
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (color !== undefined) note.color = color;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        note.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        note.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      note: updatedNote,
    });
  } catch (error) {
    console.error('[NoteController: updateNote]', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating note.',
    });
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Verify ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this note.',
      });
    }

    await note.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
      id: req.params.id,
    });
  } catch (error) {
    console.error('[NoteController: deleteNote]', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Invalid note ID format.',
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting note.',
    });
  }
};

/**
 * @desc    Toggle pin status for a note
 * @route   PATCH /api/notes/:id/pin
 * @access  Private
 */
const togglePinNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found.',
      });
    }

    // Verify ownership
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this note.',
      });
    }

    note.isPinned = !note.isPinned;
    const updatedNote = await note.save();

    return res.status(200).json({
      success: true,
      message: `Note ${updatedNote.isPinned ? 'pinned' : 'unpinned'} successfully.`,
      note: updatedNote,
    });
  } catch (error) {
    console.error('[NoteController: togglePinNote]', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error toggling pin status.',
    });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
};
