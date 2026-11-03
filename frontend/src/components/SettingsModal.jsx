import { X, User, Mail, Shield, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl text-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-base">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <User className="w-4 h-4" /> Full Name
              </span>
              <span className="font-medium text-gray-900">{user?.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <Mail className="w-4 h-4" /> Email Address
              </span>
              <span className="font-medium text-gray-900">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <Shield className="w-4 h-4" /> Account Role
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  user?.role === 'admin'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="flex items-center gap-2 text-gray-500">
                <Calendar className="w-4 h-4" /> Member Since
              </span>
              <span className="font-medium text-gray-900">{formattedDate}</span>
            </div>
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out of account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

