import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import type { KnowledgeGraphResponse } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function KnowledgeGraphScreen() {
  const router = useRouter();
  const [graphData, setGraphData] = useState<KnowledgeGraphResponse | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getKnowledgeGraph();
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load knowledge graph");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  if (loading) {
    return <LoadingState message="PARSING BIOLOGICAL KNOWLEDGE GRAPH..." />;
  }

  if (error || !graphData) {
    return <ErrorState message={error || "Graph dataset missing"} onRetry={fetchGraph} />;
  }

  const selectedNode = graphData.nodes.find((n) => n.id === selectedNodeId);

  const getNodeColor = (type: string) => {
    switch (type) {
      case "drug":
        return "#38bdf8";
      case "disease":
        return "#f59e0b";
      case "target":
        return "#10b981";
      case "pathway":
        return "#a855f7";
      case "paper":
        return "#c084fc";
      case "trial":
        return "#818cf8";
      case "patent":
        return "#fb7185";
      default:
        return "#71717a";
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle: "EXPLORE // KNOWLEDGE GRAPH" }} />
      <View style={styles.container}>
        <DemoBanner />

        {/* Selected Node Details Box */}
        {selectedNode ? (
          <View style={styles.detailBox}>
            <View style={styles.detailHeader}>
              <View
                style={[
                  styles.nodeBadge,
                  { borderColor: getNodeColor(selectedNode.type) },
                ]}
              >
                <Text
                  style={[styles.nodeBadgeText, { color: getNodeColor(selectedNode.type) }]}
                >
                  {selectedNode.type.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedNodeId(null)}>
                <Text style={styles.closeText}>✕ DISMISS</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.nodeTitle}>{selectedNode.label}</Text>
            {selectedNode.sublabel && (
              <Text style={styles.nodeSub}>{selectedNode.sublabel}</Text>
            )}

            <TouchableOpacity
              style={styles.openBtn}
              onPress={() => {
                if (selectedNode.type === "drug") router.push(`/drug/${selectedNode.id}`);
                else if (selectedNode.type === "disease") router.push(`/disease/${selectedNode.id}`);
                else if (selectedNode.type === "paper") router.push(`/paper/${selectedNode.id}`);
              }}
            >
              <Text style={styles.openBtnText}>INVESTIGATE ENTITY →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              TAP ANY BIOLOGICAL NODE BELOW TO INSPECT MECHANISMS & RELATIONSHIPS
            </Text>
          </View>
        )}

        {/* Nodes Grid / List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>
            BIOLOGICAL NODES ({graphData.nodes.length})
          </Text>

          <View style={styles.nodesGrid}>
            {graphData.nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const color = getNodeColor(node.type);
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeCard,
                    { borderColor: isSelected ? color : "#1c1c22" },
                    isSelected && { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                  ]}
                  onPress={() => setSelectedNodeId(node.id)}
                >
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <View style={styles.nodeTextCol}>
                    <Text style={styles.nodeCardTitle} numberOfLines={1}>
                      {node.label}
                    </Text>
                    <Text style={styles.nodeCardType}>{node.type.toUpperCase()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Edges List */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            RELATIONSHIP EDGES ({graphData.edges.length})
          </Text>

          <View style={styles.edgesList}>
            {graphData.edges.map((edge) => (
              <View key={edge.id} style={styles.edgeCard}>
                <Text style={styles.edgeRel}>{edge.relationship}</Text>
                <Text style={styles.edgeNodes}>
                  {edge.source} → {edge.target}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  hintBox: {
    padding: 12,
    backgroundColor: "#0d0d11",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
  },
  hintText: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textAlign: "center",
  },
  detailBox: {
    padding: 14,
    backgroundColor: "#0d0d11",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    gap: 6,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 2,
  },
  nodeBadgeText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  closeText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  nodeTitle: {
    color: "#f4f4f5",
    fontSize: 16,
    fontWeight: "500",
  },
  nodeSub: {
    color: "#a1a1aa",
    fontSize: 11,
  },
  openBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 2,
  },
  openBtnText: {
    color: "#07070a",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  scrollContent: {
    padding: 16,
    gap: 12,
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
  nodesGrid: {
    gap: 8,
  },
  nodeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    padding: 12,
    borderRadius: 4,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nodeTextCol: {
    flex: 1,
  },
  nodeCardTitle: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "500",
  },
  nodeCardType: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  edgesList: {
    gap: 8,
  },
  edgeCard: {
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 10,
    borderRadius: 4,
    gap: 2,
  },
  edgeRel: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  edgeNodes: {
    color: "#a1a1aa",
    fontSize: 11,
    fontFamily: "monospace",
  },
});
