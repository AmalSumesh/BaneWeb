import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import type { Disease } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function DiseaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [disease, setDisease] = useState<Disease | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisease = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDisease(id);
      setDisease(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load disease detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisease();
  }, [id]);

  if (loading) {
    return <LoadingState message="FETCHING DISEASE BIOLOGY PROFILE..." />;
  }

  if (error || !disease) {
    return <ErrorState message={error || "Disease entity not found"} onRetry={fetchDisease} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: `DISEASE // ${disease.name}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DemoBanner />

        <View style={styles.headerCard}>
          <Text style={styles.subLabel}>DISEASE BIOLOGY PROFILE</Text>
          <Text style={styles.title}>{disease.name}</Text>
          {disease.icdCode && <Text style={styles.icd}>ICD CODE: {disease.icdCode}</Text>}
          {disease.description && <Text style={styles.desc}>{disease.description}</Text>}
        </View>

        {disease.symptoms && disease.symptoms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHARACTERISTIC SYMPTOMS</Text>
            <View style={styles.chipRow}>
              {disease.symptoms.map((s, idx) => (
                <View key={idx} style={styles.symptomChip}>
                  <Text style={styles.chipText}>• {s.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {disease.associatedTargets && disease.associatedTargets.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ASSOCIATED TARGET GENES</Text>
            <View style={styles.chipRow}>
              {disease.associatedTargets.map((t, idx) => (
                <View key={idx} style={styles.targetChip}>
                  <Text style={styles.chipText}>{t.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {disease.associatedPathways && disease.associatedPathways.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ASSOCIATED PATHWAYS</Text>
            <View style={styles.chipRow}>
              {disease.associatedPathways.map((p, idx) => (
                <View key={idx} style={styles.pathwayChip}>
                  <Text style={styles.chipText}>{p.toUpperCase()}</Text>
                </View>
              ))}
            </View>
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
    borderLeftColor: "#f59e0b",
    padding: 14,
    borderRadius: 4,
    gap: 4,
  },
  subLabel: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  title: {
    color: "#f4f4f5",
    fontSize: 22,
    fontWeight: "300",
  },
  icd: {
    color: "#38bdf8",
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  symptomChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 2,
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
});
