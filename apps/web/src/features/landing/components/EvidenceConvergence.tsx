import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SOURCES = [
  "Papers",
  "Preprints",
  "Clinical Trials",
  "Mechanisms",
  "Conference Research",
] as const;

export function EvidenceConvergence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const sources = containerRef.current.querySelectorAll<HTMLElement>("[data-source]");
    const center = containerRef.current.querySelector<HTMLElement>("[data-center]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sources,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            end: "top 35%",
            scrub: 1,
          },
        },
      );

      if (center) {
        gsap.fromTo(
          center,
          { opacity: 0, scale: 0.85, filter: "blur(8px)" },
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 45%",
              end: "top 15%",
              scrub: 1,
            },
          },
        );
      }

      sources.forEach((source, i) => {
        const angle = (i / SOURCES.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 38;
        const cx = 50 + Math.cos(angle) * radius;
        const cy = 50 + Math.sin(angle) * radius;
        gsap.to(source, {
          left: `${cx}%`,
          top: `${cy}%`,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 55%",
            end: "top 20%",
            scrub: 1.5,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const initialPositions = [
    { x: 15, y: 20 },
    { x: 82, y: 15 },
    { x: 88, y: 70 },
    { x: 12, y: 75 },
    { x: 50, y: 8 },
  ];

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-square w-full max-w-xl border border-border-subtle bg-background-elevated/30 md:max-w-2xl"
      style={{ borderRadius: "2px" }}
    >
      <svg className="absolute inset-0 h-full w-full opacity-30" aria-hidden="true">
        <circle cx="50%" cy="50%" r="38%" fill="none" stroke="var(--color-border)" strokeWidth="0.5" strokeDasharray="4 6" />
      </svg>

      {SOURCES.map((source, i) => (
        <div
          key={source}
          data-source
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap border border-border bg-background-subtle/90 px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-wider text-foreground-muted md:px-3 md:py-2 md:text-[0.65rem]"
          style={{
            left: `${initialPositions[i].x}%`,
            top: `${initialPositions[i].y}%`,
            borderRadius: "2px",
          }}
        >
          {source}
        </div>
      ))}

      <div
        data-center
        className="absolute left-1/2 top-1/2 w-[70%] max-w-[220px] -translate-x-1/2 -translate-y-1/2 border border-accent/30 bg-background px-4 py-4 text-center md:px-6 md:py-5"
        style={{ borderRadius: "2px", opacity: reducedMotion ? 1 : 0 }}
      >
        <p className="section-label mb-1 text-accent">Signal</p>
        <p className="font-display text-base leading-snug text-foreground md:text-lg">
          Potential repurposing signal
        </p>
      </div>
    </div>
  );
}
