import React from 'react';
import { X, Sparkles, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { Candidate, JobDescription } from '../types';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface CandidateCompareModalProps {
  candidates: Candidate[];
  onClose: () => void;
  activeJd: JobDescription | null;
}

export const CandidateCompareModal: React.FC<CandidateCompareModalProps> = ({
  candidates,
  onClose,
  activeJd
}) => {
  if (candidates.length < 2) return null;

  const c1 = candidates[0];
  const c2 = candidates[1];

  const c1Score = c1.atsResult?.overallScore || 90;
  const c2Score = c2.atsResult?.overallScore || 85;

  const winner = c1Score >= c2Score ? c1 : c2;

  const compareData = [
    { subject: 'Skills', c1: c1.atsResult?.skillMatchScore || 92, c2: c2.atsResult?.skillMatchScore || 88 },
    { subject: 'Experience', c1: c1.atsResult?.experienceMatchScore || 90, c2: c2.atsResult?.experienceMatchScore || 85 },
    { subject: 'Education', c1: c1.atsResult?.educationMatchScore || 94, c2: c2.atsResult?.educationMatchScore || 90 },
    { subject: 'Keywords', c1: c1.atsResult?.keywordMatchScore || 95, c2: c2.atsResult?.keywordMatchScore || 89 },
    { subject: 'Projects', c1: c1.atsResult?.projectMatchScore || 91, c2: c2.atsResult?.projectMatchScore || 87 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="glass-card max-w-4xl w-full rounded-[28px] border border-white/10 p-6 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Side-by-Side Candidate Comparison</h3>
            <p className="text-xs text-zinc-400">Comparing candidate skill alignment against active job opening "{activeJd?.title}"</p>
          </div>
        </div>

        {/* Winner Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-950/40 to-purple-950/20 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Recommended Winner</span>
              <h4 className="text-sm font-bold text-white">{winner.name} ({winner.atsResult?.overallScore}% Overall Score)</h4>
            </div>
          </div>

          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-extrabold rounded-full border border-amber-500/30">
            Gold Match Recommendation
          </span>
        </div>

        {/* Side-by-Side Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {[c1, c2].map((cand, idx) => (
            <div key={cand.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xs font-black shadow-md shrink-0 uppercase">
                  {cand.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                  <p className="text-xs text-zinc-400">{cand.title}</p>
                </div>
              </div>

              <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold">Overall ATS Score</span>
                  <span className="text-lg font-extrabold text-indigo-400">{cand.atsResult?.overallScore ?? 0}%</span>
                </div>

                {/* Score Breakdown Table */}
                <div className="pt-2 border-t border-white/5 text-[10px] space-y-1">
                  <div className="flex justify-between text-zinc-400"><span>Required Skills (50%):</span><span className="font-bold text-indigo-300">{cand.atsResult?.breakdown?.skillsPoints ?? 0}/50 pts</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Experience (20%):</span><span className="font-bold text-blue-300">{cand.atsResult?.breakdown?.experiencePoints ?? 0}/20 pts</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Education (10%):</span><span className="font-bold text-purple-300">{cand.atsResult?.breakdown?.educationPoints ?? 0}/10 pts</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Projects (10%):</span><span className="font-bold text-emerald-300">{cand.atsResult?.breakdown?.projectPoints ?? 0}/10 pts</span></div>
                  <div className="flex justify-between text-zinc-400"><span>Certifications (10%):</span><span className="font-bold text-amber-300">{cand.atsResult?.breakdown?.certificationPoints ?? 0}/10 pts</span></div>
                </div>
              </div>

              {/* Overall Background Summary */}
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Overall Background</span>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-white/5">
                  {cand.backgroundSummary || cand.summary}
                </p>
              </div>

              {/* Advantages vs Disadvantages */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/20 rounded-xl">
                  <span className="text-emerald-400 font-bold block text-[10px] uppercase mb-1">Advantages (Why Eligible)</span>
                  <p className="text-zinc-300 text-[11px]">{cand.advantages?.[0] || 'Strong candidate alignment'}</p>
                </div>

                <div className="p-2.5 bg-amber-950/20 border border-amber-500/20 rounded-xl">
                  <span className="text-amber-400 font-bold block text-[10px] uppercase mb-1">Disadvantages (Why Not Eligible)</span>
                  <p className="text-zinc-300 text-[11px]">{cand.disadvantages?.[0] || 'Potential salary/location alignment'}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">Key Tech Skills</span>
                <div className="flex flex-wrap gap-1">
                  {(cand.skills?.languages || []).concat(cand.skills?.frameworks || []).slice(0, 6).map((sk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-300 font-mono">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">Experience</span>
                <p className="text-xs text-zinc-300">{cand.yearsOfExperience} Years Relevant Background</p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Radar Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2">
            Skill Overlay Radar Chart ({c1.name} vs {c2.name})
          </span>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={compareData}>
                <PolarGrid stroke="#3F3F46" />
                <PolarAngleAxis dataKey="subject" stroke="#A1A1AA" fontSize={10} />
                <PolarRadiusAxis stroke="#71717A" fontSize={9} />
                <Radar name={c1.name} dataKey="c1" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.5} />
                <Radar name={c2.name} dataKey="c2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
