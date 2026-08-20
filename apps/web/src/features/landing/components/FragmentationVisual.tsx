import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const FRAGMENTS = [
  { label: "Paper", x: 12, y: 18 },
  { label: "Trial", x: 78, y: 12 },
  { label: "Preprint", x: 85, y: 55 },
  { label: "Drug", x: 8, y: 62 },
  { label: "Disease", x: 72, y: 78 },
  { label: "Pathway", x: 42, y: 8 },
  { label: "Patent", x: 55, y: 88 },
] as const;

export function FragmentationVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const items = containerRef.current.querySelectorAll<HTMLElement>("[data-fragment]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0.3, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            end: "top 30%",
            scrub: 1,
          },
        },
      );

      items.forEach((item, i) => {
        const targetX = 38 + (i % 3) * 12;
        const targetY = 38 + Math.floor(i / 3) * 14;
        gsap.to(item, {
          left: `${targetX}%`,
          top: `${targetY}%`,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
            end: "bottom 30%",
            scrub: 1.2,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[4/3] w-full max-w-2xl border border-border-subtle bg-background-elevated/40 md:aspect-[16/10]"
      style={{ borderRadius: "2px" }}
    >
      <div className="absolute inset-0 opacity-20" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" className="scientific-line" strokeDasharray="2 4" />
          <line x1="50" y1="0" x2="50" y2="100" className="scientific-line" strokeDasharray="2 4" />
        </svg>
      </div>
      {FRAGMENTS.map((frag) => (
        <div
          key={frag.label}
          data-fragment
          className="absolute -translate-x-1/2 -translate-y-1/2 border border-border bg-background-subtle/80 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-wider text-foreground-muted backdrop-blur-sm md:px-4 md:py-2.5 md:text-xs"
          style={{ left: `${frag.x}%`, top: `${frag.y}%`, borderRadius: "2px" }}
        >
          {frag.label}
        </div>
      ))}
    </div>
  );
}
