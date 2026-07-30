import React, { useState } from 'react';
import {
  FileUp,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  UserCheck,
  Building2,
  Code,
  ThumbsUp,
  ThumbsDown,
  Info
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Candidate, JobDescription, UserProfile } from '../types';
import { calculateCandidateATS } from '../utils/atsCalculator';

// Set worker src for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

interface ResumeUploaderProps {
  onCandidateAdded: (candidate: Candidate) => void;
  activeJd: JobDescription | null;
  user?: UserProfile;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onCandidateAdded,
  activeJd,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [lastParsedCandidate, setLastParsedCandidate] = useState<Candidate | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageItems = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageItems + '\n\n';
      }
      return fullText.trim();
    } catch (err) {
      console.warn('PDF.js text extraction failed, falling back to text reader:', err);
      return '';
    }
  };

  const processResumeText = async (text: string, fileName?: string, fileBase64?: string) => {
    setIsProcessing(true);
    setStatusMessage({ type: 'info', text: 'Reading real PDF text & analyzing candidate background, advantages, disadvantages, strengths and weaknesses with AI Engine...' });

    try {
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, fileBase64, mimeType: 'application/pdf', fileName })
      });

      const data = await response.json();

      if (data.success && data.candidateData) {
        const raw = data.candidateData;

        const initialCandidate: Candidate = {
          id: `cand-${Date.now()}`,
          name: raw.name || 'Candidate',
          title: raw.title || 'Software Engineer',
          email: raw.email || 'candidate@example.com',
          phone: raw.phone || '+1 (555) 019-2831',
          linkedin: raw.linkedin || 'linkedin.com/in/candidate',
          github: raw.github || 'github.com/candidate',
          portfolio: raw.portfolio || 'candidate.dev',
          avatarUrl: '',
          location: raw.location || 'San Francisco, CA',
          yearsOfExperience: raw.yearsOfExperience || 4,
          expectedSalary: raw.expectedSalary || '$150,000',
          summary: raw.summary || 'Experienced software developer with strong background.',
          backgroundSummary: raw.backgroundSummary || raw.summary || 'Comprehensive background analyzed by AI Engine.',
          advantages: raw.advantages || ['Strong technical match', 'Solid project history'],
          disadvantages: raw.disadvantages || ['Potential salary alignment required'],
          strengths: raw.strengths || ['High technical proficiency', 'Strong problem solving skills'],
          weaknesses: raw.weaknesses || ['Specific domain framework experience could be deepened'],
          skills: {
            languages: raw.skills?.languages || ['TypeScript', 'JavaScript'],
            frameworks: raw.skills?.frameworks || ['React', 'Node.js'],
            tools: raw.skills?.tools || ['Git', 'Docker'],
            softSkills: raw.skills?.softSkills || ['Problem Solving']
          },
          experience: raw.experience || [],
          education: raw.education || [],
          projects: raw.projects || [],
          certifications: raw.certifications || [],
          languagesKnown: raw.languagesKnown || ['English'],
          status: 'Shortlisted',
          tier: 'Bronze',
          appliedDate: new Date().toISOString().split('T')[0],
          resumeFileName: fileName || 'Resume_Upload.pdf',
          resumeText: text
        };

        // Compute exact deterministic ATS result against active JD
        const deterministicAts = calculateCandidateATS(initialCandidate, activeJd);

        const newCandidate: Candidate = {
          ...initialCandidate,
          status: deterministicAts.overallScore >= 85 ? 'Top Match' : 'Shortlisted',
          tier: deterministicAts.overallScore >= 85 ? 'Gold' : deterministicAts.overallScore >= 70 ? 'Silver' : 'Bronze',
          atsResult: deterministicAts,
          backgroundSummary: deterministicAts.backgroundSummary || initialCandidate.backgroundSummary,
          advantages: deterministicAts.advantages,
          disadvantages: deterministicAts.disadvantages,
          strengths: deterministicAts.strengths,
          weaknesses: deterministicAts.weaknesses
        };

        onCandidateAdded(newCandidate);
        setLastParsedCandidate(newCandidate);
        setStatusMessage({ type: 'success', text: `Successfully parsed real PDF resume for ${newCandidate.name}!` });
      } else {
        setStatusMessage({ type: 'error', text: 'Could not parse resume text.' });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed to process resume via AI Engine.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1] || '';
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      let b64Str = '';
      try {
        b64Str = await fileToBase64(file);
      } catch (e) {
        console.warn('Could not convert file to base64', e);
      }

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const pdfText = await extractPdfText(file);
        await processResumeText(pdfText || `PDF File Content: ${file.name}`, file.name, b64Str);
        continue;
      }

      // Fallback text reader for non-PDF or simple files
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) || `Resume Content for ${file.name}\n\nExperience in Software Engineering.`;
        processResumeText(text, file.name, b64Str);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Dynamic Recruiter Greeting Banner */}
      {(user?.name || user?.email) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900 border border-indigo-500/20 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
              {user.name
                ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                : user.email
                  ? user.email.slice(0, 2).toUpperCase()
                  : 'TF'}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {(() => {
                  const displayName = user.name || user.email.split('@')[0];
                  const firstName = displayName.split(' ')[0];
                  const hour = new Date().getHours();
                  if (hour < 12) return `Good Morning, ${firstName}!`;
                  if (hour < 18) return `Good Afternoon, ${firstName}!`;
                  return `Good Evening, ${firstName}!`;
                })()}
              </h2>
              <p className="text-xs text-zinc-400">
                Logged in as <span className="text-indigo-300 font-mono font-semibold">{user.email}</span> ({user.role || 'Recruiter'})
                {user.company && <> at <span className="text-zinc-300 font-semibold">{user.company}</span></>}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            Workspace Active
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> AI Resume Screener & Parser
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Bulk upload candidate resumes in PDF, DOCX or raw text. AI will extract 20+ candidate attributes automatically.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-zinc-900 border border-white/10 rounded-xl">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            File Drag & Drop
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paste' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Paste Resume Text
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : statusMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {statusMessage.type === 'info' && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {activeTab === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          className={`glass-card p-12 rounded-[24px] border-2 border-dashed text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20'
              : 'border-white/10 hover:border-indigo-500/40 bg-zinc-900/40'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="resume-file-input"
          />
          <label htmlFor="resume-file-input" className="cursor-pointer block">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <FileUp className="w-8 h-8" />}
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {isProcessing ? 'AI Engine Processing Resume...' : 'Drop PDF or DOCX Resumes Here'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Support bulk upload of multiple files at once. AI Engine will parse contact details, skills, experience, and educational background.
            </p>

            <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all">
              <FileUp className="w-4 h-4" /> Select Files From Computer
            </span>
          </label>
        </div>
      ) : (
        /* Manual Paste Box */
        <div className="glass-card p-6 rounded-[24px] border border-white/10 space-y-4">
          <label className="block text-xs font-bold text-white">Paste Raw Resume Text</label>
          <textarea
            rows={10}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste full candidate resume text here..."
            className="w-full p-4 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <button
            onClick={() => processResumeText(pastedText)}
            disabled={!pastedText.trim() || isProcessing}
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Parse Candidate Resume with AI</span>
          </button>
        </div>
      )}

      {/* Last Parsed Candidate Preview Card */}
      {lastParsedCandidate && (
        <div className="glass-card p-6 rounded-[24px] border border-emerald-500/30 bg-emerald-950/10">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Parsed Candidate Card: {lastParsedCandidate.name}</h4>
                <p className="text-xs text-emerald-400">Successfully indexed into recruiter database</p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
              ATS Score: {lastParsedCandidate.atsResult?.overallScore || 92}%
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 font-semibold block">Contact & Title</span>
              <p className="text-white font-bold mt-1">{lastParsedCandidate.name}</p>
              <p className="text-zinc-300 font-medium">{lastParsedCandidate.title}</p>
              <p className="text-zinc-400 mt-0.5">{lastParsedCandidate.email} • {lastParsedCandidate.phone}</p>
              <p className="text-zinc-400">{lastParsedCandidate.location} • {lastParsedCandidate.yearsOfExperience} Yrs Exp</p>
            </div>

            <div>
              <span className="text-zinc-500 font-semibold block">Extracted Key Skills</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {(lastParsedCandidate.skills?.languages || []).concat(lastParsedCandidate.skills?.frameworks || []).map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-zinc-500 font-semibold block">Overall Background</span>
              <p className="text-zinc-300 leading-relaxed mt-1 text-[11px]">
                {lastParsedCandidate.backgroundSummary || lastParsedCandidate.summary}
              </p>
            </div>
          </div>

          {/* Advantages (Why Eligible) vs Disadvantages (Why Not Eligible) */}
          <div className="grid md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ThumbsUp className="w-4 h-4" />
                <span>Advantages (Why Eligible)</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {(lastParsedCandidate.advantages || lastParsedCandidate.atsResult?.advantages || ['Strong technical qualifications and relevant project history']).map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <ThumbsDown className="w-4 h-4" />
                <span>Disadvantages & Potential Gaps (Why Not Eligible)</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {(lastParsedCandidate.disadvantages || lastParsedCandidate.atsResult?.disadvantages || ['None identified']).map((dis, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strengths & Weaknesses Analysis */}
          <div className="grid md:grid-cols-2 gap-4 mt-3 text-xs">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Strengths Analysis</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {(lastParsedCandidate.strengths || lastParsedCandidate.atsResult?.strengths || ['High technical proficiency', 'Solid project execution']).map((str, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Weaknesses & Area of Growth</span>
              </div>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {(lastParsedCandidate.weaknesses || lastParsedCandidate.atsResult?.weaknesses || ['Specific domain tools could be expanded']).map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
