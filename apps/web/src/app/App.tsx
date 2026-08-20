import { useRouter } from "@/hooks/useRouter";
import { LandingPage } from "@/features/landing/LandingPage";
import { WorkspacePage } from "@/features/workspace/WorkspacePage";
import { PipelinePage } from "@/features/pipeline/PipelinePage";

export function App() {
  const { path, navigate } = useRouter();

  if (path.startsWith("/workspace")) {
    return <WorkspacePage />;
  }

  if (path.startsWith("/pipeline")) {
    return <PipelinePage />;
  }

  return <LandingPage onNavigate={navigate} />;
}
