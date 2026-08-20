import { useEffect, useState } from "react";
import type { Disease, Drug, Evidence, Paper } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface EntityDetailViewProps {
  entityType: "drug" | "disease" | "paper" | "evidence";
  entityId: string;
  onNavigate: (to: string) => void;
}

type Entity = Drug | Disease | Paper | Evidence;

export function EntityDetailView({ entityType, entityId, onNavigate }: EntityDetailViewProps) {
  const [entity, setEntity] = useState<Entity | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEntity(null);
    setError(null);
    const request =
      entityType === "drug"
        ? api.getDrug(entityId)
        : entityType === "disease"
          ? api.getDisease(entityId)
          : entityType === "paper"
            ? api.getPaper(entityId)
            : api.getEvidence(entityId);

    request.then(setEntity).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to load entity");
    });
  }, [entityId, entityType]);

  if (error) {
    return <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">[API_ERROR] {error}</div>;
  }

  if (!entity) {
    return <div className="py-20 text-center font-mono text-xs text-accent uppercase">Loading entity record...</div>;
  }

  const title = "name" in entity ? entity.name : entity.title;
  const description = "description" in entity ? entity.description : "summary" in entity ? entity.summary : "abstract" in entity ? entity.abstract : undefined;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between border-b border-border pb-4 font-mono text-xs">
        <button onClick={() => onNavigate("/workspace/signals")} className="text-muted hover:text-foreground">
          &lt;- BACK TO WORKSPACE
        </button>
        <span className="text-accent uppercase">{entityType} // {entityId}</span>
      </div>
      <div className="p-6 border border-border bg-background-elevated/70 rounded-sm space-y-4">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">ENTITY RECORD</span>
        <h1 className="font-display text-3xl text-foreground font-normal">{title}</h1>
        {description && <p className="text-sm text-foreground-muted leading-relaxed">{description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {"mechanismOfAction" in entity && entity.mechanismOfAction && <div className="p-4 border border-border bg-background-subtle"><span className="text-accent">MECHANISM</span><p className="mt-2 text-foreground-muted">{entity.mechanismOfAction}</p></div>}
        {"pathways" in entity && entity.pathways && <div className="p-4 border border-border bg-background-subtle"><span className="text-accent">PATHWAYS</span><p className="mt-2 text-foreground-muted">{entity.pathways.join(", ")}</p></div>}
        {"authors" in entity && <div className="p-4 border border-border bg-background-subtle"><span className="text-accent">AUTHORS</span><p className="mt-2 text-foreground-muted">{entity.authors.join(", ")}</p></div>}
        {"direction" in entity && <div className="p-4 border border-border bg-background-subtle"><span className="text-accent">EVIDENCE</span><p className="mt-2 text-foreground-muted">{entity.direction} // {entity.type}</p></div>}
      </div>
      {entityType === "drug" && <button onClick={() => onNavigate(`/workspace/drugs/${entityId}`)} className="px-4 py-2 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent-glow">Open full drug overview →</button>}
    </div>
  );
}
