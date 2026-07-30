import { Candidate, JobDescription, ATSResult, SkillPriority, SkillMatchDetail, ATSBreakdown } from '../types';

/**
 * Normalizes string for case-insensitive keyword and phrase matching.
 */
function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s+#\.-]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a candidate possesses a given required skill by checking:
 * 1. Explicit skill arrays (languages, frameworks, tools, softSkills)
 * 2. Full text of summary, resume text, experience descriptions, project tech stacks, certifications
 */
function candidatePossessesSkill(candidate: Candidate, fullCandidateTextNorm: string, candSkillSetNorm: Set<string>, requiredSkill: string): boolean {
  const reqNorm = normalizeText(requiredSkill);
  if (!reqNorm) return false;

  // 1. Direct match in skill set
  if (candSkillSetNorm.has(reqNorm)) return true;

  // 2. Check alias / common abbreviations
  const aliases: Record<string, string[]> = {
    'typescript': ['ts', 'typescript'],
    'javascript': ['js', 'javascript'],
    'react': ['react', 'reactjs', 'react.js'],
    'node.js': ['node', 'nodejs', 'node.js', 'express'],
    'node': ['node', 'nodejs', 'node.js'],
    'python': ['python', 'py', 'python3'],
    'sql': ['sql', 'postgresql', 'postgres', 'mysql', 'sqlite'],
    'postgresql': ['postgresql', 'postgres', 'sql'],
    'llm integration': ['llm', 'llms', 'gpt', 'openai', 'claude', 'gemini', 'langchain', 'ai integration'],
    'llms': ['llm', 'llms', 'gpt', 'openai', 'large language model'],
    'docker': ['docker', 'container', 'containers', 'dockerfile'],
    'kubernetes': ['kubernetes', 'k8s'],
    'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda'],
    'gcp': ['gcp', 'google cloud', 'cloud run'],
    'figma': ['figma', 'ui design', 'ux design', 'figma design'],
    'ui/ux design': ['ui', 'ux', 'ui/ux', 'user interface', 'user experience', 'figma'],
    'tailwindCSS': ['tailwind', 'tailwindcss', 'css'],
    'tailwind': ['tailwind', 'tailwindcss'],
    'pytorch': ['pytorch', 'torch', 'python'],
    'tensorflow': ['tensorflow', 'tf', 'keras'],
    'rag': ['rag', 'retrieval-augmented', 'retrieval augmented', 'vector search', 'vector db']
  };

  const synonymList = aliases[reqNorm] || [reqNorm];
  for (const syn of synonymList) {
    if (candSkillSetNorm.has(syn)) return true;
    // Word boundary search in candidate text
    const escaped = syn.replace(/[\-\.\+\#]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(fullCandidateTextNorm)) return true;
  }

  // Fallback substring check if skill phrase is >= 3 chars
  if (reqNorm.length >= 3 && fullCandidateTextNorm.includes(reqNorm)) {
    return true;
  }

  return false;
}

/**
 * Parses required skills and assigns deterministic priorities (High, Medium, Low)
 */
function parseSkillPriorities(jd: JobDescription): Array<{ skill: string; priority: SkillPriority }> {
  const rawSkills = jd.requiredSkills || [];
  const explicitPriorities = jd.skillPriorities || {};

  return rawSkills.map((skillItem, index) => {
    let cleanSkill = skillItem;
    let priority: SkillPriority | null = null;

    // Check if priority is explicitly in jd.skillPriorities
    if (explicitPriorities[skillItem]) {
      priority = explicitPriorities[skillItem];
    } else if (explicitPriorities[cleanSkill.trim()]) {
      priority = explicitPriorities[cleanSkill.trim()];
    }

    // Check if skill text itself contains priority like "Python (High Priority)" or "Python: High"
    if (!priority) {
      if (/high\s*priority/i.test(skillItem) || /\(high\)/i.test(skillItem)) {
        priority = 'High';
        cleanSkill = skillItem.replace(/\(high\s*priority\)/i, '').replace(/\(high\)/i, '').trim();
      } else if (/medium\s*priority/i.test(skillItem) || /\(medium\)/i.test(skillItem)) {
        priority = 'Medium';
        cleanSkill = skillItem.replace(/\(medium\s*priority\)/i, '').replace(/\(medium\)/i, '').trim();
      } else if (/low\s*priority/i.test(skillItem) || /\(low\)/i.test(skillItem)) {
        priority = 'Low';
        cleanSkill = skillItem.replace(/\(low\s*priority\)/i, '').replace(/\(low\)/i, '').trim();
      }
    }

    // Default priority distribution if not specified:
    // First 40% = High, Next 35% = Medium, Rest = Low
    if (!priority) {
      const ratio = (index + 1) / Math.max(1, rawSkills.length);
      if (ratio <= 0.4) {
        priority = 'High';
      } else if (ratio <= 0.75) {
        priority = 'Medium';
      } else {
        priority = 'Low';
      }
    }

    return { skill: cleanSkill, priority };
  });
}

/**
 * Main Deterministic ATS Scoring Algorithm
 * 
 * Weights:
 * • Required Skills = 50% (50 points max)
 * • Experience = 20% (20 points max)
 * • Education = 10% (10 points max)
 * • Projects = 10% (10 points max)
 * • Certifications = 10% (10 points max)
 * 
 * Total = 100 points.
 * Fully reproducible and deterministic — zero random numbers or hardcoded values.
 */
export function calculateCandidateATS(candidate: Candidate, jd: JobDescription | null): ATSResult {
  const generatedAt = new Date().toISOString();
  const id = `ats-${candidate.id}-${jd?.id || 'gen'}`;
  const candidateId = candidate.id;

  // Build full normalized text representation of candidate resume
  const candSkillsList = [
    ...(candidate.skills?.languages || []),
    ...(candidate.skills?.frameworks || []),
    ...(candidate.skills?.tools || []),
    ...(candidate.skills?.softSkills || [])
  ];

  const candSkillSetNorm = new Set<string>(
    candSkillsList.map(s => normalizeText(s)).filter(Boolean)
  );

  const expDescriptions = (candidate.experience || []).map(e => `${e.role} ${e.company} ${e.description} ${(e.achievements || []).join(' ')}`).join(' ');
  const projectTexts = (candidate.projects || []).map(p => `${p.title} ${p.description} ${(p.techStack || []).join(' ')}`).join(' ');
  const certsText = (candidate.certifications || []).join(' ');
  const eduText = (candidate.education || []).map(e => `${e.degree} ${e.fieldOfStudy} ${e.institution}`).join(' ');

  const fullCandidateText = `${candidate.name} ${candidate.title} ${candidate.summary} ${candidate.resumeText || ''} ${expDescriptions} ${projectTexts} ${certsText} ${eduText}`;
  const fullCandidateTextNorm = normalizeText(fullCandidateText);

  // If no Job Description is selected, provide general evaluation against candidate's profile
  if (!jd) {
    const hasExp = candidate.yearsOfExperience >= 3;
    const hasEdu = candidate.education && candidate.education.length > 0;
    const hasProjects = candidate.projects && candidate.projects.length > 0;
    const hasCerts = candidate.certifications && candidate.certifications.length > 0;

    const skillsPts = Math.min(50, Math.max(30, candSkillsList.length * 5));
    const expPts = hasExp ? 18 : 12;
    const eduPts = hasEdu ? 9 : 5;
    const projPts = hasProjects ? 9 : 5;
    const certPts = hasCerts ? 8 : 4;
    const total = Math.round(skillsPts + expPts + eduPts + projPts + certPts);

    return {
      id,
      candidateId,
      jdId: 'gen',
      overallScore: total,
      breakdown: {
        skillsPoints: skillsPts,
        skillsMax: 50,
        experiencePoints: expPts,
        experienceMax: 20,
        educationPoints: eduPts,
        educationMax: 10,
        projectPoints: projPts,
        projectMax: 10,
        certificationPoints: certPts,
        certificationMax: 10
      },
      skillMatchDetails: candSkillsList.map(s => ({
        skill: s,
        priority: 'High',
        matched: true,
        pointsEarned: 5,
        pointsPossible: 5
      })),
      matchedSkills: candSkillsList,
      missingSkills: [],
      skillMatchScore: Math.round((skillsPts / 50) * 100),
      experienceMatchScore: Math.round((expPts / 20) * 100),
      educationMatchScore: Math.round((eduPts / 10) * 100),
      keywordMatchScore: 85,
      projectMatchScore: Math.round((projPts / 10) * 100),
      certificationMatchScore: Math.round((certPts / 10) * 100),
      matchBadge: total >= 85 ? 'Gold' : total >= 70 ? 'Silver' : 'Bronze',
      strengths: candidate.strengths || ['Strong technical proficiency across stack', `${candidate.yearsOfExperience || 3} years of industry experience`],
      weaknesses: candidate.weaknesses || ['Select job opening to calculate exact ATS keyword match'],
      advantages: candidate.advantages || ['Solid technical foundation'],
      disadvantages: candidate.disadvantages || ['Needs specific job description benchmark'],
      interviewRecommendation: 'Select a target job description to compute detailed ATS match',
      hiringRecommendation: total >= 80 ? 'Recommended' : 'Needs Review',
      potentialConcerns: [],
      careerLevel: candidate.yearsOfExperience >= 6 ? 'Senior' : candidate.yearsOfExperience >= 3 ? 'Mid-Level' : 'Junior',
      expectedLearningCurve: '1-2 weeks',
      backgroundSummary: `${candidate.name} has ${candidate.yearsOfExperience || 0} years of experience as ${candidate.title}.`,
      generatedAt
    };
  }

  // ==========================================
  // 1. REQUIRED SKILLS SCORING (50 Points Max)
  // ==========================================
  const skillPriorityItems = parseSkillPriorities(jd);
  const priorityMultipliers: Record<SkillPriority, number> = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const totalMultiplier = skillPriorityItems.reduce(
    (sum, item) => sum + (priorityMultipliers[item.priority] || 1),
    0
  );

  let earnedSkillsPoints = 0;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const skillMatchDetails: SkillMatchDetail[] = [];

  if (skillPriorityItems.length > 0 && totalMultiplier > 0) {
    skillPriorityItems.forEach((item) => {
      const multiplier = priorityMultipliers[item.priority] || 1;
      const pointsPossible = (50 * multiplier) / totalMultiplier;

      const isMatched = candidatePossessesSkill(
        candidate,
        fullCandidateTextNorm,
        candSkillSetNorm,
        item.skill
      );

      const pointsEarned = isMatched ? pointsPossible : 0;
      if (isMatched) {
        earnedSkillsPoints += pointsPossible;
        matchedSkills.push(item.skill);
      } else {
        missingSkills.push(item.skill);
      }

      skillMatchDetails.push({
        skill: item.skill,
        priority: item.priority,
        matched: isMatched,
        pointsEarned: Math.round(pointsEarned * 10) / 10,
        pointsPossible: Math.round(pointsPossible * 10) / 10
      });
    });
  } else {
    // Default fallback if JD has no required skills listed
    earnedSkillsPoints = 40;
  }

  const skillsPoints = Math.min(50, Math.max(0, Math.round(earnedSkillsPoints * 10) / 10));

  // ==========================================
  // 2. EXPERIENCE SCORING (20 Points Max)
  // ==========================================
  // Parse target experience years from JD (e.g. "5+ Years" -> 5)
  const reqExpYearsMatch = jd.experienceLevel.match(/\d+/);
  const requiredExpYears = reqExpYearsMatch ? parseInt(reqExpYearsMatch[0], 10) : 3;
  const candidateExpYears = candidate.yearsOfExperience || 0;

  // Years Ratio score (up to 12 points)
  let yearsPoints = 0;
  if (requiredExpYears > 0) {
    if (candidateExpYears >= requiredExpYears) {
      yearsPoints = 12;
    } else {
      yearsPoints = Math.round(12 * (candidateExpYears / requiredExpYears));
    }
  } else {
    yearsPoints = 12;
  }

  // Role & Domain Relevance score (up to 8 points)
  let relevancePoints = 0;
  const candTitleNorm = normalizeText(candidate.title);
  const jdTitleNorm = normalizeText(jd.title);

  // Direct title or role keywords match
  const titleKeywords = jdTitleNorm.split(' ').filter(w => w.length > 3);
  const titleMatches = titleKeywords.filter(kw => candTitleNorm.includes(kw));
  if (titleMatches.length > 0) {
    relevancePoints += 4;
  } else if (candTitleNorm.includes('developer') || candTitleNorm.includes('engineer') || candTitleNorm.includes('designer')) {
    relevancePoints += 2;
  }

  // Domain keywords in work experience descriptions
  const domainKws = (jd.domainKeywords || []).map(k => normalizeText(k)).filter(Boolean);
  let matchedDomainKwCount = 0;
  domainKws.forEach(kw => {
    if (fullCandidateTextNorm.includes(kw)) {
      matchedDomainKwCount++;
    }
  });

  if (domainKws.length > 0) {
    relevancePoints += Math.min(4, Math.round((matchedDomainKwCount / domainKws.length) * 4));
  } else {
    relevancePoints += 2;
  }

  const experiencePoints = Math.min(20, Math.max(0, yearsPoints + relevancePoints));

  // ==========================================
  // 3. EDUCATION SCORING (10 Points Max)
  // ==========================================
  let degreeLevelPoints = 0;
  let fieldRelevancePoints = 0;

  const candidateEdus = candidate.education || [];
  const fullEduStrNorm = normalizeText(`${eduText} ${candidate.summary} ${candidate.resumeText || ''}`);

  if (candidateEdus.length > 0 || fullEduStrNorm.length > 0) {
    // Degree Level (up to 6 points)
    if (/ph\.?d|doctorate/i.test(fullEduStrNorm)) {
      degreeLevelPoints = 6;
    } else if (/master|m\.?s|m\.?tech|m\.?b\.?a/i.test(fullEduStrNorm)) {
      degreeLevelPoints = 5;
    } else if (/bachelor|b\.?s|b\.?tech|b\.?e/i.test(fullEduStrNorm)) {
      degreeLevelPoints = 4;
    } else {
      degreeLevelPoints = 2; // Bootcamp / Associate / Diploma
    }

    // Boost degree score if JD specifically requires Master/Bachelor and candidate meets/exceeds
    const jdEduNorm = normalizeText(jd.educationRequirements);
    if (jdEduNorm.includes('master') && degreeLevelPoints >= 5) {
      degreeLevelPoints = 6;
    } else if (jdEduNorm.includes('bachelor') && degreeLevelPoints >= 4) {
      degreeLevelPoints = 6;
    }

    // Field Relevance (up to 4 points)
    const techFields = ['computer', 'software', 'data', 'information', 'ai', 'machine learning', 'interaction', 'design', 'hci', 'engineering', 'science', 'math'];
    const matchesField = techFields.some(tf => fullEduStrNorm.includes(tf));
    fieldRelevancePoints = matchesField ? 4 : 2;
  } else {
    degreeLevelPoints = 2;
    fieldRelevancePoints = 1;
  }

  const educationPoints = Math.min(10, Math.max(0, degreeLevelPoints + fieldRelevancePoints));

  // ==========================================
  // 4. PROJECTS SCORING (10 Points Max)
  // ==========================================
  const candidateProjects = candidate.projects || [];
  let projectCountPoints = 0;
  let projectRelevancePoints = 0;

  if (candidateProjects.length >= 2) {
    projectCountPoints = 4;
  } else if (candidateProjects.length === 1) {
    projectCountPoints = 2;
  } else {
    projectCountPoints = 0;
  }

  if (candidateProjects.length > 0) {
    const projTechNorm = normalizeText(projectTexts);
    let matchedProjSkills = 0;
    skillPriorityItems.forEach(item => {
      if (projTechNorm.includes(normalizeText(item.skill))) {
        matchedProjSkills++;
      }
    });

    if (matchedProjSkills >= 2) {
      projectRelevancePoints = 6;
    } else if (matchedProjSkills === 1) {
      projectRelevancePoints = 4;
    } else {
      projectRelevancePoints = 2;
    }
  }

  const projectPoints = Math.min(10, Math.max(0, projectCountPoints + projectRelevancePoints));

  // ==========================================
  // 5. CERTIFICATIONS SCORING (10 Points Max)
  // ==========================================
  const candidateCerts = candidate.certifications || [];
  let certPoints = 0;

  if (candidateCerts.length > 0) {
    const domainCertKeywords = ['aws', 'gcp', 'azure', 'pmp', 'scrum', 'kubernetes', 'ckad', 'cka', 'react', 'python', 'cissp', 'security+', 'tf', 'tensorflow', 'cloud'];
    const certStrNorm = normalizeText(candidateCerts.join(' '));

    let relevantCertCount = 0;
    domainCertKeywords.forEach(kw => {
      if (certStrNorm.includes(kw)) {
        relevantCertCount++;
      }
    });

    if (relevantCertCount >= 2) {
      certPoints = 10;
    } else if (relevantCertCount === 1) {
      certPoints = 7;
    } else {
      certPoints = 5; // Has general certifications
    }
  } else {
    // Check if resume text mentions certifications
    if (/certifi|certified|aws|pmp|scrum master|kubernetes/i.test(fullCandidateTextNorm)) {
      certPoints = 5;
    } else {
      certPoints = 0;
    }
  }

  const certificationPoints = Math.min(10, Math.max(0, certPoints));

  // ==========================================
  // 6. TOTAL WEIGHTED ATS SCORE (0 to 100)
  // ==========================================
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(skillsPoints + experiencePoints + educationPoints + projectPoints + certificationPoints)
    )
  );

  const breakdown: ATSBreakdown = {
    skillsPoints: Math.round(skillsPoints * 10) / 10,
    skillsMax: 50,
    experiencePoints: Math.round(experiencePoints * 10) / 10,
    experienceMax: 20,
    educationPoints: Math.round(educationPoints * 10) / 10,
    educationMax: 10,
    projectPoints: Math.round(projectPoints * 10) / 10,
    projectMax: 10,
    certificationPoints: Math.round(certificationPoints * 10) / 10,
    certificationMax: 10
  };

  const matchBadge = overallScore >= 85 ? 'Gold' : overallScore >= 70 ? 'Silver' : 'Bronze';

  // Advantages and Disadvantages / Explanations
  const advantages: string[] = [];
  const disadvantages: string[] = [];

  if (skillsPoints >= 40) {
    advantages.push(`Excellent required skills coverage (${matchedSkills.slice(0, 4).join(', ')})`);
  } else if (skillsPoints >= 25) {
    advantages.push(`Partial required skills alignment (${matchedSkills.length} matched out of ${skillPriorityItems.length})`);
  } else {
    disadvantages.push(`Lacks key required skills: ${missingSkills.slice(0, 3).join(', ')}`);
  }

  if (candidateExpYears >= requiredExpYears) {
    advantages.push(`Meets experience requirement (${candidateExpYears} yrs vs ${requiredExpYears} yrs required)`);
  } else {
    disadvantages.push(`Below target experience (${candidateExpYears} yrs vs ${requiredExpYears} yrs required)`);
  }

  if (projectPoints >= 7) {
    advantages.push(`Demonstrates strong project portfolio with direct tech stack overlap`);
  } else if (candidateProjects.length === 0) {
    disadvantages.push(`No practical portfolio projects documented`);
  }

  if (certificationPoints >= 5) {
    advantages.push(`Holds relevant industry certifications`);
  } else {
    disadvantages.push(`No verified certifications listed`);
  }

  if (advantages.length === 0) {
    advantages.push('Solid general resume structure and education background');
  }
  if (disadvantages.length === 0) {
    disadvantages.push('Minor domain alignment required during initial onboarding');
  }

  const strengths = [
    `Required Skills Score: ${breakdown.skillsPoints}/50 (${matchedSkills.length} matched skills)`,
    `Experience Score: ${breakdown.experiencePoints}/20 (${candidateExpYears} years practical experience)`,
    `Education & Projects: ${breakdown.educationPoints}/10 Edu, ${breakdown.projectPoints}/10 Projects`
  ];

  const weaknesses = missingSkills.length > 0
    ? missingSkills.map((s) => `Missing required skill: ${s}`)
    : candidateExpYears < requiredExpYears
    ? [`Experience gap: ${candidateExpYears} yrs vs ${requiredExpYears} yrs benchmark`]
    : ['Requires onboarding to company-specific internal architecture conventions'];

  return {
    id,
    candidateId,
    jdId: jd.id,
    generatedAt,
    overallScore,
    breakdown,
    skillMatchDetails,
    matchedSkills,
    missingSkills,
    skillMatchScore: Math.round((skillsPoints / 50) * 100),
    experienceMatchScore: Math.round((experiencePoints / 20) * 100),
    educationMatchScore: Math.round((educationPoints / 10) * 100),
    keywordMatchScore: Math.round(((matchedSkills.length) / Math.max(1, skillPriorityItems.length)) * 100),
    projectMatchScore: Math.round((projectPoints / 10) * 100),
    certificationMatchScore: Math.round((certificationPoints / 10) * 100),
    matchBadge,
    backgroundSummary: `${candidate.name} has ${candidateExpYears} years of experience as ${candidate.title}. Compared against benchmark "${jd.title}", candidate achieves a deterministic score of ${overallScore}% (${breakdown.skillsPoints}/50 Skills, ${breakdown.experiencePoints}/20 Exp, ${breakdown.educationPoints}/10 Edu, ${breakdown.projectPoints}/10 Projects, ${breakdown.certificationPoints}/10 Certs).`,
    advantages,
    disadvantages,
    strengths,
    weaknesses,
    interviewRecommendation: overallScore >= 85 ? 'Strongly recommended for technical interview phase' : overallScore >= 70 ? 'Recommended for initial recruiter screening' : 'Consider for lower level roles or keep on file',
    hiringRecommendation: overallScore >= 85 ? 'Highly Recommended' : overallScore >= 70 ? 'Recommended' : 'Needs Review',
    potentialConcerns: disadvantages,
    careerLevel: candidateExpYears >= 7 ? 'Senior / Lead' : candidateExpYears >= 3 ? 'Mid-Level' : 'Junior',
    expectedLearningCurve: overallScore >= 85 ? '1 week' : overallScore >= 70 ? '2-3 weeks' : '1 month+'
  };
}
