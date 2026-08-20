/**
 * Adapted from React Bits ScrollReveal (TS-TW)
 * https://reactbits.dev/text-animations/scroll-reveal
 */
import { type ReactNode, type RefObject, useEffect, useMemo, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

export function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 2,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="word inline-block" key={`${word}-${index}`}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef?.current ? scrollContainerRef.current : window;
    const triggers: ScrollTrigger[] = [];

    const rotTween = gsap.fromTo(
      el,
      { transformOrigin: "0% 50%", rotate: baseRotation },
      {
        ease: "none",
        rotate: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom",
          end: rotationEnd,
          scrub: true,
        },
      },
    );
    if (rotTween.scrollTrigger) triggers.push(rotTween.scrollTrigger);

    const wordElements = el.querySelectorAll<HTMLElement>(".word");

    const opacityTween = gsap.fromTo(
      wordElements,
      { opacity: baseOpacity, willChange: "opacity" },
      {
        ease: "none",
        opacity: 1,
        stagger: 0.05,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom-=20%",
          end: wordAnimationEnd,
          scrub: true,
        },
      },
    );
    if (opacityTween.scrollTrigger) triggers.push(opacityTween.scrollTrigger);

    if (enableBlur) {
      const blurTween = gsap.fromTo(
        wordElements,
        { filter: `blur(${blurStrength}px)` },
        {
          ease: "none",
          filter: "blur(0px)",
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: "top bottom-=20%",
            end: wordAnimationEnd,
            scrub: true,
          },
        },
      );
      if (blurTween.scrollTrigger) triggers.push(blurTween.scrollTrigger);
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationEnd,
    blurStrength,
    reducedMotion,
  ]);

  if (reducedMotion && typeof children === "string") {
    return <div className={`${containerClassName} ${textClassName}`}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`my-4 ${containerClassName}`}>
      <div className={`${textClassName}`}>{splitText}</div>
    </div>
  );
}
