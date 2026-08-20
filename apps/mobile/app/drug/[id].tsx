import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import type { Drug } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function DrugDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [drug, setDrug] = useState<Drug | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrug = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDrug(id);
      setDrug(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drug detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrug();
  }, [id]);

  if (loading) {
    return <LoadingState message="FETCHING DRUG MOLECULAR PROFILE..." />;
  }

  if (error || !drug) {
    return <ErrorState message={error || "Drug entity not found"} onRetry={fetchDrug} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: `DRUG // ${drug.name}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DemoBanner />

        <View style={styles.headerCard}>
          <Text style={styles.subLabel}>DRUG ENTITY PROFILE</Text>
          <Text style={styles.title}>{drug.name}</Text>
          {drug.genericName && <Text style={styles.generic}>GENERIC: {drug.genericName}</Text>}
          {drug.description && <Text style={styles.desc}>{drug.description}</Text>}
        </View>

        {drug.mechanismOfAction && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>MECHANISM OF ACTION</Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{drug.mechanismOfAction}</Text>
            </View>
          </View>
        )}

        {drug.targets && drug.targets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TARGET GENES & PROTEINS</Text>
            <View style={styles.chipRow}>
              {drug.targets.map((t, idx) => (
                <View key={idx} style={styles.targetChip}>
                  <Text style={styles.chipText}>{t.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {drug.pathways && drug.pathways.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BIOLOGICAL PATHWAYS</Text>
            <View style={styles.chipRow}>
              {drug.pathways.map((p, idx) => (
                <View key={idx} style={styles.pathwayChip}>
                  <Text style={styles.chipText}>{p.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {drug.approvedIndications && drug.approvedIndications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APPROVED INDICATIONS (REFERENCE)</Text>
            {drug.approvedIndications.map((ind, idx) => (
              <View key={idx} style={styles.infoBox}>
                <Text style={styles.indText}>• {ind}</Text>
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
    fontSize: 22,
    fontWeight: "300",
  },
  generic: {
    color: "#f59e0b",
    fontSize: 11,
    fontFamily: "monospace",
  },
  desc: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
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
  infoBox: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 12,
    borderRadius: 4,
  },
  infoText: {
    color: "#f4f4f5",
    fontSize: 13,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  targetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderWidth: 1,
    borderColor: "#38bdf8",
    borderRadius: 2,
  },
  pathwayChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    borderWidth: 1,
    borderColor: "#a855f7",
    borderRadius: 2,
  },
  chipText: {
    color: "#f4f4f5",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  indText: {
    color: "#a1a1aa",
    fontSize: 12,
  },
});
