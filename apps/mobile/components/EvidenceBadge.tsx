import { StyleSheet, Text, View } from "react-native";
import type { EvidenceDirection } from "@biotech-arbitrage/types";

interface EvidenceBadgeProps {
  direction: EvidenceDirection;
  type?: string;
}

export function EvidenceBadge({ direction, type }: EvidenceBadgeProps) {
  const isSupporting = direction === "supporting";
  const isContradicting = direction === "contradicting";

  const badgeStyle = isSupporting
    ? styles.supportingBadge
    : isContradicting
    ? styles.contradictingBadge
    : styles.neutralBadge;

  const textStyle = isSupporting
    ? styles.supportingText
    : isContradicting
    ? styles.contradictingText
    : styles.neutralText;

  return (
    <View style={[styles.container, badgeStyle]}>
      <Text style={[styles.text, textStyle]}>
        {direction.toUpperCase()} {type ? `// ${type.toUpperCase()}` : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 2,
  },
  supportingBadge: {
    borderColor: "rgba(16, 185, 129, 0.6)",
    backgroundColor: "rgba(6, 78, 59, 0.4)",
  },
  contradictingBadge: {
    borderColor: "rgba(244, 63, 94, 0.6)",
    backgroundColor: "rgba(136, 19, 55, 0.4)",
  },
  neutralBadge: {
    borderColor: "rgba(245, 158, 11, 0.6)",
    backgroundColor: "rgba(120, 53, 15, 0.4)",
  },
  text: {
    fontSize: 9,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  supportingText: {
    color: "#6ee7b7",
  },
  contradictingText: {
    color: "#fda4af",
  },
  neutralText: {
    color: "#fde68a",
  },
});
