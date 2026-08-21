import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface KnowledgeGraphProps {
  onNavigate: (to: string) => void;
}

export function KnowledgeGraph({ onNavigate }: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGraphData() {
      try {
        const res = await api.getPipelineGraph();
        if (res.nodes && res.nodes.length > 0) {
          const mappedNodes: GraphNode[] = res.nodes.map((n, idx) => {
            const rawType = String(n.type ?? "unknown").toLowerCase();
            const type = rawType === "chemical" ? "drug" : rawType === "protein" || rawType === "gene" ? "target" : rawType;
            const label = String(n.label ?? n.name ?? n.id ?? "Unknown entity");
            const isCenter = idx === 0;
            const angle = ((idx - 1) / Math.max(res.nodes.length - 1, 1)) * Math.PI * 2 - Math.PI / 2;
            return {
              id: String(n.id ?? n.name ?? `node-${idx}`),
              type,
              label,
              sublabel: n.sublabel ? String(n.sublabel) : undefined,
              x: typeof n.x === "number" ? n.x : isCenter ? 500 : 500 + Math.cos(angle) * 275,
              y: typeof n.y === "number" ? n.y : isCenter ? 250 : 250 + Math.sin(angle) * 165,
            };
          });

          const seenEdgeKeys = new Set<string>();
          const mappedEdges: GraphEdge[] = [];
          for (const [idx, e] of res.edges.entries()) {
            const src = String(e.source ?? "").trim();
            const tgt = String(e.target ?? "").trim();
            const rel = String(e.relationship ?? e.relation ?? "related_to").trim();
            const edgeKey = `${src.toLowerCase()}::${rel.toLowerCase()}::${tgt.toLowerCase()}`;
            if (!seenEdgeKeys.has(edgeKey)) {
              seenEdgeKeys.add(edgeKey);
              mappedEdges.push({
                id: String(e.id ?? `edge-${idx}`),
                source: src,
                target: tgt,
                label: rel,
              });
            }
          }

          setNodes(mappedNodes);
          setEdges(mappedEdges);
          setSelectedNodeId(mappedNodes[0]?.id ?? null);
        } else {
          setError("The pipeline has not produced a knowledge graph yet. Run a pipeline query first.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load the generated pipeline graph");
      } finally {
        setLoading(false);
      }
    }
    loadGraphData();
  }, []);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("drug-metformin");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return [];
    return edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId);
  }, [edges, selectedNodeId]);

  const filteredNodes = useMemo(() => {
    if (typeFilter === "ALL") return nodes;
    return nodes.filter((n) => n.type === typeFilter);
  }, [nodes, typeFilter]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "drug":
        return "#38bdf8"; // sky
      case "target":
        return "#a78bfa"; // purple
      case "pathway":
        return "#34d399"; // emerald
      case "disease":
        return "#fbbf24"; // amber
      case "trial":
        return "#818cf8"; // indigo
      case "paper":
        return "#f472b6"; // pink
      case "patent":
        return "#fb7185"; // rose
      default:
        return "#94a3b8";
    }
  };

  if (loading) {
    return <div className="py-20 text-center font-mono text-xs text-accent uppercase">Loading generated pipeline graph...</div>;
  }

  if (error) {
    return <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">[GRAPH_ERROR] {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            05 // KNOWLEDGE GRAPH • TOPOLOGY VISUALIZER
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">
            Biological Relationship Explorer
          </h1>
          <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
            Multi-tier interactive topology: Drug → Target → Pathway → Disease → Evidence.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="px-3 py-1.5 border border-border bg-background-elevated hover:bg-background-subtle text-foreground"
          >
            ZOOM +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
            className="px-3 py-1.5 border border-border bg-background-elevated hover:bg-background-subtle text-foreground"
          >
            ZOOM -
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="px-3 py-1.5 border border-border bg-background-elevated hover:bg-background-subtle text-muted hover:text-foreground"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-3 border border-border bg-background-elevated/60 flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-muted text-[0.65rem] uppercase">FILTER ENTITY:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-transparent text-foreground outline-none text-xs uppercase"
          >
            <option value="ALL" className="bg-background-elevated">ALL ENTITIES</option>
            <option value="drug" className="bg-background-elevated">DRUGS</option>
            <option value="target" className="bg-background-elevated">TARGETS</option>
            <option value="pathway" className="bg-background-elevated">PATHWAYS</option>
            <option value="disease" className="bg-background-elevated">DISEASES</option>
            <option value="paper" className="bg-background-elevated">PAPERS</option>
            <option value="trial" className="bg-background-elevated">TRIALS</option>
          </select>
        </div>

        <div className="text-muted text-[0.65rem]">CLICK NODE TO INSPECT RELATIONSHIPS</div>
      </div>

      {/* Graph Area & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Interactive Canvas */}
        <div
          className="lg:col-span-3 h-[470px] border border-[#1d2940] bg-[#0b1120] rounded-sm relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background grid lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#28456b_1px,transparent_1px)] bg-[size:28px_28px]" />

          <svg className="w-full h-full" viewBox="0 0 1000 550" preserveAspectRatio="xMidYMid meet">
            <defs>
              <marker id="graph-arrow" markerWidth="10" markerHeight="10" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L8,4 L0,8 z" fill="#536dff" />
              </marker>
            </defs>
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isConnected =
                  selectedNodeId && (edge.source === selectedNodeId || edge.target === selectedNodeId);

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isConnected ? "#536dff" : "#344273"}
                      strokeWidth={isConnected ? 2 : 1.2}
                      strokeOpacity={isConnected ? 1 : 0.72}
                      markerEnd="url(#graph-arrow)"
                    />
                    {/* Edge Label */}
                    {edge.label && (
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2 - 6}
                        fill={isConnected ? "#b5c2ff" : "#8290bd"}
                        fontSize="13"
                        fontFamily="IBM Plex Sans, sans-serif"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const color = node.type === "drug" ? "#12b8d1" : node.type === "disease" ? "#f43f5e" : getNodeColor(node.type);
                const isCenter = node.id === nodes[0]?.id;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                    }}
                    className="cursor-pointer"
                  >
                    {/* Outer Glow Circle */}
                    <circle
                      r={isCenter ? 46 : isSelected ? 31 : 27}
                      fill={color}
                      fillOpacity={isCenter ? 0.95 : 0.95}
                      stroke={color}
                      strokeWidth={isSelected ? 3 : 1.5}
                    />

                    {/* Label */}
                    <text
                      y={isCenter ? 76 : 52}
                      fill="#f4f5fb"
                      fontSize={isCenter ? "21" : "17"}
                      fontFamily="IBM Plex Sans, sans-serif"
                      fontWeight={isCenter || isSelected ? "600" : "400"}
                      textAnchor="middle"
                    >
                      {node.label}
                    </text>

                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Details Sidebar */}
        <div className="p-5 border border-border bg-background-elevated/70 rounded-sm font-mono text-xs space-y-4">
          <div className="text-accent text-[0.65rem] uppercase tracking-widest border-b border-border pb-2">
            [SELECTED_ENTITY_INSPECTOR]
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="text-[0.6rem] text-muted uppercase">TYPE: {selectedNode.type}</span>
                <h3 className="text-base font-semibold text-foreground font-sans mt-0.5">{selectedNode.label}</h3>
                {selectedNode.sublabel && <p className="text-xs text-foreground-muted">{selectedNode.sublabel}</p>}
              </div>

              <div className="pt-3 border-t border-border/40 space-y-2">
                <div className="text-[0.65rem] text-accent uppercase font-semibold">
                  CONNECTED RELATIONSHIPS ({connectedEdges.length})
                </div>
                {connectedEdges.length === 0 ? (
                  <p className="text-[0.65rem] text-muted">No direct links highlighted.</p>
                ) : (
                  connectedEdges.map((e) => {
                    const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                    const otherNode = nodes.find((n) => n.id === otherNodeId);
                    return (
                      <div key={e.id} className="p-2 border border-border/60 bg-background-subtle text-[0.65rem] space-y-0.5">
                        <div className="text-accent">{e.label || "CONNECTED TO"}</div>
                        <div className="text-foreground font-sans font-medium">{otherNode?.label}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => onNavigate("/workspace/projects")}
                className="w-full py-2 border border-accent text-accent hover:bg-accent-glow transition-colors text-[0.7rem] uppercase font-mono"
              >
                RAG EXPLANATION →
              </button>
            </div>
          ) : (
            <div className="text-muted text-xs py-8 text-center">Select any node on the graph canvas to inspect.</div>
          )}
        </div>
      </div>
    </div>
  );
}
