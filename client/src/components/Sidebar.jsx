import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  User,
  LogOut,
  PlusCircle,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Receipt },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 min-h-screen p-5">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight text-slate-800">
            Fin<span className="text-emerald-600">ora</span>
          </span>
          <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Finance Manager
          </span>
        </div>
      </div>

      {/* Quick Add Button */}
      {onOpenAddModal && (
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 mb-6 rounded-2xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition shadow-sm hover:shadow-md hover:shadow-emerald-600/20 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Transaction
        </button>
      )}

      {/* Navigation Links */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile snippet & logout */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
