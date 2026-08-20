import { useRouter } from "@/hooks/useRouter";
import { WorkspaceShell } from "./components/WorkspaceShell";
import { SignalsView } from "./views/SignalsView";
import { SignalDetail } from "./views/SignalDetail";
import { KnowledgeGraph } from "./views/KnowledgeGraph";
import { RagExplanationView } from "./views/RagExplanationView";
import { HypothesisView } from "./views/HypothesisView";
import { AlertsView } from "./views/AlertsView";
import { SavedView } from "./views/SavedView";
import { DispensariesView } from "./views/DispensariesView";
import { EntityDetailView } from "./views/EntityDetailView";
import { PipelineEvidenceView, PipelineRelationsView, PipelineRepurposingView } from "@/features/pipeline/PipelineFlow";
import {
  ConnectionExplanationView,
  DrugOverviewView,
  MonitorResearchView,
  NewResearchAlertView,
  ScoreBreakdownView,
} from "./views/ResearchFlowViews";

export function WorkspacePage() {
  const { path, navigate } = useRouter();

  // Helper parser for route params
  const parseSignalId = () => {
    const match = path.match(/\/workspace\/signals\/([^/]+)/);
    return match ? match[1] : null;
  };

  const parseHypothesisRoute = () => {
    const match = path.match(/\/workspace\/projects\/([^/]+)\/hypotheses\/([^/]+)/);
    return match ? { projectId: match[1], hypothesisId: match[2] } : null;
  };

  const parseEntityRoute = () => {
    const match = path.match(/\/workspace\/entities\/(drug|disease|paper|evidence)\/([^/]+)/);
    return match ? { entityType: match[1] as "drug" | "disease" | "paper" | "evidence", entityId: match[2] } : null;
  };

  const parseFlowRoute = () => {
    const drug = path.match(/\/workspace\/(?:drugs|details)\/([^/]+)/);
    if (drug) return { kind: "drug", id: drug[1] } as const;
    const signal = path.match(/\/workspace\/(connections|explanations|scores)\/([^/]+)/);
    if (signal) return { kind: signal[1], id: signal[2] } as const;
    return null;
  };

  const parseSearchParam = (paramName: string) => {
    if (typeof window === "undefined") return undefined;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName) || undefined;
  };

  const signalId = parseSignalId();
  const hypothesisRoute = parseHypothesisRoute();
  const entityRoute = parseEntityRoute();
  const flowRoute = parseFlowRoute();

  const renderCurrentView = () => {
    if (signalId) {
      return <SignalDetail signalId={signalId} onNavigate={navigate} />;
    }

    if (entityRoute) {
      return <EntityDetailView {...entityRoute} onNavigate={navigate} />;
    }

    if (flowRoute?.kind === "drug") {
      return <DrugOverviewView drugId={flowRoute.id} onNavigate={navigate} />;
    }

    if (path === "/workspace/details" || path === "/workspace/drugs") {
      const activeDrugId =
        parseSearchParam("id") ||
        (typeof window !== "undefined" ? sessionStorage.getItem("active_drug_id") : null) ||
        "drug-metformin";
      return <DrugOverviewView drugId={activeDrugId} onNavigate={navigate} />;
    }

    if (flowRoute?.kind === "connections" || flowRoute?.kind === "explanations") {
      return <ConnectionExplanationView signalId={flowRoute.id} onNavigate={navigate} />;
    }

    if (flowRoute?.kind === "scores") {
      return <ScoreBreakdownView signalId={flowRoute.id} onNavigate={navigate} />;
    }

    if (path === "/workspace/relations" || path === "/pipeline/relations") {
      return <PipelineRelationsView onNavigate={navigate} />;
    }

    if (
      path === "/workspace/opportunities" ||
      path === "/workspace/scope" ||
      path === "/workspace/repurposing" ||
      path.startsWith("/pipeline/repurposing")
    ) {
      return <PipelineRepurposingView onNavigate={navigate} />;
    }

    if (path === "/workspace/papers" || path.startsWith("/workspace/evidence") || path.startsWith("/pipeline/evidence")) {
      return <PipelineEvidenceView onNavigate={navigate} />;
    }

    if (path === "/workspace/monitor") {
      return <MonitorResearchView onNavigate={navigate} />;
    }

    if (path === "/workspace/alerts/new") {
      return <NewResearchAlertView onNavigate={navigate} />;
    }

    if (hypothesisRoute) {
      return (
        <HypothesisView
          projectId={hypothesisRoute.projectId}
          hypothesisId={hypothesisRoute.hypothesisId}
          onNavigate={navigate}
        />
      );
    }

    if (path.startsWith("/workspace/evidence") || path.startsWith("/pipeline/evidence")) {
      return <PipelineEvidenceView onNavigate={navigate} />;
    }

    if (path.startsWith("/workspace/explore")) {
      return <KnowledgeGraph onNavigate={navigate} />;
    }

    if (path.startsWith("/workspace/explanation") || path.startsWith("/workspace/projects")) {
      return (
        <RagExplanationView
          onNavigate={navigate}
          initialQuery={parseSearchParam("q")}
          initialDrug={parseSearchParam("drug")}
        />
      );
    }

    if (path.startsWith("/workspace/dispensaries")) {
      return <DispensariesView onNavigate={navigate} />;
    }

    if (path.startsWith("/workspace/alerts")) {
      return <AlertsView onNavigate={navigate} />;
    }

    if (path.startsWith("/workspace/saved")) {
      return <SavedView onNavigate={navigate} />;
    }

    // Default view: Signals Workbench
    return (
      <SignalsView
        onNavigate={navigate}
        initialDrugFilter={parseSearchParam("drug")}
        initialDiseaseFilter={parseSearchParam("disease")}
      />
    );
  };

  return (
    <WorkspaceShell currentPath={path} onNavigate={navigate}>
      {renderCurrentView()}
    </WorkspaceShell>
  );
}
