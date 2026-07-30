import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, FileText, ArrowRight, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { Candidate, JobDescription, ResumeImprovement } from '../types';

interface ResumeImprovementModalProps {
  candidate: Candidate | null;
  activeJd: JobDescription | null;
  onClose: () => void;
}

export const ResumeImprovementModal: React.FC<ResumeImprovementModalProps> = ({
  candidate,
  activeJd,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvement, setImprovement] = useState<ResumeImprovement>({
    candidateId: candidate?.id || '',
    missingKeywords: activeJd?.requiredSkills.slice(0, 4) || ['Vector DB', 'RAG', 'Microservices', 'Docker'],
    grammarTips: [
      'Use high-impact action verbs at the beginning of achievements (e.g., "Architected", "Engineered", "Optimized").',
      'Quantify performance metrics explicitly (e.g., "Reduced latency by 45% across 10M daily requests").'
    ],
    atsFormattingTips: [
      'Ensure single-column layout without embedded images or tables to optimize standard ATS text parsing.',
      'Explicitly list technology stack tags under each project entry.'
    ],
    certificationSuggestions: [
      'Cloud Professional Machine Learning Engineer',
      'AWS Certified Solutions Architect'
    ],
    portfolioSuggestions: [
      'Add live hosted demo URLs for top projects alongside GitHub repositories.',
      'Include architecture diagrams illustrating microservice connections.'
    ],
    skillRoadmap: [
      'Master streaming AI LLM API integration with Express backend.',
      'Gain production experience with Vector Databases (Pinecone / Milvus).',
      'Build containerized microservices using Docker and Kubernetes.'
    ]
  });

  if (!candidate) return null;

  const handleFetchImprovement = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, jobDescription: activeJd })
      });
      const data = await response.json();
      if (data.success && data.improvements) {
        setImprovement(data.improvements);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="glass-card max-w-3xl w-full rounded-[28px] border border-white/10 p-6 sm:p-8 relative shadow-2xl my-auto max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">AI Resume Optimization & Feedback Roadmap</h3>
              <p className="text-xs text-zinc-400">ATS formatting & skill enhancement guide for {candidate.name}</p>
            </div>
          </div>

          <button
            onClick={handleFetchImprovement}
            disabled={isGenerating}
            className="px-3.5 py-2 glass-button hover:bg-indigo-600 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-400" />}
            <span>Refresh Analysis</span>
          </button>
        </div>

        {/* Missing Keywords Box */}
        <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 space-y-2">
          <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" /> Missing ATS Keyword Tags to Add
          </h4>
          <div className="flex flex-wrap gap-2 pt-1">
            {improvement.missingKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 text-xs font-mono font-bold rounded-lg">
                + {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Formatting & Action Verbs */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> ATS Formatting Tips
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {improvement.atsFormattingTips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Wording & Action Verbs
            </h4>
            <ul className="space-y-1.5 text-xs text-zinc-300">
              {improvement.grammarTips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Learning Roadmap */}
        <div className="glass-card p-5 rounded-2xl border border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" /> Career Growth Skill Roadmap
          </h4>

          <div className="space-y-2">
            {improvement.skillRoadmap.map((item, i) => (
              <div key={i} className="p-3 bg-zinc-900 rounded-xl border border-white/5 flex items-center gap-3 text-xs text-zinc-300">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                  0{i + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
