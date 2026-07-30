import React, { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import {
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Columns3,
  Star,
  Award,
  Sparkles,
  CheckSquare,
  Square,
  ArrowUpDown,
  Download,
  Trash2,
  FileCheck2,
  MessageSquare,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Candidate, FilterState, JobDescription } from '../types';
import { exportCandidateListReport } from '../utils/exportUtils';

interface CandidateListProps {
  candidates: Candidate[];
  activeJd?: JobDescription | null;
  onSelectCandidate: (candidate: Candidate) => void;
  selectedCandidateIds: string[];
  onToggleCandidateSelect: (id: string) => void;
  onOpenCompare: () => void;
  onOpenQuestions?: (candidate: Candidate) => void;
  onOpenImprovement: (candidate: Candidate) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteCandidate?: (id: string) => void;
  onClearAllCandidates?: () => void;
  onClearAllData?: () => void;
  onDeleteSelectedCandidates?: () => void;
  onOpenUpload?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeViewMode: 'grid' | 'table';
  setActiveViewMode: (mode: 'grid' | 'table') => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates = [],
  activeJd,
  onSelectCandidate,
  selectedCandidateIds,
  onToggleCandidateSelect,
  onOpenCompare,
  onOpenQuestions,
  onOpenImprovement,
  onToggleFavorite,
  onDeleteCandidate,
  onClearAllCandidates,
  onClearAllData,
  onDeleteSelectedCandidates,
  onOpenUpload,
  searchQuery,
  setSearchQuery,
  activeViewMode,
  setActiveViewMode
}) => {
  const [filterExp, setFilterExp] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'exp' | 'name'>('score');

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

  // Filter Candidates
  const filteredCandidates = (candidates || [])
    .filter((c) => {
      if (!c) return false;
      const q = (searchQuery || '').toLowerCase();
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const titleMatch = (c.title || '').toLowerCase().includes(q);
      const langs = c.skills?.languages || [];
      const fws = c.skills?.frameworks || [];
      const tools = c.skills?.tools || [];
      const skillMatch = [...langs, ...fws, ...tools].some((s) => (s || '').toLowerCase().includes(q));
      const locationMatch = (c.location || '').toLowerCase().includes(q);

      const matchesSearch = !q || nameMatch || titleMatch || skillMatch || locationMatch;
      const matchesExp = (c.yearsOfExperience || 0) >= filterExp;
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesTier = filterTier === 'all' || c.tier === filterTier;

      return matchesSearch && matchesExp && matchesStatus && matchesTier;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return (b.atsResult?.overallScore || 0) - (a.atsResult?.overallScore || 0);
      }
      if (sortBy === 'exp') {
        return b.yearsOfExperience - a.yearsOfExperience;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Database Title & Management Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Candidates Database</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              {candidates.length} Candidate{candidates.length === 1 ? '' : 's'}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse, filter, compare, and manage all parsed candidate resumes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Export Complete List Group */}
          {candidates.length > 0 && (
            <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1.5 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-zinc-400 px-2 flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Export Roster:
              </span>
              <button
                onClick={() => exportCandidateListReport(candidates, 'pdf', activeJd)}
                className="px-3 py-1.5 hover:bg-zinc-800 text-rose-300 rounded-lg text-xs font-semibold transition-all border border-rose-500/20"
                title="Export Complete Candidate List as PDF"
              >
                PDF
              </button>
              <button
                onClick={() => exportCandidateListReport(candidates, 'csv', activeJd)}
                className="px-3 py-1.5 hover:bg-zinc-800 text-blue-300 rounded-lg text-xs font-semibold transition-all border border-blue-500/20"
                title="Export Complete Candidate List as CSV"
              >
                CSV
              </button>
              <button
                onClick={() => exportCandidateListReport(candidates, 'excel', activeJd)}
                className="px-3 py-1.5 hover:bg-zinc-800 text-emerald-300 rounded-lg text-xs font-semibold transition-all border border-emerald-500/20"
                title="Export Complete Candidate List as Excel"
              >
                Excel
              </button>
            </div>
          )}

          {candidates.length > 0 && onClearAllCandidates && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Clear Candidate Database?',
                  message: `Are you sure you want to delete ALL ${candidates.length} candidate(s) from the database? This cannot be undone.`,
                  confirmLabel: 'Clear All Candidates',
                  variant: 'danger',
                  onConfirm: onClearAllCandidates,
                });
              }}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
              title="Clear All Candidates from Database"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card p-4 rounded-[20px] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, skill, degree, location..."
            className="w-full h-10 pl-10 pr-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Top Match">Top Match</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Tier Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Tiers</option>
            <option value="Gold">Gold Tier (&gt;90%)</option>
            <option value="Silver">Silver Tier (80-89%)</option>
            <option value="Bronze">Bronze Tier (70-79%)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-3 bg-zinc-900 border border-white/10 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="score">Sort by ATS Score</option>
            <option value="exp">Sort by Experience</option>
            <option value="name">Sort by Name</option>
          </select>

          {/* View Toggles */}
          <div className="flex items-center p-1 bg-zinc-900 border border-white/10 rounded-xl">
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                activeViewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                activeViewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Clear All Candidates Button */}
          {candidates.length > 0 && onClearAllCandidates && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Clear Candidate Database?',
                  message: `Are you sure you want to clear all ${candidates.length} candidate record(s)? This will remove them from the database.`,
                  confirmLabel: 'Clear Candidates',
                  variant: 'danger',
                  onConfirm: onClearAllCandidates,
                });
              }}
              className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ml-auto md:ml-0"
              title="Clear Candidate Database"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Candidates</span>
            </button>
          )}

          {/* Wipe Database & JDs Button */}
          {onClearAllData && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Wipe Candidate Database & Job Profiles?',
                  message: 'This will permanently remove all candidate records AND all job profiles / JDs.',
                  confirmLabel: 'Wipe Everything',
                  variant: 'danger',
                  onConfirm: onClearAllData,
                });
              }}
              className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Clear Candidate Database & Job Profiles"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wipe Database & JDs</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Candidates Bar for Comparison & Bulk Delete */}
      {selectedCandidateIds.length > 0 && (
        <div className="glass-card p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>{selectedCandidateIds.length} candidate(s) selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onDeleteSelectedCandidates && (
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: `Delete ${selectedCandidateIds.length} Selected Candidate(s)?`,
                    message: `Are you sure you want to delete ${selectedCandidateIds.length} selected candidate(s)? This action cannot be undone.`,
                    confirmLabel: 'Delete Selected',
                    variant: 'danger',
                    onConfirm: onDeleteSelectedCandidates,
                  });
                }}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            )}

            {selectedCandidateIds.length >= 2 && (
              <button
                onClick={onOpenCompare}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compare Selected Side-by-Side</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Candidate List View */}
      {filteredCandidates.length === 0 ? (
        <div className="glass-card p-12 rounded-[24px] border border-white/10 text-center space-y-4 my-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <FileText className="w-7 h-7" />
          </div>
          {candidates.length === 0 ? (
            <>
              <h3 className="text-lg font-bold text-white">No Candidates Saved Yet</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                There are currently no candidates in the database. Upload a resume or paste candidate resume text in the Resume Uploader to automatically analyze and save candidates.
              </p>
              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Upload Resume / Add Candidate</span>
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white">No Matching Candidates Found</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                No candidates match your current search criteria or filter parameters. Try clearing your search query or adjusting experience filters.
              </p>
            </>
          )}
        </div>
      ) : activeViewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => {
            const ats = cand.atsResult;
            const isSelected = selectedCandidateIds.includes(cand.id);

            const badgeColor =
              cand.tier === 'Gold'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : cand.tier === 'Silver'
                ? 'bg-slate-400/10 text-slate-300 border-slate-400/30'
                : 'bg-orange-500/10 text-orange-400 border-orange-500/30';

            return (
              <div
                key={cand.id}
                className={`glass-card p-5 rounded-[22px] border transition-all flex flex-col justify-between group ${
                  isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  {/* Top Bar: Checkbox + Avatar + Tier Badge + Favorite */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onToggleCandidateSelect(cand.id)}
                        className="text-zinc-400 hover:text-indigo-400 transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-indigo-400 fill-indigo-500/20" />
                        ) : (
                          <Square className="w-5 h-5 text-zinc-600" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-black shadow-md ring-2 ring-white/10 uppercase shrink-0">
                        {cand.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>

                      <div>
                        <h3
                          onClick={() => onSelectCandidate(cand)}
                          className="text-sm font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                        >
                          {cand.name}
                        </h3>
                        <p className="text-xs text-zinc-400">{cand.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onToggleFavorite(cand.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          cand.isFavorite ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-600 hover:text-zinc-300'
                        }`}
                        title="Favorite Candidate"
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>

                      {onDeleteCandidate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              title: `Delete ${cand.name}?`,
                              message: `Are you sure you want to delete candidate ${cand.name}? This will permanently remove them from the database.`,
                              confirmLabel: 'Delete Candidate',
                              variant: 'danger',
                              onConfirm: () => onDeleteCandidate(cand.id),
                            });
                          }}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ATS Metric & Weighted Point Summary */}
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 mb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Overall ATS Score</span>
                        <div className="text-xl font-extrabold text-indigo-400">{ats?.overallScore ?? 0}%</div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badgeColor}`}>
                          {cand.tier} Tier
                        </span>
                        <p className="text-[10px] text-zinc-400 mt-1">{cand.yearsOfExperience} Yrs Exp</p>
                      </div>
                    </div>

                    {/* Quick Category Points Bar */}
                    <div className="pt-2 border-t border-white/5 grid grid-cols-5 gap-1 text-[9px] text-center font-mono font-bold">
                      <div className="bg-indigo-950/40 p-1 rounded border border-indigo-500/20 text-indigo-300">
                        <span className="block text-[8px] text-zinc-400 font-sans font-bold">Skills</span>
                        {ats?.breakdown?.skillsPoints ?? 0}/50
                      </div>
                      <div className="bg-blue-950/40 p-1 rounded border border-blue-500/20 text-blue-300">
                        <span className="block text-[8px] text-zinc-400 font-sans font-bold">Exp</span>
                        {ats?.breakdown?.experiencePoints ?? 0}/20
                      </div>
                      <div className="bg-purple-950/40 p-1 rounded border border-purple-500/20 text-purple-300">
                        <span className="block text-[8px] text-zinc-400 font-sans font-bold">Edu</span>
                        {ats?.breakdown?.educationPoints ?? 0}/10
                      </div>
                      <div className="bg-emerald-950/40 p-1 rounded border border-emerald-500/20 text-emerald-300">
                        <span className="block text-[8px] text-zinc-400 font-sans font-bold">Proj</span>
                        {ats?.breakdown?.projectPoints ?? 0}/10
                      </div>
                      <div className="bg-amber-950/40 p-1 rounded border border-amber-500/20 text-amber-300">
                        <span className="block text-[8px] text-zinc-400 font-sans font-bold">Cert</span>
                        {ats?.breakdown?.certificationPoints ?? 0}/10
                      </div>
                    </div>
                  </div>

                  {/* Advantages vs Disadvantages Quick Snippets */}
                  <div className="space-y-1.5 mb-3 text-[11px]">
                    <div className="flex items-start gap-1.5 text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/10">
                      <span className="font-bold text-[10px] text-emerald-400 shrink-0 uppercase tracking-wide">PRO:</span>
                      <span className="text-zinc-300 line-clamp-1">{cand.advantages?.[0] || ats?.advantages?.[0] || 'Strong technical background'}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-amber-400 bg-amber-950/20 p-2 rounded-lg border border-amber-500/10">
                      <span className="font-bold text-[10px] text-amber-400 shrink-0 uppercase tracking-wide">CON:</span>
                      <span className="text-zinc-300 line-clamp-1">{cand.disadvantages?.[0] || ats?.disadvantages?.[0] || 'Minor onboarding needed'}</span>
                    </div>
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(cand.skills?.languages || []).concat(cand.skills?.frameworks || []).slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-center">
                  <button
                    onClick={() => onSelectCandidate(cand)}
                    className="py-1.5 glass-button hover:bg-indigo-600 hover:text-white rounded-lg text-[11px] font-semibold transition-all"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onOpenImprovement(cand)}
                    className="py-1.5 glass-button hover:bg-emerald-600 hover:text-white rounded-lg text-[11px] font-semibold text-emerald-300 transition-all"
                  >
                    AI Suggestions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-[22px] border border-white/10 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 border-b border-white/10 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <Square className="w-4 h-4 text-zinc-600" />
                </th>
                <th className="p-4">Candidate</th>
                <th className="p-4">ATS Match</th>
                <th className="p-4">Experience</th>
                <th className="p-4">Top Skills</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filteredCandidates.map((cand) => {
                const isSelected = selectedCandidateIds.includes(cand.id);
                return (
                  <tr key={cand.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <button onClick={() => onToggleCandidateSelect(cand.id)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-[11px] font-bold shrink-0 uppercase">
                          {cand.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div
                            onClick={() => onSelectCandidate(cand)}
                            className="font-bold text-white hover:text-indigo-300 cursor-pointer"
                          >
                            {cand.name}
                          </div>
                          <div className="text-[11px] text-zinc-500">{cand.title}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-indigo-400">
                      {cand.atsResult?.overallScore || 90}% ({cand.tier})
                    </td>

                    <td className="p-4">{cand.yearsOfExperience} Yrs</td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {(cand.skills?.languages || []).concat(cand.skills?.frameworks || []).slice(0, 3).map((sk, i) => (
                          <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-emerald-400">{cand.status}</td>

                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectCandidate(cand)}
                        className="px-2.5 py-1 glass-button rounded text-[11px] hover:text-white"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => onOpenImprovement(cand)}
                        className="px-2.5 py-1 glass-button text-emerald-300 rounded text-[11px] hover:text-white"
                      >
                        AI Suggestions
                      </button>
                      {onDeleteCandidate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmModal({
                              isOpen: true,
                              title: `Delete ${cand.name}?`,
                              message: `Are you sure you want to delete candidate ${cand.name}? This will permanently remove them from the database.`,
                              confirmLabel: 'Delete Candidate',
                              variant: 'danger',
                              onConfirm: () => onDeleteCandidate(cand.id),
                            });
                          }}
                          className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded text-[11px] transition-colors"
                          title="Delete Candidate"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
