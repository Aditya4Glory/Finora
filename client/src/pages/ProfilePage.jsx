import React, { useState } from 'react';
import { User, Mail, Calendar, Save, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIsUpdating(true);
      await updateProfile({ name: name.trim() });
      toast.success('Profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View and manage your personal Finora account information.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        {/* User Avatar & Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
            <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdate} className="mt-6 space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div>
            <label htmlFor="profile-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Email Address <span className="text-slate-400 font-normal lowercase">(cannot be changed)</span>
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="profile-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Member Since (Read-only) */}
          <div>
            <label htmlFor="profile-joined" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Member Since
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="profile-joined"
                type="text"
                value={formatDate(user?.createdAt) || 'Recent'}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="submit"
              disabled={isUpdating || name.trim() === user?.name}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
