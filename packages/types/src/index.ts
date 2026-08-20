export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  description?: string;
  mechanismOfAction?: string;
  targets?: string[];
  pathways?: string[];
  approvedIndications?: string[];
  structureImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Disease {
  id: string;
  name: string;
  description?: string;
  icdCode?: string;
  symptoms?: string[];
  associatedTargets?: string[];
  associatedPathways?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Symptom {
  id: string;
  name: string;
  description?: string;
  severity?: "mild" | "moderate" | "severe";
  associatedDiseases?: string[];
  createdAt: string;
}

export interface Target {
  id: string;
  name: string;
  geneSymbol?: string;
  description?: string;
  pathways?: string[];
  createdAt: string;
}

export interface Pathway {
  id: string;
  name: string;
  description?: string;
  targets?: string[];
  diseases?: string[];
  createdAt: string;
}

export type PaperType = "journal" | "preprint" | "review" | "meta-analysis";

export interface Paper {
  id: string;
  title: string;
  abstract?: string;
  authors: string[];
  journal?: string;
  publishedAt: string;
  doi?: string;
  pmid?: string;
  type: PaperType;
  url?: string;
  keywords?: string[];
  createdAt: string;
}

export type EvidenceType =
  | "preclinical"
  | "clinical"
  | "computational"
  | "observational"
  | "review";

export type EvidenceDirection = "supporting" | "contradicting" | "neutral";

export interface Evidence {
  id: string;
  title: string;
  summary: string;
  type: EvidenceType;
  direction: EvidenceDirection;
  sourceType: "paper" | "trial" | "patent" | "database";
  sourceId?: string;
  confidence?: number;
  createdAt: string;
}

export type TrialPhase = "preclinical" | "phase-1" | "phase-2" | "phase-3" | "phase-4";
export type TrialStatus =
  | "recruiting"
  | "active"
  | "completed"
  | "terminated"
  | "withdrawn"
  | "unknown";

export interface ClinicalTrial {
  id: string;
  title: string;
  nctId?: string;
  phase: TrialPhase;
  status: TrialStatus;
  drugId?: string;
  diseaseId?: string;
  sponsor?: string;
  startDate?: string;
  completionDate?: string;
  summary?: string;
  createdAt: string;
}

export type PatentStatus = "pending" | "granted" | "expired" | "abandoned";

export interface Patent {
  id: string;
  title: string;
  patentNumber?: string;
  assignee?: string;
  inventors?: string[];
  filedAt?: string;
  grantedAt?: string;
  status: PatentStatus;
  abstract?: string;
  relatedDrugIds?: string[];
  relatedDiseaseIds?: string[];
  createdAt: string;
}

export interface ScoreBreakdownItem {
  factor: string;
  score: number;
  weight: number;
  rationale?: string;
}

export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  suggestedStudies?: string[];
  createdAt: string;
}

export interface RepurposingSignal {
  id: string;
  drugId: string;
  diseaseId: string;
  drug?: Drug;
  disease?: Disease;
  overallScore: number;
  scoreBreakdown: ScoreBreakdownItem[];
  evidence: Evidence[];
  mechanisms?: string[];
  researchGap?: ResearchGap;
  explanation: string;
  contradictoryEvidence?: Evidence[];
  clinicalEvidence?: Evidence[];
  novelty?: number;
  recency?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "archived" | "completed";

export interface Project {
  id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  signalIds?: string[];
  hypothesisIds?: string[];
  noteIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type HypothesisStatus = "draft" | "active" | "validated" | "rejected";

export interface Hypothesis {
  id: string;
  projectId?: string;
  title: string;
  statement: string;
  status: HypothesisStatus;
  signalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  projectId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertType = "new_evidence" | "new_trial" | "new_paper" | "signal_update";
export type AlertSeverity = "info" | "notable" | "urgent";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityType?: "drug" | "disease" | "signal" | "project";
  entityId?: string;
  read: boolean;
  createdAt: string;
}

export type SearchResultType =
  | "drug"
  | "disease"
  | "symptom"
  | "signal"
  | "paper"
  | "trial"
  | "patent";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  score?: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SavedItem {
  id: string;
  entityType: SearchResultType;
  entityId: string;
  createdAt: string;
}

export interface ResearchItem {
  id: string;
  title: string;
  summary: string;
  type: "paper" | "preprint" | "trial" | "patent";
  publishedAt: string;
  relevanceScore?: number;
}

export type GraphNodeType =
  | "drug"
  | "disease"
  | "target"
  | "pathway"
  | "paper"
  | "trial"
  | "patent";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  sublabel?: string;
  x?: number;
  y?: number;
  properties?: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  evidenceCount?: number;
}

export interface KnowledgeGraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
