import React from 'react';
import {
  Users,
  Briefcase,
  FileSearch,
  BarChart3,
  Sparkles,
  Settings,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { UserProfile } from '../types';
import { Logo } from './Logo';

interface SidebarProps {
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  setActiveTab?: (tab: string) => void;
  user?: UserProfile;
  candidateCount: number;
  jdCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  setActiveTab,
  user,
  candidateCount,
  jdCount
}) => {
  const handleTabClick = (tabId: string) => {
    if (onSelectTab) onSelectTab(tabId);
    if (setActiveTab) setActiveTab(tabId);
  };

  const menuItems = [
    { id: 'resume-parser', label: 'AI Resume Screener', icon: FileSearch },
    { id: 'candidates', label: 'Candidates Database', icon: Users, badge: candidateCount },
    { id: 'job-descriptions', label: 'Job Profiles & JDs', icon: Briefcase, badge: jdCount },
    { id: 'matching', label: 'AI Candidate Matching', icon: Sparkles },
    { id: 'analytics', label: 'Recruitment Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/10 flex flex-col h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Logo size="md" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          Core Workflows
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive
                      ? 'text-white'
                      : 'text-zinc-400 group-hover:text-indigo-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-800 text-zinc-400 border border-white/5'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Company Profile Footer */}
      <div className="p-4 border-t border-white/10 m-2 bg-zinc-900/60 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.company || 'TalentForge Workspace'}</p>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> AI Engine Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
