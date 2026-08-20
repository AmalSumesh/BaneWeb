import { useEffect, useState } from "react";
import type { Alert } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface AlertsViewProps {
  onNavigate: (to: string) => void;
}

export function AlertsView({ onNavigate }: AlertsViewProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAlerts() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAlerts();
        setAlerts(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load alerts feed");
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const getSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
      case "urgent":
        return "border-rose-500/60 text-rose-200 bg-rose-950/60 font-bold";
      case "notable":
        return "border-amber-500/60 text-amber-200 bg-amber-950/60 font-bold";
      case "info":
      default:
        return "border-sky-500/60 text-sky-200 bg-sky-950/60 font-bold";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            RESEARCH_INTELLIGENCE // ALERTS
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">
            Real-Time Research Monitoring
          </h1>
          <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
            Automated alerts tracking newly published clinical trial updates, preprints, patents, and signal score shifts across monitored biomedical targets.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center font-mono">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mb-4" />
          <span className="text-xs text-accent uppercase">Querying Research Feed Updates...</span>
        </div>
      ) : error ? (
        <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">
          [API_ERROR] {error}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="font-mono text-xs text-muted">
            TOTAL ALERTS: <span className="text-foreground">{alerts.length}</span>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => {
                  if (alert.entityType === "signal" && alert.entityId) {
                    onNavigate(`/workspace/signals/${alert.entityId}`);
                  } else {
                    onNavigate("/workspace/evidence");
                  }
                }}
                className="p-5 border border-border hover:border-accent bg-background-elevated/40 hover:bg-background-elevated transition-colors rounded-sm cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-[0.65rem]">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 border uppercase font-semibold ${getSeverityBadge(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-accent uppercase">{alert.type.replace("_", " ")}</span>
                  </div>
                  <span className="text-muted">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>

                <h3 className="text-sm font-semibold text-foreground font-sans">{alert.title}</h3>
                <p className="text-xs text-foreground-muted leading-relaxed font-sans">{alert.message}</p>

                {alert.entityId && (
                  <div className="pt-2 flex items-center justify-between font-mono text-[0.65rem] text-muted border-t border-border/40">
                    <span>AFFECTED ENTITY: {alert.entityType?.toUpperCase()} ({alert.entityId})</span>
                    <span className="text-accent">INSPECT ENTITY →</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
