import { motion } from "motion/react";

const GRAPH_NODES = [
  { id: "drug", label: "Metformin", x: 18, y: 50 },
  { id: "target", label: "AMPK", x: 38, y: 30 },
  { id: "pathway", label: "Mitophagy", x: 58, y: 50 },
  { id: "disease", label: "Parkinson's", x: 78, y: 30 },
] as const;

export function WorkspaceMock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden border border-border bg-background-elevated"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 md:px-6">
        <div className="h-2 w-2 rounded-full bg-border" />
        <div className="h-2 w-2 rounded-full bg-border" />
        <div className="h-2 w-2 rounded-full bg-border" />
        <span className="ml-3 font-mono text-[0.6rem] uppercase tracking-wider text-muted">
          Research workspace
        </span>
      </div>

      <div className="grid gap-px bg-border-subtle md:grid-cols-[240px_1fr]">
        <aside className="space-y-4 bg-background p-5 md:p-6">
          <div>
            <p className="section-label mb-2">Relationship</p>
            <p className="text-sm text-foreground">Metformin → Parkinson&apos;s</p>
          </div>
          <div>
            <p className="section-label mb-2">Score</p>
            <p className="font-display text-4xl text-foreground">68</p>
            <p className="mt-1 text-xs text-muted">Prioritization index</p>
          </div>
          <div>
            <p className="section-label mb-2">Research gap</p>
            <p className="text-xs leading-relaxed text-foreground-muted">
              Underpowered clinical trials; mechanistic evidence exceeds observational support.
            </p>
          </div>
        </aside>

        <div className="space-y-4 bg-background p-5 md:p-6">
          <div className="border border-border-subtle p-4" style={{ borderRadius: "2px" }}>
            <p className="section-label mb-3">Knowledge graph</p>
            <svg viewBox="0 0 100 60" className="h-28 w-full md:h-32" aria-hidden="true">
              {GRAPH_NODES.slice(0, -1).map((node, i) => {
                const next = GRAPH_NODES[i + 1];
                return (
                  <line
                    key={`line-${node.id}`}
                    x1={node.x}
                    y1={node.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="var(--color-border)"
                    strokeWidth="0.5"
                  />
                );
              })}
              {GRAPH_NODES.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="2.5" fill="var(--color-accent)" opacity="0.8" />
                  <text
                    x={node.x}
                    y={node.y + 8}
                    textAnchor="middle"
                    fill="var(--color-foreground-muted)"
                    fontSize="3.5"
                    fontFamily="var(--font-mono)"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border border-border-subtle p-3" style={{ borderRadius: "2px" }}>
              <p className="section-label mb-2">Evidence</p>
              <p className="text-xs text-foreground-muted">3 supporting · 1 contradicting</p>
            </div>
            <div className="border border-border-subtle p-3" style={{ borderRadius: "2px" }}>
              <p className="section-label mb-2">Papers</p>
              <p className="text-xs text-foreground-muted">12 indexed · 2 recent</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
