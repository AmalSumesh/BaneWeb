import { useEffect, useState } from "react";
import type { Alert, ClinicalTrial, Drug, RepurposingSignal } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface FlowProps {
  onNavigate: (to: string) => void;
}

interface SignalFlowProps extends FlowProps {
  signalId: string;
}

function LoadingState({ label }: { label: string }) {
  return <div className="py-20 text-center font-mono text-xs text-accent uppercase">{label}</div>;
}

function ErrorState({ message }: { message: string }) {
  return <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">[API_ERROR] {message}</div>;
}

function normalizeScore(score: number) {
  return score <= 1 ? score * 100 : score;
}

function FlowHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="border-b border-border pb-6">
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
      <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">{title}</h1>
      <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">{description}</p>
    </div>
  );
}

export function DrugOverviewView({ drugId, onNavigate }: FlowProps & { drugId: string }) {
  const [drug, setDrug] = useState<Drug | null>(null);
  const [trials, setTrials] = useState<ClinicalTrial[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    Promise.all([api.getDrug(drugId), api.getTrials({ page: 1, pageSize: 20 })])
      .then(([drugData, trialData]) => {
        setDrug(drugData);
        setTrials(trialData.items.filter((trial) => trial.drugId === drugId));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load drug overview"));
  }, [drugId]);

  if (error) return <ErrorState message={error} />;
  if (!drug) return <LoadingState label="Loading drug overview..." />;

  return (
    <div className="space-y-6">
      <FlowHeader
        eyebrow={`01 // DRUG PHARMACOLOGY • ${drug.name.toUpperCase()}`}
        title={drug.name}
        description={drug.description || "Backend drug entity profile and related research activity."}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Molecular Structure Picture Frame */}
        <div className="p-5 border border-border bg-background-elevated/70 flex flex-col items-center justify-between space-y-4 rounded-sm">
          <div className="w-full flex items-center justify-between font-mono text-[0.65rem] text-muted">
            <span className="text-amber-400 uppercase tracking-widest font-semibold">2D STRUCTURE // PUBCHEM</span>
            <span>{drug.targets?.find((t) => t.includes("CID"))?.replace("PubChem CID:", "CID:").trim() || "NCBI PUG"}</span>
          </div>

          <div className="w-full aspect-square max-w-[220px] bg-white rounded-sm p-3 flex items-center justify-center border border-border/80 shadow-md">
            <img
              src={drug.structureImageUrl || `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(drug.name)}/PNG`}
              alt={`${drug.name} Molecular Structure`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          <div className="w-full font-mono text-[0.65rem] text-foreground-muted text-center border-t border-border/50 pt-2">
            {drug.name} • Chemical Formulation
          </div>
        </div>

        {/* Entity Profile & MOA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 border border-border bg-background-elevated/50 space-y-3 rounded-sm">
            <div className="font-mono text-xs text-amber-400 uppercase tracking-wider">ENTITY PROFILE</div>
            <div className="text-xs text-foreground-muted">GENERIC NAME: <span className="text-foreground font-mono">{drug.genericName || "Not recorded"}</span></div>
            <div className="text-xs text-foreground-muted">APPROVED INDICATIONS: <span className="text-foreground">{drug.approvedIndications?.join(", ") || "Not recorded"}</span></div>
            <div className="text-xs text-foreground-muted">MOLECULAR TARGETS: <span className="text-foreground font-mono text-amber-300/90">{drug.targets?.join(", ") || "Not recorded"}</span></div>
          </div>
          <div className="p-5 border border-border bg-background-elevated/50 space-y-3 rounded-sm">
            <div className="font-mono text-xs text-amber-400 uppercase tracking-wider">MECHANISM OF ACTION</div>
            <p className="text-sm text-foreground leading-relaxed">{drug.mechanismOfAction || "No mechanism recorded."}</p>
            <div className="text-xs text-foreground-muted">SIGNALING PATHWAYS: <span className="text-foreground font-mono">{drug.pathways?.join(", ") || "Not recorded"}</span></div>
          </div>
        </div>
      </div>

      <div className="p-5 border border-border bg-background-elevated/50 space-y-3">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-amber-400 uppercase tracking-wider">CLINICAL RESEARCH TRIALS</span>
          <span className="text-foreground">{trials.length} related trials</span>
        </div>
        {trials.length === 0 ? (
          <p className="text-xs text-muted">No related clinical trials registered in the current dataset.</p>
        ) : (
          trials.map((trial) => (
            <div key={trial.id} className="border-t border-border pt-3 text-xs">
              <div className="text-foreground font-medium">{trial.title}</div>
              <div className="text-muted mt-1 font-mono">{trial.phase} // {trial.status}</div>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={() => onNavigate("/pipeline/relations")}
          className="px-4 py-2 border border-amber-500/60 bg-amber-500/10 text-amber-400 font-mono text-xs uppercase tracking-wider hover:bg-amber-500/20 transition-all"
        >
          View Repurposing Relations →
        </button>
        <button
          onClick={() => onNavigate("/workspace/evidence")}
          className="px-4 py-2 border border-border text-foreground-muted font-mono text-xs uppercase tracking-wider hover:text-foreground hover:border-amber-500/40 transition-all"
        >
          Inspect Evidence Streams →
        </button>
        <button
          onClick={() => onNavigate("/workspace/explore")}
          className="px-4 py-2 border border-border text-foreground-muted font-mono text-xs uppercase tracking-wider hover:text-foreground hover:border-amber-500/40 transition-all"
        >
          Knowledge Graph →
        </button>
      </div>
    </div>
  );
}

export function ConnectionExplanationView({ signalId, onNavigate }: SignalFlowProps) {
  const [signal, setSignal] = useState<RepurposingSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getSignal(signalId).then(setSignal).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load connection explanation")); }, [signalId]);
  if (error) return <ErrorState message={error} />;
  if (!signal) return <LoadingState label="Explaining biological connection..." />;
  return <div className="space-y-6"><FlowHeader eyebrow="WHY THIS CONNECTION // MECHANISM" title={`${signal.drug?.name || signal.drugId} × ${signal.disease?.name || signal.diseaseId}`} description="Traceable mechanistic rationale from the signal API." /><div className="p-6 border border-border bg-background-elevated/50 space-y-4"><div className="font-mono text-xs text-accent uppercase">EXPLANATION</div><p className="text-sm text-foreground leading-relaxed">{signal.explanation}</p><div className="flex flex-wrap gap-2">{signal.mechanisms?.map((mechanism) => <span key={mechanism} className="px-3 py-1 border border-accent/40 text-accent bg-accent-glow font-mono text-xs">{mechanism}</span>)}</div></div><button onClick={() => onNavigate(`/workspace/scores/${signalId}`)} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent-glow">View score breakdown →</button></div>;
}

export function ScoreBreakdownView({ signalId, onNavigate }: SignalFlowProps) {
  const [signal, setSignal] = useState<RepurposingSignal | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getSignal(signalId).then(setSignal).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load score breakdown")); }, [signalId]);
  if (error) return <ErrorState message={error} />;
  if (!signal) return <LoadingState label="Calculating prioritization breakdown..." />;
  return <div className="space-y-6"><FlowHeader eyebrow="SCORE BREAKDOWN // EVIDENCE WEIGHTS" title="Repurposing Score" description="Research prioritization factors returned by the signal service, not a treatment probability." /><div className="p-6 border border-border bg-background-elevated/50 space-y-5"><div className="flex items-end gap-2"><span className="font-display text-5xl text-accent">{signal.overallScore}</span><span className="font-mono text-xs text-muted mb-2">/ 100</span></div>{signal.scoreBreakdown.map((item) => { const score = normalizeScore(item.score); return <div key={item.factor} className="space-y-1"><div className="flex justify-between font-mono text-xs"><span className="text-foreground-muted uppercase">{item.factor}</span><span className="text-foreground">{Math.round(score)}/100</span></div><div className="h-2 bg-background-subtle"><div className="h-full bg-accent" style={{ width: `${Math.min(100, score)}%` }} /></div>{item.rationale && <p className="text-xs text-muted">{item.rationale}</p>}</div>; })}</div><button onClick={() => onNavigate(`/workspace/signals/${signalId}`)} className="px-4 py-2 border border-border text-muted font-mono text-xs uppercase hover:text-foreground">Open full signal →</button></div>;
}

export function MonitorResearchView({ onNavigate }: FlowProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getAlerts({ page: 1, pageSize: 50 }).then((response) => setAlerts(response.items)).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load monitoring feed")); }, []);
  if (error) return <ErrorState message={error} />;
  return <div className="space-y-6"><FlowHeader eyebrow="MONITOR RESEARCH // INTELLIGENCE FEED" title="Monitor Research" description="Track new evidence, trials, papers, and signal updates from the alerts API." /><div className="p-5 border border-border bg-background-elevated/50 space-y-3"><div className="font-mono text-xs text-accent uppercase">MONITOR STATUS</div><p className="text-sm text-foreground">{alerts.length} active research updates</p><p className="text-xs text-foreground-muted">Alerts are connected to entities and can be opened directly from the feed.</p></div><button onClick={() => onNavigate("/workspace/alerts/new")} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent-glow">View new research alert →</button></div>;
}

export function NewResearchAlertView({ onNavigate }: FlowProps) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { api.getAlerts({ page: 1, pageSize: 1 }).then((response) => setAlert(response.items[0] || null)).catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load new alert")); }, []);
  if (error) return <ErrorState message={error} />;
  if (!alert) return <LoadingState label="Checking for new research alerts..." />;
  return <div className="space-y-6"><FlowHeader eyebrow="NEW RESEARCH ALERT // LIVE UPDATE" title={alert.title} description="Latest notification from the backend research monitoring service." /><div className="p-6 border border-border border-l-4 border-l-accent bg-background-elevated/50 space-y-4"><div className="font-mono text-xs text-accent">{alert.severity.toUpperCase()} // {alert.type.replace("_", " ")}</div><p className="text-sm text-foreground leading-relaxed">{alert.message}</p>{alert.entityId && <div className="text-xs text-muted">AFFECTED ENTITY: {alert.entityType} // {alert.entityId}</div>}</div><button onClick={() => onNavigate("/workspace/alerts")} className="px-4 py-2 border border-border text-muted font-mono text-xs uppercase hover:text-foreground">Open all alerts →</button></div>;
}
