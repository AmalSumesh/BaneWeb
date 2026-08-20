import { WorkspaceMock } from "../components/WorkspaceMock";
import { SectionLabel } from "../components/SectionLabel";

export function WorkspacePreview() {
  return (
    <section id="workspace" className="relative border-t border-border-subtle bg-background-subtle/40 py-section">
      <div className="section-container">
        <SectionLabel>06 — Research workspace</SectionLabel>
        <h2 className="editorial-headline mt-6 max-w-[16ch]">
          From signal to investigation.
        </h2>
        <p className="editorial-subhead mt-6">
          Trace drug-disease relationships through evidence, scores, knowledge graphs, and research
          gaps — in a workspace built for biomedical researchers.
        </p>

        <div className="mt-12 md:mt-16">
          <WorkspaceMock />
        </div>
      </div>
    </section>
  );
}
