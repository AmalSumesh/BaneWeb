import { useEffect } from "react";
import { BlurText } from "../components/BlurText";
import { MolecularCanvas } from "../components/MolecularCanvas";

interface HeroSectionProps {
  onNavigate?: (to: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  useEffect(() => {
    document.title = "Biotech Arbitrage Engine";
  }, []);

  const scrollToHow = () => {
    document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToWorkspace = () => {
    if (onNavigate) {
      onNavigate("/pipeline");
      return;
    }
    document.getElementById("workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden">
      <MolecularCanvas className="opacity-60" />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 hero-glow"
        aria-hidden="true"
      />

      <div className="section-container relative z-10 py-section">
        <div className="max-w-4xl">
          <p className="section-label mb-8 md:mb-10">Biotech Arbitrage Engine</p>

          <h1 className="editorial-headline max-w-[16ch]">
            <BlurText
              text="Therapeutic possibilities are hidden in the evidence."
              animateBy="words"
              delay={80}
              stepDuration={0.4}
              as="span"
              className="font-display block text-left"
            />
          </h1>

          <p className="editorial-subhead mt-8 md:mt-10">
            A research intelligence system that connects fragmented biomedical evidence — drugs,
            diseases, pathways, trials, and papers — to surface investigational repurposing signals.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-12">
            <button type="button" className="btn-primary" onClick={scrollToWorkspace}>
              Explore the evidence
            </button>
            <button type="button" className="btn-ghost" onClick={scrollToHow}>
              See how it works
            </button>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 md:block"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[0.6rem] uppercase tracking-widest text-muted">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-muted/50 to-transparent" />
        </div>
      </div>
    </section>
  );
}
