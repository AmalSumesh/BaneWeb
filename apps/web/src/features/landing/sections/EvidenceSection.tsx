import { EvidenceConvergence } from "../components/EvidenceConvergence";
import { SectionLabel } from "../components/SectionLabel";

export function EvidenceSection() {
  return (
    <section id="evidence" className="relative py-section">
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <EvidenceConvergence />

          <div className="lg:order-first">
            <SectionLabel>03 — Evidence convergence</SectionLabel>
            <h2 className="editorial-headline mt-6 max-w-[14ch] text-[clamp(2rem,4.5vw,3.5rem)]">
              Never just an inference.
            </h2>
            <p className="editorial-subhead mt-6">
              A potential repurposing signal emerges only when evidence converges — from literature,
              trials, mechanisms, and emerging research.
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
              Every signal is traceable. Every claim has a source. This is research intelligence,
              not speculation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
