import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function LoadingState({ message = "LOADING RESEARCH DATA..." }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color="#f59e0b" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorHeader}>[DATA_UNAVAILABLE]</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>RETRY CONNECTION</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.emptyTitle}>{title.toUpperCase()}</Text>
      {description && <Text style={styles.emptyDescription}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    color: "#f59e0b",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1.5,
    marginTop: 8,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.5)",
    backgroundColor: "rgba(136, 19, 55, 0.2)",
    borderRadius: 4,
    gap: 8,
  },
  errorHeader: {
    color: "#fda4af",
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 1,
  },
  errorMessage: {
    color: "#e4e4e7",
    fontSize: 12,
    lineHeight: 16,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#f43f5e",
    borderRadius: 2,
  },
  retryText: {
    color: "#fda4af",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  emptyTitle: {
    color: "#71717a",
    fontSize: 11,
    fontFamily: "monospace",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  emptyDescription: {
    color: "#a1a1aa",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
});
