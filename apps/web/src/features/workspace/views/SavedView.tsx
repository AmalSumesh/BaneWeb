import { useEffect, useState } from "react";
import type { SavedItem } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface SavedViewProps {
  onNavigate: (to: string) => void;
}

export function SavedView({ onNavigate }: SavedViewProps) {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSaved() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSaved();
        setSavedItems(res.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load saved items");
      } finally {
        setLoading(false);
      }
    }
    loadSaved();
  }, []);

  const handleDeleteSaved = async (id: string) => {
    try {
      await api.deleteSaved(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete saved item");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            SAVED_INVESTIGATIONS // INDEX
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">
            Bookmarked Biomedical Entities
          </h1>
          <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
            Curated list of saved repurposing signals, drug targets, diseases, and research evidence.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center font-mono">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mx-auto mb-3" />
          <span className="text-xs text-accent">FETCHING BOOKMARKS...</span>
        </div>
      ) : error ? (
        <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">
          [API_ERROR] {error}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="p-12 text-center border border-border font-mono text-xs text-muted">
          No saved entities found. Save signals or research targets from the Signals Workbench.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedItems.map((item) => (
            <div
              key={item.id}
              className="p-5 border border-border hover:border-accent bg-background-elevated/40 space-y-3 rounded-sm font-mono text-xs"
            >
              <div className="flex justify-between items-center text-[0.65rem]">
                <span className="text-accent uppercase font-semibold">
                  ENTITY: {item.entityType.toUpperCase()}
                </span>
                <span className="text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="font-sans font-semibold text-sm text-foreground">
                Entity ID: {item.entityId}
              </div>

              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[0.65rem]">
                <button
                  onClick={() => {
                    if (item.entityType === "signal") onNavigate(`/workspace/signals/${item.entityId}`);
                    else onNavigate("/workspace/signals");
                  }}
                  className="text-accent hover:underline"
                >
                  VIEW ENTITY →
                </button>
                <button
                  onClick={() => handleDeleteSaved(item.id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  REMOVE BOOKMARK
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
