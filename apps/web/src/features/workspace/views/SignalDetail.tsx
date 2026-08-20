import { useEffect, useState } from "react";
import type { RepurposingSignal, ClinicalTrial, Patent } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface SignalDetailProps {
  signalId: string;
  onNavigate: (to: string) => void;
}

export function SignalDetail({ signalId, onNavigate }: SignalDetailProps) {
  const [signal, setSignal] = useState<RepurposingSignal | null>(null);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const sig = await api.getSignal(signalId);
        setSignal(sig);

        // Fetch related trials and patents asynchronously
        try {
          const trialsRes = await api.getTrials({ pageSize: 10 });
          setTrials(trialsRes.items.filter((t) => t.drugId === sig.drugId || t.diseaseId === sig.diseaseId));
        } catch {
          // ignore error
        }

        try {
          const patentsRes = await api.getPatents({ pageSize: 10 });
          setPatents(patentsRes.items);
        } catch {
          // ignore error
        }

        try {
          const savedRes = await api.getSaved();
          setIsSaved(savedRes.items.some((item) => item.entityId === signalId));
        } catch {
          // ignore error
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load signal detail from backend API");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [signalId]);

  const handleToggleSave = async () => {
    if (!signal) return;
    try {
      if (isSaved) {
        const savedRes = await api.getSaved();
        const item = savedRes.items.find((i) => i.entityId === signalId);
        if (item) {
          await api.deleteSaved(item.id);
          setIsSaved(false);
        }
      } else {
        await api.saveItem({ entityType: "signal", entityId: signalId });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save signal:", err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mb-4" />
        <span className="text-xs text-accent tracking-widest uppercase">Analyzing Signal Syntheses Matrix...</span>
        <span className="text-[0.65rem] text-muted mt-1">SYNTHESIZING EVIDENCE MATRIX</span>
      </div>
    );
  }

  if (error || !signal) {
    return (
      <div className="p-8 border border-rose-900/50 bg-rose-950/20 rounded-sm font-mono my-8">
        <div className="text-rose-400 text-sm font-semibold uppercase tracking-wider mb-2">
          [SIGNAL_NOT_FOUND_ERROR]
        </div>
        <p className="text-xs text-foreground-muted mb-4">{error || "Signal entity does not exist."}</p>
        <button
          onClick={() => onNavigate("/workspace/signals")}
          className="px-4 py-2 border border-border text-xs text-foreground hover:bg-background-elevated transition-colors"
        >
          ← RETURN TO SIGNALS WORKBENCH
        </button>
      </div>
    );
  }

  // Divide evidence into supporting & contradictory
  const supportingEvidence = signal.evidence.filter((e) => e.direction === "supporting");
  const contradictoryEvidence = signal.contradictoryEvidence || signal.evidence.filter((e) => e.direction === "contradicting");

  return (
    <div className="space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between font-mono text-xs border-b border-border pb-4">
        <button
          onClick={() => onNavigate("/workspace/signals")}
          className="text-muted hover:text-foreground transition-colors flex items-center gap-2"
        >
          <span>← BACK TO SIGNALS WORKBENCH</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-muted">SIGNAL_ID: {signal.id}</span>
          <button
            onClick={handleToggleSave}
            className={`px-3 py-1 border transition-colors ${
              isSaved ? "border-accent text-accent bg-accent-glow" : "border-border text-muted hover:text-foreground"
            }`}
          >
            {isSaved ? "★ SAVED IN PROJECT" : "☆ SAVE SIGNAL"}
          </button>
        </div>
      </div>

      {/* Main Signal Banner */}
      <div className="p-6 md:p-8 border border-border bg-background-elevated/70 rounded-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent mb-2">

        <div className="flex flex-wrap gap-2 border-b border-border pb-6 font-mono text-[0.65rem] uppercase">
          <button onClick={() => onNavigate(`/workspace/drugs/${signal.drugId}`)} className="px-3 py-1.5 border border-border text-muted hover:text-foreground">Drug overview</button>
          <button onClick={() => onNavigate(`/workspace/connections/${signal.id}`)} className="px-3 py-1.5 border border-accent/50 text-accent hover:bg-accent-glow">Why this connection</button>
          <button onClick={() => onNavigate(`/workspace/explanations/${signal.id}`)} className="px-3 py-1.5 border border-border text-muted hover:text-foreground">Evidence explanation</button>
          <button onClick={() => onNavigate(`/workspace/scores/${signal.id}`)} className="px-3 py-1.5 border border-border text-muted hover:text-foreground">Score breakdown</button>
          <button onClick={() => onNavigate("/workspace/papers")} className="px-3 py-1.5 border border-border text-muted hover:text-foreground">Relevant papers</button>
          <button onClick={() => onNavigate("/workspace/monitor")} className="px-3 py-1.5 border border-border text-muted hover:text-foreground">Monitor research</button>
        </div>
              REPURPOSING HYPOTHESIS CANDIDATE // ID: {signal.id}
            </div>
            <h1 className="font-display text-3xl md:text-5xl text-foreground font-normal leading-tight">
              {signal.drug?.name || signal.drugId}{" "}
              <span className="text-muted font-light">×</span>{" "}
              {signal.disease?.name || signal.diseaseId}
            </h1>
            {signal.drug?.genericName && (
              <p className="font-mono text-xs text-foreground-muted mt-2">
                GENERIC: {signal.drug.genericName} • TARGET PATHWAYS: {signal.drug.pathways?.join(", ") || "Multi-target"}
              </p>
            )}
          </div>

          {/* Large Prioritization Score Banner */}
          <div className="p-5 border border-accent/40 bg-background-subtle rounded-sm shrink-0 flex flex-col items-center justify-center min-w-[200px]">
            <div className="font-mono text-4xl font-light text-accent">{signal.overallScore}</div>
            <div className="font-mono text-[0.65rem] text-muted uppercase tracking-widest mt-1">
              PRIORITIZATION SCORE
            </div>
            <div className="font-mono text-[0.6rem] text-accent/80 mt-1">CONFIDENCE: HIGH</div>
          </div>
        </div>
      </div>

      {/* CUSTOM SCIENTIFIC PRIORITIZATION SCORE BREAKDOWN VISUALIZATION */}
      <div className="p-6 border border-border bg-background-elevated/40 rounded-sm space-y-4">
        <div className="flex items-center justify-between font-mono">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">
            [SCIENTIFIC_SCORE_BREAKDOWN]
          </span>
          <span className="text-[0.65rem] text-muted">COMPUTATIONAL EVIDENCE WEIGHTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 font-mono text-xs">
          {signal.scoreBreakdown.map((item, idx) => (
            <div key={idx} className="p-3 border border-border/60 bg-background-subtle/50 space-y-2">
              <div className="flex items-center justify-between text-muted text-[0.65rem]">
                <span className="uppercase">{item.factor}</span>
                <span className="text-foreground font-semibold">{Math.round(item.score <= 1 ? item.score * 100 : item.score)}/100</span>
              </div>
              <div className="w-full bg-background-elevated h-2 rounded-none overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, item.score <= 1 ? item.score * 100 : item.score)}%` }}
                  className="h-full bg-accent transition-all duration-500"
                />
              </div>
              {item.rationale && (
                <p className="text-[0.65rem] text-foreground-muted font-sans line-clamp-2 leading-tight">
                  {item.rationale}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* WHY THIS SIGNAL (Explanation) */}
      <div className="p-6 border border-border bg-background-elevated/40 rounded-sm space-y-3">
        <div className="font-mono text-xs text-accent uppercase tracking-widest">
          01 // WHY THIS SIGNAL WAS SURFACED
        </div>
        <p className="text-sm md:text-base text-foreground leading-relaxed font-sans">
          {signal.explanation}
        </p>
      </div>

      {/* MECHANISTIC RATIONALE */}
      {signal.mechanisms && signal.mechanisms.length > 0 && (
        <div className="p-6 border border-border bg-background-elevated/40 rounded-sm space-y-3">
          <div className="font-mono text-xs text-accent uppercase tracking-widest">
            02 // MECHANISTIC RATIONALE & BIOLOGICAL TARGETS
          </div>
          <div className="flex flex-wrap gap-2">
            {signal.mechanisms.map((mech, idx) => (
              <div
                key={idx}
                className="px-3 py-1 border border-accent/40 bg-accent-glow text-accent font-mono text-xs"
              >
                TARGET PATHWAY: {mech}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUAL EVIDENCE MATRIX: SUPPORTING VS CONTRADICTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SUPPORTING EVIDENCE */}
        <div className="p-6 border border-emerald-500/30 bg-emerald-950/10 rounded-sm space-y-4">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs text-emerald-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              [+] SUPPORTING EVIDENCE ({supportingEvidence.length})
            </span>
            <span className="text-[0.65rem] text-emerald-500/70">POSITIVE SIGNAL ALIGNMENT</span>
          </div>

          <div className="space-y-3">
            {supportingEvidence.length === 0 ? (
              <p className="text-xs text-muted font-mono py-4">No direct supporting evidence entries logged yet.</p>
            ) : (
              supportingEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 border border-emerald-500/30 bg-background-elevated/70 space-y-2 rounded-sm"
                >
                  <div className="flex items-center justify-between font-mono text-[0.65rem]">
                    <span className="text-emerald-400 font-bold">✔ CONFIRMED DATASET</span>
                    <span className="text-muted uppercase">{ev.type} • {ev.sourceType}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{ev.title}</h4>
                  <p className="text-xs text-foreground-muted leading-relaxed">{ev.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CONTRADICTORY EVIDENCE */}
        <div className="p-6 border border-amber-500/30 bg-amber-950/10 rounded-sm space-y-4">
          <div className="flex items-center justify-between font-mono">
            <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              [!] CONTRADICTORY & AMBIGUOUS EVIDENCE ({contradictoryEvidence.length})
            </span>
            <span className="text-[0.65rem] text-amber-500/70">CONFOUNDING FACTORS</span>
          </div>

          <div className="space-y-3">
            {contradictoryEvidence.length === 0 ? (
              <div className="p-4 border border-border/40 bg-background-elevated/40 text-xs text-muted font-mono">
                No contradictory evidence identified in current published literature index.
              </div>
            ) : (
              contradictoryEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 border border-amber-500/40 bg-background-elevated/70 space-y-2 rounded-sm border-l-4 border-l-amber-500"
                >
                  <div className="flex items-center justify-between font-mono text-[0.65rem]">
                    <span className="text-amber-400 font-bold">⚠ CONTRADICTORY OBSERVATION</span>
                    <span className="text-muted uppercase">{ev.type} • {ev.sourceType}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{ev.title}</h4>
                  <p className="text-xs text-foreground-muted leading-relaxed">{ev.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RESEARCH GAP & CAVEATS */}
      {signal.researchGap && (
        <div className="p-6 border border-amber-500/40 bg-background-elevated/60 rounded-sm space-y-3">
          <div className="font-mono text-xs text-amber-400 uppercase tracking-widest font-semibold">
            03 // IDENTIFIED RESEARCH GAP & SUGGESTED VALIDATION
          </div>
          <h3 className="text-base font-medium text-foreground">{signal.researchGap.title}</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">{signal.researchGap.description}</p>
          {signal.researchGap.suggestedStudies && (
            <div className="pt-2 font-mono text-xs">
              <span className="text-muted text-[0.65rem] uppercase block mb-1">SUGGESTED VALIDATION EXPERIMENTS:</span>
              <ul className="list-disc list-inside text-foreground-muted space-y-1 text-xs font-sans">
                {signal.researchGap.suggestedStudies.map((study, i) => (
                  <li key={i}>{study}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* RELATED TRIALS & PATENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* TRIALS */}
        <div className="p-6 border border-border bg-background-elevated/30 rounded-sm space-y-3">
          <div className="font-mono text-xs text-accent uppercase tracking-widest">
            RELATED CLINICAL TRIALS ({trials.length})
          </div>
          {trials.length === 0 ? (
            <p className="text-xs text-muted font-mono">No active registered clinical trials found for this pair.</p>
          ) : (
            <div className="space-y-2">
              {trials.map((trial) => (
                <div key={trial.id} className="p-3 border border-border/60 bg-background-subtle font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[0.65rem] text-accent">
                    <span>{trial.nctId || trial.id}</span>
                    <span className="uppercase font-semibold">{trial.phase}</span>
                  </div>
                  <div className="text-foreground font-sans font-medium text-xs">{trial.title}</div>
                  <div className="text-muted text-[0.65rem]">STATUS: {trial.status.toUpperCase()}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PATENTS */}
        <div className="p-6 border border-border bg-background-elevated/30 rounded-sm space-y-3">
          <div className="font-mono text-xs text-accent uppercase tracking-widest">
            INTELLECTUAL PROPERTY & PATENTS ({patents.length})
          </div>
          {patents.length === 0 ? (
            <p className="text-xs text-muted font-mono">No patent filings linked to this specific candidate.</p>
          ) : (
            <div className="space-y-2">
              {patents.slice(0, 3).map((patent) => (
                <div key={patent.id} className="p-3 border border-border/60 bg-background-subtle font-mono text-xs space-y-1">
                  <div className="flex justify-between text-[0.65rem] text-rose-400">
                    <span>{patent.patentNumber || patent.id}</span>
                    <span className="uppercase font-semibold">{patent.status}</span>
                  </div>
                  <div className="text-foreground font-sans font-medium text-xs">{patent.title}</div>
                  <div className="text-muted text-[0.65rem]">ASSIGNEE: {patent.assignee || "Unknown"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
