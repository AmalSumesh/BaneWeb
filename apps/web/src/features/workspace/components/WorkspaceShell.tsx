import { useState } from "react";
import { SearchCommand } from "./SearchCommand";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SearchResult } from "@biotech-arbitrage/types";

interface WorkspaceShellProps {
  currentPath: string;
  onNavigate: (to: string) => void;
  children: React.ReactNode;
}

export function WorkspaceShell({ currentPath, onNavigate, children }: WorkspaceShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const primaryNavItems = [
    { label: "NEW PIPELINE", path: "/pipeline" },
    { label: "DETAILS", path: "/workspace/details" },
    { label: "RELATIONS", path: "/pipeline/relations" },
    { label: "EVIDENCE", path: "/pipeline/evidence" },
    { label: "SCOPE", path: "/pipeline/repurposing" },
    { label: "GRAPH", path: "/workspace/explore" },
    { label: "EXPLANATION", path: "/workspace/explanation" },
    { label: "DISPENSARIES", path: "/workspace/dispensaries" },
  ];

  const handleSelectSearchResult = (result: SearchResult) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("active_drug_id", result.id);
    }
    switch (result.type) {
      case "signal":
        onNavigate(`/workspace/signals/${result.id}`);
        break;
      case "drug":
        onNavigate(`/workspace/details/${result.id}`);
        break;
      case "disease":
        onNavigate(`/workspace/entities/disease/${result.id}`);
        break;
      case "paper":
        onNavigate(`/workspace/entities/paper/${result.id}`);
        break;
      case "symptom":
        onNavigate(`/workspace/evidence?q=${encodeURIComponent(result.title)}`);
        break;
      case "trial":
      case "patent":
      default:
        onNavigate(`/workspace/evidence?q=${encodeURIComponent(result.title)}`);
        break;
    }
  };

  const handleBackToLanding = () => {
    onNavigate("/");
  };

  const formatBreadcrumb = () => {
    if (currentPath === "/workspace" || currentPath === "/workspace/signals") return "WORKSPACE / DRUG DETAILS";
    if (currentPath.startsWith("/workspace/signals/")) return "WORKSPACE / DRUG DETAILS / DOSSIER";
    if (currentPath.startsWith("/workspace/drugs/")) return "WORKSPACE / DRUG DETAILS / DOSSIER";
    if (currentPath.startsWith("/workspace/opportunities") || currentPath.startsWith("/pipeline/relations")) return "WORKSPACE / RELATIONS";
    if (currentPath.startsWith("/workspace/evidence") || currentPath.startsWith("/pipeline/evidence")) return "WORKSPACE / EVIDENCE STREAMS";
    if (currentPath.startsWith("/pipeline/repurposing") || currentPath.startsWith("/workspace/scope")) return "WORKSPACE / REPURPOSING SCOPE";
    if (currentPath.startsWith("/workspace/explore") || currentPath.startsWith("/pipeline/graph")) return "WORKSPACE / GRAPH";
    if (currentPath.startsWith("/workspace/explanation") || currentPath.startsWith("/workspace/projects")) return "WORKSPACE / AI EXPLANATION & RAG";
    if (currentPath.startsWith("/workspace/dispensaries")) return "WORKSPACE / DISPENSARIES & LOCALITIES";
    if (currentPath.startsWith("/workspace/alerts")) return "WORKSPACE / ALERTS FEED";
    if (currentPath.startsWith("/workspace/saved")) return "WORKSPACE / SAVED ITEMS";
    return "WORKSPACE";
  };

  const isSearchingOrRetrieving =
    currentPath === "/pipeline" || currentPath.startsWith("/pipeline/status");

  const visiblePrimaryNavItems = isSearchingOrRetrieving
    ? primaryNavItems.filter((item) => item.path === "/pipeline")
    : primaryNavItems;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-accent/20 selection:text-foreground">
      {/* Top Header with Orange Accent Border */}
      <header className="sticky top-0 z-40 bg-background-elevated/95 backdrop-blur-md border-b border-border border-b-amber-500/30">
        {/* Status bar */}
        <div className="border-b border-border-subtle bg-background-subtle/80 px-4 md:px-8 py-1.5 flex items-center justify-between text-[0.65rem] font-mono text-muted">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-foreground-muted">{formatBreadcrumb()}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] text-muted hidden sm:inline">BIOTECH ARBITRAGE ENGINE</span>
            <span className="text-border">|</span>
            <button
              onClick={handleBackToLanding}
              className="px-3 py-1 border border-amber-500/60 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 transition-all font-mono text-[0.65rem] uppercase tracking-wider flex items-center gap-2 rounded-sm font-semibold shadow-sm"
              title="Return to Landing Page"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>LANDING PAGE</span>
            </button>
          </div>
        </div>

        {/* Primary Navbar */}
        <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("/workspace/signals")}
              className="text-left group flex items-center gap-3"
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-7 h-7 object-contain rounded-sm shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div>
                <div className="font-mono text-xs tracking-[0.2em] text-foreground uppercase group-hover:text-amber-400 transition-colors flex items-center gap-2">
                  <span>Biotech Arbitrage</span>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-none inline-block" />
                </div>
                <div className="font-mono text-[0.6rem] text-muted tracking-wider uppercase">
                  Research Instrument
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-background-subtle/70 p-1 border border-border rounded-sm">
            <button
              onClick={() => onNavigate("/pipeline")}
              className="font-mono text-[0.7rem] uppercase px-3 py-1.5 text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-2 border-r border-border/50"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>SEARCH</span>
              <kbd className="text-[0.6rem] border border-amber-500/40 px-1 py-0.2 rounded text-amber-300">⌘K</kbd>
            </button>

            {visiblePrimaryNavItems.map((item) => {
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
              return (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`font-mono text-[0.7rem] uppercase px-3 py-1.5 tracking-wider transition-colors ${isActive
                      ? "bg-background-elevated text-foreground border border-amber-500/40 shadow-sm"
                      : "text-foreground-muted hover:text-foreground hover:bg-background-elevated/40"
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Search Trigger Button (Mobile) */}
            <button
              onClick={() => onNavigate("/pipeline")}
              className="lg:hidden font-mono text-xs px-3 py-1.5 border border-border text-foreground-muted hover:text-foreground hover:border-amber-500 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>SEARCH</span>
              <kbd className="text-[0.65rem] border border-border px-1">⌘K</kbd>
            </button>

            {/* Theme Toggle placed cleanly on the far right */}
            <ThemeToggle />

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden font-mono text-xs px-2.5 py-1.5 border border-border text-foreground-muted"
            >
              {isMobileMenuOpen ? "CLOSE" : "MENU"}
            </button>
          </div>
        </div>

        {/* Mobile Expanded Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background-elevated p-4 flex flex-col gap-2 font-mono text-xs">
            {visiblePrimaryNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-2 px-3 border border-border/40 hover:border-amber-500 text-foreground-muted hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Workspace Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6">
        {children}
      </main>

      {/* Scientific Footer Disclaimer */}
      <footer className="border-t border-border-subtle py-4 px-4 md:px-8 bg-background-subtle/30 text-muted font-mono text-[0.65rem] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-amber-500" />
          <span>BIOTECH ARBITRAGE ENGINE // RESEARCH INSTRUMENT</span>
        </div>
        <div>PRECISION PRIORITIZATION SCORE // RESEARCH INTELLIGENCE ONLY</div>
      </footer>

      {/* Search Modal */}
      <SearchCommand
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />
    </div>
  );
}
