# 🚀 TalentForge – AI Resume Screening & Candidate Matching Platform

TalentForge is an AI-powered recruitment platform that automates resume screening, candidate evaluation, and interview preparation using Google's Gemini AI. It helps recruiters significantly reduce manual effort by extracting structured information from resumes, matching candidates against job requirements, identifying skill gaps, and generating unbiased interview questions.

Unlike traditional ATS systems that rely on keyword matching, TalentForge combines Large Language Models (LLMs), structured candidate analysis, and fairness auditing to provide more intelligent hiring recommendations.

---

# ✨ Key Features

## 📄 Intelligent Resume Parsing

Upload resumes in PDF format and automatically extract:

- Candidate Name
- Email Address
- Phone Number
- LinkedIn Profile
- Portfolio Links
- Professional Summary
- Technical Skills
- Soft Skills
- Years of Experience
- Employment History
- Education Details
- Certifications
- Quantifiable Achievements

The extracted information is converted into structured JSON for further processing.

---

## 🤖 AI-Powered Candidate Analysis

The application uses Google's Gemini AI to understand resume content instead of relying on simple keyword searches.

It analyzes:

- Technical expertise
- Career progression
- Skill proficiency
- Professional achievements
- Project experience
- Leadership experience
- Domain knowledge

This provides much richer candidate insights than traditional ATS software.

---

## 🎯 ATS Candidate Matching

Recruiters can create a Job Description by specifying:

- Required Skills
- Preferred Skills
- Minimum Experience
- Job Role

The system compares every candidate against the job requirements and calculates:

- Overall Match Score
- Skills Match
- Education Match
- Professional Impact Score

Candidates are ranked automatically from highest to lowest compatibility.

---

## 📊 AI Candidate Ranking

TalentForge generates a detailed evaluation report including:

- Overall Compatibility Score
- Matching Skills
- Missing Skills
- Candidate Strengths
- Areas for Improvement
- Recommendation Summary

This enables recruiters to identify the strongest candidates within seconds.

---

## ⚖️ Bias Mitigation Engine

To encourage fair hiring practices, the platform performs bias-aware candidate evaluation.

Sensitive attributes are ignored during scoring, including:

- Candidate Name
- Gender Indicators
- Address
- School Prestige
- Employment Gaps

A fairness audit report is generated to improve transparency in hiring decisions.

---

## 💬 Natural Language Candidate Search

Recruiters can search candidates using plain English.

Example queries:

- Show React Developers
- Find candidates with Python and AWS
- Who has 5+ years of experience?
- Best frontend developer
- Candidates experienced in Machine Learning

Gemini AI understands recruiter intent and returns relevant candidates.

---

## ❓ AI Interview Question Generator

Based on:

- Candidate Resume
- Missing Skills
- Job Description

TalentForge automatically generates personalized interview questions with:

- Technical Questions
- Behavioral Questions
- Problem Solving Questions
- Purpose of Each Question

Helping interviewers conduct more structured interviews.

---

## 📈 Recruitment Dashboard

The dashboard provides recruiters with:

- Total Candidates
- Average ATS Score
- Skill Distribution
- Candidate Rankings
- Hiring Recommendations
- AI Insights

---

# 🧠 AI Technologies Used

- Google Gemini API
- Structured JSON Response Schema
- Prompt Engineering
- Resume Information Extraction
- Candidate Similarity Analysis
- AI Scoring Engine
- Bias Mitigation Logic

---

# 🏗 Architecture

```
Resume Upload
      │
      ▼
Resume Parser
      │
      ▼
Gemini AI
      │
      ▼
Structured Candidate Data
      │
      ▼
ATS Scoring Engine
      │
      ▼
Bias Audit
      │
      ▼
Interview Question Generator
      │
      ▼
Recruiter Dashboard
```

---

# 🛠 Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Node.js
- Express.js

### AI

- Google Gemini API
- Google AI Studio

### Libraries

- @google/genai
- Express
- Vite

---

# 📁 Project Structure

```
TalentForge/

├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   └── App.tsx
│
├── server/
│   ├── api/
│   ├── parser/
│   ├── scoring/
│   └── index.ts
│
├── public/
│
├── package.json
├── vite.config.ts
└── README.md
```

---

# 🚀 Future Improvements

- Multi-Resume Upload
- Resume Database
- Firebase Authentication
- Recruiter Login
- Candidate Portal
- Email Notifications
- Resume Version History
- Advanced Analytics Dashboard
- OCR Support for Scanned Resumes
- Multi-language Resume Parsing
- OpenAI & Claude Model Support
- Cloud Storage Integration
- Team Collaboration Features

---

# 💡 Why I Built This

Hiring teams often spend hours manually reviewing resumes, comparing candidates, and preparing interview questions. TalentForge was created to automate these repetitive tasks using AI while promoting fair and unbiased candidate evaluation.

The goal is to demonstrate how Large Language Models can streamline recruitment workflows by combining resume understanding, ATS scoring, bias mitigation, and intelligent recruiter assistance in a single platform.
