import { Candidate, JobDescription } from '../types';

const COMPANY_NAME = 'TalentForge Workspace';

function formatDataValue(val: any): string {
  if (val === undefined || val === null) return 'N/A';
  if (Array.isArray(val)) return val.join('; ');
  return String(val);
}

function escapeCSV(str: string): string {
  if (!str) return '""';
  const clean = String(str).replace(/"/g, '""');
  return `"${clean}"`;
}

/**
 * Download a CSV file
 */
export function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download an Excel (.xls) formatted document
 */
export function downloadExcel(filename: string, content: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Open a styled HTML print window for PDF saving
 */
export function printPDFReport(title: string, bodyHTML: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #18181b; background: #ffffff; }
          h1 { color: #4f46e5; font-size: 24px; margin-bottom: 4px; }
          h2 { color: #27272a; font-size: 18px; border-bottom: 2px solid #e4e4e7; padding-bottom: 6px; margin-top: 24px; }
          .header { border-bottom: 1px solid #e4e4e7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .company { font-weight: bold; color: #4f46e5; font-size: 14px; }
          .date { color: #71717a; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; background: #e0e7ff; color: #3730a3; margin-right: 6px; }
          .score { font-size: 28px; font-weight: bold; color: #4f46e5; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
          th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e4e4e7; }
          th { background: #f4f4f5; font-weight: 600; color: #3f3f46; }
          .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
          ul { margin: 4px 0 0 20px; padding: 0; }
          li { margin-bottom: 4px; font-size: 13px; line-height: 1.5; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>${title}</h1>
            <div class="company">${COMPANY_NAME}</div>
          </div>
          <div class="date">Generated Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ${bodyHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// ==========================================
// 1. INDIVIDUAL CANDIDATE REPORT EXPORT
// ==========================================
export function exportIndividualCandidateReport(
  candidate: Candidate,
  format: 'pdf' | 'csv' | 'excel',
  activeJd?: JobDescription | null
) {
  const generatedDate = new Date().toLocaleDateString();
  const ats = candidate.atsResult;
  const score = ats?.overallScore ?? 0;
  const summary = ats?.backgroundSummary || candidate.summary || 'Candidate evaluation pending.';
  const strengths = ats?.strengths && ats.strengths.length > 0 ? ats.strengths : ['Strong technical background'];
  const weaknesses = ats?.weaknesses && ats.weaknesses.length > 0 ? ats.weaknesses : ['Areas to probe during technical interview'];
  const missingSkills = ats?.missingSkills && ats.missingSkills.length > 0 ? ats.missingSkills : ['None Identified'];
  const recommendation = ats?.hiringRecommendation || ats?.interviewRecommendation || (score >= 85 ? 'Strongly Recommended for immediate technical interview' : score >= 70 ? 'Recommended for screening' : 'Consider with reservations');

  const jdTitle = activeJd?.title || 'General Evaluation';

  if (format === 'csv' || format === 'excel') {
    const rows = [
      [escapeCSV('COMPANY NAME'), escapeCSV(COMPANY_NAME)],
      [escapeCSV('GENERATED DATE'), escapeCSV(generatedDate)],
      [escapeCSV('TARGET JOB PROFILE'), escapeCSV(jdTitle)],
      [],
      [escapeCSV('CANDIDATE INFORMATION')],
      [escapeCSV('Full Name'), escapeCSV(candidate.name)],
      [escapeCSV('Current Title'), escapeCSV(candidate.title || 'N/A')],
      [escapeCSV('Email'), escapeCSV(candidate.email || 'N/A')],
      [escapeCSV('Phone'), escapeCSV(candidate.phone || 'N/A')],
      [escapeCSV('Location'), escapeCSV(candidate.location || 'N/A')],
      [escapeCSV('Experience (Years)'), escapeCSV(String(candidate.yearsOfExperience || 0))],
      [escapeCSV('Tier Qualification'), escapeCSV(candidate.tier)],
      [],
      [escapeCSV('ATS EVALUATION METRICS')],
      [escapeCSV('Overall Match Score'), escapeCSV(`${score}%`)],
      [escapeCSV('Skill Match Score'), escapeCSV(`${ats?.skillMatchScore ?? score}%`)],
      [escapeCSV('Experience Match Score'), escapeCSV(`${ats?.experienceMatchScore ?? score}%`)],
      [escapeCSV('Education Match Score'), escapeCSV(`${ats?.educationMatchScore ?? score}%`)],
      [],
      [escapeCSV('AI BACKGROUND SUMMARY'), escapeCSV(summary)],
      [],
      [escapeCSV('STRENGTHS'), escapeCSV(strengths.join('; '))],
      [escapeCSV('WEAKNESSES'), escapeCSV(weaknesses.join('; '))],
      [escapeCSV('MISSING SKILLS'), escapeCSV(missingSkills.join('; '))],
      [],
      [escapeCSV('HIRING RECOMMENDATION'), escapeCSV(recommendation)]
    ];

    const filename = `Candidate_Report_${candidate.name.replace(/\s+/g, '_')}_${generatedDate.replace(/\//g, '-')}`;

    if (format === 'csv') {
      downloadCSV(`${filename}.csv`, rows);
    } else {
      let tsv = `COMPANY NAME\t${COMPANY_NAME}\n`;
      tsv += `GENERATED DATE\t${generatedDate}\n`;
      tsv += `TARGET JOB PROFILE\t${jdTitle}\n\n`;
      rows.slice(4).forEach((r) => {
        tsv += r.map((c) => c.replace(/"/g, '')).join('\t') + '\n';
      });
      downloadExcel(`${filename}.xls`, tsv);
    }
    return;
  }

  // PDF Format
  const bodyHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0; border: none; font-size: 22px; color: #18181b;">${candidate.name}</h2>
          <div style="color: #52525b; font-size: 13px; margin-top: 4px;">${candidate.title || 'Candidate'} • ${candidate.location || 'Remote'}</div>
          <div style="color: #71717a; font-size: 12px; margin-top: 4px;">Email: ${candidate.email} | Phone: ${candidate.phone} | Experience: ${candidate.yearsOfExperience || 0} Years</div>
        </div>
        <div style="text-align: right;">
          <div class="score">${score}%</div>
          <div style="font-size: 11px; font-weight: bold; color: #4f46e5;">ATS MATCH SCORE</div>
          <div class="badge" style="margin-top: 6px;">${candidate.tier} Tier</div>
        </div>
      </div>
    </div>

    <h2>Evaluation Context</h2>
    <div style="font-size: 13px; color: #3f3f46;">Target Job Profile: <strong>${jdTitle}</strong></div>

    <h2>AI Background Summary</h2>
    <p style="font-size: 13px; line-height: 1.6; color: #27272a;">${summary}</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
      <div class="card">
        <h3 style="margin-top:0; font-size: 14px; color: #15803d;">Key Strengths</h3>
        <ul>
          ${strengths.map((s) => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      <div class="card">
        <h3 style="margin-top:0; font-size: 14px; color: #b45309;">Areas for Improvement / Weaknesses</h3>
        <ul>
          ${weaknesses.map((w) => `<li>${w}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="card" style="margin-top: 16px;">
      <h3 style="margin-top:0; font-size: 14px; color: #4f46e5;">Missing Skills</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
        ${missingSkills.map((sk) => `<span class="badge" style="background: #fef3c7; color: #92400e;">${sk}</span>`).join('')}
      </div>
    </div>

    <div class="card" style="margin-top: 16px; border-left: 4px solid #4f46e5; background: #eef2ff;">
      <h3 style="margin-top:0; font-size: 14px; color: #3730a3;">AI Hiring & Interview Recommendation</h3>
      <p style="font-size: 13px; margin: 6px 0 0 0; color: #1e1b4b; line-height: 1.5;">${recommendation}</p>
    </div>
  `;

  printPDFReport(`Candidate Evaluation Report - ${candidate.name}`, bodyHTML);
}

// ==========================================
// 2. COMPLETE CANDIDATE LIST EXPORT
// ==========================================
export function exportCandidateListReport(
  candidates: Candidate[],
  format: 'pdf' | 'csv' | 'excel',
  activeJd?: JobDescription | null
) {
  const generatedDate = new Date().toLocaleDateString();

  if (format === 'csv' || format === 'excel') {
    const rows = [
      [escapeCSV('COMPANY NAME'), escapeCSV(COMPANY_NAME)],
      [escapeCSV('GENERATED DATE'), escapeCSV(generatedDate)],
      [escapeCSV('TOTAL CANDIDATES'), escapeCSV(String(candidates.length))],
      [],
      [
        escapeCSV('Candidate Name'),
        escapeCSV('Title'),
        escapeCSV('Email'),
        escapeCSV('Phone'),
        escapeCSV('Experience (Yrs)'),
        escapeCSV('Tier'),
        escapeCSV('ATS Match Score'),
        escapeCSV('AI Summary'),
        escapeCSV('Strengths'),
        escapeCSV('Weaknesses'),
        escapeCSV('Missing Skills'),
        escapeCSV('Recommendation')
      ]
    ];

    candidates.forEach((c) => {
      const score = c.atsResult?.overallScore ?? 0;
      const ats = c.atsResult;
      const summary = ats?.backgroundSummary || c.summary || '';
      const strengths = (ats?.strengths || []).join('; ');
      const weaknesses = (ats?.weaknesses || []).join('; ');
      const missing = (ats?.missingSkills || []).join('; ');
      const rec = ats?.hiringRecommendation || (score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : 'Consider');

      rows.push([
        escapeCSV(c.name),
        escapeCSV(c.title || ''),
        escapeCSV(c.email || ''),
        escapeCSV(c.phone || ''),
        escapeCSV(String(c.yearsOfExperience || 0)),
        escapeCSV(c.tier),
        escapeCSV(`${score}%`),
        escapeCSV(summary),
        escapeCSV(strengths),
        escapeCSV(weaknesses),
        escapeCSV(missing),
        escapeCSV(rec)
      ]);
    });

    const filename = `Candidate_Database_${candidates.length}_Applicants_${generatedDate.replace(/\//g, '-')}`;

    if (format === 'csv') {
      downloadCSV(`${filename}.csv`, rows);
    } else {
      let tsv = `COMPANY NAME\t${COMPANY_NAME}\nGENERATED DATE\t${generatedDate}\nTOTAL CANDIDATES\t${candidates.length}\n\n`;
      rows.slice(4).forEach((r) => {
        tsv += r.map((cell) => cell.replace(/"/g, '')).join('\t') + '\n';
      });
      downloadExcel(`${filename}.xls`, tsv);
    }
    return;
  }

  // PDF
  const tableRows = candidates
    .map((c) => {
      const score = c.atsResult?.overallScore ?? 0;
      const ats = c.atsResult;
      const rec = ats?.hiringRecommendation || (score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : 'Consider');
      return `
      <tr>
        <td><strong>${c.name}</strong><br/><span style="color:#71717a; font-size:11px;">${c.title || 'N/A'}</span></td>
        <td>${c.email}<br/>${c.phone || ''}</td>
        <td>${c.yearsOfExperience || 0} Yrs</td>
        <td><span class="badge">${c.tier}</span></td>
        <td style="font-size:14px; font-weight:bold; color:#4f46e5;">${score}%</td>
        <td style="font-size:11px;">${rec}</td>
      </tr>
    `;
    })
    .join('');

  const bodyHTML = `
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h2 style="margin: 0; border: none; font-size: 18px;">Candidate Database Snapshot</h2>
          <div style="color: #71717a; font-size: 12px; margin-top: 4px;">Total Applicants Evaluated: <strong>${candidates.length}</strong></div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Candidate Info</th>
          <th>Contact</th>
          <th>Exp</th>
          <th>Tier</th>
          <th>ATS Score</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  printPDFReport('Complete Candidate Roster & Evaluation Report', bodyHTML);
}

// ==========================================
// 3. JOB PROFILE ANALYSIS EXPORT
// ==========================================
export function exportJobProfileAnalysisReport(
  jobDescriptions: JobDescription[],
  candidates: Candidate[],
  format: 'pdf' | 'csv' | 'excel'
) {
  const generatedDate = new Date().toLocaleDateString();

  const analyticsData = jobDescriptions.map((jd) => {
    const matchingCandidates = candidates.filter((c) => {
      if (c.atsResult?.jdId) return c.atsResult.jdId === jd.id;
      return true;
    });

    const scores = matchingCandidates.map((c) => c.atsResult?.overallScore ?? 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const topCand = [...matchingCandidates].sort((a, b) => {
      const sa = a.atsResult?.overallScore ?? 0;
      const sb = b.atsResult?.overallScore ?? 0;
      return sb - sa;
    })[0];

    return {
      jd,
      applicantCount: matchingCandidates.length,
      avgScore,
      highestScore,
      lowestScore,
      topCandidateName: topCand ? `${topCand.name} (${topCand.atsResult?.overallScore ?? 0}%)` : 'N/A'
    };
  });

  if (format === 'csv' || format === 'excel') {
    const rows = [
      [escapeCSV('COMPANY NAME'), escapeCSV(COMPANY_NAME)],
      [escapeCSV('GENERATED DATE'), escapeCSV(generatedDate)],
      [escapeCSV('TOTAL JOB PROFILES'), escapeCSV(String(jobDescriptions.length))],
      [],
      [
        escapeCSV('Job Title'),
        escapeCSV('Department'),
        escapeCSV('Experience Required'),
        escapeCSV('Applicants'),
        escapeCSV('Avg Match Score'),
        escapeCSV('Highest Match'),
        escapeCSV('Lowest Match'),
        escapeCSV('Top Candidate'),
        escapeCSV('Required Skills')
      ]
    ];

    analyticsData.forEach((item) => {
      rows.push([
        escapeCSV(item.jd.title),
        escapeCSV(item.jd.department || 'N/A'),
        escapeCSV(item.jd.experienceLevel || 'N/A'),
        escapeCSV(String(item.applicantCount)),
        escapeCSV(`${item.avgScore}%`),
        escapeCSV(`${item.highestScore}%`),
        escapeCSV(`${item.lowestScore}%`),
        escapeCSV(item.topCandidateName),
        escapeCSV((item.jd.requiredSkills || []).join('; '))
      ]);
    });

    const filename = `Job_Profile_Analysis_${generatedDate.replace(/\//g, '-')}`;

    if (format === 'csv') {
      downloadCSV(`${filename}.csv`, rows);
    } else {
      let tsv = `COMPANY NAME\t${COMPANY_NAME}\nGENERATED DATE\t${generatedDate}\nTOTAL JOB PROFILES\t${jobDescriptions.length}\n\n`;
      rows.slice(4).forEach((r) => {
        tsv += r.map((c) => c.replace(/"/g, '')).join('\t') + '\n';
      });
      downloadExcel(`${filename}.xls`, tsv);
    }
    return;
  }

  // PDF
  const cardHTML = analyticsData
    .map(
      (item) => `
    <div class="card" style="margin-bottom: 20px;">
      <h3 style="margin:0; font-size:16px; color:#4f46e5;">${item.jd.title} <span class="badge" style="margin-left: 8px;">${item.jd.department || 'Engineering'}</span></h3>
      <div style="font-size:12px; color:#52525b; margin-top:4px;">Experience Required: ${item.jd.experienceLevel} | Location: ${item.jd.location || 'Remote'}</div>

      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; text-align: center;">
        <div style="background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e4e4e7;">
          <div style="font-size:11px; color:#71717a;">Applicants</div>
          <div style="font-weight:bold; font-size:16px; color:#18181b;">${item.applicantCount}</div>
        </div>
        <div style="background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e4e4e7;">
          <div style="font-size:11px; color:#71717a;">Avg Score</div>
          <div style="font-weight:bold; font-size:16px; color:#4f46e5;">${item.avgScore}%</div>
        </div>
        <div style="background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e4e4e7;">
          <div style="font-size:11px; color:#71717a;">Highest Score</div>
          <div style="font-weight:bold; font-size:16px; color:#16a34a;">${item.highestScore}%</div>
        </div>
        <div style="background:#ffffff; padding:8px; border-radius:6px; border:1px solid #e4e4e7;">
          <div style="font-size:11px; color:#71717a;">Lowest Score</div>
          <div style="font-weight:bold; font-size:16px; color:#d97706;">${item.lowestScore}%</div>
        </div>
      </div>

      <div style="margin-top: 12px; font-size:12px;">
        <strong>Top Candidate:</strong> ${item.topCandidateName}<br/>
        <strong>Required Skills:</strong> ${(item.jd.requiredSkills || []).join(', ')}
      </div>
    </div>
  `
    )
    .join('');

  printPDFReport('Job Profile Competency & Analysis Report', cardHTML);
}

// ==========================================
// 4. RECRUITMENT ANALYTICS EXPORT
// ==========================================
export function exportRecruitmentAnalyticsReport(
  candidates: Candidate[],
  jobDescriptions: JobDescription[],
  format: 'pdf' | 'csv' | 'excel'
) {
  const generatedDate = new Date().toLocaleDateString();

  const totalCandidates = candidates.length;
  const totalJobProfiles = jobDescriptions.length;

  const scores = candidates.map((c) => c.atsResult?.overallScore ?? 0);
  const avgAtsScore = totalCandidates > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalCandidates) : 0;
  const highestScore = totalCandidates > 0 ? Math.max(...scores) : 0;
  const lowestScore = totalCandidates > 0 ? Math.min(...scores) : 0;

  const totalExperience = candidates.reduce((acc, c) => acc + (c.yearsOfExperience || 0), 0);
  const avgExperience = totalCandidates > 0 ? (totalExperience / totalCandidates).toFixed(1) : '0';

  if (format === 'csv' || format === 'excel') {
    const rows = [
      [escapeCSV('COMPANY NAME'), escapeCSV(COMPANY_NAME)],
      [escapeCSV('GENERATED DATE'), escapeCSV(generatedDate)],
      [],
      [escapeCSV('KEY PERFORMANCE INDICATORS')],
      [escapeCSV('Metric'), escapeCSV('Value')],
      [escapeCSV('Total Candidates'), escapeCSV(String(totalCandidates))],
      [escapeCSV('Total Job Profiles'), escapeCSV(String(totalJobProfiles))],
      [escapeCSV('Average ATS Match Score'), escapeCSV(`${avgAtsScore}%`)],
      [escapeCSV('Highest Match Score'), escapeCSV(`${highestScore}%`)],
      [escapeCSV('Lowest Match Score'), escapeCSV(`${lowestScore}%`)],
      [escapeCSV('Average Experience'), escapeCSV(`${avgExperience} Yrs`)],
      [],
      [escapeCSV('APPLICANT MATCHING BREAKDOWN')],
      [
        escapeCSV('Candidate Name'),
        escapeCSV('Title'),
        escapeCSV('Experience (Yrs)'),
        escapeCSV('ATS Match Score'),
        escapeCSV('Recommendation')
      ]
    ];

    candidates.forEach((c) => {
      const score = c.atsResult?.overallScore ?? 0;
      const rec = score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : 'Consider';
      rows.push([
        escapeCSV(c.name),
        escapeCSV(c.title || ''),
        escapeCSV(String(c.yearsOfExperience || 0)),
        escapeCSV(`${score}%`),
        escapeCSV(rec)
      ]);
    });

    const filename = `Recruitment_Analytics_Report_${generatedDate.replace(/\//g, '-')}`;

    if (format === 'csv') {
      downloadCSV(`${filename}.csv`, rows);
    } else {
      let tsv = `COMPANY NAME\t${COMPANY_NAME}\nGENERATED DATE\t${generatedDate}\n\nKEY PERFORMANCE INDICATORS\n`;
      rows.slice(4).forEach((r) => {
        tsv += r.map((c) => c.replace(/"/g, '')).join('\t') + '\n';
      });
      downloadExcel(`${filename}.xls`, tsv);
    }
    return;
  }

  // PDF
  const bodyHTML = `
    <div class="card">
      <h2 style="margin-top:0; font-size:18px;">Executive Key Performance Indicators</h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; text-align: center; margin-top: 12px;">
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Total Candidates</div>
          <div style="font-size: 22px; font-weight: bold; color: #4f46e5;">${totalCandidates}</div>
        </div>
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Job Profiles</div>
          <div style="font-size: 22px; font-weight: bold; color: #7c3aed;">${totalJobProfiles}</div>
        </div>
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Avg ATS Score</div>
          <div style="font-size: 22px; font-weight: bold; color: #16a34a;">${avgAtsScore}%</div>
        </div>
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Highest Match</div>
          <div style="font-size: 22px; font-weight: bold; color: #2563eb;">${highestScore}%</div>
        </div>
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Lowest Match</div>
          <div style="font-size: 22px; font-weight: bold; color: #d97706;">${lowestScore}%</div>
        </div>
        <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e4e4e7;">
          <div style="font-size: 11px; color: #71717a;">Avg Experience</div>
          <div style="font-size: 22px; font-weight: bold; color: #0891b2;">${avgExperience} Yrs</div>
        </div>
      </div>
    </div>

    <h2>Candidate Roster Performance Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Role</th>
          <th>Experience</th>
          <th>ATS Score</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${candidates
          .map((c) => {
            const score = c.atsResult?.overallScore ?? 0;
            const rec = score >= 85 ? 'Highly Recommended' : score >= 70 ? 'Recommended' : 'Consider';
            return `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.title || 'N/A'}</td>
              <td>${c.yearsOfExperience || 0} Yrs</td>
              <td style="font-weight:bold; color:#4f46e5;">${score}%</td>
              <td>${rec}</td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>
  `;

  printPDFReport('Executive Recruitment Analytics Report', bodyHTML);
}
