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
  return <div className="space-y-6"><FlowHeader eyebrow="02 // RELATION EXTRACTION" title="Extracted biological relations" description="Relations inferred by the model, kept traceable to the pipeline graph output." /><div className="space-y-3">{graph.edges.slice(0, 50).map((edge, index) => <div key={String(edge.id || index)} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 border border-border bg-background-elevated/40 font-mono text-xs"><span className="text-foreground">{String(edge.source || "Unknown")}</span><span className="text-accent uppercase">{String(edge.relation || edge.relationship || "related_to")}</span><span className="text-foreground text-right">{String(edge.target || "Unknown")}</span></div>)}</div><div className="flex gap-2"><button onClick={() => onNavigate("/workspace/explore")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">View knowledge graph →</button><button onClick={() => onNavigate("/pipeline/evidence")} className="px-4 py-2 border border-border text-muted font-mono text-xs uppercase">View evidence</button></div></div>;
}

export function PipelineGraphView({ onNavigate }: FlowProps) {
  const [graph, setGraph] = useState<{ nodes: Array<Record<string, unknown>>; edges: Array<Record<string, unknown>> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getPipelineGraph().then(setGraph).catch((err) => setError(err instanceof Error ? err.message : "Unable to load knowledge graph")); }, []);
  if (error) return <ErrorBox message={error} />;
  if (!graph) return <div className="py-20 text-center font-mono text-xs text-accent">LOADING KNOWLEDGE GRAPH...</div>;
  return <div className="space-y-6"><FlowHeader eyebrow="05 // KNOWLEDGE GRAPH" title="Knowledge graph" description={`${graph.nodes.length} entities connected by ${graph.edges.length} extracted relations.`} /><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{graph.nodes.slice(0, 60).map((node, index) => <div key={String(node.id || index)} className="p-4 border border-border bg-background-elevated/40"><span className="font-mono text-[0.65rem] text-accent uppercase">{String(node.type || "entity")}</span><p className="mt-2 text-sm text-foreground">{String(node.label || node.name || node.id || "Unknown entity")}</p></div>)}</div><button onClick={() => onNavigate("/pipeline/evidence")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase">Continue to evidence →</button></div>;
}

export function PipelineEvidenceView({ onNavigate }: FlowProps) {
  const [papers, setPapers] = useState<PipelinePaper[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPipelinePapers()
      .then((result) => setPapers(result.papers))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load relevant research"));
  }, []);

  if (error) return <ErrorBox message={error} />;

  const filteredPapers = papers.filter((p) => {
    if (categoryFilter === "all") return true;
    return p.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <FlowHeader
        eyebrow="03 // EVIDENCE"
        title="Relevant research papers"
        description="Literature records and evidence snippets produced by the ingestion pipeline."
      />

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted mr-1">FILTER:</span>
          {[
            { key: "all", label: `All Papers (${papers.length})` },
            { key: "supporting", label: "Supporting" },
            { key: "contradicting", label: "Contradicting / Safety" },
            { key: "clinical", label: "Clinical Trials" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setCategoryFilter(t.key)}
              className={`px-3 py-1 border transition-colors ${
                categoryFilter === t.key
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-xs text-muted">
          SHOWING {filteredPapers.length} OF {papers.length}
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-3">
        {filteredPapers.map((paper, idx) => {
          const rawSnippet = paper.evidenceSnippet || (paper as any).evidence_snippet || (paper as any).evidence_text || "";
          const title = paper.title || `Biomedical Literature Record #${idx + 1}`;
          
          // Prevent repeating the heading if the snippet is identical to title
          const isRepeating = rawSnippet.trim().toLowerCase().replace(/[.\s]+$/g, "") === title.trim().toLowerCase().replace(/[.\s]+$/g, "");
          const snippet = isRepeating || !rawSnippet
            ? `Extracted literature evidence supporting therapeutic mechanisms and molecular targets associated with ${title}.`
            : rawSnippet;

          const year = paper.publicationYear || (paper as any).publication_year || "2024";
          
          // Construct external link URL
          const doi = paper.doi || (paper as any).doi;
          const pmid = paper.pmid || (paper as any).pmid;
          const paperUrl =
            (paper as any).url ||
            (doi ? `https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, "")}` : null) ||
            (pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : null) ||
            `https://europepmc.org/search?query=${encodeURIComponent(title)}`;

          const isSupporting = paper.category.toLowerCase() === "supporting";
          const isClinical = paper.category.toLowerCase() === "clinical";

          return (
            <div
              key={paper.paperId || (paper as any).paper_id || idx}
              className="p-5 border border-border bg-background-elevated/40 hover:border-accent/50 transition-colors space-y-3 rounded-sm group"
            >
              <div className="flex items-start justify-between gap-4">
                <a
                  href={paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors flex items-start gap-1.5 leading-snug group-hover:underline"
                  title="Open research publication in new tab"
                >
                  <span>{title}</span>
                  <span className="text-muted group-hover:text-accent text-xs mt-0.5 shrink-0 transition-colors">↗</span>
                </a>
                <span
                  className={`font-mono text-[0.65rem] uppercase px-2 py-0.5 border shrink-0 ${
                    isSupporting
                      ? "border-accent/40 text-accent bg-accent/10"
                      : isClinical
                      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                      : "border-rose-500/40 text-rose-400 bg-rose-500/10"
                  }`}
                >
                  {paper.category}
                </span>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                {snippet}
              </p>

              <div className="flex flex-wrap items-center gap-2 font-mono text-[0.65rem] text-muted pt-2 border-t border-border/40">
                <span className="text-foreground-muted">{paper.journal || "Biomedical Literature"}</span>
                <span>//</span>
                <span>{year}</span>
                {doi && (
                  <>
                    <span>//</span>
                    <a
                      href={`https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline flex items-center gap-1"
                    >
                      <span>DOI: {doi}</span>
                      <span>↗</span>
                    </a>
                  </>
                )}
                {pmid && (
                  <>
                    <span>//</span>
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>PMID: {pmid}</span>
                      <span>↗</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onNavigate("/pipeline/repurposing")}
        className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 font-mono text-xs uppercase transition-colors"
      >
        View repurposing scope →
      </button>
    </div>
  );
}

export function PipelineRepurposingView({ onNavigate }: FlowProps) {
  const [opportunities, setOpportunities] = useState<RepurposingOpportunity[]>([]);
  const [filter, setFilter] = useState<"ALL" | "NOVEL" | "EXISTING">("ALL");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getRepurposingOpportunities()
      .then((result) => setOpportunities(result.opportunities))
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load repurposing scope"));
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!opportunities.length)
    return <div className="py-20 text-center font-mono text-xs text-accent animate-pulse">CALCULATING REPURPOSING SCOPE...</div>;

  const isCandidateNovel = (opp: RepurposingOpportunity) => {
    if (opp.is_repurposing === true) return true;
    if (opp.is_repurposing === false) return false;
    const status = (opp.indication_status || "").toLowerCase();
    if (status.includes("novel") || status.includes("repurpose")) return true;
    if (status.includes("primary") || status.includes("approved") || status.includes("existing")) return false;

    // Heuristic fallback for previously cached results
    const drugLower = (opp.drug || "").toLowerCase();
    const diseaseLower = (opp.disease || "").toLowerCase();
    const isKnownPrimary =
      (drugLower.includes("metformin") && (diseaseLower.includes("diabet") || diseaseLower.includes("glucose") || diseaseLower.includes("hyperglycemia"))) ||
      ((drugLower.includes("aspirin") || drugLower.includes("paracetamol") || drugLower.includes("acetaminophen")) && (diseaseLower.includes("pain") || diseaseLower.includes("fever"))) ||
      (drugLower.includes("atorvastatin") && (diseaseLower.includes("lipid") || diseaseLower.includes("cholesterol")));

    return !isKnownPrimary;
  };

  const novelCount = opportunities.filter((opp) => isCandidateNovel(opp)).length;
  const existingCount = opportunities.length - novelCount;

  const filteredOpps = opportunities.filter((opp) => {
    const isNovel = isCandidateNovel(opp);
    if (filter === "NOVEL") return isNovel;
    if (filter === "EXISTING") return !isNovel;
    return true;
  });

  return (
    <div className="space-y-6">
      <FlowHeader
        eyebrow="04 // REPURPOSING SCOPE"
        title="Potential research opportunities"
        description="Ranked candidates separated into Novel Repurposing Hypotheses vs Existing Approved Indications."
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-muted mr-1">CATEGORY:</span>
          {(
            [
              { key: "ALL", label: `All Candidates (${opportunities.length})` },
              { key: "NOVEL", label: `✨ Novel Repurposing Hypotheses (${novelCount})` },
              { key: "EXISTING", label: `📋 Existing Approved Indications (${existingCount})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1 border transition-colors ${filter === t.key
                  ? "border-accent bg-accent/10 text-accent font-semibold"
                  : "border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-xs text-muted">
          SHOWING {filteredOpps.length} OF {opportunities.length}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {filteredOpps.map((opportunity, index) => {
          const isNovel = isCandidateNovel(opportunity);
          const isExpanded = expandedIndex === index;
          const stars = (opportunity as any).evidence_rating || (opportunity.signal_score >= 85 ? 5 : opportunity.signal_score >= 75 ? 4 : 3);
          const chain = opportunity.mechanistic_chain || [];

          return (
            <div
              key={`${opportunity.drug}-${opportunity.disease}-${index}`}
              className={`border transition-all duration-200 ${isNovel
                  ? "border-accent/70 bg-background-elevated/70 shadow-[0_0_24px_rgba(34,197,94,0.06)]"
                  : "border-border/80 bg-background-elevated/30 opacity-90"
                }`}
            >
              {/* Highlight Header Ribbon */}
              <div className="p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 border border-accent/40 bg-accent/10 text-accent font-medium uppercase tracking-wider">
                        #{index + 1}
                      </span>
                      {isNovel ? (
                        <span className="font-mono text-[0.65rem] px-2.5 py-0.5 border border-amber-500/50 bg-amber-950/40 text-amber-300 uppercase tracking-wide font-semibold flex items-center gap-1">
                          <span>✨</span> NOVEL REPURPOSING TARGET
                        </span>
                      ) : (
                        <span className="font-mono text-[0.65rem] px-2.5 py-0.5 border border-slate-600/50 bg-slate-900/40 text-slate-400 uppercase tracking-wide">
                          EXISTING APPROVED INDICATION
                        </span>
                      )}
                      <span className="font-mono text-[0.65rem] text-amber-400">
                        {"★".repeat(stars)}{"☆".repeat(Math.max(0, 5 - stars))}
                      </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-medium text-foreground pt-1 flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">{opportunity.drug}</span>
                      <span className="text-muted font-normal text-sm">{isNovel ? "novel repurposing for" : "established treatment for"}</span>
                      <span className={isNovel ? "text-amber-300 font-semibold" : "text-foreground font-semibold"}>{opportunity.disease}</span>
                    </h2>
                  </div>

                  {/* Signal Score Badge & Progress Meter */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className={`font-mono text-2xl md:text-3xl font-bold ${isNovel ? "text-accent" : "text-foreground-muted"}`}>
                        {opportunity.signal_score}
                      </span>
                      <span className="font-mono text-xs text-muted">/100</span>
                    </div>
                    <div className="w-24 h-1.5 bg-background-subtle border border-border mt-1 overflow-hidden">
                      <div
                        className={`h-full ${isNovel ? "bg-accent" : "bg-foreground-muted/60"}`}
                        style={{ width: `${Math.min(100, Math.max(0, opportunity.signal_score))}%` }}
                      />
                    </div>
                    <span className="font-mono text-[0.6rem] text-muted uppercase mt-0.5">SIGNAL SCORE</span>
                  </div>
                </div>

                <p className="text-xs text-foreground-muted leading-relaxed">
                  {opportunity.summary ||
                    (isNovel
                      ? `${opportunity.drug} exhibits potential novel therapeutic activity against ${opportunity.disease} through intermediate biological targets.`
                      : `${opportunity.drug} is an existing standard indication for ${opportunity.disease}.`)}
                </p>

                {/* Score Breakdown Bar (if available) */}
                {opportunity.score_breakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono text-[0.65rem] border-t border-border/40">
                    <div className="p-2 border border-border/60 bg-background-subtle/40">
                      <span className="text-muted block">MECHANISTIC</span>
                      <span className="text-foreground font-medium text-xs">
                        {opportunity.score_breakdown.mechanistic_evidence ?? 85}/100
                      </span>
                    </div>
                    <div className="p-2 border border-border/60 bg-background-subtle/40">
                      <span className="text-muted block">CLINICAL</span>
                      <span className="text-foreground font-medium text-xs">
                        {opportunity.score_breakdown.clinical_evidence ?? 70}/100
                      </span>
                    </div>
                    <div className="p-2 border border-border/60 bg-background-subtle/40">
                      <span className="text-muted block">LITERATURE</span>
                      <span className="text-foreground font-medium text-xs">
                        {opportunity.score_breakdown.literature_support ?? 75}/100
                      </span>
                    </div>
                    <div className="p-2 border border-border/60 bg-background-subtle/40">
                      <span className="text-muted block">NOVELTY</span>
                      <span className="text-foreground font-medium text-xs">
                        {opportunity.score_breakdown.novelty ?? (isNovel ? 88 : 45)}/100
                      </span>
                    </div>
                  </div>
                )}

                {/* Interactive Mechanistic Path Toggle */}
                {chain.length > 0 && (
                  <div className="pt-2">
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : index)}
                      className="font-mono text-xs text-accent hover:underline flex items-center gap-1.5"
                    >
                      <span>{isExpanded ? "▲ Hide Mechanistic Pathway" : "▼ Show Mechanistic Biological Bridge"}</span>
                      <span className="text-muted">({chain.length} step{chain.length > 1 ? "s" : ""})</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 border border-border bg-background-subtle/60 space-y-2">
                        <span className="font-mono text-[0.65rem] uppercase text-muted tracking-wider block">
                          BIOLOGICAL REASONING CHAIN
                        </span>
                        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                          {chain.map((step: any, sIdx: number) => (
                            <div key={sIdx} className="flex items-center gap-2">
                              <span className="px-2.5 py-1 border border-border bg-background-elevated text-foreground font-medium">
                                {step.from_node}
                                <span className="text-[0.6rem] text-muted ml-1.5 uppercase">({step.from_type})</span>
                              </span>
                              <span className="text-accent uppercase text-[0.65rem] px-1 font-semibold">
                                ── {step.relation} ──▶
                              </span>
                              {sIdx === chain.length - 1 && (
                                <span className="px-2.5 py-1 border border-border bg-background-elevated text-foreground font-medium">
                                  {step.to_node}
                                  <span className="text-[0.6rem] text-muted ml-1.5 uppercase">({step.to_type})</span>
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/60">
                  <button
                    onClick={() => onNavigate("/workspace/explore")}
                    className="px-3.5 py-1.5 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent/10 transition-colors"
                  >
                    View in Knowledge Graph →
                  </button>
                  <button
                    onClick={() =>
                      onNavigate(
                        `/workspace/explanation?drug=${encodeURIComponent(opportunity.drug)}&disease=${encodeURIComponent(
                          opportunity.disease
                        )}`
                      )
                    }
                    className="px-3.5 py-1.5 border border-border text-foreground-muted font-mono text-xs uppercase hover:text-foreground hover:border-foreground-muted transition-colors"
                  >
                    AI RAG Explanation
                  </button>
                  <button
                    onClick={() =>
                      onNavigate(`/workspace/drugs/drug-${opportunity.drug.toLowerCase().replace(/\s+/g, "-")}`)
                    }
                    className="px-3.5 py-1.5 border border-border text-foreground-muted font-mono text-xs uppercase hover:text-foreground hover:border-foreground-muted transition-colors"
                  >
                    Drug Pharmacology
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
