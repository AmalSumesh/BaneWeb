import { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { SearchResult } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.search({ q, limit: 20 });
      setResults(res.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search request failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectResult = (item: SearchResult) => {
    switch (item.type) {
      case "signal":
        router.push(`/signal/${item.id}`);
        break;
      case "drug":
        router.push(`/drug/${item.id}`);
        break;
      case "disease":
        router.push(`/disease/${item.id}`);
        break;
      case "paper":
        router.push(`/paper/${item.id}`);
        break;
      case "trial":
      case "patent":
      case "symptom":
      default:
        router.push(`/evidence?q=${encodeURIComponent(item.title)}`);
        break;
    }
  };

  const getBadgeStyle = (type: SearchResult["type"]) => {
    switch (type) {
      case "signal":
        return styles.signalBadge;
      case "drug":
        return styles.drugBadge;
      case "disease":
        return styles.diseaseBadge;
      case "paper":
        return styles.paperBadge;
      case "trial":
        return styles.trialBadge;
      case "patent":
        return styles.patentBadge;
      default:
        return styles.defaultBadge;
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchPrefix}>⌕</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search drugs, diseases, signals, targets..."
          placeholderTextColor="#71717a"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Suggested Quick Searches */}
      {query.length === 0 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionTitle}>SUGGESTED TARGET SEARCHES</Text>
          <View style={styles.chipRow}>
            {["Metformin", "Parkinson's", "AMPK", "Neuroinflammation"].map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.chip}
                onPress={() => setQuery(term)}
              >
                <Text style={styles.chipText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {loading && <LoadingState message="SEARCHING BIOMEDICAL ENTITIES..." />}

      {error && <ErrorState message={error} onRetry={() => handleSearch(query)} />}

      {!loading && !error && (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No biomedical entities found"
              description="Query target genes (e.g. MTOR), drugs (Metformin), or diseases (Parkinson's)."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => handleSelectResult(item)}
            >
              <View style={styles.resultInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.resultTitle}>{item.title}</Text>
                  {item.score !== undefined && (
                    <Text style={styles.resultScore}>
                      Score {Math.round(item.score * 100)}
                    </Text>
                  )}
                </View>
                {item.subtitle && (
                  <Text style={styles.resultSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                )}
              </View>

              <View style={[styles.typeBadge, getBadgeStyle(item.type)]}>
                <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
  },
  searchPrefix: {
    color: "#f59e0b",
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: "#f4f4f5",
    fontSize: 13,
    fontFamily: "monospace",
  },
  clearText: {
    color: "#71717a",
    fontSize: 14,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  suggestionTitle: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 2,
  },
  chipText: {
    color: "#f59e0b",
    fontSize: 11,
    fontFamily: "monospace",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 4,
  },
  resultInfo: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultTitle: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  resultScore: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
  },
  resultSubtitle: {
    color: "#a1a1aa",
    fontSize: 11,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 2,
  },
  typeText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  signalBadge: { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.15)" },
  drugBadge: { borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,0.15)" },
  diseaseBadge: { borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.15)" },
  paperBadge: { borderColor: "#c084fc", backgroundColor: "rgba(192,132,252,0.15)" },
  trialBadge: { borderColor: "#818cf8", backgroundColor: "rgba(129,140,248,0.15)" },
  patentBadge: { borderColor: "#fb7185", backgroundColor: "rgba(251,113,133,0.15)" },
  defaultBadge: { borderColor: "#71717a", backgroundColor: "rgba(113,113,122,0.15)" },
});
