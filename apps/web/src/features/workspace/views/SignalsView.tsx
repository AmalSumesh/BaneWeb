import { useEffect, useState, useMemo } from "react";
import type { RepurposingSignal } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface SignalsViewProps {
  onNavigate: (to: string) => void;
  initialDrugFilter?: string;
  initialDiseaseFilter?: string;
}

export function SignalsView({ onNavigate, initialDrugFilter, initialDiseaseFilter }: SignalsViewProps) {
  const [signals, setSignals] = useState<RepurposingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "recency" | "novelty">("score");
  const [minScore, setMinScore] = useState<number>(0);
  const [savedSignalIds, setSavedSignalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadSignals() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSignals({ page: 1, pageSize: 50 });
        setSignals(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load signals from backend API");
      } finally {
        setLoading(false);
      }
    }

    async function loadSaved() {
      try {
        const res = await api.getSaved();
        const signalIds = new Set(
          res.items.filter((item) => item.entityType === "signal").map((item) => item.entityId)
        );
        setSavedSignalIds(signalIds);
      } catch {
        // saved items non-critical
      }
    }

    loadSignals();
    loadSaved();
  }, []);

  const handleToggleSaveSignal = async (e: React.MouseEvent, signalId: string) => {
    e.stopPropagation();
    try {
      if (savedSignalIds.has(signalId)) {
        const savedRes = await api.getSaved();
        const savedItem = savedRes.items.find((item) => item.entityId === signalId);
        if (savedItem) {
          await api.deleteSaved(savedItem.id);
          setSavedSignalIds((prev) => {
            const next = new Set(prev);
            next.delete(signalId);
            return next;
          });
        }
      } else {
        await api.saveItem({ entityType: "signal", entityId: signalId });
        setSavedSignalIds((prev) => new Set(prev).add(signalId));
      }
    } catch (err) {
      console.error("Failed to toggle save signal:", err);
    }
  };

  const filteredSignals = useMemo(() => {
    return signals
      .filter((s) => {
        if (s.overallScore < minScore) return false;
        if (initialDrugFilter && s.drugId !== initialDrugFilter && s.drug?.name !== initialDrugFilter) return false;
        if (initialDiseaseFilter && s.diseaseId !== initialDiseaseFilter && s.disease?.name !== initialDiseaseFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const drugName = s.drug?.name.toLowerCase() || "";
        const diseaseName = s.disease?.name.toLowerCase() || "";
        const explanation = s.explanation.toLowerCase();
        return drugName.includes(q) || diseaseName.includes(q) || explanation.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.overallScore - a.overallScore;
        if (sortBy === "novelty") return (b.novelty ?? 0) - (a.novelty ?? 0);
        if (sortBy === "recency") return (b.recency ?? 0) - (a.recency ?? 0);
        return 0;
      });
  }, [signals, searchQuery, sortBy, minScore, initialDrugFilter, initialDiseaseFilter]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mb-4" />
        <span className="text-xs text-accent tracking-widest uppercase">Querying Biomedical Signals Database...</span>
        <span className="text-[0.65rem] text-muted mt-1">FETCHING CANDIDATE PAIRS</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 border border-rose-900/50 bg-rose-950/20 rounded-sm font-mono my-8">
        <div className="text-rose-400 text-sm font-semibold uppercase tracking-wider mb-2">
          [DATA_UNREACHABLE]
        </div>
        <p className="text-xs text-foreground-muted mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-rose-800 text-xs text-rose-300 hover:bg-rose-900/30 transition-colors"
        >
          RETRY CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            SIGNAL_INVESTIGATION // WORKBENCH
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">
            Therapeutic Repurposing Candidates
          </h1>
          <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
            Prioritized Drug × Disease hypotheses derived from cross-database evidence synthesis.
            Scores reflect multi-factor research prioritization, not clinical efficacy guarantee.
          </p>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="p-3 border border-border bg-background-subtle/70 rounded-sm max-w-xs text-[0.65rem] font-mono text-muted space-y-1">
          <div className="text-accent flex items-center gap-1 font-semibold">
            <span>ℹ RESEARCH PRIORITIZATION SCORE</span>
          </div>
          <p className="leading-tight">
            Calculated score represents computational evidence alignment & novelty. Not medical treatment recommendation.
          </p>
        </div>
        <button
          onClick={() => onNavigate("/workspace/opportunities")}
          className="px-4 py-2 border border-accent text-accent hover:bg-accent-glow font-mono text-xs uppercase tracking-wider transition-colors shrink-0"
        >
          POTENTIAL OPPORTUNITIES →
        </button>
      </div>

      {/* Control Bar: Filter, Search & Sort */}
      <div className="p-4 border border-border bg-background-elevated/80 rounded-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 font-mono text-xs border-l-4 border-l-amber-500 shadow-sm">
        {/* Search within signals */}
        <div className="flex-1 flex items-center border border-border bg-background-subtle px-3 py-1.5 focus-within:border-amber-500 transition-colors">
          <svg className="w-3.5 h-3.5 text-amber-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter candidates by drug, disease, mechanism..."
            className="w-full bg-transparent text-foreground placeholder-muted outline-none font-sans text-xs"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-muted hover:text-foreground text-xs">
              ✕
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Min Score filter */}
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 bg-background-subtle">
            <span className="text-amber-400 text-[0.65rem] uppercase">MIN SCORE:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="bg-transparent text-foreground outline-none text-xs"
            >
              <option value={0} className="bg-background-elevated">ALL (0+)</option>
              <option value={50} className="bg-background-elevated">50+</option>
              <option value={70} className="bg-background-elevated">70+</option>
              <option value={80} className="bg-background-elevated">80+</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 border border-border px-3 py-1.5 bg-background-subtle">
            <span className="text-amber-400 text-[0.65rem] uppercase">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "recency" | "novelty")}
              className="bg-transparent text-foreground outline-none text-xs"
            >
              <option value="score" className="bg-background-elevated">PRIORITIZATION SCORE</option>
              <option value="novelty" className="bg-background-elevated">NOVELTY SCORE</option>
              <option value="recency" className="bg-background-elevated">EVIDENCE RECENCY</option>
            </select>
          </div>

          <div className="text-muted text-[0.65rem]">
            SHOWING <span className="text-foreground font-semibold">{filteredSignals.length}</span> SIGNALS
          </div>
        </div>
      </div>

      {/* Signals High-Density Console Table/List */}
      {filteredSignals.length === 0 ? (
        <div className="p-12 text-center border border-border bg-background-subtle/30 font-mono">
          <p className="text-xs text-muted uppercase tracking-widest">No signals match current filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setMinScore(0);
            }}
            className="mt-3 text-xs text-amber-400 underline hover:text-foreground"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSignals.map((signal) => {
            const isSaved = savedSignalIds.has(signal.id);
            return (
              <div
                key={signal.id}
                onClick={() => onNavigate(`/workspace/signals/${signal.id}`)}
                className="group border border-border hover:border-amber-500/60 bg-background-elevated/40 hover:bg-background-elevated transition-all p-5 rounded-sm cursor-pointer relative border-l-2 hover:border-l-amber-500"
              >
                {/* Header row: Drug x Disease + Score */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-[0.65rem] text-amber-400 uppercase tracking-widest mb-1">
                      <span>SIGNAL ID // {signal.id}</span>
                      <span>•</span>
                      <span>UPDATED {new Date(signal.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <h2 className="text-lg md:text-xl font-medium text-foreground group-hover:text-amber-300 transition-colors flex items-center gap-2">
                      <span>{signal.drug?.name || signal.drugId}</span>
                      <span className="text-muted font-light text-base">×</span>
                      <span className="text-foreground">{signal.disease?.name || signal.diseaseId}</span>
                    </h2>
                  </div>

                  {/* Prioritization Score Badge */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-2xl font-light text-amber-400">
                        {signal.overallScore}
                        <span className="text-xs text-muted">/100</span>
                      </div>
                      <div className="font-mono text-[0.6rem] text-muted uppercase">PRIORITIZATION SCORE</div>
                    </div>

                    <button
                      onClick={(e) => handleToggleSaveSignal(e, signal.id)}
                      title={isSaved ? "Remove from saved" : "Save signal"}
                      className={`p-2 border transition-colors ${
                        isSaved
                          ? "border-amber-500 text-amber-300 bg-amber-500/20"
                          : "border-border text-muted hover:text-foreground hover:border-foreground"
                      }`}
                    >
                      {isSaved ? "★ SAVED" : "☆ SAVE"}
                    </button>
                  </div>
                </div>

                {/* Score breakdown visual bar */}
                <div className="mt-3 w-full bg-background-subtle h-1.5 rounded-none overflow-hidden flex">
                  {signal.scoreBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${(item.score * item.weight) * 100}%` }}
                      className={`h-full border-r border-background ${
                        idx === 0 ? "bg-amber-500" : idx === 1 ? "bg-emerald-400" : "bg-sky-400"
                      }`}
                      title={`${item.factor}: ${item.score}`}
                    />
                  ))}
                </div>

                {/* Explanation & Mechanisms */}
                <p className="mt-3 text-xs text-foreground-muted leading-relaxed line-clamp-2">
                  {signal.explanation}
                </p>

                {/* Bottom Tags Row */}
                <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[0.65rem] px-2 py-0.5 border border-emerald-500/60 text-emerald-300 bg-emerald-950/60 font-semibold">
                      EVIDENCE: {signal.evidence.length} SOURCES
                    </span>
                    {signal.mechanisms && signal.mechanisms.length > 0 && (
                      <span className="text-[0.65rem] px-2 py-0.5 border border-sky-500/60 text-sky-300 bg-sky-950/60 font-semibold">
                        TARGET: {signal.mechanisms[0]}
                      </span>
                    )}
                    {signal.researchGap && (
                      <span className="text-[0.65rem] px-2 py-0.5 border border-amber-500/60 text-amber-300 bg-amber-950/60 font-semibold truncate max-w-xs">
                        GAP: {signal.researchGap.title}
                      </span>
                    )}
                  </div>

                  <span className="text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 text-[0.7rem] font-semibold">
                    INSPECT EVIDENCE SIGNAL →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
