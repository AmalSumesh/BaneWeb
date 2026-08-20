import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FACTORS = [
  { label: "Mechanistic evidence", value: 74, weight: 0.3 },
  { label: "Clinical evidence", value: 42, weight: 0.2 },
  { label: "Literature evidence", value: 71, weight: 0.25 },
  { label: "Novelty", value: 61, weight: 0.15 },
  { label: "Recency", value: 79, weight: 0.1 },
] as const;

const OVERALL = 68;

export function ScoreVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const bars = containerRef.current.querySelectorAll<HTMLElement>("[data-bar]");
    const score = containerRef.current.querySelector<HTMLElement>("[data-score]");

    const ctx = gsap.context(() => {
      bars.forEach((bar, i) => {
        const fill = bar.querySelector<HTMLElement>("[data-fill]");
        if (!fill) return;
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 85%",
              end: "top 60%",
              scrub: 1,
            },
            delay: i * 0.05,
          },
        );
      });

      if (score) {
        gsap.fromTo(
          score,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 55%",
              end: "top 35%",
              scrub: 1,
            },
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="grid gap-10 lg:grid-cols-[1fr_200px] lg:items-center lg:gap-16">
      <div className="space-y-5">
        {FACTORS.map((factor) => (
          <div key={factor.label} data-bar className="space-y-2">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-foreground-muted">{factor.label}</span>
              <span className="font-mono text-xs text-muted">
                {factor.value}
                <span className="text-muted/60"> · w{factor.weight}</span>
              </span>
            </div>
            <div className="h-px w-full overflow-hidden bg-border">
              <div
                data-fill
                className="h-full origin-left bg-accent/70"
                style={{
                  width: `${factor.value}%`,
                  transform: reducedMotion ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        data-score
        className="flex flex-col items-center justify-center border border-border bg-background-elevated/50 p-8 md:p-10"
        style={{ borderRadius: "2px", opacity: reducedMotion ? 1 : 0 }}
      >
        <p className="section-label mb-3">Prioritization</p>
        <p className="font-display text-6xl leading-none text-foreground md:text-7xl">{OVERALL}</p>
        <p className="mt-3 max-w-[14ch] text-center text-xs leading-relaxed text-muted">
          Research prioritization score — not a treatment probability
        </p>
        <svg className="mt-6 h-24 w-24" viewBox="0 0 100 100" aria-hidden="true">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="0.5"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="1"
            strokeDasharray={`${OVERALL * 2.64} 264`}
            strokeLinecap="square"
            transform="rotate(-90 50 50)"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}
