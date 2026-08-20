import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import type { Note, Project } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProject(id);
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddNote = async () => {
    if (!id || !newNoteContent.trim()) return;
    setSubmittingNote(true);
    try {
      const created = await api.createProjectNote(id, newNoteContent.trim());
      setNotes((prev) => [created, ...prev]);
      setNewNoteContent("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return <LoadingState message="OPENING RESEARCH PROJECT WORKSPACE..." />;
  }

  if (error || !project) {
    return <ErrorState message={error || "Project not found"} onRetry={fetchProject} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: `PROJECT // ${project.id}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DemoBanner />

        {/* Project Header */}
        <View style={styles.headerCard}>
          <Text style={styles.subLabel}>RESEARCH PROJECT WORKSPACE</Text>
          <Text style={styles.title}>{project.title}</Text>
          {project.description && <Text style={styles.desc}>{project.description}</Text>}
        </View>

        {/* Add Note Input Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESEARCH NOTEBOOK</Text>
          <View style={styles.addNoteBox}>
            <TextInput
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              placeholder="Record observation, methodology note, or hypothesis..."
              placeholderTextColor="#71717a"
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
            <TouchableOpacity
              style={[
                styles.addNoteBtn,
                (!newNoteContent.trim() || submittingNote) && styles.disabledBtn,
              ]}
              onPress={handleAddNote}
              disabled={!newNoteContent.trim() || submittingNote}
            >
              <Text style={styles.addNoteBtnText}>
                {submittingNote ? "POSTING..." : "ADD NOTE TO PROJECT"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Feed */}
        {notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECT NOTES ({notes.length})</Text>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Text style={styles.noteDate}>
                  {new Date(note.createdAt).toLocaleDateString()} • {new Date(note.createdAt).toLocaleTimeString()}
                </Text>
                <Text style={styles.noteText}>{note.content}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
    padding: 14,
    borderRadius: 4,
    gap: 4,
  },
  subLabel: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  title: {
    color: "#f4f4f5",
    fontSize: 20,
    fontWeight: "300",
  },
  desc: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1.5,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    paddingBottom: 4,
  },
  addNoteBox: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 12,
    borderRadius: 4,
    gap: 8,
  },
  noteInput: {
    color: "#f4f4f5",
    fontSize: 12,
    fontFamily: "monospace",
    minHeight: 60,
    textAlignVertical: "top",
  },
  addNoteBtn: {
    backgroundColor: "#f59e0b",
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 2,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  addNoteBtnText: {
    color: "#07070a",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1,
  },
  noteCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 12,
    borderRadius: 4,
    gap: 4,
  },
  noteDate: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  noteText: {
    color: "#f4f4f5",
    fontSize: 12,
    lineHeight: 16,
  },
});
