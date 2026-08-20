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
import type { Alert } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function AlertsScreen() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setError(null);
    try {
      const res = await api.getAlerts();
      setAlerts(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const handleOpenAlert = (item: Alert) => {
    if (!item.entityId) return;
    if (item.entityType === "signal") {
      router.push(`/signal/${item.entityId}`);
    } else if (item.entityType === "drug") {
      router.push(`/drug/${item.entityId}`);
    } else if (item.entityType === "disease") {
      router.push(`/disease/${item.entityId}`);
    } else if (item.entityType === "project") {
      router.push(`/projects/${item.entityId}`);
    }
  };

  const getSeverityStyle = (sev: Alert["severity"]) => {
    switch (sev) {
      case "urgent":
        return styles.urgentBadge;
      case "notable":
        return styles.notableBadge;
      case "info":
      default:
        return styles.infoBadge;
    }
  };

  if (loading && !refreshing) {
    return <LoadingState message="POLLING INTELLIGENCE FEED..." />;
  }

  if (error && alerts.length === 0) {
    return <ErrorState message={error} onRetry={fetchAlerts} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
        ListEmptyComponent={
          <EmptyState title="No Active Alerts" description="Intelligence feed updates automatically." />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleOpenAlert(item)}
            activeOpacity={item.entityId ? 0.7 : 1}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.severityBadge, getSeverityStyle(item.severity)]}>
                <Text style={styles.severityText}>{item.severity.toUpperCase()}</Text>
              </View>

              <Text style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.message}>{item.message}</Text>

            {item.entityId && (
              <View style={styles.cardFooter}>
                <Text style={styles.entityTag}>
                  AFFECTED: {item.entityType?.toUpperCase()} // {item.entityId}
                </Text>
                <Text style={styles.linkText}>VIEW ENTITY →</Text>
              </View>
            )}
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
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderRadius: 2,
  },
  severityText: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  urgentBadge: { borderColor: "#f43f5e", backgroundColor: "rgba(244, 63, 94, 0.2)" },
  notableBadge: { borderColor: "#f59e0b", backgroundColor: "rgba(245, 158, 11, 0.2)" },
  infoBadge: { borderColor: "#38bdf8", backgroundColor: "rgba(56, 189, 248, 0.2)" },
  dateText: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
  },
  title: {
    color: "#f4f4f5",
    fontSize: 14,
    fontWeight: "500",
  },
  message: {
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
  entityTag: {
    color: "#38bdf8",
    fontSize: 9,
    fontFamily: "monospace",
  },
  linkText: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
