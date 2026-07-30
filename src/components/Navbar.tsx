import React, { useState } from 'react';
import { Search, Bell, Sparkles, User, FileUp, Moon, Sun, ShieldCheck, LogOut } from 'lucide-react';
import { UserProfile, NotificationItem } from '../types';

interface NavbarProps {
  user: UserProfile;
  notifications?: NotificationItem[];
  onOpenNotifications?: () => void;
  onOpenUpload?: () => void;
  onOpenAuth?: () => void;
  onOpenChat?: () => void;
  onLogout?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  isLanding?: boolean;
  onToggleLanding?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  notifications = [],
  onOpenNotifications,
  onOpenUpload,
  onOpenAuth,
  onOpenChat,
  searchQuery = '',
  setSearchQuery,
  activeTab,
  onSelectTab,
  isLanding,
  onToggleLanding,
  theme = 'dark',
  onToggleTheme,
  onLogout
}) => {
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 w-full glass-panel border-b border-white/10 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search candidates, skills, college, experience..."
          className="w-full h-10 pl-10 pr-4 bg-zinc-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Upload Button */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <FileUp className="w-4 h-4" />
          <span>Upload Resume</span>
        </button>

        {/* Notifications Center */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 glass-button rounded-xl text-zinc-300 hover:text-white transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => {
            if (onToggleTheme) {
              onToggleTheme(theme === 'dark' ? 'light' : 'dark');
            }
          }}
          className="p-2.5 glass-button rounded-xl text-zinc-300 hover:text-white transition-all hidden sm:flex"
          title={`Switch to ${theme === 'dark' ? 'Bright Mode' : 'Night Mode'}`}
        >
          {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>

        {/* User Profile Avatar */}
        <div
          onClick={onOpenAuth}
          className="flex items-center gap-2.5 pl-2 cursor-pointer group"
          title="Manage Profile"
        >
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition-all shadow-md">
                {user.name 
                  ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
                  : user.email 
                    ? user.email.slice(0, 2).toUpperCase() 
                    : 'TF'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-950" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {user.name || user.email}
            </div>
            <div className="text-[11px] text-zinc-400 truncate max-w-[160px] font-mono">{user.email}</div>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2.5 glass-button rounded-xl text-zinc-400 hover:text-amber-400 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
