import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { initGsap } from "@/lib/gsap";
import { GrainOverlay } from "./components/GrainOverlay";
import { HeroSection } from "./sections/HeroSection";
import { FragmentationSection } from "./sections/FragmentationSection";
import { ConnectionSection } from "./sections/ConnectionSection";
import { EvidenceSection } from "./sections/EvidenceSection";
import { SignalSection } from "./sections/SignalSection";
import { ResearchGapSection } from "./sections/ResearchGapSection";
import { WorkspacePreview } from "./sections/WorkspacePreview";
import { FinalCTA } from "./sections/FinalCTA";

interface LandingPageProps {
  onNavigate?: (to: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  useEffect(() => {
    initGsap();
  }, []);

  const handleEnterWorkspace = () => {
    if (onNavigate) {
      onNavigate("/pipeline");
    } else {
      window.location.href = "/pipeline";
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      <GrainOverlay />

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-transparent bg-background-elevated/70 backdrop-blur-md">
        <div className="section-container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-6 h-6 object-contain rounded-sm shrink-0"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground-muted">
              Biotech Arbitrage
            </span>
            <span className="hidden font-mono text-[0.6rem] uppercase tracking-wider text-muted sm:inline">
              | Research Intelligence
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              onClick={handleEnterWorkspace}
              className="font-mono text-[0.68rem] uppercase tracking-wider px-3.5 py-1.5 border border-accent text-accent hover:bg-accent-glow transition-all flex items-center gap-2 rounded-sm shadow-sm"
            >
              <span>ENTER WORKSPACE</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <HeroSection onNavigate={onNavigate} />
        <div className="section-breaker" />
        <FragmentationSection />
        <div className="section-breaker" />
        <ConnectionSection />
        <div className="section-breaker" />
        <EvidenceSection />
        <div className="section-breaker" />
        <SignalSection />
        <div className="section-breaker" />
        <ResearchGapSection />
        <div className="section-breaker" />
        <WorkspacePreview />
        <div className="section-breaker" />
        <FinalCTA onNavigate={onNavigate} />
      </main>

      <footer className="border-t border-border-subtle py-8">
        <div className="section-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-mono text-[0.6rem] uppercase tracking-wider text-muted">
            © 2026 Biotech Arbitrage Engine
          </p>
          <p className="max-w-xs text-center text-xs text-muted sm:text-right">
            Research intelligence only. Not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
