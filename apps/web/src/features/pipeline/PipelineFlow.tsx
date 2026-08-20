import { useEffect, useState } from "react";
import { ApiError, type PipelinePaper, type PipelineStatus, type RepurposingOpportunity } from "@biotech-arbitrage/api-client";
import { api } from "@/lib/api";

interface FlowProps {
  onNavigate: (to: string) => void;
}

function FlowHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="border-b border-border pb-6"><span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">{eyebrow}</span><h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">{title}</h1><p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">{description}</p></div>;
}

function ErrorBox({ message }: { message: string }) {
  return <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">[PIPELINE_ERROR] {message}</div>;
}

export function PipelineQueryView({ onNavigate }: FlowProps) {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setError(null);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("active_drug_id", query.trim().toLowerCase());
      }
      await api.runPipeline(query.trim(), maxResults);
      onNavigate(`/pipeline/status?query=${encodeURIComponent(query.trim())}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onNavigate("/pipeline/status");
        return;
      }
      setError(err instanceof Error ? err.message : "Unable to start ingestion pipeline");
    }
  };
  return <div className="space-y-8"><FlowHeader eyebrow="01 // PIPELINE INTAKE" title="Find a biomedical connection" description="Enter a drug, disease, or research question. The engine retrieves literature, runs entity extraction, infers relations, and builds traceable outputs." /><form onSubmit={submit} className="space-y-4"><div className="flex items-center border border-accent bg-background-elevated/70 px-5 py-4 focus-within:ring-1 focus-within:ring-accent"><svg className="w-5 h-5 text-accent mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a drug, disease, or biomedical connection..." className="flex-1 bg-transparent text-base text-foreground placeholder-muted outline-none" /></div><div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs"><label className="text-muted">MAX PAPERS <select value={maxResults} onChange={(event) => setMaxResults(Number(event.target.value))} className="ml-2 bg-background-subtle border border-border px-2 py-1 text-foreground"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label><button type="submit" disabled={!query.trim()} className="px-5 py-2 border border-accent text-accent uppercase hover:bg-accent-glow disabled:opacity-40">Run ingestion and model →</button></div></form>{error && <ErrorBox message={error} />}<div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs"><div className="p-4 border border-border bg-background-elevated/40"><span className="text-accent">01</span><p className="mt-2 text-foreground">Retrieve evidence</p><p className="mt-1 text-muted">Europe PMC literature ingestion</p></div><div className="p-4 border border-border bg-background-elevated/40"><span className="text-accent">02</span><p className="mt-2 text-foreground">Extract entities</p><p className="mt-1 text-muted">NER model identifies biomedical concepts</p></div><div className="p-4 border border-border bg-background-elevated/40"><span className="text-accent">03</span><p className="mt-2 text-foreground">Infer relations</p><p className="mt-1 text-muted">Relation model builds the knowledge graph</p></div></div></div>;
}

export function PipelineStatusView({ onNavigate }: FlowProps) {
  const [status, setStatus] = useState<PipelineStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; const poll = async () => { try { const next = await api.getPipelineStatus(); if (active) setStatus(next); if (active && next.status === "running") window.setTimeout(poll, 1500); } catch (err) { if (active) setError(err instanceof Error ? err.message : "Unable to read pipeline status"); } }; poll(); return () => { active = false; }; }, []);
  if (error) return <ErrorBox message={error} />;
  if (!status) return <div className="py-20 text-center font-mono text-xs text-accent">INITIALIZING PIPELINE STATUS...</div>;
  const finished = status.status === "completed";
  return <div className="space-y-6"><FlowHeader eyebrow="02 // INGESTION + MODEL RUN" title={finished ? "Pipeline complete" : status.status === "failed" ? "Pipeline failed" : "Building biomedical relations"} description={status.query ? `Current query: ${status.query}` : "The backend is coordinating literature retrieval, NER, relation extraction, and graph export."} /><div className="p-6 border border-border bg-background-elevated/50 space-y-5"><div className="flex justify-between font-mono text-xs"><span className="text-accent uppercase">STATUS</span><span className={status.status === "failed" ? "text-rose-400" : "text-foreground"}>{status.status.toUpperCase()}</span></div>{["Europe PMC ingestion", "Biomedical entity extraction", "Relation extraction", "Graph and evidence export"].map((step, index) => <div key={step} className="flex items-center gap-3 border-t border-border pt-3 font-mono text-xs"><span className="text-accent">{finished || index < 2 && status.status === "running" ? "✓" : "○"}</span><span className="text-foreground-muted">{step}</span></div>)}{status.error && <p className="text-xs text-rose-300">{status.error}</p>}</div>{finished && <div className="flex flex-wrap gap-2"><button onClick={() => onNavigate("/pipeline/relations")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">Show relations →</button><button onClick={() => onNavigate("/workspace/explore")} className="px-4 py-2 border border-border text-muted font-mono text-xs uppercase hover:text-foreground">Open knowledge graph</button></div>}</div>;
}

export function PipelineRelationsView({ onNavigate }: FlowProps) {
  const [graph, setGraph] = useState<{ nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getPipelineGraph().then(setGraph).catch((err) => setError(err instanceof Error ? err.message : "Unable to load extracted relations")); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!graph) return <div className="py-20 text-center font-mono text-xs text-accent">LOADING EXTRACTED RELATIONS...</div>;
  return <div className="space-y-6"><FlowHeader eyebrow="03 // RELATION EXTRACTION" title="Extracted biological relations" description="Relations inferred by the model, kept traceable to the pipeline graph output." /><div className="space-y-3">{graph.edges.slice(0, 50).map((edge, index) => <div key={String(edge.id || index)} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 border border-border bg-background-elevated/40 font-mono text-xs"><span className="text-foreground">{String(edge.source || "Unknown")}</span><span className="text-accent uppercase">{String(edge.relation || edge.relationship || "related_to")}</span><span className="text-foreground text-right">{String(edge.target || "Unknown")}</span></div>)}</div><div className="flex gap-2"><button onClick={() => onNavigate("/workspace/explore")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">View knowledge graph →</button><button onClick={() => onNavigate("/pipeline/evidence")} className="px-4 py-2 border border-border text-muted font-mono text-xs uppercase">View evidence</button></div></div>;
}

export function PipelineGraphView({ onNavigate }: FlowProps) {
  const [graph, setGraph] = useState<{ nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getPipelineGraph().then(setGraph).catch((err) => setError(err instanceof Error ? err.message : "Unable to load knowledge graph")); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!graph) return <div className="py-20 text-center font-mono text-xs text-accent">LOADING KNOWLEDGE GRAPH...</div>;
  return <div className="space-y-6"><FlowHeader eyebrow="04 // KNOWLEDGE GRAPH" title="Knowledge graph" description={`${graph.nodes.length} entities connected by ${graph.edges.length} extracted relations.`} /><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{graph.nodes.slice(0, 60).map((node, index) => <div key={String(node.id || index)} className="p-4 border border-border bg-background-elevated/40"><span className="font-mono text-[0.65rem] text-accent uppercase">{String(node.type || "entity")}</span><p className="mt-2 text-sm text-foreground">{String(node.label || node.name || node.id || "Unknown entity")}</p></div>)}</div><button onClick={() => onNavigate("/pipeline/evidence")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">Continue to evidence →</button></div>;
}

export function PipelineEvidenceView({ onNavigate }: FlowProps) {
  const [papers, setPapers] = useState<PipelinePaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getPipelinePapers().then((result) => setPapers(result.papers)).catch((err) => setError(err instanceof Error ? err.message : "Unable to load relevant research")); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!papers.length) return <div className="py-20 text-center font-mono text-xs text-accent">LOADING RELEVANT RESEARCH PAPERS...</div>;
  return <div className="space-y-6"><FlowHeader eyebrow="05 // EVIDENCE" title="Relevant research papers" description="Literature records and evidence snippets produced by the ingestion pipeline." /><div className="space-y-3">{papers.map((paper) => <div key={paper.paperId} className="p-5 border border-border bg-background-elevated/40 space-y-2"><div className="flex justify-between gap-3"><h2 className="text-sm text-foreground">{paper.title}</h2><span className="font-mono text-[0.65rem] text-accent uppercase">{paper.category}</span></div><p className="text-xs text-foreground-muted">{paper.evidenceSnippet || "No extracted evidence snippet available."}</p><div className="font-mono text-[0.65rem] text-muted">{paper.journal} // {paper.publicationYear || "YEAR UNKNOWN"} {paper.doi && `// ${paper.doi}`}</div></div>)}</div><button onClick={() => onNavigate("/pipeline/repurposing")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">View repurposing scope →</button></div>;
}

export function PipelineRepurposingView(_props: FlowProps) {
  const [opportunities, setOpportunities] = useState<RepurposingOpportunity[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getRepurposingOpportunities().then((result) => setOpportunities(result.opportunities)).catch((err) => setError(err instanceof Error ? err.message : "Unable to load repurposing scope")); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!opportunities.length) return <div className="py-20 text-center font-mono text-xs text-accent">CALCULATING REPURPOSING SCOPE...</div>;
  return <div className="space-y-6"><FlowHeader eyebrow="06 // REPURPOSING SCOPE" title="Potential research opportunities" description="Ranked drug-disease connections calculated from the extracted graph and evidence." /><div className="space-y-3">{opportunities.map((opportunity, index) => <div key={`${opportunity.drug}-${opportunity.disease}-${index}`} className="p-5 border border-border bg-background-elevated/40"><div className="flex items-center justify-between"><span className="text-sm text-foreground">{opportunity.drug} <span className="text-muted">×</span> {opportunity.disease}</span><span className="font-mono text-accent">{opportunity.signal_score}/100</span></div><p className="mt-2 text-xs text-foreground-muted">{opportunity.summary || opportunity.connection_type || "Potential repurposing relationship identified."}</p></div>)}</div></div>;
}
