import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import type { RepurposingSignal } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { EvidenceBadge } from "../../components/EvidenceBadge";
import { ScoreBar } from "../../components/ScoreBar";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function SignalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [signal, setSignal] = useState<RepurposingSignal | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignal = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const sigData = await api.getSignal(id);
      setSignal(sigData);

      const savedRes = await api.getSaved();
      setIsSaved(savedRes.items.some((item) => item.entityId === id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load signal detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignal();
  }, [id]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      const savedRes = await api.getSaved();
      const existing = savedRes.items.find((item) => item.entityId === id);
      if (existing) {
        await api.deleteSaved(existing.id);
        setIsSaved(false);
      } else {
        await api.saveItem({ entityType: "signal", entityId: id });
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save signal:", err);
    }
  };

  if (loading) {
    return <LoadingState message="ANALYZING CANDIDATE HYPOTHESIS..." />;
  }

  if (error || !signal) {
    return <ErrorState message={error || "Signal not found"} onRetry={fetchSignal} />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `SIGNAL // ${signal.id}`,
          headerRight: () => (
            <TouchableOpacity style={styles.saveHeaderBtn} onPress={toggleSave}>
              <Text style={styles.saveHeaderTxt}>{isSaved ? "★ SAVED" : "☆ SAVE"}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DemoBanner />

        {/* Pair Headline */}
        <View style={styles.headerCard}>
          <Text style={styles.idLabel}>REPURPOSING HYPOTHESIS CANDIDATE</Text>
          <Text style={styles.pairTitle}>
            {signal.drug?.name || signal.drugId} × {signal.disease?.name || signal.diseaseId}
          </Text>
          <Text style={styles.explanation}>{signal.explanation}</Text>
        </View>

        {/* Score Component */}
        <ScoreBar score={signal.overallScore} breakdown={signal.scoreBreakdown} />

        {/* Score Breakdown List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCORE BREAKDOWN RATIONALE</Text>
          {signal.scoreBreakdown.map((item, idx) => (
            <View key={idx} style={styles.breakdownItem}>
              <View style={styles.breakdownTop}>
                <Text style={styles.factorName}>{item.factor}</Text>
                <Text style={styles.factorScore}>{(item.score * item.weight).toFixed(1)} pts</Text>
              </View>
              {item.rationale && <Text style={styles.factorRationale}>{item.rationale}</Text>}
            </View>
          ))}
        </View>

        {/* Mechanistic Rationale */}
        {signal.mechanisms && signal.mechanisms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MECHANISTIC TARGET RATIONALE</Text>
            {signal.mechanisms.map((mech, idx) => (
              <View key={idx} style={styles.mechanismChip}>
                <Text style={styles.mechanismText}>• {mech}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Supporting Evidence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORTING EVIDENCE ({signal.evidence.length})</Text>
          {signal.evidence.map((ev) => (
            <View key={ev.id} style={styles.evidenceCard}>
              <EvidenceBadge direction={ev.direction} type={ev.type} />
              <Text style={styles.evidenceTitle}>{ev.title}</Text>
              <Text style={styles.evidenceSummary}>{ev.summary}</Text>
            </View>
          ))}
        </View>

        {/* Contradictory Evidence */}
        {signal.contradictoryEvidence && signal.contradictoryEvidence.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              CONTRADICTORY & LIMITING EVIDENCE ({signal.contradictoryEvidence.length})
            </Text>
            {signal.contradictoryEvidence.map((ev) => (
              <View key={ev.id} style={[styles.evidenceCard, styles.contradictoryCard]}>
                <EvidenceBadge direction={ev.direction} type={ev.type} />
                <Text style={styles.evidenceTitle}>{ev.title}</Text>
                <Text style={styles.evidenceSummary}>{ev.summary}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Research Gap */}
        {signal.researchGap && (
          <View style={styles.gapCard}>
            <Text style={styles.gapLabel}>IDENTIFIED RESEARCH GAP</Text>
            <Text style={styles.gapTitle}>{signal.researchGap.title}</Text>
            <Text style={styles.gapDesc}>{signal.researchGap.description}</Text>
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
  saveHeaderBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 2,
  },
  saveHeaderTxt: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  headerCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 14,
    borderRadius: 4,
    gap: 6,
  },
  idLabel: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  pairTitle: {
    color: "#f4f4f5",
    fontSize: 20,
    fontWeight: "300",
  },
  explanation: {
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
  breakdownItem: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 10,
    borderRadius: 4,
    gap: 4,
  },
  breakdownTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  factorName: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "500",
  },
  factorScore: {
    color: "#f59e0b",
    fontSize: 12,
    fontFamily: "monospace",
  },
  factorRationale: {
    color: "#a1a1aa",
    fontSize: 11,
  },
  mechanismChip: {
    backgroundColor: "#111116",
    padding: 8,
    borderRadius: 2,
  },
  mechanismText: {
    color: "#38bdf8",
    fontSize: 12,
    fontFamily: "monospace",
  },
  evidenceCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.4)",
    padding: 12,
    borderRadius: 4,
    gap: 6,
  },
  contradictoryCard: {
    borderColor: "rgba(244, 63, 94, 0.4)",
  },
  evidenceTitle: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "500",
  },
  evidenceSummary: {
    color: "#a1a1aa",
    fontSize: 11,
    lineHeight: 15,
  },
  gapCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.5)",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    padding: 14,
    borderRadius: 4,
    gap: 4,
  },
  gapLabel: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  gapTitle: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  gapDesc: {
    color: "#a1a1aa",
    fontSize: 11,
    lineHeight: 16,
  },
});
