import React, { useState } from 'react';
import { Briefcase, Plus, Sparkles, Check, Building, MapPin, DollarSign, Layers, Trash2, Edit3, Loader2, Download, AlertTriangle, RefreshCw } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { Candidate, JobDescription } from '../types';
import { exportJobProfileAnalysisReport } from '../utils/exportUtils';

interface JobDescriptionManagerProps {
  jobDescriptions: JobDescription[];
  candidates?: Candidate[];
  activeJd: JobDescription | null;
  onSelectActiveJd: (jd: JobDescription) => void;
  onAddJd: (jd: JobDescription) => void;
  onDeleteJd: (id: string) => void;
  onClearAllJds?: () => void;
  onClearAllData?: () => void;
  onRestoreDefaultJds?: () => void;
}

export const JobDescriptionManager: React.FC<JobDescriptionManagerProps> = ({
  jobDescriptions = [],
  candidates = [],
  activeJd,
  onSelectActiveJd,
  onAddJd,
  onDeleteJd,
  onClearAllJds,
  onClearAllData,
  onRestoreDefaultJds
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [rawJdText, setRawJdText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

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

  const handleExtractJd = async () => {
    if (!rawJdText.trim()) return;
    setIsExtracting(true);

    try {
      const response = await fetch('/api/extract-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: rawJdText })
      });

      const data = await response.json();
      if (data.success && data.jobDescription) {
        const ext = data.jobDescription;
        const newJd: JobDescription = {
          id: `jd-${Date.now()}`,
          title: ext.title || 'Senior Software Engineer',
          department: ext.department || 'Engineering',
          location: ext.location || 'San Francisco, CA',
          experienceLevel: ext.experienceLevel || '5+ Years',
          employmentType: ext.employmentType || 'Full-time',
          salaryRange: ext.salaryRange || '$150,000 - $200,000',
          summary: ext.summary || rawJdText.slice(0, 180),
          requiredSkills: ext.requiredSkills || ['TypeScript', 'React', 'Node.js'],
          optionalSkills: ext.optionalSkills || ['Docker', 'AWS'],
          responsibilities: ext.responsibilities || ['Develop scalable web applications.'],
          educationRequirements: ext.educationRequirements || "Bachelor's degree in CS",
          domainKeywords: ext.domainKeywords || ['Clean Code', 'Agile'],
          createdAt: new Date().toISOString().split('T')[0]
        };

        onAddJd(newJd);
        onSelectActiveJd(newJd);
        setShowAddModal(false);
        setRawJdText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Active Job Descriptions
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Select the active benchmark Job Description. All candidate resumes will be compared and scored against this profile.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Job Profile Analysis Group */}
          {jobDescriptions.length > 0 && (
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
              <span className="text-xs font-bold text-zinc-400 px-2 flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-indigo-400" /> Export Analysis:
              </span>
              <button
                onClick={() => exportJobProfileAnalysisReport(jobDescriptions, candidates, 'pdf')}
                className="px-2.5 py-1.5 hover:bg-zinc-800 text-rose-300 rounded-lg text-xs font-semibold transition-all border border-rose-500/20"
                title="Export Job Profile Analysis as PDF"
              >
                PDF
              </button>
              <button
                onClick={() => exportJobProfileAnalysisReport(jobDescriptions, candidates, 'csv')}
                className="px-2.5 py-1.5 hover:bg-zinc-800 text-blue-300 rounded-lg text-xs font-semibold transition-all border border-blue-500/20"
                title="Export Job Profile Analysis as CSV"
              >
                CSV
              </button>
              <button
                onClick={() => exportJobProfileAnalysisReport(jobDescriptions, candidates, 'excel')}
                className="px-2.5 py-1.5 hover:bg-zinc-800 text-emerald-300 rounded-lg text-xs font-semibold transition-all border border-emerald-500/20"
                title="Export Job Profile Analysis as Excel"
              >
                Excel
              </button>
            </div>
          )}

          {/* Clear JDs Only */}
          {jobDescriptions.length > 0 && onClearAllJds && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Clear Job Profiles & JDs?',
                  message: `Are you sure you want to clear all ${jobDescriptions.length} job profile benchmarks?`,
                  confirmLabel: 'Clear Job Profiles',
                  variant: 'danger',
                  onConfirm: onClearAllJds,
                });
              }}
              className="px-3.5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Clear all job descriptions"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Job Profiles</span>
            </button>
          )}

          {/* Clear Everything Option */}
          {onClearAllData && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: 'Wipe Database & Job Profiles?',
                  message: 'This will permanently remove all candidate records AND all job profiles / JDs.',
                  confirmLabel: 'Wipe Everything',
                  variant: 'danger',
                  onConfirm: onClearAllData,
                });
              }}
              className="px-3.5 py-2.5 bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="Wipe Candidate Database & Job Profiles"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden md:inline">Wipe Database & JDs</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Opening
          </button>
        </div>
      </div>

      {/* Grid of Job Descriptions or Empty State */}
      {jobDescriptions.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-[24px] border border-white/10 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Job Profiles / JDs in Database</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              All job description benchmarks have been cleared. Add a new job opening via AI text extraction or restore sample profiles.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Opening</span>
            </button>
            {onRestoreDefaultJds && (
              <button
                onClick={() => onRestoreDefaultJds()}
                className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>Restore Sample Profiles</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
        {jobDescriptions.map((jd) => {
          const isActive = activeJd?.id === jd.id;

          return (
            <div
              key={jd.id}
              className={`glass-card p-6 rounded-[24px] border transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-white/5">
                      {jd.department}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{jd.title}</h3>
                  </div>

                  {isActive ? (
                    <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Active Match Benchmark
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectActiveJd(jd)}
                      className="px-3 py-1 glass-button hover:bg-indigo-600 hover:text-white text-zinc-300 text-xs font-semibold rounded-full transition-all"
                    >
                      Set as Benchmark
                    </button>
                  )}
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-4">{jd.summary}</p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300 mb-4 bg-zinc-900/60 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {jd.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {jd.salaryRange}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-400" /> {jd.experienceLevel}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" /> {jd.employmentType}
                  </div>
                </div>

                {/* Required Skills */}
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Required Skills & Importance Weight ({jd.requiredSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {jd.requiredSkills.map((sk, idx) => {
                      const priority = jd.skillPriorities?.[sk] || (idx <= 2 ? 'High' : idx <= 5 ? 'Medium' : 'Low');
                      const pBg = priority === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : priority === 'Medium' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700';
                      return (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-900 text-zinc-200 text-[11px] font-mono border border-white/10 flex items-center gap-1.5">
                          <span>{sk}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold border ${pBg}`}>
                            {priority}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-zinc-500">
                <span>Created {jd.createdAt}</span>
                <button
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: `Delete Job Profile "${jd.title}"?`,
                      message: `Are you sure you want to delete "${jd.title}"?`,
                      confirmLabel: 'Delete Profile',
                      variant: 'danger',
                      onConfirm: () => onDeleteJd(jd.id),
                    });
                  }}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded transition-colors flex items-center gap-1"
                  title="Delete Job Description"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[11px] hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Add JD Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-xl w-full rounded-[24px] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Add Job Description via AI Extraction
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste raw job posting text or description below. AI Engine will automatically extract the job title, department, required technical skills, salary band, and domain keywords.
            </p>

            <textarea
              rows={8}
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              placeholder="Paste Job Description text here..."
              className="w-full p-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 glass-button text-xs font-bold text-zinc-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleExtractJd}
                disabled={!rawJdText.trim() || isExtracting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Extract & Add Job Opening</span>
              </button>
            </div>
          </div>
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
