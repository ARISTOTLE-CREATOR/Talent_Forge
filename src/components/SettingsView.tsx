import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import {
  User,
  Building2,
  Mail,
  Phone,
  Briefcase,
  Moon,
  Sun,
  ShieldCheck,
  Cpu,
  Database,
  Trash2,
  Download,
  Save,
  Check,
  LogOut,
  Sliders,
  Bell,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, Candidate, JobDescription } from '../types';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  theme: 'dark' | 'light';
  onToggleTheme: (newTheme: 'dark' | 'light') => void;
  candidateCount: number;
  jdCount?: number;
  candidates: Candidate[];
  jobDescriptions?: JobDescription[];
  onClearCandidates?: () => void;
  onClearJds?: () => void;
  onClearAllData?: () => void;
  onRestoreDefaults?: () => void;
  onLogOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  theme,
  onToggleTheme,
  candidateCount,
  jdCount = 0,
  candidates,
  jobDescriptions = [],
  onClearCandidates,
  onClearJds,
  onClearAllData,
  onRestoreDefaults,
  onLogOut
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || '',
    company: user.company || ''
  });

  React.useEffect(() => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      company: user.company || ''
    });
  }, [user]);

  const [aiSettings, setAiSettings] = useState({
    minMatchScore: 75,
    autoShortlistGold: true,
    strictParsing: true,
    aiModelMode: 'high-precision'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      ...formData
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(candidates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `talentforge_candidates_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">System & Account Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
              TalentForge Config
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your recruiter profile, appearance mode, AI screening criteria, and database backups.
          </p>
        </div>

        {/* Theme Toggle Switch */}
        <div className={`flex items-center gap-1.5 p-1.5 rounded-2xl border transition-all self-start sm:self-auto shadow-lg ${
          theme === 'light'
            ? 'bg-slate-200/90 border-slate-300'
            : 'glass-card bg-zinc-900/60 border-white/10'
        }`}>
          <button
            type="button"
            onClick={() => onToggleTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/80'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-indigo-300' : 'text-slate-600'}`} />
            <span>Night Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleTheme('light')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              theme === 'light'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-amber-100' : 'text-amber-400'}`} />
            <span>Brightness Mode</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Navigation / Quick Info */}
        <div className="space-y-6 md:col-span-1">
          {/* User Profile Card */}
          <div className="glass-card p-6 rounded-[24px] border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg ring-2 ring-indigo-500/30 shrink-0">
                {formData.name
                  ? formData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : formData.email
                    ? formData.email.slice(0, 2).toUpperCase()
                    : 'TF'}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{formData.name || 'Recruiter'}</h3>
                <p className="text-xs text-indigo-300 font-mono truncate">{formData.email}</p>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{formData.role || 'Talent Acquisition'}</p>
                <p className="text-[11px] text-zinc-500 font-medium truncate">{formData.company}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Database Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Stored Candidates</span>
                <span className="text-white font-bold">{candidateCount}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Active Job Profiles / JDs</span>
                <span className="text-white font-bold">{jdCount}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>AI Core Status</span>
                <span className="text-purple-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            </div>
          </div>

          {/* Data Backup Card */}
          <div className="glass-card p-6 rounded-[24px] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Data Management</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Export records or clear candidate database and job profiles.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleExportData}
                disabled={candidateCount === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export Candidates (JSON)</span>
              </button>

              {/* Clear Option 1: Candidates Only */}
              {onClearCandidates && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Clear Candidate Database?',
                      message: `Are you sure you want to clear all ${candidateCount} candidate records?`,
                      confirmLabel: 'Clear Candidates',
                      variant: 'danger',
                      onConfirm: onClearCandidates,
                    });
                  }}
                  disabled={candidateCount === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Candidate Database Only ({candidateCount})</span>
                </button>
              )}

              {/* Clear Option 2: Job Profiles Only */}
              {onClearJds && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Clear Job Profiles & JDs?',
                      message: `Are you sure you want to clear all ${jdCount} job description benchmarks?`,
                      confirmLabel: 'Clear Job Profiles',
                      variant: 'warning',
                      onConfirm: onClearJds,
                    });
                  }}
                  disabled={jdCount === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold transition-all"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Clear Job Profiles & JDs Only ({jdCount})</span>
                </button>
              )}

              {/* Clear Option 3: Wipe Candidate Database AND Job Profiles (Combined Option) */}
              {onClearAllData && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Wipe Database & Job Profiles?',
                      message: 'Wipe EVERYTHING? This will clear the entire Candidate Database AND all Job Profiles / JDs.',
                      confirmLabel: 'Wipe Everything',
                      variant: 'danger',
                      onConfirm: onClearAllData,
                    });
                  }}
                  disabled={candidateCount === 0 && jdCount === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white shadow-lg shadow-red-600/30 rounded-xl text-xs font-bold transition-all active:scale-95"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Wipe Database & Job Profiles (All)</span>
                </button>
              )}

              {/* Restore Defaults */}
              {onRestoreDefaults && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Restore Demo Data?',
                      message: 'Restore default sample candidates and benchmark job openings?',
                      confirmLabel: 'Restore Sample Data',
                      variant: 'info',
                      onConfirm: onRestoreDefaults,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  <span>Restore Sample Demo Profiles</span>
                </button>
              )}

              {onLogOut && (
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: 'Log Out?',
                      message: 'Are you sure you want to log out of your session?',
                      confirmLabel: 'Log Out',
                      variant: 'warning',
                      onConfirm: onLogOut,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10 rounded-xl text-xs font-semibold transition-all"
                >
                  <LogOut className="w-4 h-4 text-amber-400" />
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Settings Form */}
          <form onSubmit={handleSaveProfile} className="glass-card p-6 sm:p-8 rounded-[24px] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Recruiter Profile Information</h3>
                  <p className="text-[11px] text-zinc-400">Update your details displayed across candidate evaluations and reports.</p>
                </div>
              </div>

              {savedSuccess && (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold animate-fade-in">
                  <Check className="w-4 h-4" /> Saved!
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="alex.rivera@company.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" /> Mobile / Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Role Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Lead Technical Recruiter"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Company / Organization
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full h-10 px-3.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Acme Corporation"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>

          {/* AI Screening Preferences */}
          <div className="glass-card p-6 sm:p-8 rounded-[24px] border border-white/10 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Engine & Evaluation Criteria</h3>
                <p className="text-[11px] text-zinc-400">Configure real-time parsing accuracy and ATS match parameters.</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span>Minimum ATS Gold Match Score Threshold</span>
                  <span className="text-indigo-400 font-bold">{aiSettings.minMatchScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={aiSettings.minMatchScore}
                  onChange={(e) => setAiSettings({ ...aiSettings, minMatchScore: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-zinc-500">
                  Candidates scoring above {aiSettings.minMatchScore}% will be automatically badged as "Gold Tier" top matches.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-white/10 cursor-pointer hover:border-indigo-500/50 transition-all">
                  <input
                    type="checkbox"
                    checked={aiSettings.autoShortlistGold}
                    onChange={(e) => setAiSettings({ ...aiSettings, autoShortlistGold: e.target.checked })}
                    className="mt-0.5 rounded accent-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Auto-Shortlist Top Matches</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Automatically mark candidates scoring over {aiSettings.minMatchScore}% for interview kit generation.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950 border border-white/10 cursor-pointer hover:border-indigo-500/50 transition-all">
                  <input
                    type="checkbox"
                    checked={aiSettings.strictParsing}
                    onChange={(e) => setAiSettings({ ...aiSettings, strictParsing: e.target.checked })}
                    className="mt-0.5 rounded accent-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Strict Skill Gap Flagging</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Strictly flag any missing required technical keywords from job descriptions.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
