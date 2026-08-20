import { ConnectionFlow } from "../components/ConnectionFlow";
import { SectionLabel } from "../components/SectionLabel";

export function ConnectionSection() {
  return (
    <section id="connection" className="relative bg-background-subtle/50">
      <div className="section-container pt-section md:absolute md:left-0 md:right-0 md:top-0 md:z-10">
        <SectionLabel>02 — The connection</SectionLabel>
        <h2 className="editorial-headline mt-6 max-w-[18ch] text-[clamp(2rem,4.5vw,3.25rem)]">
          From molecule to mechanism to disease.
        </h2>
        <p className="editorial-subhead mt-6 pb-8 md:pb-0">
          Investigational relationships trace a path through biological systems — not a single data
          point, but a chain of evidence.
        </p>
      </div>
      <ConnectionFlow />
    </section>
  );
}
