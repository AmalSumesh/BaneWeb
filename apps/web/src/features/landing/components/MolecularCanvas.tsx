import { useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function createNodes(count: number, width: number, height: number): Node[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    radius: 2.5 + Math.random() * 3, // slightly larger floating bubbles
  }));
}

function readCanvasColors(theme: string) {
  if (theme === "light") {
    return {
      accentRgb: "245, 158, 11", // Vibrant Orange/Amber RGB for connection lines
      foregroundRgb: "234, 88, 12", // Rich Orange RGB for floating bubbles
    };
  }
  const style = getComputedStyle(document.documentElement);
  return {
    accentRgb: style.getPropertyValue("--color-accent-rgb").trim() || "91, 141, 239",
    foregroundRgb: style.getPropertyValue("--color-foreground-rgb").trim() || "232, 232, 236",
  };
}

export function MolecularCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let nodes: Node[] = [];
    let colors = readCanvasColors(theme);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const { width, height } = parent.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = createNodes(width < 768 ? 22 : 36, width, height);
      colors = readCanvasColors(theme);
    };

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      if (!reducedMotion) {
        nodes.forEach((node) => {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        });
      }

      const maxDist = width < 768 ? 110 : 150;
      const lineAlphaScale = theme === "light" ? 0.35 : 0.18;
      const nodeAlpha = theme === "light" ? 0.75 : 0.35;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * lineAlphaScale;
            ctx.strokeStyle = `rgba(${colors.accentRgb}, ${alpha})`;
            ctx.lineWidth = theme === "light" ? 1 : 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.foregroundRgb}, ${nodeAlpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, theme]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
