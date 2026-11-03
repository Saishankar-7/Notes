import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/useAuth';
import { NoteModal } from '../components/NoteModal';
import { TemplateModal } from '../components/TemplateModal';
import { SettingsModal } from '../components/SettingsModal';
import {
  Pin,
  Trash2,
  Edit3,
  Plus,
  FolderOpen,
  Settings,
  ChevronDown,
} from 'lucide-react';

export const Notes = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Top filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');

  // Active view in sidebar: 'dashboard' | 'all_notes' | 'trash'
  const [activeView, setActiveView] = useState('dashboard');

  // Modals
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await notesAPI.getNotes({});
        if (active) {
          setNotes(response.data.notes || []);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load notes.');
          setLoading(false);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Derived subjects from notes
  const availableSubjects = useMemo(() => {
    const subs = new Set();
    notes.forEach((n) => {
      if (n.category && n.category.trim()) {
        subs.add(n.category.trim());
      }
    });
    return ['All Subjects', ...Array.from(subs)];
  }, [notes]);

  // Filter notes by search & subject
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject =
        selectedSubject === 'All Subjects' ||
        (note.category || '').toLowerCase() === selectedSubject.toLowerCase();

      return matchesSearch && matchesSubject;
    });
  }, [notes, searchQuery, selectedSubject]);

  // Starred notes (pinned)
  const starredNotes = useMemo(() => {
    return notes.filter((n) => n.isPinned);
  }, [notes]);

  // Recent notes (latest 6)
  const recentNotes = useMemo(() => {
    return filteredNotes.slice(0, 6);
  }, [filteredNotes]);

  // Note CRUD handlers
  const handleSaveNote = async (noteData) => {
    if (editingNote && editingNote._id) {
      const response = await notesAPI.updateNote(editingNote._id, noteData);
      setNotes((prev) =>
        prev.map((n) => (n._id === editingNote._id ? response.data.note : n))
      );
    } else {
      const response = await notesAPI.createNote(noteData);
      setNotes((prev) => [response.data.note, ...prev]);
    }
  };

  const handleTogglePin = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await notesAPI.togglePin(id);
      const updated = response.data.note;
      setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      console.error('[Notes: handleTogglePin]', err);
    }
  };

  const handleDeleteNote = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesAPI.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('[Notes: handleDeleteNote]', err);
    }
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setIsNoteModalOpen(true);
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setIsNoteModalOpen(true);
  };

  const handleUseTemplate = (templateData) => {
    setEditingNote(templateData);
    setIsNoteModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-gray-900 flex flex-col font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* TOP HEADER BAR (Exact match to screenshot)                  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <header className="w-full bg-white border-b border-gray-200/90 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-30">
        {/* Search Input (Left side) */}
        <div className="flex-1 max-w-2xl relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeView !== 'all_notes' && e.target.value.trim() !== '') {
                setActiveView('all_notes');
              }
            }}
            placeholder="Search notes..."
            className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black/20 focus:border-gray-400"
          />
        </div>

        {/* Right Action Items: All Subjects, Dashboard, Idle, Logout, Admin */}
        <div className="flex items-center gap-2 text-sm">
          {/* Subjects Dropdown */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="appearance-none bg-white border border-gray-200 hover:border-gray-300 rounded-lg pl-3 pr-8 py-1.5 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black/20"
            >
              {availableSubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Dashboard Button */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`border rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              activeView === 'dashboard'
                ? 'bg-gray-100 border-gray-300 text-gray-900'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Dashboard
          </button>

          {/* Admin Panel button (if admin) */}
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold transition-colors"
            >
              Admin
            </button>
          )}

          {/* Idle status badge */}
          <span className="border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-xs text-gray-500 font-medium">
            Idle
          </span>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MAIN CONTAINER: SIDEBAR + CONTENT                           */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        {/* LEFT SIDEBAR (Exact match to screenshot) */}
        <aside className="w-60 sm:w-64 border-r border-gray-200/90 bg-[#f7f7f9] p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-3.5rem)]">
          <div className="space-y-4">
            {/* + New Note Button (Solid Black Pill) */}
            <button
              onClick={openCreateModal}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold text-sm shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>

            {/* Nav Card Items */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`w-full text-left py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-white border-gray-300 text-gray-900 shadow-xs'
                    : 'bg-white/80 border-gray-200/80 text-gray-700 hover:bg-white hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="w-full text-left py-2.5 px-4 rounded-xl border border-gray-200/80 bg-white/80 hover:bg-white hover:border-gray-300 text-sm font-medium text-gray-700 transition-all"
              >
                Templates
              </button>

              <button
                onClick={() => setActiveView('trash')}
                className={`w-full text-left py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                  activeView === 'trash'
                    ? 'bg-white border-gray-300 text-gray-900 shadow-xs'
                    : 'bg-white/80 border-gray-200/80 text-gray-700 hover:bg-white hover:border-gray-300'
                }`}
              >
                Trash
              </button>
            </div>

            {/* STARRED SECTION */}
            <div className="pt-4">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2.5">
                STARRED
              </h4>

              {starredNotes.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No starred notes yet</p>
              ) : (
                <div className="space-y-2">
                  {starredNotes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => openEditModal(note)}
                      className="group cursor-pointer rounded-xl p-2 hover:bg-white transition-colors"
                    >
                      <p className="font-semibold text-sm text-gray-900 leading-tight group-hover:text-black">
                        {note.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {note.category || 'No subject'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sidebar: Settings */}
          <div className="pt-6">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-full text-left py-2 px-4 rounded-xl border border-gray-200/80 bg-white/80 hover:bg-white text-sm font-medium text-gray-700 flex items-center justify-between transition-all"
            >
              <span>Settings</span>
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </aside>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* MAIN CONTENT AREA                                          */}
        {/* ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* VIEW: DASHBOARD (Matches screenshot) */}
          {activeView === 'dashboard' && (
            <div className="max-w-5xl">
              {/* Dashboard Title & Subtitle */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Start a new note and jump back into your recent work.
                </p>
              </div>

              {/* QUICK ACTIONS SECTION (3 Cards) */}
              <section className="mb-10">
                <h2 className="text-base font-bold text-gray-900 mb-3.5">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1: New Note ✏️ */}
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">New Note</h3>
                        <span className="text-base">✏️</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-6">
                        Create a blank note and start writing right away.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={openCreateModal}
                        className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                      >
                        Create note
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Browse Templates 📝 */}
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          Browse Templates
                        </h3>
                        <span className="text-base">📝</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-6">
                        Start with a structured layout for notes, labs, or exams.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => setIsTemplateModalOpen(true)}
                        className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                      >
                        View templates
                      </button>
                    </div>
                  </div>

                  {/* Card 3: All Notes 📚 */}
                  <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">All Notes</h3>
                        <span className="text-base">📚</span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-6">
                        Open the full notes library to browse, search, and manage
                        everything.
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => setActiveView('all_notes')}
                        className="rounded-lg border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-800 transition-colors shadow-2xs"
                      >
                        Open all notes
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* RECENT NOTES SECTION */}
              <section>
                <div className="flex items-center justify-between mb-3.5">
                  <h2 className="text-base font-bold text-gray-900">Recent Notes</h2>
                  {recentNotes.length > 0 && (
                    <button
                      onClick={() => setActiveView('all_notes')}
                      className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View all ({filteredNotes.length}) &rarr;
                    </button>
                  )}
                </div>

                {loading && notes.length === 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                ) : recentNotes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                    <p className="text-sm font-medium text-gray-600">No notes yet</p>
                    <p className="text-xs text-gray-400 mt-1 mb-4">
                      Create your first note or pick a template above.
                    </p>
                    <button
                      onClick={openCreateModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Note</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {recentNotes.map((note) => (
                      <div
                        key={note._id}
                        onClick={() => openEditModal(note)}
                        className="group relative cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between min-h-[96px]"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-base text-gray-900 group-hover:text-black line-clamp-1">
                              {note.title || 'Untitled'}
                            </h3>
                            <button
                              onClick={(e) => handleTogglePin(note._id, e)}
                              className={`p-1 rounded transition-colors ${
                                note.isPinned
                                  ? 'text-amber-500'
                                  : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600'
                              }`}
                              title={note.isPinned ? 'Unstar note' : 'Star note'}
                            >
                              <Pin
                                className={`w-3.5 h-3.5 ${
                                  note.isPinned ? 'fill-current' : ''
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {note.category || 'No subject'}
                          </p>
                        </div>

                        {/* Hover action shortcuts */}
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(note);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteNote(note._id, e)}
                            className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* VIEW: ALL NOTES LIBRARY */}
          {activeView === 'all_notes' && (
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    All Notes ({filteredNotes.length})
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Browse, search, edit, and organize your entire collection
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    &larr; Back to Dashboard
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create note</span>
                  </button>
                </div>
              </div>

              {filteredNotes.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
                  <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No notes found</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {searchQuery
                      ? 'No notes match your search keywords.'
                      : 'You do not have any notes matching this filter.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => openEditModal(note)}
                      className="group cursor-pointer rounded-2xl border border-gray-200/90 bg-white p-5 shadow-xs hover:shadow-md hover:border-gray-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                            {note.title || 'Untitled'}
                          </h3>
                          <button
                            onClick={(e) => handleTogglePin(note._id, e)}
                            className={`p-1 rounded transition-colors ${
                              note.isPinned
                                ? 'text-amber-500'
                                : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600'
                            }`}
                          >
                            <Pin
                              className={`w-3.5 h-3.5 ${
                                note.isPinned ? 'fill-current' : ''
                              }`}
                            />
                          </button>
                        </div>
                        <span className="inline-block text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md mb-2">
                          {note.category || 'No subject'}
                        </span>
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {note.content || '(Empty content)'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>
                          {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(note);
                            }}
                            className="p-1 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteNote(note._id, e)}
                            className="p-1 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* VIEW: TRASH */}
          {activeView === 'trash' && (
            <div className="max-w-3xl">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trash</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  Items deleted from your workspace
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xs">
                <Trash2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-800">Trash is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Deleted notes are automatically cleaned and purged. No pending notes in
                  trash.
                </p>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="mt-5 px-4 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* MODALS                                                      */}
      {/* ─────────────────────────────────────────────────────────── */}
      {isNoteModalOpen && (
        <NoteModal
          key={editingNote?._id || 'new-' + (editingNote?.title || 'blank')}
          isOpen={isNoteModalOpen}
          onClose={() => {
            setIsNoteModalOpen(false);
            setEditingNote(null);
          }}
          onSave={handleSaveNote}
          initialData={editingNote}
        />
      )}

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleUseTemplate}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default Notes;
