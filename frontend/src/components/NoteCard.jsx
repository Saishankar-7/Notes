import { Pin, Edit3, Trash2, Calendar, Tag } from 'lucide-react';

export const NoteCard = ({ note, onEdit, onDelete, onTogglePin }) => {
  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(
    undefined,
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
        note.isPinned
          ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-indigo-500/40 shadow-indigo-500/5'
          : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header: Title & Pin Action */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-lg text-slate-100 group-hover:text-white line-clamp-2 leading-snug">
            {note.title}
          </h3>
          <button
            onClick={() => onTogglePin(note._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              note.isPinned
                ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Category Pill */}
        {note.category && (
          <span className="inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 border border-slate-700/80 mb-3">
            {note.category}
          </span>
        )}

        {/* Content Preview */}
        <p className="text-sm text-slate-300 whitespace-pre-wrap line-clamp-4 leading-relaxed mb-4">
          {note.content}
        </p>
      </div>

      {/* Bottom Section: Tags, Timestamp & Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-3">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-500" />
            {note.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
            <button
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
              title="Edit note"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(note._id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;

