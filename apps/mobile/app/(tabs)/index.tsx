import { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import type { Alert, Project, RepurposingSignal, ResearchItem } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { DemoBanner } from "../../components/DemoBanner";
import { EvidenceBadge } from "../../components/EvidenceBadge";
import { ErrorState, LoadingState } from "../../components/StateViews";

export default function HomeScreen() {
  const router = useRouter();
  const [signals, setSignals] = useState<RepurposingSignal[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setError(null);
    try {
      const [sigRes, alertRes, projRes, resRes] = await Promise.all([
        api.getSignals({ page: 1, pageSize: 3 }),
        api.getAlerts({ page: 1, pageSize: 3 }),
        api.getProjects({ page: 1, pageSize: 3 }),
        api.getResearch({ page: 1, pageSize: 3 }),
      ]);
      setSignals(sigRes.items);
      setAlerts(alertRes.items);
      setProjects(projRes.items);
      setResearch(resRes.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return <LoadingState message="SYNCHRONIZING RESEARCH UNIVERSE..." />;
  }

  if (error && signals.length === 0) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
      }
    >
      <DemoBanner />

      {/* Header Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSub}>RESEARCH MONITORING // COMPANION</Text>
        <Text style={styles.heroTitle}>Biomedical Arbitrage Intelligence</Text>
        <Text style={styles.heroDesc}>
          Cross-database synthesis surface connecting drug mechanisms, pathway models, evidence, and research gaps.
        </Text>
      </View>

      {/* Section: Priority Signals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>REPURPOSING SIGNALS</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/signals")}>
            <Text style={styles.seeAll}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {signals.map((sig) => (
          <TouchableOpacity
            key={sig.id}
            style={styles.card}
            onPress={() => router.push(`/signal/${sig.id}`)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.signalId}>ID: {sig.id}</Text>
              <Text style={styles.scoreText}>
                {sig.overallScore}
                <Text style={styles.scoreSub}>/100</Text>
              </Text>
            </View>

            <Text style={styles.cardTitle}>
              {sig.drug?.name || sig.drugId} × {sig.disease?.name || sig.diseaseId}
            </Text>

            <Text style={styles.cardDesc} numberOfLines={2}>
              {sig.explanation}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.tagText}>EVIDENCE: {sig.evidence.length} SOURCES</Text>
              <Text style={styles.inspectLink}>INSPECT →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section: Recent Intelligence Alerts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>RECENT ALERTS</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/alerts")}>
            <Text style={styles.seeAll}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {alerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            style={styles.alertCard}
            onPress={() => {
              if (alert.entityId && alert.entityType === "signal") {
                router.push(`/signal/${alert.entityId}`);
              } else {
                router.push("/(tabs)/alerts");
              }
            }}
          >
            <View style={styles.alertHeader}>
              <Text style={styles.alertSeverity}>[{alert.severity.toUpperCase()}]</Text>
              <Text style={styles.alertDate}>{new Date(alert.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage} numberOfLines={2}>
              {alert.message}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section: Active Projects */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ACTIVE PROJECTS</Text>
          <TouchableOpacity onPress={() => router.push("/projects")}>
            <Text style={styles.seeAll}>VIEW ALL →</Text>
          </TouchableOpacity>
        </View>

        {projects.map((proj) => (
          <TouchableOpacity
            key={proj.id}
            style={styles.projectCard}
            onPress={() => router.push(`/projects/${proj.id}`)}
          >
            <Text style={styles.projectStatus}>STATUS: {proj.status.toUpperCase()}</Text>
            <Text style={styles.projectTitle}>{proj.title}</Text>
            {proj.description && (
              <Text style={styles.projectDesc} numberOfLines={2}>
                {proj.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07070a",
  },
  content: {
    paddingBottom: 40,
    gap: 20,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    borderRadius: 4,
    gap: 6,
  },
  heroSub: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#f4f4f5",
    fontSize: 18,
    fontWeight: "300",
  },
  heroDesc: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 17,
  },
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    paddingBottom: 6,
  },
  sectionTitle: {
    color: "#f59e0b",
    fontSize: 11,
    fontFamily: "monospace",
    letterSpacing: 1.5,
  },
  seeAll: {
    color: "#a1a1aa",
    fontSize: 10,
    fontFamily: "monospace",
  },
  card: {
    padding: 14,
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 4,
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  signalId: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
  },
  scoreText: {
    color: "#f59e0b",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "300",
  },
  scoreSub: {
    fontSize: 10,
    color: "#71717a",
  },
  cardTitle: {
    color: "#f4f4f5",
    fontSize: 15,
    fontWeight: "500",
  },
  cardDesc: {
    color: "#a1a1aa",
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  tagText: {
    color: "#6ee7b7",
    fontSize: 9,
    fontFamily: "monospace",
  },
  inspectLink: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  alertCard: {
    padding: 12,
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
    borderRadius: 4,
    gap: 4,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  alertSeverity: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  alertDate: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  alertTitle: {
    color: "#f4f4f5",
    fontSize: 13,
    fontWeight: "500",
  },
  alertMessage: {
    color: "#a1a1aa",
    fontSize: 11,
    lineHeight: 15,
  },
  projectCard: {
    padding: 12,
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    borderRadius: 4,
    gap: 4,
  },
  projectStatus: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
  },
  projectTitle: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  projectDesc: {
    color: "#a1a1aa",
    fontSize: 11,
  },
});
