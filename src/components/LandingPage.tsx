import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Brain,
  BarChart2,
  FileCheck2,
  Users,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

interface LandingPageProps {
  onStartScreening: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScreening }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />

      {/* Floating Resume Preview Cards Graphic */}
      <div className="absolute top-28 left-8 hidden lg:block animate-float pointer-events-none opacity-80">
        <div className="glass-card p-4 rounded-2xl w-56 border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
              AV
            </div>
            <div>
              <div className="text-xs font-bold">Alexander Vance</div>
              <div className="text-[10px] text-zinc-400">Staff AI Engineer</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
            <span className="text-zinc-400">ATS Match Score</span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              96% Gold
            </span>
          </div>
        </div>
      </div>

      <div className="absolute top-44 right-12 hidden lg:block animate-float-delayed pointer-events-none opacity-80">
        <div className="glass-card p-4 rounded-2xl w-60 border border-purple-500/20 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Resume Parser
            </span>
            <span className="text-[10px] text-zinc-400">Instant AI</span>
          </div>
          <p className="text-[11px] text-zinc-300">
            Extracted 18 core technical skills, 6 years experience timeline & Stanford MS degree in 0.8s.
          </p>
        </div>
      </div>

      {/* Hero Header */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Talent<span className="text-indigo-400">Forge</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDemoModal(true)}
            className="text-xs font-semibold text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            Watch Demo
          </button>
          <button
            onClick={onStartScreening}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            Next-Gen AI Recruitment Engine
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none mb-6">
            Hire Smarter with <br />
            <span className="gradient-text-primary">AI-Powered Screening</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Upload resumes, parse candidate data instantly, generate explanatory ATS match scores, rank top talent, and ask conversational AI recruiter questions in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={onStartScreening}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/40 flex items-center justify-center gap-3 transition-all active:scale-95 group"
            >
              <span>Start Screening Candidates</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowDemoModal(true)}
              className="w-full sm:w-auto px-6 py-4 glass-button text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all"
            >
              <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
              <span>Watch 2-Min Demo</span>
            </button>
          </div>
        </motion.div>

        {/* Feature Pill Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
        >
          {[
            { label: 'Resume Parsing', val: '< 1 Second', icon: Zap },
            { label: 'ATS Match Precision', val: '98.4%', icon: FileCheck2 },
            { label: 'AI Talent Insights', val: 'Real-time', icon: Brain },
            { label: 'Recruiter Time Saved', val: '12 hrs/week', icon: BarChart2 },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="glass-card p-5 rounded-2xl text-left border border-white/10 hover:border-indigo-500/40 transition-colors">
                <Icon className="w-5 h-5 text-indigo-400 mb-2" />
                <div className="text-2xl font-extrabold text-white">{stat.val}</div>
                <div className="text-xs text-zinc-400 font-medium mt-0.5">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </section>

      {/* Interactive Platform Preview Graphic */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-card p-3 rounded-[24px] border border-white/10 shadow-2xl shadow-indigo-950/50 relative">
          <div className="bg-zinc-950 rounded-[18px] overflow-hidden border border-white/5 p-6 md:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-zinc-500 ml-2">TalentForge Workspace / Senior Full Stack Engineer</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Live AI Analysis
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-xs font-bold text-zinc-400 mb-1">Rank #1 Top Match</div>
                <div className="text-base font-bold text-white">Alexander Vance</div>
                <div className="text-xs text-zinc-400">Staff AI Engineer</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Overall ATS Score</span>
                  <span className="text-xl font-extrabold text-indigo-400">96%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
                <div className="text-xs font-bold text-zinc-400 mb-1">AI Recommendation</div>
                <div className="text-sm font-semibold text-emerald-400">Strong Hire</div>
                <p className="text-xs text-zinc-400 mt-2">
                  Exceeds full stack TypeScript, React, and Node.js criteria. Built production AI RAG pipelines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex flex-col justify-between">
                <div className="text-xs font-bold text-zinc-400">Candidate Quick Actions</div>
                <div className="space-y-2 mt-2">
                  <button onClick={onStartScreening} className="w-full py-2 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-500 transition-colors">
                    Generate Interview Questions
                  </button>
                  <button onClick={onStartScreening} className="w-full py-2 glass-button rounded-lg text-xs font-bold text-zinc-300">
                    Compare Candidates
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Modal Simulation */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full rounded-2xl overflow-hidden border border-white/10 p-6 relative">
            <button
              onClick={() => setShowDemoModal(false)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-2">TalentForge Platform Walkthrough</h3>
            <p className="text-xs text-zinc-400 mb-6">
              Watch how AI parses resumes, extracts required skills, calculates ATS match scores, and generates candidate interview kits.
            </p>

            <div className="aspect-video bg-zinc-950 rounded-xl border border-white/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mb-4 animate-bounce">
                <Play className="w-8 h-8 fill-indigo-400 ml-1" />
              </div>
              <h4 className="text-lg font-bold text-white">Interactive Demo Mode Ready</h4>
              <p className="text-xs text-zinc-400 max-w-md mt-1">
                You can directly launch the workspace to experience live resume screening and AI recruiter chat.
              </p>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  onStartScreening();
                }}
                className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
              >
                Launch Live App Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
