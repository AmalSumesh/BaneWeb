import { useEffect, useState } from "react";
import type { Hypothesis, Note, RepurposingSignal } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface HypothesisViewProps {
  projectId: string;
  hypothesisId: string;
  onNavigate: (to: string) => void;
}

export function HypothesisView({ projectId, hypothesisId, onNavigate }: HypothesisViewProps) {
  const [hypothesis, setHypothesis] = useState<Hypothesis | null>(null);
  const [signal, setSignal] = useState<RepurposingSignal | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    async function loadHypothesisData() {
      setLoading(true);
      try {
        const [hypothesisData, project, projectNotes] = await Promise.all([
          api.getHypothesis(projectId, hypothesisId),
          api.getProject(projectId),
          api.getProjectNotes(projectId),
        ]);
        setHypothesis(hypothesisData);
        setNotes(projectNotes);

        if (hypothesisData.signalId || project.signalIds?.[0]) {
          setSignal(await api.getSignal(hypothesisData.signalId || project.signalIds![0]));
        }
      } catch {
        setHypothesis(null);
      } finally {
        setLoading(false);
      }
    }
    loadHypothesisData();
  }, [projectId, hypothesisId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const created = await api.createProjectNote(projectId, newNote);
      setNotes((prev) => [...prev, created]);
      setNewNote("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mb-4" />
        <span className="text-xs text-accent uppercase">Loading Hypothesis Research Notebook...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between font-mono text-xs border-b border-border pb-4">
        <button
          onClick={() => onNavigate("/workspace/projects")}
          className="text-muted hover:text-foreground transition-colors flex items-center gap-2"
        >
          <span>← BACK TO PROJECTS WORKBENCH</span>
        </button>
        <span className="text-accent">HYPOTHESIS ID: {hypothesisId}</span>
      </div>

      {/* Main Notebook Card */}
      <div className="p-8 border border-border bg-background-elevated/70 rounded-sm space-y-6">
        <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
          SCIENTIFIC HYPOTHESIS NOTEBOOK // PROJECT {projectId}
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-foreground font-normal leading-tight">
          {hypothesis?.title}
        </h1>

        {/* Statement Box */}
        <div className="p-4 border-l-4 border-l-accent border-y border-r border-border bg-background-subtle rounded-r-sm space-y-1">
          <div className="font-mono text-[0.65rem] text-accent uppercase">CORE STATEMENT</div>
          <p className="text-sm text-foreground leading-relaxed font-sans">{hypothesis?.statement}</p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-4 font-mono text-xs pt-2">
          <span className="text-muted">STATUS:</span>
          <span className="px-2.5 py-0.5 border border-emerald-500/40 text-emerald-400 bg-emerald-950/20 uppercase font-semibold">
            {hypothesis?.status}
          </span>
        </div>
      </div>

      {/* Mechanistic Rationale & Open Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-border bg-background-elevated/40 space-y-3 rounded-sm">
          <div className="font-mono text-xs text-accent uppercase tracking-widest">[MECHANISTIC_RATIONALE]</div>
          <p className="text-xs text-foreground-muted leading-relaxed font-sans">
            Complex I inhibition in mitochondria $\rightarrow$ decreased ATP production $\rightarrow$ increased AMP/ATP ratio $\rightarrow$ conformational activation of AMPK $\rightarrow$ phosphorylation of TSC2 and Raptor $\rightarrow$ inhibition of mTORC1 kinase activity.
          </p>
        </div>

        <div className="p-6 border border-border bg-background-elevated/40 space-y-3 rounded-sm">
          <div className="font-mono text-xs text-amber-400 uppercase tracking-widest">[OPEN_QUESTIONS]</div>
          <ul className="list-disc list-inside text-xs text-foreground-muted space-y-1.5 font-sans">
            <li>What blood-brain barrier penetration coefficient is achieved at therapeutic dosages?</li>
            <li>Do IDH1-mutant glioma cell lines display differential sensitivity vs IDH wild-type?</li>
            <li>What synergistic effect is observed with concurrent Temozolomide therapy?</li>
          </ul>
        </div>
      </div>

      {/* Linked Signal & Evidence Stream */}
      {signal && (
        <div className="p-6 border border-border bg-background-elevated/40 rounded-sm space-y-4">
          <div className="flex justify-between items-center font-mono text-xs">
            <span className="text-accent uppercase tracking-widest">[LINKED_REPURPOSING_SIGNAL]</span>
            <button
              onClick={() => onNavigate(`/workspace/signals/${signal.id}`)}
              className="text-accent underline text-[0.7rem]"
            >
              INSPECT FULL SIGNAL DETAILS →
            </button>
          </div>

          <div className="p-4 border border-border/60 bg-background-subtle font-mono text-xs space-y-2">
            <div className="flex justify-between text-muted text-[0.65rem]">
              <span>SIGNAL ID: {signal.id}</span>
              <span className="text-accent">PRIORITIZATION SCORE: {signal.overallScore}/100</span>
            </div>
            <div className="font-sans text-sm font-semibold text-foreground">
              {signal.drug?.name} × {signal.disease?.name}
            </div>
            <p className="text-xs text-foreground-muted font-sans line-clamp-2">{signal.explanation}</p>
          </div>
        </div>
      )}

      {/* Notes Stream & Notebook Form */}
      <div className="p-6 border border-border bg-background-elevated/40 rounded-sm space-y-4 font-mono text-xs">
        <div className="text-accent uppercase tracking-widest">[INVESTIGATOR_NOTES]</div>

        <form onSubmit={handleAddNote} className="space-y-2">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write laboratory notes, literature references, or protocol observations..."
            rows={3}
            className="w-full bg-background-subtle border border-border p-3 text-xs text-foreground placeholder-muted outline-none font-sans rounded-sm focus:border-accent"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submittingNote || !newNote.trim()}
              className="px-4 py-1.5 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent-glow transition-colors disabled:opacity-50"
            >
              {submittingNote ? "LOGGING..." : "+ LOG NOTE TO NOTEBOOK"}
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-2">
          {notes.map((n) => (
            <div key={n.id} className="p-3 border border-border/60 bg-background-subtle font-mono text-xs space-y-1">
              <div className="flex justify-between text-[0.6rem] text-muted">
                <span>NOTE ID: {n.id}</span>
                <span>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-foreground font-sans text-xs">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
