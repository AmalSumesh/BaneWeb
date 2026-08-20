import { useEffect, useState, useRef, useCallback } from "react";
import type { SearchResult } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface SearchCommandProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: SearchResult) => void;
}

export function SearchCommand({ isOpen, onClose, onSelectResult }: SearchCommandProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      performSearch("");
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setError(null);
    }
  }, [isOpen]);

  const performSearch = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.search({ q, limit: 15 });
      setResults(res.results);
      setSelectedIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch search results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, isOpen, performSearch]);

  const handleKeyDownInInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectResult(results[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const getTypeBadgeStyle = (type: SearchResult["type"]) => {
    switch (type) {
      case "signal":
        return "border-emerald-500/40 text-emerald-400 bg-emerald-950/20";
      case "drug":
        return "border-sky-500/40 text-sky-400 bg-sky-950/20";
      case "disease":
        return "border-amber-500/40 text-amber-400 bg-amber-950/20";
      case "trial":
        return "border-indigo-500/40 text-indigo-400 bg-indigo-950/20";
      case "paper":
        return "border-purple-500/40 text-purple-400 bg-purple-950/20";
      case "patent":
        return "border-rose-500/40 text-rose-400 bg-rose-950/20";
      default:
        return "border-border text-foreground-muted bg-background-subtle";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-background-elevated border border-border rounded-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-background-subtle/50">
          <span className="font-mono text-xs text-accent mr-3 select-none">SEARCH //</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search drugs, diseases, symptoms, signals, papers, trials..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-muted outline-none font-sans"
          />
          {loading && (
            <span className="font-mono text-[0.65rem] text-accent animate-pulse mr-3">SEARCHING...</span>
          )}
          <button
            onClick={onClose}
            className="font-mono text-[0.65rem] uppercase px-2 py-0.5 border border-border text-muted hover:text-foreground hover:border-foreground transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-border/40 p-2">
          {error && (
            <div className="p-4 text-xs font-mono text-rose-400 border border-rose-900/40 bg-rose-950/10">
              {error}
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="p-8 text-center">
              <p className="font-mono text-xs text-muted uppercase tracking-widest">No matching biomedical entities found</p>
              <p className="text-xs text-foreground-muted mt-1">Try querying target genes (e.g., MTOR), drugs (Metformin), or diseases (Parkinson's).</p>
            </div>
          )}

          {results.map((result, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={`${result.type}-${result.id}-${idx}`}
                onClick={() => {
                  onSelectResult(result);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-l-2 ${
                  isSelected
                    ? "bg-background-subtle border-accent text-foreground"
                    : "border-transparent text-foreground-muted hover:bg-background-subtle/40"
                }`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground truncate">{result.title}</span>
                    {result.score !== undefined && (
                      <span className="font-mono text-[0.65rem] text-accent">
                        Score {Math.round(result.score * 100)}
                      </span>
                    )}
                  </div>
                  {result.subtitle && (
                    <p className="text-xs text-foreground-muted truncate mt-0.5">{result.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`font-mono text-[0.6rem] uppercase tracking-wider px-2 py-0.5 border rounded-sm ${getTypeBadgeStyle(
                      result.type
                    )}`}
                  >
                    {result.type}
                  </span>
                  <span className="font-mono text-xs text-muted select-none">↵</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-background-subtle/30 flex items-center justify-between font-mono text-[0.65rem] text-muted">
          <div className="flex items-center gap-4">
            <span><kbd className="px-1 py-0.5 border border-border text-foreground-muted">↑↓</kbd> NAVIGATE</span>
            <span><kbd className="px-1 py-0.5 border border-border text-foreground-muted">↵</kbd> SELECT</span>
            <span><kbd className="px-1 py-0.5 border border-border text-foreground-muted">ESC</kbd> CLOSE</span>
          </div>
          <span>BIOTECH ARBITRAGE ENGINE</span>
        </div>
      </div>
    </div>
  );
}
