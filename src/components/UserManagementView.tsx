import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Lock, 
  User, 
  Search, 
  RefreshCw,
  PowerOff,
  Power,
  Loader2,
  ShieldAlert,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const {
    currentUser,
    registerTeacher,
    toggleUserStatus,
    deleteUserAccount,
    fetchAllUsers,
    resetPassword,
  } = useAuth();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Teacher form
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsersList(data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setActionError(err.message || 'Failed to load user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRegisterTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword) {
      setActionError('All fields are required.');
      return;
    }

    if (teacherPassword.length < 6) {
      setActionError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const createdName = teacherName.trim();
      const createdEmail = teacherEmail.trim().toLowerCase();
      await registerTeacher(createdName, createdEmail, teacherPassword);
      setActionSuccess(
        `Teacher account for "${createdName}" created successfully! They can now log in using ${createdEmail}.`
      );
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPassword('');
      setShowAddModal(false);
      await loadUsers();
    } catch (err: any) {
      console.error('Teacher creation error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setActionError('An account with this email address already exists.');
      } else {
        setActionError(err.message || 'Failed to register teacher account.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (user.uid === currentUser?.uid) {
      setActionError('You cannot deactivate your own administrative account.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    try {
      await toggleUserStatus(user.uid, user.active);
      setActionSuccess(
        `Account for ${user.name} has been ${user.active ? 'deactivated' : 'activated'}.`
      );
      await loadUsers();
    } catch (err: any) {
      console.error('Status toggle error:', err);
      setActionError(err.message || 'Failed to update account status.');
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    if (user.uid === currentUser?.uid) {
      setActionError('You cannot delete your own administrative account.');
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    try {
      await deleteUserAccount(user.uid);
      setActionSuccess(`Removed staff account for ${user.name} (${user.email}).`);
      await loadUsers();
    } catch (err: any) {
      console.error('Delete user error:', err);
      setActionError(err.message || 'Failed to delete user account.');
    }
  };

  const handleSendResetLink = async (user: UserProfile) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await resetPassword(user.email);
      setActionSuccess(`Password reset email dispatched to ${user.email}.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setActionError(err.message || 'Failed to send password reset email.');
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="text-indigo-600 dark:text-indigo-400" size={24} />
            <span>Staff & User Role Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Control institutional accounts, authorize teacher credentials, and enforce Firestore security policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
            title="Refresh Users"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95"
          >
            <UserPlus size={16} />
            <span>Register New Teacher</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{actionSuccess}</span>
        </div>
      )}

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 flex items-start gap-3 text-xs text-indigo-900 dark:text-indigo-200">
        <ShieldAlert size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Database-Level Security Enforcement Active</p>
          <p className="text-slate-600 dark:text-slate-400">
            User roles are stored in Cloud Firestore (
            <code className="bg-white/60 dark:bg-slate-800 px-1 py-0.5 rounded">/users/&#123;uid&#125;</code>
            ) and verified by Firebase Security Rules. Teachers cannot escalate their role or delete student databases even if attempting direct API requests.
          </p>
        </div>
      </div>

      {/* Search and Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email or role..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredUsers.length} Staff Member{filteredUsers.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Institutional Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
                    <span>Loading authorized personnel...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No staff records found matching your query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent =
                    u.uid === currentUser?.uid ||
                    (currentUser?.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="ml-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.5 rounded">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-mono text-xs">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-xs ${
                            u.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.active ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{u.active ? 'Active' : 'Disabled'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleSendResetLink(u)}
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="Dispatch Password Reset Email"
                          >
                            <KeyRound size={15} />
                          </button>

                          {!isCurrent && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg border transition ${
                                  u.active
                                    ? 'border-amber-200 dark:border-amber-900 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                                    : 'border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                                }`}
                                title={u.active ? 'Disable Account Access' : 'Enable Account Access'}
                              >
                                {u.active ? <PowerOff size={15} /> : <Power size={15} />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                                title="Delete Staff Account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Teacher */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Register Teacher Account
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Create official login credentials for faculty. Teachers have restricted privileges: they can enter student marks and generate transcripts, but cannot delete records or alter school configurations.
            </p>

            {actionError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Enter teacher full name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="Enter teacher email address"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showTeacherPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The teacher can sign in immediately using this email and password.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
