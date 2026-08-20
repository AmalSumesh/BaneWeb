import { API_PREFIX } from "@biotech-arbitrage/config";
import type {
  Alert,
  ClinicalTrial,
  Disease,
  Drug,
  Evidence,
  Hypothesis,
  KnowledgeGraphResponse,
  Note,
  PaginatedResponse,
  Paper,
  Patent,
  Project,
  RepurposingSignal,
  ResearchItem,
  SavedItem,
  SearchResponse,
} from "@biotech-arbitrage/types";

export interface ApiClientConfig {
  baseUrl: string;
  ragUrl?: string;
  fetch?: typeof fetch;
}

export interface SearchParams {
  q: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
}

export interface PipelineStatus {
  status: "idle" | "running" | "completed" | "failed";
  query?: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  outputFiles?: Record<string, string>;
}

export interface PipelineGraph {
  nodes: Array<Record<string, unknown>>;
  edges: Array<Record<string, unknown>>;
}

export interface PipelinePaper {
  paperId: string;
  title: string;
  publicationYear?: string;
  journal?: string;
  doi?: string;
  pmid?: string;
  category: string;
  evidenceSnippet?: string;
}

export interface RepurposingOpportunity {
  drug: string;
  disease: string;
  signal_score: number;
  novelty?: string;
  connection_type?: string;
  mechanistic_chain?: Array<Record<string, unknown>>;
  score_breakdown?: Record<string, number>;
  summary?: string;
}

export interface BioRagRequest {
  drug: string;
  question: string;
  top_k?: number;
}

export interface BioRagEvidenceItem {
  document_id?: string;
  type?: string;
  drug?: string;
  disease?: string;
  conditions?: string | string[];
  title?: string;
  phase?: string;
  status?: string;
  trial_id?: string;
  nct_id?: string;
  vector_score?: number;
  evidence_level?: string;
}

export interface BioRagResponse {
  success: boolean;
  drug: string;
  question: string;
  established_indication?: string;
  retrieved_documents?: number;
  drug_relevant_documents?: number;
  established_documents?: number;
  repurposing_documents?: number;
  evidence: BioRagEvidenceItem[];
  answer: string;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BiotechArbitrageClient {
  private readonly baseUrl: string;
  private readonly ragUrl?: string;
  private readonly fetchFn: typeof fetch;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.ragUrl = config.ragUrl ? config.ragUrl.replace(/\/$/, "") : undefined;
    this.fetchFn = config.fetch ?? fetch.bind(globalThis);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${API_PREFIX}${path}`;
    const response = await this.fetchFn(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new ApiError(response.status, message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  private async requestPipeline<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}/api${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new ApiError(response.status, message || `Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  search(params: SearchParams): Promise<SearchResponse> {
    const query = new URLSearchParams();
    query.set("q", params.q);
    if (params.type) query.set("type", params.type);
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    return this.request<SearchResponse>(`/search?${query.toString()}`);
  }

  getDrug(id: string): Promise<Drug> {
    return this.request<Drug>(`/drugs/${id}`);
  }

  getDisease(id: string): Promise<Disease> {
    return this.request<Disease>(`/diseases/${id}`);
  }

  getSignal(id: string): Promise<RepurposingSignal> {
    return this.request<RepurposingSignal>(`/signals/${id}`);
  }

  getSignals(params?: ListParams): Promise<PaginatedResponse<RepurposingSignal>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<RepurposingSignal>>(`/signals${suffix}`);
  }

  getPaper(id: string): Promise<Paper> {
    return this.request<Paper>(`/papers/${id}`);
  }

  getEvidence(id: string): Promise<Evidence> {
    return this.request<Evidence>(`/evidence/${id}`);
  }

  getTrials(params?: ListParams): Promise<PaginatedResponse<ClinicalTrial>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<ClinicalTrial>>(`/trials${suffix}`);
  }

  getPatents(params?: ListParams): Promise<PaginatedResponse<Patent>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<Patent>>(`/patents${suffix}`);
  }

  getResearch(params?: ListParams): Promise<PaginatedResponse<ResearchItem>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<ResearchItem>>(`/research${suffix}`);
  }

  getProjects(params?: ListParams): Promise<PaginatedResponse<Project>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<Project>>(`/projects${suffix}`);
  }

  createProject(data: Pick<Project, "title" | "description">): Promise<Project> {
    return this.request<Project>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  getProjectNotes(projectId: string): Promise<Note[]> {
    return this.request<Note[]>(`/projects/${projectId}/notes`);
  }

  getHypothesis(projectId: string, hypothesisId: string): Promise<Hypothesis> {
    return this.request<Hypothesis>(`/projects/${projectId}/hypotheses/${hypothesisId}`);
  }

  createProjectNote(projectId: string, content: string): Promise<Note> {
    return this.request<Note>(`/projects/${projectId}/notes`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  getAlerts(params?: ListParams): Promise<PaginatedResponse<Alert>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.pageSize !== undefined) query.set("page_size", String(params.pageSize));
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return this.request<PaginatedResponse<Alert>>(`/alerts${suffix}`);
  }

  getSaved(): Promise<PaginatedResponse<SavedItem>> {
    return this.request<PaginatedResponse<SavedItem>>("/saved");
  }

  saveItem(data: Pick<SavedItem, "entityType" | "entityId">): Promise<SavedItem> {
    return this.request<SavedItem>("/saved", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  deleteSaved(id: string): Promise<void> {
    return this.request<void>(`/saved/${id}`, { method: "DELETE" });
  }

  getKnowledgeGraph(): Promise<KnowledgeGraphResponse> {
    return this.request<KnowledgeGraphResponse>("/graph");
  }

  runPipeline(query: string, maxResults = 50): Promise<PipelineStatus> {
    return this.requestPipeline<PipelineStatus>("/pipeline/run", {
      method: "POST",
      body: JSON.stringify({ query, max_results: maxResults }),
    });
  }

  getPipelineStatus(): Promise<PipelineStatus> {
    return this.requestPipeline<PipelineStatus>("/pipeline/status");
  }

  getPipelineGraph(): Promise<PipelineGraph> {
    return this.requestPipeline<PipelineGraph>("/graph");
  }

  getPipelineEvidence(): Promise<{ evidence: Array<Record<string, unknown>>; total: number }> {
    return this.requestPipeline<{ evidence: Array<Record<string, unknown>>; total: number }>("/evidence");
  }

  getPipelinePapers(category = "all"): Promise<{ papers: PipelinePaper[]; total: number }> {
    return this.requestPipeline<{ papers: PipelinePaper[]; total: number }>(`/papers?category=${encodeURIComponent(category)}`);
  }

  getRepurposingOpportunities(): Promise<{ opportunities: RepurposingOpportunity[]; total: number }> {
    return this.requestPipeline<{ opportunities: RepurposingOpportunity[]; total: number }>("/repurposing/opportunities");
  }

  async queryBioRag(req: BioRagRequest): Promise<BioRagResponse> {
    const candidateUrls = [
      this.ragUrl ? `${this.ragUrl}/api/repurposing` : null,
      "http://localhost:8001/api/repurposing",
      "http://127.0.0.1:8001/api/repurposing",
      `${this.baseUrl}/api/repurposing`,
    ].filter(Boolean) as string[];

    let lastError: Error | null = null;
    for (const url of candidateUrls) {
      try {
        const response = await this.fetchFn(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(req),
        });
        if (response.ok) {
          return (await response.json()) as BioRagResponse;
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }
    throw lastError || new Error("Failed to post to /api/repurposing");
  }
}

export function createApiClient(config: ApiClientConfig): BiotechArbitrageClient {
  return new BiotechArbitrageClient(config);
}

export type { Hypothesis };
