import React from "react";
import { View, StyleSheet } from "react-native";

interface SkeletonCardProps {
  height?: number;
  width?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 80,
  width,
}) => {
  return (
    <View style={[styles.skeleton, { height, width }]}>
      <View style={styles.shimmer} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 16,
    overflow: "hidden",
  },
  shimmer: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    opacity: 0.5,
  },
});