import { VectorDocument, VectorChunk, NlpEntity, RagCitation, VectorDbStats } from '../types';

// TF-IDF Cosine Similarity Vector Search Engine
export class VectorEngine {
  private static tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  public static chunkDocument(docId: string, docTitle: string, text: string, chunkSize = 350, overlap = 50): VectorChunk[] {
    const words = text.split(/\s+/).filter(Boolean);
    const chunks: VectorChunk[] = [];
    let chunkIdx = 0;

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
      const chunkWords = words.slice(i, i + chunkSize);
      if (chunkWords.length === 0) break;

      const content = chunkWords.join(' ');
      const tokens = this.tokenize(content);
      const uniqueKeywords = Array.from(new Set(tokens)).slice(0, 10);

      chunks.push({
        id: `chunk-${docId}-${chunkIdx}`,
        docId,
        docTitle,
        chunkIndex: chunkIdx + 1,
        content,
        wordCount: chunkWords.length,
        keywords: uniqueKeywords
      });

      chunkIdx++;
      if (i + chunkSize >= words.length) break;
    }

    return chunks;
  }

  public static calculateSimilarity(query: string, content: string): number {
    const queryTokens = this.tokenize(query);
    const contentTokens = this.tokenize(content);

    if (queryTokens.length === 0 || contentTokens.length === 0) return 0;

    const queryFreq: Record<string, number> = {};
    const contentFreq: Record<string, number> = {};

    queryTokens.forEach((t) => (queryFreq[t] = (queryFreq[t] || 0) + 1));
    contentTokens.forEach((t) => (contentFreq[t] = (contentFreq[t] || 0) + 1));

    let dotProduct = 0;
    let queryMag = 0;
    let contentMag = 0;

    Object.keys(queryFreq).forEach((term) => {
      queryMag += queryFreq[term] * queryFreq[term];
      if (contentFreq[term]) {
        dotProduct += queryFreq[term] * contentFreq[term];
      }
    });

    Object.keys(contentFreq).forEach((term) => {
      contentMag += contentFreq[term] * contentFreq[term];
    });

    if (queryMag === 0 || contentMag === 0) return 0;

    const cosineScore = dotProduct / (Math.sqrt(queryMag) * Math.sqrt(contentMag));
    
    // Boost score if exact phrase matches
    const phraseBoost = content.toLowerCase().includes(query.toLowerCase().trim()) ? 0.35 : 0;

    return Math.min(0.99, parseFloat((cosineScore + phraseBoost).toFixed(4)));
  }

  public static extractNlpEntities(text: string): NlpEntity[] {
    const entities: NlpEntity[] = [];
    const lower = text.toLowerCase();

    // Technology entities
    const techStack = ['TypeScript', 'React', 'Node.js', 'Python', 'Docker', 'Kubernetes', 'PostgreSQL', 'AWS', 'RAG', 'Vector Database', 'TailwindCSS', 'Redis', 'OCR', 'NLP'];
    techStack.forEach((tech) => {
      if (lower.includes(tech.toLowerCase())) {
        entities.push({ category: 'Technology', value: tech });
      }
    });

    // Organizations
    const orgs = ['Acme Corp', 'InnovateTech Labs', 'Stanford University', 'AWS', 'TalentForge Workspace', 'Global Corp'];
    orgs.forEach((org) => {
      if (lower.includes(org.toLowerCase())) {
        entities.push({ category: 'Organization', value: org });
      }
    });

    // Monetary / Metrics
    const metricMatches = text.match(/\$[\d,]+|\d+%\s*|\d+\+\s*years/gi);
    if (metricMatches) {
      metricMatches.slice(0, 4).forEach((m) => {
        entities.push({ category: 'Metric', value: m.trim() });
      });
    }

    // Key Concepts
    const concepts = ['ATS Match Scoring', 'Vector Embedding Search', 'OCR Extraction', 'Interview Kit Generation', 'Compliance Policy', 'Salary Benchmark'];
    concepts.forEach((c) => {
      if (lower.includes(c.toLowerCase().split(' ')[0])) {
        entities.push({ category: 'Key Concept', value: c });
      }
    });

    return Array.from(new Set(entities.map((e) => `${e.category}:${e.value}`)))
      .map((str) => {
        const [category, value] = str.split(':');
        return { category: category as any, value };
      })
      .slice(0, 8);
  }
}

// Pre-seeded Initial Vector Store Knowledge Base
export const initialVectorDocuments: VectorDocument[] = [
  {
    id: 'doc-101',
    title: 'Candidate Evaluation Scan - Alexander Vance (PDF OCR)',
    fileName: 'Alexander_Vance_Candidate_Scan.pdf',
    fileType: 'pdf',
    category: 'Candidate Resume & Review',
    uploadedAt: '2026-07-20',
    wordCount: 420,
    ocrConfidence: 99.2,
    extractedType: 'Scanned Portfolio & Interview Assessment',
    rawText: `Alexander Vance - Principal Full Stack & RAG Systems Architect.
Summary: 8+ years of engineering experience delivering enterprise web apps and LLM/RAG microservices.
Technical Expertise: React, TypeScript, Node.js, Express, Python, Vector Databases (Pinecone/Milvus), Docker, Kubernetes, PostgreSQL, AWS Cloud.
Key Achievements: Architected a multi-tenant vector similarity search engine handling 2M+ daily embedding queries with sub-50ms latency.
Interview Scorecard: Overall ATS score 94%. Strong communication, clean architectural patterns, deep knowledge of streaming APIs and TF-IDF / Cosine vector math.
Disadvantages / Areas to note: High salary expectation ($185,000/yr), target start date in 3 weeks.`,
    nlpEntities: [
      { category: 'Role', value: 'Principal Full Stack Architect' },
      { category: 'Technology', value: 'TypeScript' },
      { category: 'Technology', value: 'React' },
      { category: 'Technology', value: 'Vector Database' },
      { category: 'Metric', value: '94%' },
      { category: 'Metric', value: '$185,000' }
    ],
    chunks: []
  },
  {
    id: 'doc-102',
    title: 'Enterprise Technical Hiring & Banding Policy (Scanned Agreement)',
    fileName: 'Hiring_Banding_Policy_2026.png',
    fileType: 'scan_image',
    category: 'HR & Compliance Policy',
    uploadedAt: '2026-07-21',
    wordCount: 380,
    ocrConfidence: 96.8,
    extractedType: 'Optical Scan Policy Document',
    rawText: `Talent Acquisition Policy & Technical Engineering Salary Bands - Fiscal Year 2026.
1. Senior Full Stack Engineer Band: $150,000 - $195,000 base salary + equity options.
2. ATS Match Requirements: Candidates evaluated above 85% match (Gold Tier) automatically qualify for technical architecture interviews.
3. Interview Process:
- Stage 1: Automated AI Resume Screening & Vector Match
- Stage 2: 45-min Live Coding & System Design
- Stage 3: Leadership & Team Culture Alignment
4. Background Check & Verification: All candidates must pass degree verification and criminal background check prior to formal offer issue.`,
    nlpEntities: [
      { category: 'Organization', value: 'IntelliHire Workspace' },
      { category: 'Policy', value: 'Fiscal Year 2026 Policy' },
      { category: 'Metric', value: '$150,000 - $195,000' },
      { category: 'Metric', value: '85%' },
      { category: 'Key Concept', value: 'ATS Match Requirements' }
    ],
    chunks: []
  },
  {
    id: 'doc-103',
    title: 'RAG & Vector Database System Architecture Spec (Docx Scan)',
    fileName: 'RAG_Vector_Architecture_Spec.docx',
    fileType: 'docx',
    category: 'Technical Specifications',
    uploadedAt: '2026-07-22',
    wordCount: 510,
    ocrConfidence: 98.9,
    extractedType: 'Technical Architecture Specification',
    rawText: `Technical Architecture Specification: Unstructured Document Ingestion and RAG Query Engine.
Overview: The system ingests unstructured files (PDFs, PNG/JPG document scans, DOCX) using an OCR engine and Multimodal LLM text parser.
Data Pipeline:
1. Optical Character Recognition (OCR) converts image pixels and document buffers into clean unicode text streams.
2. Natural Language Processing (NLP) extracts entity tags including Organizations, Technologies, Metrics, and Dates.
3. Text Chunking splits unstructured documents into 350-word sliding windows with 50-word overlap.
4. Vector Storage indexes semantic embeddings and enables TF-IDF Cosine Similarity query matching.
5. Grounded RAG Generator retrieves top-K candidate chunks and formulates precise answers backed by explicit source citations.`,
    nlpEntities: [
      { category: 'Technology', value: 'OCR' },
      { category: 'Technology', value: 'NLP' },
      { category: 'Technology', value: 'RAG' },
      { category: 'Technology', value: 'Vector Storage' },
      { category: 'Key Concept', value: 'Cosine Similarity' }
    ],
    chunks: []
  }
];

// Initialize document chunks for default documents
initialVectorDocuments.forEach((doc) => {
  doc.chunks = VectorEngine.chunkDocument(doc.id, doc.title, doc.rawText);
});
