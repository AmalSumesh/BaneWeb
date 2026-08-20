import { StyleSheet, Text, View } from "react-native";
import type { ScoreBreakdownItem } from "@biotech-arbitrage/types";

interface ScoreBarProps {
  score: number;
  breakdown?: ScoreBreakdownItem[];
}

export function ScoreBar({ score, breakdown }: ScoreBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.scoreTitle}>RESEARCH PRIORITIZATION SCORE</Text>
        <Text style={styles.scoreValue}>
          {score}
          <Text style={styles.maxScore}>/100</Text>
        </Text>
      </View>

      <View style={styles.barBackground}>
        {breakdown && breakdown.length > 0 ? (
          <View style={styles.breakdownRow}>
            {breakdown.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.segment,
                  {
                    flex: Math.max(0.05, item.score * item.weight),
                    backgroundColor:
                      idx === 0 ? "#f59e0b" : idx === 1 ? "#10b981" : idx === 2 ? "#38bdf8" : "#a855f7",
                  },
                ]}
              />
            ))}
          </View>
        ) : (
          <View style={[styles.solidBar, { width: `${Math.min(100, score)}%` }]} />
        )}
      </View>
      <Text style={styles.disclaimer}>
        Computational research index based on evidence alignment. Not medical guarantee.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#111116",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    padding: 12,
    borderRadius: 4,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scoreTitle: {
    color: "#a1a1aa",
    fontSize: 10,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  scoreValue: {
    color: "#f59e0b",
    fontSize: 22,
    fontWeight: "300",
    fontFamily: "monospace",
  },
  maxScore: {
    fontSize: 12,
    color: "#71717a",
  },
  barBackground: {
    height: 6,
    backgroundColor: "#1c1c22",
    overflow: "hidden",
  },
  breakdownRow: {
    flexDirection: "row",
    height: "100%",
  },
  segment: {
    height: "100%",
    marginRight: 1,
  },
  solidBar: {
    height: "100%",
    backgroundColor: "#f59e0b",
  },
  disclaimer: {
    color: "#71717a",
    fontSize: 9,
    fontFamily: "monospace",
    lineHeight: 12,
  },
});
