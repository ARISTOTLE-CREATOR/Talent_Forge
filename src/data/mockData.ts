import { Candidate, JobDescription, UserProfile, NotificationItem } from '../types';

export const initialUserProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  role: '',
  company: '',
  avatarUrl: '',
  apiKeyConfigured: true
};

export const initialJobDescriptions: JobDescription[] = [
  {
    id: 'jd-001',
    title: 'Senior Full Stack & AI Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA (Hybrid)',
    experienceLevel: '5+ Years',
    employmentType: 'Full-time',
    salaryRange: '$160,000 - $210,000',
    summary: 'We are seeking a seasoned Senior Full Stack & AI Engineer to architect high-performance React application frontends and Node.js microservices integrated with LLMs, Vector DBs, and AI APIs.',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'Express', 'Python', 'LLM Integration', 'TailwindCSS', 'PostgreSQL', 'Docker'],
    optionalSkills: ['GraphQL', 'Kubernetes', 'Redis', 'WebSockets', 'Drizzle ORM'],
    responsibilities: [
      'Architect and build real-time web UI dashboard interfaces with modern React and Tailwind CSS.',
      'Design RESTful and streaming API microservices connecting AI models.',
      'Optimize database queries and background asynchronous tasks.',
      'Mentor junior engineers and establish automated CI/CD code quality standards.'
    ],
    educationRequirements: 'Bachelor or Master in Computer Science or equivalent practical experience.',
    domainKeywords: ['ATS', 'RAG', 'Vector Search', 'AI Integration', 'Microservices', 'Clean Code', 'TypeScript'],
    createdAt: '2026-07-15'
  },
  {
    id: 'jd-002',
    title: 'Lead AI / ML Research Scientist',
    department: 'AI Lab',
    location: 'Remote (US/Canada)',
    experienceLevel: '6+ Years',
    employmentType: 'Full-time',
    salaryRange: '$180,000 - $240,000',
    summary: 'Join our AI Research Lab to fine-tune generative models, design retrieval-augmented generation pipelines, and build candidate ranking neural models.',
    requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'LangChain', 'RAG', 'Vector DB', 'NLP'],
    optionalSkills: ['FastAPI', 'MLOps', 'WandB', 'Transformer Architectures', 'C++'],
    responsibilities: [
      'Research and deploy state-of-the-art NLP models for semantic document parsing.',
      'Build evaluation benchmarks for AI scoring precision and prompt calibration.',
      'Collaborate with product engineers to deploy low-latency inference pipelines.'
    ],
    educationRequirements: 'Master or Ph.D. in Computer Science, Machine Learning, or Computational Linguistics.',
    domainKeywords: ['Embedding', 'Cosine Similarity', 'Fine-tuning', 'Transformers', 'Semantic Search'],
    createdAt: '2026-07-18'
  },
  {
    id: 'jd-003',
    title: 'Senior Product Designer (UI/UX)',
    department: 'Design',
    location: 'New York, NY',
    experienceLevel: '4+ Years',
    employmentType: 'Full-time',
    salaryRange: '$140,000 - $185,000',
    summary: 'Craft futuristic dark-mode SaaS interfaces, complex enterprise workflow design, and responsive interactive design systems for recruiter dashboards.',
    requiredSkills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research', 'Micro-interactions'],
    optionalSkills: ['HTML/CSS', 'Framer Motion', 'TailwindCSS', 'Storybook'],
    responsibilities: [
      'Lead end-to-end design from user research and wireframes to pixel-perfect high-fidelity component libraries.',
      'Build scalable design tokens and glassmorphism UI patterns.',
      'Conduct recruiter usability tests and iterate on candidate matching workflows.'
    ],
    educationRequirements: 'Bachelor in HCI, Interaction Design, Visual Arts, or equivalent portfolio experience.',
    domainKeywords: ['Design Tokens', 'Dark Mode', 'Design System', 'Accessibility', 'Figma'],
    createdAt: '2026-07-20'
  }
];

export const initialCandidates: Candidate[] = [];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'TalentForge System Ready',
    message: 'Upload resumes or paste text in the Resume Uploader to screen and analyze candidates.',
    timestamp: 'Just now',
    type: 'info',
    read: false
  }
];

export const initialChatWelcome = `Hello! I am **TalentForge Copilot**. 

I am ready to answer questions strictly regarding your uploaded candidate resumes, candidate names, skills, match scores, experience, and background details.

You can ask me questions such as:
- *"What are [Candidate Name]'s key technical skills and experience?"*
- *"Compare [Candidate 1] and [Candidate 2] based on their resume details."*
- *"Which candidates have experience with specific languages or tools?"*

Upload or select candidates to begin exploring resume details!`;
