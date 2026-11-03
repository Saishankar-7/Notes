import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  StickyNote,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={isAuthenticated ? '/notes' : '/login'}
          className="flex items-center gap-2.5 text-slate-100 hover:text-white transition-colors"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/20">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            NotesApp <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">RBAC</span>
          </span>
        </Link>

        {/* Navigation & User Actions */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/notes"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === '/notes'
                    ? 'bg-slate-800 text-indigo-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">My Notes</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Link>
              )}
            </nav>

            <div className="h-6 w-px bg-slate-800" />

            {/* User Profile Badge */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-semibold text-slate-200 leading-tight">
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  {user?.role === 'admin' ? (
                    <span className="text-amber-400 font-medium">Administrator</span>
                  ) : (
                    <span>User</span>
                  )}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-600/30 transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

