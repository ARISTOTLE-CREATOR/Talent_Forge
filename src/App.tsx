import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './components/LandingPage';
import { CandidateList } from './components/CandidateList';
import { ResumeUploader } from './components/ResumeUploader';
import { JobDescriptionManager } from './components/JobDescriptionManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SettingsView } from './components/SettingsView';
import { CandidateProfileModal } from './components/CandidateProfileModal';
import { CandidateCompareModal } from './components/CandidateCompareModal';
import { ResumeImprovementModal } from './components/ResumeImprovementModal';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';

import { initialCandidates, initialJobDescriptions, initialUserProfile, initialNotifications } from './data/mockData';
import { Candidate, JobDescription, UserProfile, CandidateStatus, NotificationItem } from './types';
import { calculateCandidateATS } from './utils/atsCalculator';
import { Sparkles, Briefcase, RefreshCw } from 'lucide-react';

export function App() {
  const [isLanding, setIsLanding] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('resume-parser');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Core App State & Authentication
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('talentforge_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read user from localStorage:', e);
    }
    return initialUserProfile;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('talentforge_auth');
      if (saved === 'true') return true;
    } catch (e) {
      console.warn('Could not read auth state from localStorage:', e);
    }
    return false; // Application always opens with the Login page on initial session
  });

  const handleLogin = (authenticatedUser: UserProfile, rememberMe: boolean) => {
    setUser(authenticatedUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('talentforge_user', JSON.stringify(authenticatedUser));
      if (rememberMe) {
        localStorage.setItem('talentforge_auth', 'true');
      } else {
        localStorage.removeItem('talentforge_auth');
      }
    } catch (e) {
      console.warn('Could not save auth state:', e);
    }
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('talentforge_auth');
    } catch (e) {
      console.warn('Could not clear auth state:', e);
    }
  };

  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(() => {
    try {
      const saved = localStorage.getItem('intellihire_jds');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read JDs from localStorage:', e);
    }
    return initialJobDescriptions;
  });

  const [activeJd, setActiveJd] = useState<JobDescription | null>(() => {
    try {
      const saved = localStorage.getItem('intellihire_active_jd');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.warn('Could not read active JD from localStorage:', e);
    }
    return initialJobDescriptions[0] || null;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('intellihire_candidates') || localStorage.getItem('talentai_candidates');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read candidates from localStorage:', e);
    }
    return [];
  });

  // Save JDs & Active JD to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('intellihire_jds', JSON.stringify(jobDescriptions));
      if (activeJd) {
        localStorage.setItem('intellihire_active_jd', JSON.stringify(activeJd));
      } else {
        localStorage.removeItem('intellihire_active_jd');
      }
    } catch (e) {
      console.warn('Could not save JDs to localStorage:', e);
    }
  }, [jobDescriptions, activeJd]);

  // Automatically recalculate ATS match scores whenever activeJd changes
  useEffect(() => {
    if (!activeJd) return;
    setCandidates((prevCandidates) =>
      prevCandidates.map((cand) => {
        const updatedAts = calculateCandidateATS(cand, activeJd);
        const newScore = updatedAts.overallScore;
        const newTier = newScore >= 85 ? 'Gold' : newScore >= 70 ? 'Silver' : 'Bronze';
        return {
          ...cand,
          matchScore: newScore,
          tier: newTier,
          atsResult: updatedAts,
          advantages: updatedAts.advantages,
          disadvantages: updatedAts.disadvantages,
          strengths: updatedAts.strengths,
          weaknesses: updatedAts.weaknesses,
          missingSkills: updatedAts.missingSkills
        };
      })
    );
  }, [activeJd?.id]);

  // Sync candidates to local storage whenever added or modified
  useEffect(() => {
    try {
      localStorage.setItem('intellihire_candidates', JSON.stringify(candidates));
    } catch (e) {
      console.warn('Could not save candidates to localStorage:', e);
    }
  }, [candidates]);

  // Apply theme class to document body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  // Selected Candidate State for Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [improvementCandidate, setImprovementCandidate] = useState<Candidate | null>(null);

  // Modal Visibility Controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Comparison Checkbox Selection
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'table'>('grid');

  // Candidate Actions
  const handleAddCandidate = (newCand: Candidate) => {
    // Score against active JD if available
    const scoredCand = activeJd
      ? {
          ...newCand,
          atsResult: calculateCandidateATS(newCand, activeJd),
          matchScore: calculateCandidateATS(newCand, activeJd).overallScore
        }
      : newCand;

    setCandidates((prev) => [scoredCand, ...prev]);
  };

  const handleUpdateCandidate = (updatedCandidate: Candidate) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
    );
    if (selectedCandidate?.id === updatedCandidate.id) {
      setSelectedCandidate(updatedCandidate);
    }
  };

  const handleToggleCandidateSelect = (id: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleFavorite = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
  };

  const handleDeleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
    setSelectedCandidateIds((prev) => prev.filter((i) => i !== id));
    if (selectedCandidate?.id === id) setSelectedCandidate(null);
  };

  const handleClearAllCandidates = () => {
    setCandidates([]);
    setSelectedCandidateIds([]);
    setSelectedCandidate(null);
    try {
      localStorage.setItem('intellihire_candidates', JSON.stringify([]));
      localStorage.setItem('talentai_candidates', JSON.stringify([]));
    } catch (e) {
      console.warn('Could not clear candidates from localStorage:', e);
    }
  };

  const handleClearAllJds = () => {
    setJobDescriptions([]);
    setActiveJd(null);
    try {
      localStorage.removeItem('intellihire_jds');
      localStorage.removeItem('intellihire_active_jd');
    } catch (e) {
      console.warn('Could not clear JDs from localStorage:', e);
    }
  };

  const handleClearAllData = () => {
    setCandidates([]);
    setJobDescriptions([]);
    setActiveJd(null);
    setSelectedCandidateIds([]);
    setSelectedCandidate(null);
    try {
      localStorage.setItem('intellihire_candidates', JSON.stringify([]));
      localStorage.setItem('talentai_candidates', JSON.stringify([]));
      localStorage.removeItem('intellihire_jds');
      localStorage.removeItem('intellihire_active_jd');
    } catch (e) {
      console.warn('Could not wipe localStorage:', e);
    }
  };

  const handleRestoreDefaultData = () => {
    setCandidates(initialCandidates);
    setJobDescriptions(initialJobDescriptions);
    setActiveJd(initialJobDescriptions[0] || null);
  };

  const handleDeleteSelectedCandidates = () => {
    setCandidates((prev) => prev.filter((c) => !selectedCandidateIds.includes(c.id)));
    setSelectedCandidateIds([]);
  };

  const handleAddJd = (newJd: JobDescription) => {
    setJobDescriptions((prev) => [newJd, ...prev]);
    setActiveJd(newJd);
  };

  const handleDeleteJd = (id: string) => {
    setJobDescriptions((prev) => {
      const filtered = prev.filter((j) => j.id !== id);
      if (activeJd?.id === id) {
        setActiveJd(filtered[0] || null);
      }
      return filtered;
    });
  };

  const handleSelectActiveJd = (jd: JobDescription) => {
    setActiveJd(jd);
  };

  const handleSidebarTabSelect = (tab: string) => {
    setActiveTab(tab);
  };

  // 1. Unauthenticated State -> Always render Login Page first!
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        initialUser={user}
      />
    );
  }

  // 2. If user toggled landing page view
  if (isLanding) {
    return (
      <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0B0F19] text-zinc-100'}`}>
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleSidebarTabSelect}
          user={user}
          notifications={notifications}
          onOpenNotifications={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
          }}
          onOpenUpload={() => setActiveTab('resume-parser')}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogOut}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLanding={isLanding}
          onToggleLanding={() => setIsLanding(!isLanding)}
          theme={theme}
          onToggleTheme={setTheme}
        />
        <LandingPage
          onGetStarted={() => {
            setIsLanding(false);
            setActiveTab('resume-parser');
          }}
        />
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          user={user}
          onUpdateUser={setUser}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-500 selection:text-white flex flex-col ${theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#0B0F19] text-zinc-100'}`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSidebarTabSelect}
        user={user}
        notifications={notifications}
        onOpenNotifications={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onOpenUpload={() => setActiveTab('resume-parser')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogOut}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLanding={isLanding}
        onToggleLanding={() => setIsLanding(!isLanding)}
        theme={theme}
        onToggleTheme={setTheme}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSidebarTabSelect}
          user={user}
          candidateCount={candidates.length}
          jdCount={jobDescriptions.length}
        />

        {/* Main Workspace */}
        <main className="flex-1 min-w-0">
          {(activeTab === 'resume-parser' || activeTab === 'upload' || activeTab === 'dashboard' || activeTab === 'overview') && (
            <ResumeUploader
              onCandidateAdded={handleAddCandidate}
              activeJd={activeJd}
              user={user}
            />
          )}

          {activeTab === 'matching' && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-[24px] border border-indigo-500/30 bg-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">AI Candidate Matching Matrix</h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Showing real-time match rankings and qualification scores against benchmark: <span className="text-indigo-300 font-bold">{activeJd?.title || 'All Job Profiles'}</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('job-descriptions')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 self-start md:self-auto shadow-lg shadow-indigo-600/30"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Switch Benchmark Opening</span>
                </button>
              </div>

              <CandidateList
                candidates={candidates}
                activeJd={activeJd}
                onSelectCandidate={setSelectedCandidate}
                selectedCandidateIds={selectedCandidateIds}
                onToggleCandidateSelect={handleToggleCandidateSelect}
                onOpenCompare={() => setIsCompareOpen(true)}
                onOpenImprovement={setImprovementCandidate}
                onToggleFavorite={handleToggleFavorite}
                onDeleteCandidate={handleDeleteCandidate}
                onClearAllCandidates={handleClearAllCandidates}
                onClearAllData={handleClearAllData}
                onDeleteSelectedCandidates={handleDeleteSelectedCandidates}
                onOpenUpload={() => setActiveTab('resume-parser')}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                activeViewMode={activeViewMode}
                setActiveViewMode={setActiveViewMode}
              />
            </div>
          )}

          {activeTab === 'candidates' && (
            <CandidateList
              candidates={candidates}
              activeJd={activeJd}
              onSelectCandidate={setSelectedCandidate}
              selectedCandidateIds={selectedCandidateIds}
              onToggleCandidateSelect={handleToggleCandidateSelect}
              onOpenCompare={() => setIsCompareOpen(true)}
              onOpenImprovement={setImprovementCandidate}
              onToggleFavorite={handleToggleFavorite}
              onDeleteCandidate={handleDeleteCandidate}
              onClearAllCandidates={handleClearAllCandidates}
              onClearAllData={handleClearAllData}
              onDeleteSelectedCandidates={handleDeleteSelectedCandidates}
              onOpenUpload={() => setActiveTab('resume-parser')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeViewMode={activeViewMode}
              setActiveViewMode={setActiveViewMode}
            />
          )}

          {(activeTab === 'job-descriptions' || activeTab === 'jds' || activeTab === 'jobs') && (
            <JobDescriptionManager
              jobDescriptions={jobDescriptions}
              candidates={candidates}
              activeJd={activeJd}
              onSelectActiveJd={handleSelectActiveJd}
              onAddJd={handleAddJd}
              onDeleteJd={handleDeleteJd}
              onClearAllJds={handleClearAllJds}
              onClearAllData={handleClearAllData}
              onRestoreDefaultJds={handleRestoreDefaultData}
            />
          )}

          {(activeTab === 'analytics' || activeTab === 'reports' || activeTab === 'ai-insights') && (
            <AnalyticsDashboard
              candidates={candidates}
              jobDescriptions={jobDescriptions}
              user={user}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={setUser}
              theme={theme}
              onToggleTheme={setTheme}
              candidateCount={candidates.length}
              jdCount={jobDescriptions.length}
              candidates={candidates}
              jobDescriptions={jobDescriptions}
              onClearCandidates={handleClearAllCandidates}
              onClearJds={handleClearAllJds}
              onClearAllData={handleClearAllData}
              onRestoreDefaults={handleRestoreDefaultData}
              onLogOut={handleLogOut}
            />
          )}
        </main>
      </div>

      {/* MODALS & OVERLAYS */}
      {selectedCandidate && (
        <CandidateProfileModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          activeJd={activeJd}
          onOpenImprovement={setImprovementCandidate}
          onToggleFavorite={handleToggleFavorite}
          onDeleteCandidate={handleDeleteCandidate}
          onUpdateCandidate={handleUpdateCandidate}
        />
      )}

      {isCompareOpen && selectedCandidateIds.length >= 2 && (
        <CandidateCompareModal
          candidates={candidates.filter((c) => selectedCandidateIds.includes(c.id))}
          onClose={() => setIsCompareOpen(false)}
          activeJd={activeJd}
        />
      )}

      {improvementCandidate && (
        <ResumeImprovementModal
          candidate={improvementCandidate}
          activeJd={activeJd}
          onClose={() => setImprovementCandidate(null)}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={setUser}
      />
    </div>
  );
}

export default App;
