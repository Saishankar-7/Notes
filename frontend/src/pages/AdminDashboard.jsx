import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/useAuth';
import {
  Users,
  FileText,
  Pin,
  ShieldCheck,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refreshData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('[AdminDashboard: refreshData]', err);
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchInitial = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getUsers(),
        ]);
        if (active) {
          setStats(statsRes.data.stats);
          setUsers(usersRes.data.users);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load administrator data.');
          setLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      active = false;
    };
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to '${newRole}'?`
      )
    )
      return;

    try {
      setError('');
      await adminAPI.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setSuccessMessage(`Role successfully changed to ${newRole}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      adminAPI.getStats().then((res) => setStats(res.data.stats));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Warning: Deleting user '${userName}' will permanently delete their account and all their notes. Continue?`
      )
    )
      return;

    try {
      setError('');
      await adminAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSuccessMessage(`User '${userName}' and their notes were deleted.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      adminAPI.getStats().then((res) => setStats(res.data.stats));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-gray-900 font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate('/notes')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black mb-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Admin Control Panel
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Platform-wide analytics, metrics, and user account management
            </p>
          </div>

          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors text-xs font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-2 p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-gray-900">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {stats.totalUsers}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-gray-900">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Total Notes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {stats.totalNotes}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
                <Pin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Pinned Notes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {stats.pinnedNotesCount}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gray-100 text-gray-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
                  Admins
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">
                  {stats.adminCount}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Registered Accounts ({users.length})
            </h2>
            <span className="text-xs text-gray-400">Manage permissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Notes</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => {
                  const isSelf = currentAdmin?._id === u._id;
                  const formattedDate = new Date(u.createdAt).toLocaleDateString();

                  return (
                    <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black text-white">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>

                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            u.role === 'admin'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="px-6 py-3.5 text-xs text-gray-600 font-medium">
                        {u.noteCount ?? 0}
                      </td>

                      <td className="px-6 py-3.5 text-xs text-gray-400">
                        {formattedDate}
                      </td>

                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleRoleChange(u._id, u.role)}
                            disabled={isSelf}
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                              isSelf
                                ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                                : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            Set {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            disabled={isSelf}
                            className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                              isSelf
                                ? 'opacity-40 cursor-not-allowed text-gray-300'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
