const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide note content'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#ffffff',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize sorting pinned notes first, then newest updated
noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });

// Text index to enable keyword searching across title and content
noteSchema.index({ title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
