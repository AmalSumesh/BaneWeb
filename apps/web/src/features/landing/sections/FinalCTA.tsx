import { BlurText } from "../components/BlurText";

interface FinalCTAProps {
  onNavigate?: (to: string) => void;
}

export function FinalCTA({ onNavigate }: FinalCTAProps) {
  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate("/pipeline");
    } else {
      window.location.href = "/pipeline";
    }
  };

  return (
    <section className="relative flex min-h-[70vh] items-center py-section">
      <div className="pointer-events-none absolute inset-0 cta-glow" aria-hidden="true" />

      <div className="section-container relative z-10 text-center">
        <h2 className="editorial-headline mx-auto max-w-[12ch]">
          <BlurText
            text="Follow the evidence."
            animateBy="words"
            delay={100}
            as="span"
            className="font-display block"
          />
        </h2>

        <p className="editorial-subhead mx-auto mt-8">
          Investigational relationships await systematic discovery. Begin where the evidence leads.
        </p>

        <div className="mt-12">
          <button type="button" className="btn-primary" onClick={handleNavigate}>
            Enter the research workspace
          </button>
        </div>
      </div>
    </section>
  );
}
