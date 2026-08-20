import { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import type { Evidence, EvidenceDirection } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { EvidenceBadge } from "../../components/EvidenceBadge";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function EvidenceExplorerScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [directionFilter, setDirectionFilter] = useState<"ALL" | EvidenceDirection>("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = async () => {
    setError(null);
    try {
      const res = await api.getResearch({ page: 1, pageSize: 20 });
      // Map research items to evidence schemas if needed, or query signals
      const sigRes = await api.getSignals({ page: 1, pageSize: 10 });
      const aggregated: Evidence[] = [];
      sigRes.items.forEach((sig) => {
        aggregated.push(...sig.evidence);
        if (sig.contradictoryEvidence) {
          aggregated.push(...sig.contradictoryEvidence);
        }
      });
      setEvidenceList(aggregated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load evidence");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const filteredEvidence = evidenceList.filter((ev) => {
    if (directionFilter !== "ALL" && ev.direction !== directionFilter) return false;
    if (q && !ev.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvidence();
  };

  if (loading && !refreshing) {
    return <LoadingState message="STREAMING EVIDENCE RECORDS..." />;
  }

  if (error && evidenceList.length === 0) {
    return <ErrorState message={error} onRetry={fetchEvidence} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: "EVIDENCE // EXPLORER" }} />
      <View style={styles.container}>
        <DemoBanner />

        {/* Filter Toolbar */}
        <View style={styles.filterBar}>
          <Text style={styles.filterLabel}>DIRECTION:</Text>
          <View style={styles.filterChips}>
            {(["ALL", "supporting", "contradicting", "neutral"] as const).map((dir) => (
              <TouchableOpacity
                key={dir}
                style={[
                  styles.chip,
                  directionFilter === dir && styles.chipActive,
                ]}
                onPress={() => setDirectionFilter(dir)}
              >
                <Text
                  style={[
                    styles.chipText,
                    directionFilter === dir && styles.chipTextActive,
                  ]}
                >
                  {dir.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredEvidence}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
          }
          ListEmptyComponent={
            <EmptyState title="No Evidence Records Match Filter" description="Try clearing directional filters." />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <EvidenceBadge direction={item.direction} type={item.type} />
                <Text style={styles.sourceText}>SRC: {item.sourceType.toUpperCase()}</Text>
              </View>

              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>

              {item.confidence !== undefined && (
                <View style={styles.cardFooter}>
                  <Text style={styles.confidenceText}>
                    CONFIDENCE SCORE: {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              )}
            </View>
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
  filterBar: {
    padding: 12,
    backgroundColor: "#0d0d11",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    gap: 8,
  },
  filterLabel: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 2,
  },
  chipActive: {
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  chipText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  chipTextActive: {
    color: "#f59e0b",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 14,
    borderRadius: 4,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sourceText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  title: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  summary: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  confidenceText: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
  },
});
