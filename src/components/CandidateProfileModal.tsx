import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { ConfirmModal } from './ConfirmModal';
import {
  X,
  Award,
  Sparkles,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  MapPin,
  Briefcase,
  GraduationCap,
  FileCode,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Download,
  Star,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Zap,
  Trash2
} from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import { exportIndividualCandidateReport } from '../utils/exportUtils';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface CandidateProfileModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  activeJd: JobDescription | null;
  onOpenImprovement: (candidate: Candidate) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteCandidate?: (id: string) => void;
  onUpdateCandidate?: (candidate: Candidate) => void;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  candidate,
  onClose,
  activeJd,
  onOpenImprovement,
  onToggleFavorite,
  onDeleteCandidate,
  onUpdateCandidate
}) => {
  const [activeTab, setActiveTab] = useState<'match' | 'experience' | 'education' | 'resume' | 'notes'>('match');
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>(candidate?.notes || []);
  const [copiedText, setCopiedText] = useState(false);

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

  useEffect(() => {
    if (candidate) {
      setNotesList(candidate.notes || []);
      const score = candidate.atsResult?.overallScore || 0;
      if (score >= 90) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [candidate]);

  if (!candidate) return null;

  const ats = candidate.atsResult;

  // Radar Chart Data comparing Candidate vs Job Requirements
  const radarData = [
    { subject: 'Skills', candidate: ats?.skillMatchScore || 90, required: 85 },
    { subject: 'Experience', candidate: ats?.experienceMatchScore || 88, required: 80 },
    { subject: 'Education', candidate: ats?.educationMatchScore || 92, required: 75 },
    { subject: 'Keywords', candidate: ats?.keywordMatchScore || 94, required: 85 },
    { subject: 'Projects', candidate: ats?.projectMatchScore || 86, required: 80 }
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteText = `${newNote.trim()} (Added ${new Date().toLocaleDateString()})`;
    const updatedNotes = [...notesList, noteText];
    setNotesList(updatedNotes);
    setNewNote('');
    if (onUpdateCandidate) {
      onUpdateCandidate({ ...candidate, notes: updatedNotes });
    }
  };

  const handleCopyResumeText = () => {
    navigator.clipboard.writeText(candidate.resumeText || candidate.summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full rounded-[28px] border border-white/10 p-6 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Candidate Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xl font-black shadow-lg ring-4 ring-indigo-500/20 shrink-0 uppercase tracking-wider">
              {candidate.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-extrabold text-white">{candidate.name}</h2>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> {candidate.tier} Tier
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-1">{candidate.title} • {candidate.location}</p>

              {/* Social / Contact Badges */}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-zinc-300">
                <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-indigo-400">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" /> {candidate.email}
                </a>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" /> {candidate.phone}
                </span>
                <a href={`https://${candidate.linkedin}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-400">
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
                </a>
                <a href={`https://${candidate.github}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-400">
                  <Github className="w-3.5 h-3.5 text-zinc-400" /> GitHub
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            {/* Export Report Group */}
            <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
              <span className="text-[10px] font-bold text-zinc-400 px-2 flex items-center gap-1">
                <Download className="w-3 h-3 text-indigo-400" /> Export:
              </span>
              <button
                onClick={() => exportIndividualCandidateReport(candidate, 'pdf', activeJd)}
                className="px-2.5 py-1 hover:bg-zinc-800 text-rose-300 rounded-lg text-[11px] font-semibold transition-all border border-rose-500/20"
                title="Export Individual Candidate PDF Report"
              >
                PDF
              </button>
              <button
                onClick={() => exportIndividualCandidateReport(candidate, 'csv', activeJd)}
                className="px-2.5 py-1 hover:bg-zinc-800 text-blue-300 rounded-lg text-[11px] font-semibold transition-all border border-blue-500/20"
                title="Export Individual Candidate CSV Data"
              >
                CSV
              </button>
              <button
                onClick={() => exportIndividualCandidateReport(candidate, 'excel', activeJd)}
                className="px-2.5 py-1 hover:bg-zinc-800 text-emerald-300 rounded-lg text-[11px] font-semibold transition-all border border-emerald-500/20"
                title="Export Individual Candidate Excel Report"
              >
                Excel
              </button>
            </div>

            <button
              onClick={() => onToggleFavorite(candidate.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                candidate.isFavorite ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'glass-button text-zinc-400'
              }`}
              title="Favorite Candidate"
            >
              <Star className="w-4 h-4 fill-current" />
            </button>

            {onDeleteCandidate && (
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: `Delete ${candidate.name}?`,
                    message: `Are you sure you want to delete ${candidate.name}? This will permanently remove them from the candidate database.`,
                    confirmLabel: 'Delete Candidate',
                    variant: 'danger',
                    onConfirm: () => {
                      onDeleteCandidate(candidate.id);
                      onClose();
                    },
                  });
                }}
                className="p-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                title="Delete Candidate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center border-b border-white/10 my-6 gap-2 overflow-x-auto">
          {[
            { id: 'match', label: 'ATS Match Breakdown' },
            { id: 'experience', label: 'Work Experience' },
            { id: 'education', label: 'Education & Projects' },
            { id: 'resume', label: 'Resume Document View' },
            { id: 'notes', label: `Recruiter Notes (${notesList.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-indigo-500 text-white font-bold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ATS MATCH BREAKDOWN */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            {/* Overall ATS Score & Weighted Breakdown Header Card */}
            <div className="glass-card p-6 rounded-[22px] border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-purple-950/30 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-24 h-24 rounded-2xl border-4 border-indigo-500 bg-indigo-950/80 flex flex-col items-center justify-center shadow-xl shadow-indigo-500/30 shrink-0">
                    <span className="text-3xl font-black text-white">{ats?.overallScore || 0}%</span>
                    <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider mt-0.5">{candidate.tier} Match</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Weighted ATS Evaluation</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">Deterministic</span>
                    </div>
                    <h3 className="text-xl font-black text-white mt-0.5">Overall ATS Score: {ats?.overallScore || 0}%</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Benchmark: <span className="text-white font-semibold">{activeJd ? activeJd.title : 'General Profile'}</span>
                    </p>
                    <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Hiring Recommendation: {ats?.hiringRecommendation || 'Needs Review'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950/80 p-4 rounded-xl border border-white/10 text-xs space-y-1 self-stretch md:self-auto flex flex-col justify-center min-w-[200px]">
                  <div className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-wider mb-1">Score Weights</div>
                  <div className="flex justify-between text-zinc-400"><span>• Required Skills</span><span className="font-bold text-white">50% (Max 50 pts)</span></div>
                  <div className="flex justify-between text-zinc-400"><span>• Experience</span><span className="font-bold text-white">20% (Max 20 pts)</span></div>
                  <div className="flex justify-between text-zinc-400"><span>• Education</span><span className="font-bold text-white">10% (Max 10 pts)</span></div>
                  <div className="flex justify-between text-zinc-400"><span>• Projects</span><span className="font-bold text-white">10% (Max 10 pts)</span></div>
                  <div className="flex justify-between text-zinc-400"><span>• Certifications</span><span className="font-bold text-white">10% (Max 10 pts)</span></div>
                </div>
              </div>

              {/* Detailed Point Breakdown Grid */}
              <div>
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Weighted Category Breakdown
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-indigo-500/30 text-center flex flex-col justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold block mb-1">Required Skills</span>
                    <span className="text-xl font-extrabold text-indigo-400">{ats?.breakdown?.skillsPoints ?? 0}/50</span>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${((ats?.breakdown?.skillsPoints || 0) / 50) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-blue-500/30 text-center flex flex-col justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold block mb-1">Experience</span>
                    <span className="text-xl font-extrabold text-blue-400">{ats?.breakdown?.experiencePoints ?? 0}/20</span>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${((ats?.breakdown?.experiencePoints || 0) / 20) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-purple-500/30 text-center flex flex-col justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold block mb-1">Education</span>
                    <span className="text-xl font-extrabold text-purple-400">{ats?.breakdown?.educationPoints ?? 0}/10</span>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${((ats?.breakdown?.educationPoints || 0) / 10) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-emerald-500/30 text-center flex flex-col justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold block mb-1">Projects</span>
                    <span className="text-xl font-extrabold text-emerald-400">{ats?.breakdown?.projectPoints ?? 0}/10</span>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${((ats?.breakdown?.projectPoints || 0) / 10) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/90 p-3.5 rounded-xl border border-amber-500/30 text-center col-span-2 sm:col-span-1 flex flex-col justify-between">
                    <span className="text-[11px] text-zinc-400 font-bold block mb-1">Certifications</span>
                    <span className="text-xl font-extrabold text-amber-400">{ats?.breakdown?.certificationPoints ?? 0}/10</span>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${((ats?.breakdown?.certificationPoints || 0) / 10) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skill Importance & Points Evaluation */}
            {ats?.skillMatchDetails && ats.skillMatchDetails.length > 0 && (
              <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Award className="w-4 h-4 text-indigo-400" /> Job Description Required Skills & Importance
                  </h4>
                  <span className="text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                    Skills Score: {ats.breakdown.skillsPoints}/50 pts
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {ats.skillMatchDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        item.matched
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {item.matched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                        )}
                        <div className="truncate">
                          <span className="text-xs font-bold block truncate">{item.skill}</span>
                          <span className={`text-[10px] font-semibold uppercase ${
                            item.priority === 'High' ? 'text-amber-400' : item.priority === 'Medium' ? 'text-indigo-300' : 'text-zinc-400'
                          }`}>
                            {item.priority} Priority
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <span className={`text-xs font-extrabold ${item.matched ? 'text-emerald-400' : 'text-red-400'}`}>
                          {item.pointsEarned}/{item.pointsPossible} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched vs Missing Skills List */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Matched Skills */}
              <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Possessed / Matched Skills ({ats?.matchedSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(ats?.matchedSkills && ats.matchedSkills.length > 0) ? (
                    ats.matchedSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-lg border border-emerald-500/30 flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-400" /> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No direct required skill matches identified</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2 uppercase tracking-wider">
                  <XCircle className="w-4 h-4 text-rose-400" /> Missing Required Skills ({ats?.missingSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(ats?.missingSkills && ats.missingSkills.length > 0) ? (
                    ats.missingSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3 h-3 text-rose-400" /> {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Candidate possesses ALL required skills!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Overall Background Summary */}
            <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Overall Candidate Background Analysis
              </h4>
              <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                {candidate.backgroundSummary || candidate.atsResult?.backgroundSummary || candidate.summary}
              </p>
            </div>

            {/* Pros vs Cons: Advantages (Why Eligible) vs Disadvantages (Why Not Eligible) */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Advantages */}
              <div className="glass-card p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advantages (Why Eligible)
                </h4>
                <ul className="space-y-2 text-xs text-zinc-200">
                  {(candidate.advantages || candidate.atsResult?.advantages || candidate.atsResult?.strengths || ['Exceeds core requirement criteria']).map((adv, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disadvantages */}
              <div className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Disadvantages & Gaps (Why Not Eligible)
                </h4>
                <ul className="space-y-2 text-xs text-zinc-200">
                  {(candidate.disadvantages || candidate.atsResult?.disadvantages || candidate.atsResult?.weaknesses || ['None identified']).map((dis, i) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                      <XCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Strengths and Weaknesses Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths Card */}
              <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-purple-950/20 space-y-4 shadow-lg shadow-indigo-950/30">
                <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" /> Key Strengths Analysis
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    {(candidate.strengths || candidate.atsResult?.strengths || ['High Technical Aptitude']).length} Factors Identified
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(candidate.strengths || candidate.atsResult?.strengths || ['Demonstrates strong technical capability and software engineering fundamentals']).map((str, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-indigo-500/10 hover:bg-indigo-500/15 p-3 rounded-xl border border-indigo-500/20 transition-all">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-100 font-medium leading-relaxed">{str}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses Card */}
              <div className="glass-card p-5 rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/30 to-zinc-950/20 space-y-4 shadow-lg shadow-rose-950/30">
                <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4 text-rose-400" /> Weaknesses & Growth Areas
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    {(candidate.weaknesses || candidate.atsResult?.weaknesses || ['Skill Expansion Point']).length} Focus Areas
                  </span>
                </div>

                <div className="space-y-2.5">
                  {(candidate.weaknesses || candidate.atsResult?.weaknesses || ['Specific domain tool depth can be expanded during onboarding']).map((wk, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-rose-500/10 hover:bg-rose-500/15 p-3 rounded-xl border border-rose-500/20 transition-all">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-zinc-100 font-medium leading-relaxed">{wk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORK EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Verified Work History Timeline
            </h4>

            <div className="space-y-4">
              {candidate.experience.map((exp) => (
                <div key={exp.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-white">{exp.role}</h5>
                      <p className="text-xs text-indigo-400 font-semibold">{exp.company} • {exp.location}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[11px] font-mono">
                      {exp.duration}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 mt-2">{exp.description}</p>

                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Key Achievements</span>
                      <ul className="mt-1 space-y-1 text-xs text-zinc-400">
                        {exp.achievements.map((ach, i) => (
                          <li key={i}>• {ach}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EDUCATION & PROJECTS */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-purple-400" /> Academic Degree & Education
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {candidate.education.map((edu) => (
                  <div key={edu.id} className="glass-card p-4 rounded-xl border border-white/10">
                    <h5 className="text-xs font-bold text-white">{edu.degree} in {edu.fieldOfStudy}</h5>
                    <p className="text-xs text-purple-300 font-medium">{edu.institution}</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Graduated {edu.gradYear} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
                <FileCode className="w-4 h-4 text-emerald-400" /> Featured Projects
              </h4>

              <div className="space-y-3">
                {candidate.projects.map((proj) => (
                  <div key={proj.id} className="glass-card p-4 rounded-xl border border-white/10">
                    <h5 className="text-xs font-bold text-white">{proj.title}</h5>
                    <p className="text-xs text-zinc-400 mt-1">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {proj.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESUME DOCUMENT VIEW */}
        {activeTab === 'resume' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Original Resume File: {candidate.resumeFileName || 'Candidate_Resume.pdf'}
              </span>

              <button
                onClick={handleCopyResumeText}
                className="px-3 py-1.5 glass-button text-xs font-semibold text-zinc-300 rounded-lg flex items-center gap-1.5"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied Text' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-6 bg-zinc-950 rounded-2xl border border-white/10 font-mono text-xs text-zinc-300 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap select-text">
              {candidate.resumeText || candidate.summary}
            </div>
          </div>
        )}

        {/* TAB 5: RECRUITER NOTES */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="flex gap-3">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add recruiter feedback or interview note..."
                className="flex-1 h-10 px-4 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-2">
              {notesList.map((note, i) => (
                <div key={i} className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-xs text-zinc-300">
                  {note}
                </div>
              ))}
              {notesList.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-6">No notes added yet for this candidate.</p>
              )}
            </div>
          </div>
        )}
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
