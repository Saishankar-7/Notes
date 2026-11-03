import { useState } from 'react';
import { X, Pin } from 'lucide-react';

const COMMON_SUBJECTS = [
  'No subject',
  'General',
  'Work',
  'Career, Resume',
  'Gardening',
  'Periodic table',
  'Chemistry',
  'Personal',
  'Ideas',
  'Study',
];

export const NoteModal = ({ isOpen, onClose, onSave, initialData }) => {
  const isEditing = Boolean(initialData && initialData._id);

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'No subject');
  const [customSubject, setCustomSubject] = useState('');
  const [isPinned, setIsPinned] = useState(Boolean(initialData?.isPinned));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || 'Untitled';
    if (!content.trim() && !title.trim()) {
      setError('Please provide at least a title or some content.');
      return;
    }

    const finalCategory = customSubject.trim() || category || 'No subject';

    try {
      setLoading(true);
      setError('');
      await onSave({
        title: finalTitle,
        content: content.trim(),
        category: finalCategory,
        isPinned,
      });
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to save note.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl text-gray-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Note' : 'New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Subject / Category & Pin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Subject / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
              >
                {COMMON_SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
                <option value="custom">+ Custom Subject...</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setIsPinned(!isPinned)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  isPinned
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Pin className={`w-4 h-4 ${isPinned ? 'fill-current text-amber-600' : ''}`} />
                <span>{isPinned ? 'Starred / Pinned' : 'Star / Pin note'}</span>
              </button>
            </div>
          </div>

          {category === 'custom' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                Enter Custom Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Physics, Biology, Taxes"
                className="w-full px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 text-sm"
              />
            </div>
          )}

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Content
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content here..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all text-sm resize-none font-mono text-xs sm:text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-black hover:bg-neutral-800 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update note' : 'Create note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal;
