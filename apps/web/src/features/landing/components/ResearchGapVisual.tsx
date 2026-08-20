import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ResearchGapVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const left = containerRef.current.querySelector<HTMLElement>("[data-left]");
    const right = containerRef.current.querySelector<HTMLElement>("[data-right]");
    const gap = containerRef.current.querySelector<HTMLElement>("[data-gap]");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          end: "top 30%",
          scrub: 1,
        },
      });

      tl.fromTo(left, { height: "20%" }, { height: "75%" }, 0);
      tl.fromTo(right, { height: "15%" }, { height: "28%" }, 0);
      tl.fromTo(gap, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1 }, 0.5);
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-3xl">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 md:gap-8">
        <div className="flex flex-col items-center">
          <div className="relative flex h-48 w-full items-end justify-center border border-border-subtle bg-background-elevated/40 p-4 md:h-56">
            <div
              data-left
              className="w-full bg-biological/25"
              style={{ height: reducedMotion ? "75%" : "20%", borderRadius: "2px" }}
            />
          </div>
          <p className="mt-4 text-center text-sm text-foreground-muted">Strong evidence</p>
        </div>

        <div className="flex flex-col items-center justify-center pb-16 md:pb-20">
          <span className="font-display text-3xl text-muted md:text-4xl">+</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative flex h-48 w-full items-end justify-center border border-border-subtle bg-background-elevated/40 p-4 md:h-56">
            <div
              data-right
              className="w-full bg-accent/20"
              style={{ height: reducedMotion ? "28%" : "15%", borderRadius: "2px" }}
            />
          </div>
          <p className="mt-4 text-center text-sm text-foreground-muted">Limited research</p>
        </div>
      </div>

      <div
        data-gap
        className="mx-auto mt-10 max-w-md border border-signal/25 bg-background-subtle/60 px-6 py-5 text-center"
        style={{ borderRadius: "2px", opacity: reducedMotion ? 1 : 0 }}
      >
        <p className="section-label mb-2 text-signal">Evidence gap</p>
        <p className="font-display text-xl text-foreground md:text-2xl">
          High signal, low trial coverage
        </p>
      </div>
    </div>
  );
}
