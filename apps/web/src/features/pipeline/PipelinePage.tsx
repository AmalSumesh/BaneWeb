import { useRouter } from "@/hooks/useRouter";
import { WorkspaceShell } from "@/features/workspace/components/WorkspaceShell";
import { KnowledgeGraph } from "@/features/workspace/views/KnowledgeGraph";
import {
  PipelineEvidenceView,
  PipelineQueryView,
  PipelineRelationsView,
  PipelineRepurposingView,
  PipelineStatusView,
} from "./PipelineFlow";

export function PipelinePage() {
  const { path, navigate } = useRouter();
  let view = <PipelineQueryView onNavigate={navigate} />;

  if (path.startsWith("/pipeline/status")) view = <PipelineStatusView onNavigate={navigate} />;
  if (path.startsWith("/pipeline/relations")) view = <PipelineRelationsView onNavigate={navigate} />;
  if (path.startsWith("/pipeline/graph")) view = <KnowledgeGraph onNavigate={navigate} />;
  if (path.startsWith("/pipeline/evidence")) view = <PipelineEvidenceView onNavigate={navigate} />;
  if (path.startsWith("/pipeline/repurposing")) view = <PipelineRepurposingView onNavigate={navigate} />;

  return <WorkspaceShell currentPath={path} onNavigate={navigate}>{view}</WorkspaceShell>;
}
