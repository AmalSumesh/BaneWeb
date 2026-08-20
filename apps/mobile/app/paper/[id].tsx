import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import type { Paper } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function PaperDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaper = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPaper(id);
      setPaper(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load paper detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaper();
  }, [id]);

  if (loading) {
    return <LoadingState message="FETCHING SCIENTIFIC PUBLICATION..." />;
  }

  if (error || !paper) {
    return <ErrorState message={error || "Paper record not found"} onRetry={fetchPaper} />;
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: `PAPER // ${paper.id}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <DemoBanner />

        <View style={styles.headerCard}>
          <View style={styles.topRow}>
            <Text style={styles.typeBadge}>TYPE: {paper.type.toUpperCase()}</Text>
            <Text style={styles.dateText}>{new Date(paper.publishedAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.title}>{paper.title}</Text>
          {paper.journal && <Text style={styles.journal}>JOURNAL: {paper.journal}</Text>}
          {paper.doi && <Text style={styles.doi}>DOI: {paper.doi}</Text>}
        </View>

        {paper.authors && paper.authors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AUTHORS</Text>
            <View style={styles.infoBox}>
              <Text style={styles.authorsText}>{paper.authors.join(" • ")}</Text>
            </View>
          </View>
        )}

        {paper.abstract && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABSTRACT</Text>
            <View style={styles.infoBox}>
              <Text style={styles.abstractText}>{paper.abstract}</Text>
            </View>
          </View>
        )}

        {paper.keywords && paper.keywords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INDEXED KEYWORDS</Text>
            <View style={styles.chipRow}>
              {paper.keywords.map((kw, idx) => (
                <View key={idx} style={styles.chip}>
                  <Text style={styles.chipText}>#{kw}</Text>
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
    borderLeftColor: "#c084fc",
    padding: 14,
    borderRadius: 4,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeBadge: {
    color: "#c084fc",
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
    fontWeight: "500",
    lineHeight: 22,
  },
  journal: {
    color: "#38bdf8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  doi: {
    color: "#a1a1aa",
    fontSize: 10,
    fontFamily: "monospace",
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
  authorsText: {
    color: "#f4f4f5",
    fontSize: 12,
    lineHeight: 16,
  },
  abstractText: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 18,
  },
  chipRow: {
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
  chipText: {
    color: "#c084fc",
    fontSize: 10,
    fontFamily: "monospace",
  },
});
