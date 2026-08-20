import { ScrollReveal } from "../components/ScrollReveal";
import { SectionLabel } from "../components/SectionLabel";
import { FragmentationVisual } from "../components/FragmentationVisual";

export function FragmentationSection() {
  return (
    <section id="problem" className="relative py-section">
      <div className="section-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionLabel>01 — The problem</SectionLabel>
            <h2 className="editorial-headline mt-6 max-w-[14ch] text-[clamp(2rem,4.5vw,3.5rem)]">
              Biomedical evidence is everywhere.
            </h2>
            <ScrollReveal
              containerClassName="mt-8"
              textClassName="editorial-subhead !max-w-none text-foreground-muted"
              baseRotation={1}
              blurStrength={3}
            >
              Papers, preprints, trials, patents, and biological databases grow faster than any
              researcher can synthesize. Each source holds a fragment of truth.
            </ScrollReveal>
            <h3 className="mt-10 font-display text-2xl text-foreground md:text-3xl">
              But the connection between it is not.
            </h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              Drug-disease relationships remain buried across disconnected evidence layers — waiting
              for systematic investigation.
            </p>
          </div>

          <FragmentationVisual />
        </div>
      </div>
    </section>
  );
}
