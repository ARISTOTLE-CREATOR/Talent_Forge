import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  ArrowUpRight,
  Star,
  Target
} from 'lucide-react';
import { Candidate, JobDescription, UserProfile } from '../types';
import { exportRecruitmentAnalyticsReport } from '../utils/exportUtils';

interface AnalyticsDashboardProps {
  candidates: Candidate[];
  jobDescriptions: JobDescription[];
  user?: UserProfile;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  candidates = [],
  jobDescriptions = [],
  user
}) => {
  const [activeJdFilter, setActiveJdFilter] = useState<string>('all');
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const safeCandidates = candidates || [];
  const safeJds = jobDescriptions || [];

  const totalCandidates = safeCandidates.length;
  const totalJobProfiles = safeJds.length;

  // Extract match scores
  const scores = safeCandidates.map(
    (c) => c?.atsResult?.overallScore ?? c?.matchScore ?? 0
  );

  const avgAtsScore =
    totalCandidates > 0
      ? Math.round(scores.reduce((acc, s) => acc + s, 0) / totalCandidates)
      : 0;

  const highestScore = totalCandidates > 0 ? Math.max(...scores) : 0;
  const lowestScore = totalCandidates > 0 ? Math.min(...scores) : 0;

  // Calculate average experience
  const totalExperience = safeCandidates.reduce(
    (acc, c) => acc + (c?.yearsOfExperience || 0),
    0
  );
  const avgExperience =
    totalCandidates > 0
      ? (totalExperience / totalCandidates).toFixed(1)
      : '0';

  // --- KPI CARDS DATA ---
  const kpiCards = [
    {
      id: 'total-candidates',
      title: 'Total Candidates',
      value: totalCandidates.toString(),
      description: 'Total resumes parsed and stored in database',
      icon: Users,
      color: 'from-indigo-500/20 to-indigo-600/5',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20'
    },
    {
      id: 'total-jds',
      title: 'Total Job Profiles',
      value: totalJobProfiles.toString(),
      description: 'Active job profiles available for candidate matching',
      icon: Briefcase,
      color: 'from-purple-500/20 to-purple-600/5',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20'
    },
    {
      id: 'avg-ats-score',
      title: 'Average ATS Match Score',
      value: totalCandidates > 0 ? `${avgAtsScore}%` : 'N/A',
      description: 'Mean compatibility score across all applicants',
      icon: Award,
      color: 'from-emerald-500/20 to-emerald-600/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'highest-score',
      title: 'Highest Match Score',
      value: totalCandidates > 0 ? `${highestScore}%` : 'N/A',
      description: 'Top candidate qualification match score',
      icon: TrendingUp,
      color: 'from-blue-500/20 to-blue-600/5',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'lowest-score',
      title: 'Lowest Match Score',
      value: totalCandidates > 0 ? `${lowestScore}%` : 'N/A',
      description: 'Minimum candidate compatibility score recorded',
      icon: TrendingDown,
      color: 'from-amber-500/20 to-amber-600/5',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/20'
    },
    {
      id: 'avg-experience',
      title: 'Average Experience',
      value: totalCandidates > 0 ? `${avgExperience} Yrs` : 'N/A',
      description: 'Average years of relevant work experience per candidate',
      icon: Clock,
      color: 'from-cyan-500/20 to-cyan-600/5',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/20'
    }
  ];

  // --- JOB PROFILE ANALYTICS COMPUTATION ---
  const jobProfileAnalytics = safeJds.map((jd) => {
    // Filter candidates matching or relevant to this JD (or overall pool evaluated)
    const matchingCandidates = safeCandidates.filter((c) => {
      if (c.atsResult?.jdId) {
        return c.atsResult.jdId === jd.id;
      }
      return true; // if not specific, include in pool comparison
    });

    const jdScores = matchingCandidates.map(
      (c) => c.atsResult?.overallScore ?? c.matchScore ?? 0
    );

    const jdAvgScore =
      jdScores.length > 0
        ? Math.round(jdScores.reduce((a, b) => a + b, 0) / jdScores.length)
        : 0;

    const jdHighestScore = jdScores.length > 0 ? Math.max(...jdScores) : 0;
    const jdLowestScore = jdScores.length > 0 ? Math.min(...jdScores) : 0;

    // Top matching candidate
    const sortedCandidates = [...matchingCandidates].sort((a, b) => {
      const scoreA = a.atsResult?.overallScore ?? a.matchScore ?? 0;
      const scoreB = b.atsResult?.overallScore ?? b.matchScore ?? 0;
      return scoreB - scoreA;
    });

    const topCandidate = sortedCandidates[0] || null;

    // Requested skills from JD
    const requestedSkills = jd.requiredSkills || [];

    // Missing skills aggregated from candidate ATS results or required skills comparison
    const missingSkillsMap: Record<string, number> = {};
    matchingCandidates.forEach((c) => {
      const missing = c.atsResult?.missingSkills || [];
      if (missing.length > 0) {
        missing.forEach((sk) => {
          missingSkillsMap[sk] = (missingSkillsMap[sk] || 0) + 1;
        });
      } else {
        // Fallback: compare candidate skills against required skills
        const candSkills = [
          ...(c.skills?.languages || []),
          ...(c.skills?.frameworks || []),
          ...(c.skills?.tools || [])
        ].map((s) => s.toLowerCase());

        requestedSkills.forEach((reqSk) => {
          if (!candSkills.includes(reqSk.toLowerCase())) {
            missingSkillsMap[reqSk] = (missingSkillsMap[reqSk] || 0) + 1;
          }
        });
      }
    });

    const mostMissingSkills = Object.entries(missingSkillsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([sk]) => sk);

    return {
      jd,
      applicantCount: matchingCandidates.length,
      avgMatchScore: jdAvgScore,
      highestMatch: jdHighestScore,
      lowestMatch: jdLowestScore,
      topCandidate,
      requestedSkills: requestedSkills.slice(0, 5),
      mostMissingSkills: mostMissingSkills.length > 0 ? mostMissingSkills : ['None Identified']
    };
  });

  // --- AI INSIGHTS COMPUTATION ---
  // 1. Most in-demand skills across JDs and Candidates
  const allJdSkills: Record<string, number> = {};
  safeJds.forEach((j) => {
    (j.requiredSkills || []).forEach((sk) => {
      allJdSkills[sk] = (allJdSkills[sk] || 0) + 1;
    });
  });
  safeCandidates.forEach((c) => {
    [
      ...(c.skills?.languages || []),
      ...(c.skills?.frameworks || []),
      ...(c.skills?.tools || [])
    ].forEach((sk) => {
      allJdSkills[sk] = (allJdSkills[sk] || 0) + 1;
    });
  });

  const topInDemandSkills = Object.entries(allJdSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  // 2. Skills missing in most candidates
  const globalMissingSkills: Record<string, number> = {};
  safeCandidates.forEach((c) => {
    (c.atsResult?.missingSkills || []).forEach((sk) => {
      globalMissingSkills[sk] = (globalMissingSkills[sk] || 0) + 1;
    });
  });
  const topMissingSkillsList = Object.entries(globalMissingSkills)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill]) => skill);

  // 3. Strongest & Weakest candidates
  const candidatesByScore = [...safeCandidates].sort((a, b) => {
    const scoreA = a.atsResult?.overallScore ?? a.matchScore ?? 0;
    const scoreB = b.atsResult?.overallScore ?? b.matchScore ?? 0;
    return scoreB - scoreA;
  });

  const strongestCandidates = candidatesByScore.slice(0, 3);
  const weakestCandidates = [...candidatesByScore].reverse().slice(0, 2);

  // 4. Hiring Recommendations
  const generateHiringRecommendations = () => {
    const recs: string[] = [];
    if (totalCandidates === 0) {
      recs.push('Upload resumes to generate AI recruitment insights and candidate matching benchmarks.');
      return recs;
    }

    if (avgAtsScore >= 80) {
      recs.push('High candidate quality detected across the pool. Prioritize interviewing top Gold tier applicants immediately.');
    } else if (avgAtsScore >= 65) {
      recs.push('Moderate overall candidate alignment. Consider technical screening assessments for Silver tier candidates.');
    } else {
      recs.push('Current candidate pool exhibits significant skill gaps compared to job requirements. Consider expanding candidate search channels or updating JD criteria.');
    }

    if (topMissingSkillsList.length > 0) {
      recs.push(`Key skill gaps identified in "${topMissingSkillsList.slice(0, 2).join(', ')}". Suggest targeted pre-interview technical questions.`);
    }

    if (strongestCandidates.length > 0) {
      const topName = strongestCandidates[0].name;
      const topScore = strongestCandidates[0].atsResult?.overallScore ?? strongestCandidates[0].matchScore ?? 0;
      recs.push(`Top recommended candidate is ${topName} with an overall ATS match score of ${topScore}%.`);
    }

    return recs;
  };

  const hiringRecommendations = generateHiringRecommendations();

  // --- EXPORT FUNCTIONS ---
  const triggerNotification = (msg: string) => {
    setExportNotification(msg);
    setTimeout(() => setExportNotification(null), 3500);
  };

  const exportCSV = () => {
    exportRecruitmentAnalyticsReport(safeCandidates, safeJds, 'csv');
    triggerNotification('Exported CSV Analytics Report successfully');
  };

  const exportExcel = () => {
    exportRecruitmentAnalyticsReport(safeCandidates, safeJds, 'excel');
    triggerNotification('Exported Excel Report successfully');
  };

  const exportPDF = () => {
    exportRecruitmentAnalyticsReport(safeCandidates, safeJds, 'pdf');
    triggerNotification('Exported PDF Analytics Report successfully');
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-2xl border border-indigo-400/30 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{exportNotification}</span>
        </div>
      )}

      {/* Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Recruitment Analytics
            {user?.name && (
              <span className="text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Prepared for {user.name}
              </span>
            )}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time applicant key performance indicators automatically synchronized with your Candidate Database and AI Matching Engine.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 px-3 py-2 rounded-xl border border-white/10 mr-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="hidden sm:inline">Live Synced:</span>
            <strong className="text-white">{totalCandidates} Candidates</strong>
          </div>

          <button
            onClick={exportPDF}
            className="px-3.5 py-2 glass-button hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-white/10"
            title="Export PDF Report"
          >
            <Printer className="w-3.5 h-3.5 text-rose-400" />
            <span>PDF</span>
          </button>

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 glass-button hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-white/10"
            title="Export CSV Data"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportExcel}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            title="Export Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              className={`glass-card p-6 rounded-[22px] border ${card.borderColor} bg-gradient-to-br ${card.color} transition-all hover:scale-[1.01] shadow-lg flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl bg-zinc-950/60 border border-white/10 ${card.iconColor}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* JOB PROFILE ANALYTICS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-400" /> Job Profile Analytics
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Performance, applicant volume, and skill gap metrics per uploaded Job Description
            </p>
          </div>

          <span className="text-xs font-semibold text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-lg border border-white/10">
            {jobProfileAnalytics.length} Job Profile{jobProfileAnalytics.length === 1 ? '' : 's'}
          </span>
        </div>

        {jobProfileAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {jobProfileAnalytics.map((jp, idx) => (
              <div
                key={jp.jd.id || idx}
                className="glass-card p-6 rounded-[24px] border border-white/10 space-y-5 bg-zinc-900/40 hover:border-white/20 transition-all"
              >
                {/* JD Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      {jp.jd.title}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {jp.jd.department || 'Engineering'}
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      {jp.jd.location || 'Remote'} • Experience: <strong className="text-zinc-200">{jp.jd.experienceLevel || 'Mid-Senior'}</strong> • Salary: <strong className="text-zinc-200">{jp.jd.salaryRange || 'Competitive'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                      {jp.applicantCount} Applicants
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                      Avg Score: {jp.avgMatchScore}%
                    </span>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 space-y-1">
                    <span className="text-zinc-400 text-[11px]">Highest Match</span>
                    <div className="text-lg font-bold text-emerald-400">{jp.highestMatch}%</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 space-y-1">
                    <span className="text-zinc-400 text-[11px]">Lowest Match</span>
                    <div className="text-lg font-bold text-amber-400">{jp.lowestMatch}%</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 space-y-1 col-span-2 sm:col-span-2">
                    <span className="text-zinc-400 text-[11px]">Top Matching Candidate</span>
                    <div className="font-bold text-white truncate">
                      {jp.topCandidate ? (
                        <span className="flex items-center gap-1.5 text-indigo-300">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          {jp.topCandidate.name} ({jp.topCandidate.atsResult?.overallScore ?? jp.topCandidate.matchScore ?? 0}%)
                        </span>
                      ) : (
                        <span className="text-zinc-500 font-normal">No candidate matched yet</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Required vs Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  {/* Requested Skills */}
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5 text-[11px]">
                      <Target className="w-3.5 h-3.5 text-indigo-400" /> Most Requested Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jp.requestedSkills.length > 0 ? (
                        jp.requestedSkills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold"
                          >
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-500 italic">No specific skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2">
                    <span className="font-bold text-zinc-300 flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Common Missing Skills in Applicants
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {jp.mostMissingSkills.map((sk, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 rounded-[24px] border border-white/10 text-center space-y-2">
            <Briefcase className="w-8 h-8 text-zinc-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Job Profiles Uploaded</h4>
            <p className="text-xs text-zinc-400">
              Upload job descriptions in the "Job Profiles & JDs" module to view dedicated job profile analytics.
            </p>
          </div>
        )}
      </div>

      {/* AI INSIGHTS SECTION */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> AI Talent Insights
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated intelligence synthesized across your candidate pipeline and job profiles
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: In-Demand Skills vs Common Gaps */}
          <div className="glass-card p-6 rounded-[24px] border border-indigo-500/20 bg-gradient-to-br from-indigo-900/10 to-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Skill Pool Analysis
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                AI Synthesis
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 font-semibold block mb-1.5 text-[11px]">🔥 Most In-Demand Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {topInDemandSkills.length > 0 ? (
                    topInDemandSkills.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-200 font-medium border border-indigo-500/30">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">Upload candidates/JDs to compute</span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-zinc-400 font-semibold block mb-1.5 text-[11px]">⚠️ Skills Missing in Most Candidates</span>
                <div className="flex flex-wrap gap-1.5">
                  {topMissingSkillsList.length > 0 ? (
                    topMissingSkillsList.map((sk, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-200 font-medium border border-amber-500/30">
                        {sk}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No significant missing skills recorded</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Candidate Quality Spectrum */}
          <div className="glass-card p-6 rounded-[24px] border border-emerald-500/20 bg-gradient-to-br from-emerald-900/10 to-zinc-950 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Candidate Spectrum
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Ranking
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 font-semibold block mb-1 text-[11px]">🌟 Top Performing Candidates</span>
                {strongestCandidates.length > 0 ? (
                  <div className="space-y-1.5">
                    {strongestCandidates.map((c) => {
                      const score = c.atsResult?.overallScore ?? c.matchScore ?? 0;
                      return (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-white/5">
                          <span className="font-semibold text-white truncate max-w-[180px]">{c.name}</span>
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[10px]">
                            {score}% Match
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-zinc-500 italic">No candidates evaluated</span>
                )}
              </div>

              {weakestCandidates.length > 0 && totalCandidates > 2 && (
                <div className="pt-2 border-t border-white/5">
                  <span className="text-zinc-400 font-semibold block mb-1 text-[11px]">📉 Candidates Needing Review / Skills Gap</span>
                  <div className="space-y-1.5">
                    {weakestCandidates.map((c) => {
                      const score = c.atsResult?.overallScore ?? c.matchScore ?? 0;
                      return (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80 border border-white/5">
                          <span className="font-semibold text-zinc-300 truncate max-w-[180px]">{c.name}</span>
                          <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px]">
                            {score}% Match
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Strategic Recruitment Recommendations (Full width) */}
          <div className="glass-card p-6 rounded-[24px] border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-zinc-950 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Strategic Recruitment Recommendations
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Actionable Next Steps
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {hiringRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-zinc-200">
                  <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Performance Overview Table */}
      <div className="glass-card p-6 rounded-[24px] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" /> Candidate Matching Performance Overview
          </h3>
          <span className="text-xs text-zinc-400">
            {totalCandidates} candidate{totalCandidates === 1 ? '' : 's'} recorded
          </span>
        </div>

        {totalCandidates > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Title / Role</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">ATS Match Score</th>
                  <th className="py-3 px-4">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                {safeCandidates.map((c) => {
                  const score = c?.atsResult?.overallScore ?? c?.matchScore ?? 0;
                  return (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white">{c.name}</td>
                      <td className="py-3 px-4 text-zinc-400">{c.title || 'N/A'}</td>
                      <td className="py-3 px-4 text-zinc-400">{c.yearsOfExperience || 0} Yrs</td>
                      <td className="py-3 px-4 font-bold text-indigo-400">{score}%</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          score >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : score >= 70
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : 'Consider'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500 text-xs">
            No candidates present in database. Upload resumes to populate analytics metrics.
          </div>
        )}
      </div>
    </div>
  );
};


