export type CandidateStatus = 'Top Match' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Needs Review' | 'Rejected';
export type CandidateTier = 'Gold' | 'Silver' | 'Bronze' | 'Unranked';
export type SkillPriority = 'High' | 'Medium' | 'Low';

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  duration: string;
  location?: string;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  gradYear: string;
  gpa?: string;
}

export interface CandidateProject {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface CandidateSkills {
  languages: string[];
  frameworks: string[];
  tools: string[];
  softSkills: string[];
}

export interface SkillMatchDetail {
  skill: string;
  priority: SkillPriority;
  matched: boolean;
  pointsEarned: number;
  pointsPossible: number;
}

export interface ATSBreakdown {
  skillsPoints: number;        // out of 50
  skillsMax: number;           // 50
  experiencePoints: number;    // out of 20
  experienceMax: number;       // 20
  educationPoints: number;     // out of 10
  educationMax: number;        // 10
  projectPoints: number;       // out of 10
  projectMax: number;          // 10
  certificationPoints: number; // out of 10
  certificationMax: number;    // 10
}

export interface ATSResult {
  id: string;
  candidateId: string;
  jdId: string;
  overallScore: number;         // 0 to 100
  breakdown: ATSBreakdown;      // 50/20/10/10/10 exact breakdown
  skillMatchDetails: SkillMatchDetail[];
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchScore: number;      // percentage for skills (0-100)
  experienceMatchScore: number; // percentage for experience (0-100)
  educationMatchScore: number;  // percentage for education (0-100)
  keywordMatchScore: number;
  projectMatchScore: number;    // percentage for projects (0-100)
  certificationMatchScore: number; // percentage for certifications (0-100)
  matchBadge: CandidateTier | 'Needs Review' | 'Rejected';
  strengths: string[];
  weaknesses: string[];
  advantages: string[];
  disadvantages: string[];
  interviewRecommendation: string;
  hiringRecommendation: string;
  potentialConcerns: string[];
  careerLevel: string;
  expectedLearningCurve: string;
  backgroundSummary?: string;
  generatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  avatarUrl?: string;
  location: string;
  yearsOfExperience: number;
  expectedSalary: string;
  summary: string;
  skills: CandidateSkills;
  experience: WorkExperience[];
  education: Education[];
  projects: CandidateProject[];
  certifications: string[];
  languagesKnown: string[];
  status: CandidateStatus;
  tier: CandidateTier;
  atsResult?: ATSResult;
  notes?: string[];
  isFavorite?: boolean;
  resumeText?: string;
  appliedDate: string;
  resumeFileName?: string;
  backgroundSummary?: string;
  advantages?: string[];
  disadvantages?: string[];
  strengths?: string[];
  weaknesses?: string[];
}

export interface JobDescription {
  id: string;
  title: string;
  department: string;
  location: string;
  experienceLevel: string;
  employmentType: string;
  salaryRange: string;
  summary: string;
  requiredSkills: string[];
  skillPriorities?: Record<string, SkillPriority>;
  optionalSkills: string[];
  responsibilities: string[];
  educationRequirements: string;
  domainKeywords: string[];
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'Technical' | 'Behavioral' | 'HR' | 'Coding' | 'Scenario';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  answerGuide: string;
  rationale: string;
}

export interface ResumeImprovement {
  candidateId: string;
  missingKeywords: string[];
  grammarTips: string[];
  atsFormattingTips: string[];
  certificationSuggestions: string[];
  portfolioSuggestions: string[];
  skillRoadmap: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  candidateIds?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  company: string;
  avatarUrl: string;
  apiKeyConfigured?: boolean;
}

export interface FilterState {
  search: string;
  minScore: number;
  minExp: number;
  maxSalary: number;
  skills: string[];
  status: string;
  tier: string;
  location: string;
  degree: string;
}

export interface VectorChunk {
  id: string;
  docId: string;
  docTitle: string;
  chunkIndex: number;
  content: string;
  wordCount: number;
  similarityScore?: number;
  keywords: string[];
}

export interface NlpEntity {
  category: 'Organization' | 'Technology' | 'Metric' | 'Date' | 'Role' | 'Policy' | 'Key Concept';
  value: string;
}

export interface VectorDocument {
  id: string;
  title: string;
  fileName?: string;
  fileType: 'pdf' | 'scan_image' | 'docx' | 'txt' | 'note';
  category: string;
  uploadedAt: string;
  wordCount: number;
  ocrConfidence: number; // e.g. 98.5%
  extractedType: string;
  rawText: string;
  nlpEntities: NlpEntity[];
  chunks: VectorChunk[];
  thumbnailUrl?: string;
}

export interface RagCitation {
  docId: string;
  docTitle: string;
  chunkIndex: number;
  similarityScore: number;
  snippet: string;
}

export interface RagChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  retrievedChunks?: VectorChunk[];
  citations?: RagCitation[];
  confidenceScore?: number;
}

export interface VectorDbStats {
  totalDocuments: number;
  totalChunks: number;
  totalTokensIndexed: number;
  avgOcrAccuracy: number;
  vectorDimensions: number;
}
