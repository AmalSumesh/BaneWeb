import { ScoreVisualization } from "../components/ScoreVisualization";
import { SectionLabel } from "../components/SectionLabel";

export function SignalSection() {
  return (
    <section id="signal" className="relative border-y border-border-subtle bg-background-elevated/30 py-section">
      <div className="section-container">
        <SectionLabel>04 — Explainability</SectionLabel>
        <h2 className="editorial-headline mt-6 max-w-[16ch]">
          Why does this signal exist?
        </h2>
        <p className="editorial-subhead mt-6">
          Each factor contributes to a transparent research prioritization score — mechanistic
          plausibility, clinical data, literature support, novelty, and recency.
        </p>

        <div className="mt-14 md:mt-16">
          <ScoreVisualization />
        </div>
      </div>
    </section>
  );
}
