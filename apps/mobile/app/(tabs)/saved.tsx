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
import type { SavedItem } from "@biotech-arbitrage/types";
import { api } from "../../lib/api";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";

export default function SavedScreen() {
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSaved = async () => {
    setError(null);
    try {
      const res = await api.getSaved();
      setSavedItems(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load saved items");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSaved(id);
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete saved item:", err);
    }
  };

  const handleOpenEntity = (item: SavedItem) => {
    switch (item.entityType) {
      case "signal":
        router.push(`/signal/${item.entityId}`);
        break;
      case "drug":
        router.push(`/drug/${item.entityId}`);
        break;
      case "disease":
        router.push(`/disease/${item.entityId}`);
        break;
      case "paper":
        router.push(`/paper/${item.entityId}`);
        break;
      default:
        break;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSaved();
  };

  if (loading && !refreshing) {
    return <LoadingState message="FETCHING BOOKMARKED RESEARCH..." />;
  }

  if (error && savedItems.length === 0) {
    return <ErrorState message={error} onRetry={fetchSaved} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={savedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
        ListEmptyComponent={
          <EmptyState
            title="No Saved Items"
            description="Bookmark candidates, papers, or drugs to keep track of key evidence."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={styles.cardContent} onPress={() => handleOpenEntity(item)}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{item.entityType.toUpperCase()}</Text>
              </View>
              <Text style={styles.entityId}>{item.entityId}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteText}>REMOVE</Text>
            </TouchableOpacity>
          </View>
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
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0d0d11",
    borderWidth: 1,
    borderColor: "#1c1c22",
    padding: 14,
    borderRadius: 4,
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#f59e0b",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderRadius: 2,
  },
  typeText: {
    color: "#f59e0b",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  entityId: {
    color: "#f4f4f5",
    fontSize: 14,
    fontFamily: "monospace",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.5)",
    borderRadius: 2,
  },
  deleteText: {
    color: "#fda4af",
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
  },
});
