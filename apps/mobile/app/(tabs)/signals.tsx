import { useState, useEffect } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { RepurposingSignal } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function SignalsScreen() {
  const router = useRouter();
  const [signals, setSignals] = useState<RepurposingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    setError(null);
    try {
      const res = await api.getSignals({ page: 1, pageSize: 20 });
      setSignals(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load signals");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSignals();
  };

  if (loading && !refreshing) {
    return <LoadingState message="QUERYING REPURPOSING SIGNALS..." />;
  }

  if (error && signals.length === 0) {
    return <ErrorState message={error} onRetry={fetchSignals} />;
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerBox}>
        <Text style={styles.headerSub}>THERAPEUTIC CANDIDATE INDEX</Text>
        <Text style={styles.headerTitle}>Prioritized Repurposing Hypotheses</Text>
        <Text style={styles.disclaimerText}>
          Scores represent computational research prioritization, not clinical efficacy guarantee.
        </Text>
      </View>

      <FlatList
        data={signals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
        ListEmptyComponent={
          <EmptyState title="No Repurposing Signals Found" description="Check back for new evidence." />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/signal/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.signalId}>SIGNAL // {item.id}</Text>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreNumber}>{item.overallScore}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>

            <Text style={styles.pairTitle}>
              {item.drug?.name || item.drugId} × {item.disease?.name || item.diseaseId}
            </Text>

            <Text style={styles.explanation} numberOfLines={3}>
              {item.explanation}
            </Text>

            <View style={styles.cardBottom}>
              <View style={styles.badgeRow}>
                <View style={styles.evidenceTag}>
                  <Text style={styles.evidenceTagText}>
                    EVIDENCE: {item.evidence.length} SOURCES
                  </Text>
                </View>
                {item.mechanisms && item.mechanisms.length > 0 && (
                  <View style={styles.targetTag}>
                    <Text style={styles.targetTagText}>
                      TARGET: {item.mechanisms[0]}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.inspectText}>INSPECT →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  headerBox: {
    padding: 16,
    backgroundColor: "#0d0d11",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    gap: 4,
  },
  headerSub: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "300",
  },
  disclaimerText: {
    color: "#71717a",
    fontSize: 10,
    fontFamily: "monospace",
    marginTop: 2,
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
    borderLeftColor: "#f59e0b",
    padding: 14,
    borderRadius: 4,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signalId: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreNumber: {
    color: "#f59e0b",
    fontSize: 20,
    fontFamily: "monospace",
    fontWeight: "300",
  },
  scoreMax: {
    color: "#71717a",
    fontSize: 10,
    fontFamily: "monospace",
  },
  pairTitle: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "500",
  },
  explanation: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 16,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  evidenceTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.5)",
    backgroundColor: "rgba(6,78,59,0.3)",
    borderRadius: 2,
  },
  evidenceTagText: {
    color: "#6ee7b7",
    fontSize: 8,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  targetTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.5)",
    backgroundColor: "rgba(12,74,110,0.3)",
    borderRadius: 2,
  },
  targetTagText: {
    color: "#7dd3fc",
    fontSize: 8,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  inspectText: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
    marginLeft: 8,
  },
});
