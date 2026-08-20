import { ResearchGapVisual } from "../components/ResearchGapVisual";
import { SectionLabel } from "../components/SectionLabel";

export function ResearchGapSection() {
  return (
    <section id="gaps" className="relative py-section">
      <div className="section-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionLabel>05 — Research gaps</SectionLabel>
          <h2 className="editorial-headline mt-6">
            Where evidence outpaces inquiry.
          </h2>
          <p className="editorial-subhead mx-auto mt-6">
            The most compelling opportunities often sit at the intersection of strong mechanistic
            evidence and limited clinical investigation.
          </p>
        </div>

        <div className="mt-14 md:mt-20">
          <ResearchGapVisual />
        </div>

        <p className="mx-auto mt-12 max-w-lg text-center text-sm leading-relaxed text-muted">
          Strong evidence + limited research = a potential evidence gap worth investigating.
        </p>
      </div>
    </section>
  );
}
