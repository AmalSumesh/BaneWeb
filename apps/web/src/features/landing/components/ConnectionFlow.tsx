import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const STEPS = [
  { id: "drug", label: "Drug", sub: "Metformin" },
  { id: "target", label: "Target", sub: "AMPK" },
  { id: "pathway", label: "Pathway", sub: "Energy metabolism" },
  { id: "disease", label: "Disease", sub: "Parkinson's" },
] as const;

export function ConnectionFlow() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const steps = sectionRef.current.querySelectorAll<HTMLElement>("[data-step]");
    const lines = sectionRef.current.querySelectorAll<SVGElement>("[data-line]");

    const ctx = gsap.context(() => {
      if (isMobile) {
        steps.forEach((step, i) => {
          gsap.fromTo(
            step,
            { opacity: 0.15, y: 16 },
            {
              opacity: 1,
              y: 0,
              scrollTrigger: {
                trigger: step,
                start: "top 85%",
                end: "top 60%",
                scrub: 0.5,
              },
              delay: i * 0.1,
            },
          );
          if (lines[i]) {
            gsap.fromTo(
              lines[i],
              { opacity: 0 },
              {
                opacity: 0.6,
                scrollTrigger: {
                  trigger: step,
                  start: "top 80%",
                  end: "top 55%",
                  scrub: 0.5,
                },
              },
            );
          }
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      steps.forEach((step, i) => {
        tl.fromTo(
          step,
          { opacity: 0.15, y: 24, filter: "blur(4px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 1 },
          i * 0.8,
        );
        if (lines[i]) {
          tl.fromTo(
            lines[i],
            { strokeDashoffset: 100, opacity: 0 },
            { strokeDashoffset: 0, opacity: 0.6, duration: 0.6 },
            i * 0.8 + 0.4,
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={sectionRef}
      className="relative flex min-h-0 items-center justify-center md:min-h-screen"
    >
      <div className="section-container relative w-full py-section">
        <div className="relative mx-auto flex max-w-md flex-col items-center gap-0 md:max-w-lg">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex w-full flex-col items-center">
              <div
                data-step
                className="w-full border border-border bg-background-elevated/60 px-6 py-5 text-center backdrop-blur-sm md:px-8 md:py-6"
                style={{ borderRadius: "2px", opacity: reducedMotion ? 1 : 0.15 }}
              >
                <p className="section-label mb-2">{step.label}</p>
                <p className="font-display text-2xl text-foreground md:text-3xl">{step.sub}</p>
              </div>
              {i < STEPS.length - 1 && (
                <svg
                  width="2"
                  height="48"
                  viewBox="0 0 2 48"
                  className="my-1 shrink-0"
                  aria-hidden="true"
                >
                  <line
                    data-line
                    x1="1"
                    y1="0"
                    x2="1"
                    y2="48"
                    stroke="var(--color-accent)"
                    strokeWidth="1"
                    strokeDasharray="100"
                    strokeDashoffset={reducedMotion ? 0 : 100}
                    opacity={reducedMotion ? 0.6 : 0}
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
