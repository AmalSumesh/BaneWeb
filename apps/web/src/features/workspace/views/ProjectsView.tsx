import { useEffect, useState } from "react";
import type { Project, Note } from "@biotech-arbitrage/types";
import { api } from "@/lib/api";

interface ProjectsViewProps {
  onNavigate: (to: string) => void;
  selectedProjectId?: string;
}

export function ProjectsView({ onNavigate, selectedProjectId }: ProjectsViewProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Project Modal State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // New Note State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getProjects();
        setProjects(res.items);

        if (selectedProjectId) {
          const proj = res.items.find((p) => p.id === selectedProjectId);
          if (proj) setActiveProject(proj);
          else if (res.items.length > 0) setActiveProject(res.items[0]);
        } else if (res.items.length > 0) {
          setActiveProject(res.items[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load research projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!activeProject) {
      setNotes([]);
      return;
    }

    api.getProjectNotes(activeProject.id)
      .then(setNotes)
      .catch(() => setNotes([]));
  }, [activeProject]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateLoading(true);
    try {
      const created = await api.createProject({
        title: newTitle,
        description: newDescription,
      });
      setProjects((prev) => [created, ...prev]);
      setActiveProject(created);
      setIsCreatingProject(false);
      setNewTitle("");
      setNewDescription("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newNoteContent.trim()) return;
    setNoteLoading(true);
    try {
      const createdNote = await api.createProjectNote(activeProject.id, newNoteContent);
      setNotes((prev) => [...prev, createdNote]);
      setNewNoteContent("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save project note");
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent animate-spin rounded-full mb-4" />
        <span className="text-xs text-accent uppercase">Loading Research Projects Workbench...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-rose-900/50 bg-rose-950/20 text-rose-300 font-mono text-xs">
        [API_ERROR] {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            PROJECTS // INVESTIGATION_NOTEBOOK
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mt-1 font-normal">
            Research Projects & Notebooks
          </h1>
          <p className="text-xs text-foreground-muted mt-1 max-w-2xl leading-relaxed">
            Organize hypothesis investigations, track supporting evidence, add analytical notes, and curate repurposing targets.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingProject(true)}
          className="px-4 py-2 border border-accent text-accent hover:bg-accent-glow font-mono text-xs uppercase tracking-wider transition-colors shrink-0"
        >
          + NEW RESEARCH PROJECT
        </button>
      </div>

      {/* Main Workspace Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Projects Sidebar */}
        <div className="space-y-3">
          <div className="font-mono text-[0.65rem] text-muted uppercase tracking-wider px-1">
            ACTIVE PROJECTS ({projects.length})
          </div>

          {projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => setActiveProject(proj)}
                className={`p-4 border cursor-pointer transition-all rounded-sm font-mono text-xs space-y-2 ${
                  isSelected
                    ? "border-accent bg-background-elevated text-foreground shadow-md"
                    : "border-border/70 hover:border-border text-foreground-muted hover:bg-background-elevated/40"
                }`}
              >
                <div className="flex justify-between items-center text-[0.65rem]">
                  <span className="text-accent uppercase">{proj.status}</span>
                  <span className="text-muted">{proj.id}</span>
                </div>
                <div className="font-sans font-semibold text-sm text-foreground">{proj.title}</div>
                {proj.description && <p className="text-[0.7rem] text-muted font-sans line-clamp-2">{proj.description}</p>}
              </div>
            );
          })}
        </div>

        {/* Right Active Project Notebook */}
        <div className="lg:col-span-2 space-y-6">
          {activeProject ? (
            <div className="p-6 border border-border bg-background-elevated/50 space-y-6 rounded-sm">
              <div className="border-b border-border pb-4 flex items-start justify-between">
                <div>
                  <span className="font-mono text-[0.65rem] text-accent uppercase">PROJECT ID: {activeProject.id}</span>
                  <h2 className="font-display text-2xl text-foreground mt-1 font-normal">{activeProject.title}</h2>
                  {activeProject.description && (
                    <p className="text-xs text-foreground-muted mt-1">{activeProject.description}</p>
                  )}
                </div>
                <span className="px-2 py-1 border border-emerald-500/40 text-emerald-400 bg-emerald-950/20 font-mono text-[0.65rem] uppercase">
                  {activeProject.status}
                </span>
              </div>

              {/* Hypotheses Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-accent uppercase tracking-widest">[HYPOTHESIS_INVESTIGATIONS]</span>
                  <button
                    onClick={() =>
                      onNavigate(`/workspace/projects/${activeProject.id}/hypotheses/hypo-101`)
                    }
                    className="text-accent underline text-[0.7rem]"
                  >
                    OPEN HYPOTHESIS WORKSPACE →
                  </button>
                </div>

                <div
                  onClick={() =>
                    onNavigate(`/workspace/projects/${activeProject.id}/hypotheses/hypo-101`)
                  }
                  className="p-4 border border-border hover:border-accent bg-background-subtle cursor-pointer transition-colors rounded-sm space-y-2"
                >
                  <div className="flex justify-between font-mono text-[0.65rem] text-accent">
                    <span>HYPOTHESIS #H-101</span>
                    <span>ACTIVE VALIDATION</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground font-sans">
                    AMPK Activation via Metformin Suppresses Glioblastoma Proliferation
                  </h4>
                  <p className="text-xs text-foreground-muted leading-relaxed font-sans">
                    Metformin inhibits mitochondrial complex I, leading to elevated AMP/ATP ratio, activating AMPK and downregulating mTORC1 signaling.
                  </p>
                </div>
              </div>

              {/* Notes Stream */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="font-mono text-xs text-accent uppercase tracking-widest">
                  [RESEARCH_NOTES_LOG] ({notes.length})
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Log experimental observations, assay results, or literature findings..."
                    rows={3}
                    className="w-full bg-background-subtle border border-border p-3 text-xs text-foreground placeholder-muted outline-none font-sans rounded-sm focus:border-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={noteLoading || !newNoteContent.trim()}
                      className="px-4 py-1.5 border border-accent text-accent font-mono text-xs uppercase hover:bg-accent-glow transition-colors disabled:opacity-50"
                    >
                      {noteLoading ? "SAVING..." : "+ ADD NOTE"}
                    </button>
                  </div>
                </form>

                {/* Existing Notes List */}
                <div className="space-y-3 pt-2">
                  {notes.length === 0 ? (
                    <p className="text-xs text-muted font-mono">No research notes logged in this project yet.</p>
                  ) : (
                    notes.map((note) => (
                      <div key={note.id} className="p-3 border border-border/60 bg-background-subtle/70 font-mono text-xs space-y-1">
                        <div className="flex justify-between text-[0.6rem] text-muted">
                          <span>NOTE ID: {note.id}</span>
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-foreground font-sans text-xs">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-border font-mono text-xs text-muted">
              Select or create a project to inspect its research notebook.
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop backdrop-blur-sm">
          <div className="w-full max-w-md bg-background-elevated border border-border p-6 rounded-sm space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center text-accent uppercase font-semibold">
              <span>[CREATE_NEW_RESEARCH_PROJECT]</span>
              <button onClick={() => setIsCreatingProject(false)} className="text-muted hover:text-foreground">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 font-sans">
              <div>
                <label className="block font-mono text-[0.65rem] text-muted uppercase mb-1">PROJECT TITLE</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AMPK Oncology Repurposing Investigation"
                  className="w-full bg-background-subtle border border-border p-2 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[0.65rem] text-muted uppercase mb-1">DESCRIPTION / SCOPE</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Summary of research scope, target diseases, or mechanisms..."
                  className="w-full bg-background-subtle border border-border p-2 text-xs text-foreground outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 font-mono">
                <button
                  type="button"
                  onClick={() => setIsCreatingProject(false)}
                  className="px-4 py-2 border border-border text-muted hover:text-foreground"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !newTitle.trim()}
                  className="px-4 py-2 border border-accent text-accent hover:bg-accent-glow uppercase font-semibold disabled:opacity-50"
                >
                  {createLoading ? "CREATING..." : "CREATE PROJECT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
