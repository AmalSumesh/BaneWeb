import { StyleSheet, Text, View } from "react-native";

export function DemoBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text style={styles.text}>DEMONSTRATION DATA ONLY • NOT MEDICAL ADVICE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111116",
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c22",
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#f59e0b",
  },
  text: {
    color: "#a1a1aa",
    fontSize: 9,
    fontFamily: "monospace",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
