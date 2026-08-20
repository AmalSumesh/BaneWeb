import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import type { Project } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function ProjectsScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setError(null);
    try {
      const res = await api.getProjects();
      setProjects(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  if (loading && !refreshing) {
    return <LoadingState message="LOADING RESEARCH WORKSPACES..." />;
  }

  if (error && projects.length === 0) {
    return <ErrorState message={error} onRetry={fetchProjects} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: "PROJECTS // WORKBENCH" }} />
      <View style={styles.container}>
        <DemoBanner />

        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
          }
          ListEmptyComponent={
            <EmptyState title="No Active Projects" description="Create a project to organize hypotheses." />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/projects/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.statusBadge}>STATUS: {item.status.toUpperCase()}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.updatedAt).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              {item.description && <Text style={styles.description}>{item.description}</Text>}

              <View style={styles.cardFooter}>
                <Text style={styles.idText}>ID: {item.id}</Text>
                <Text style={styles.openText}>OPEN WORKSPACE →</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
    padding: 14,
    borderRadius: 4,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusBadge: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  dateText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  title: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "300",
  },
  description: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  idText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  openText: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
