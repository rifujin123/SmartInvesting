import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IllustrationOnboarding1Props {
  width: number;
  height: number;
}

export const IllustrationOnboarding1: React.FC<IllustrationOnboarding1Props> = ({
  width,
  height,
}) => (
  <View style={[styles.container, { width, height }]}>
    {/* Main Phone */}
    <View style={styles.phone}>
      <View style={styles.phoneScreen}>
        {/* Header */}
        <View style={styles.phoneHeader}>
          <View style={styles.phoneAvatar} />
          <View style={styles.phoneHeaderText}>
            <View style={styles.phoneHeaderLine} />
            <View style={styles.phoneHeaderLineShort} />
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <View style={[styles.bar, styles.bar1]} />
          <View style={[styles.bar, styles.bar2]} />
          <View style={[styles.bar, styles.bar3]} />
          <View style={[styles.bar, styles.bar4]} />
          <View style={[styles.bar, styles.bar5]} />
        </View>

        {/* Cards */}
        <View style={styles.expenseCard}>
          <View style={styles.expenseIcon} />
          <View style={styles.expenseInfo}>
            <View style={styles.expenseLine} />
            <View style={styles.expenseLineShort} />
          </View>
          <Text style={styles.expenseAmount}>+240 VND</Text>
        </View>
        <View style={[styles.expenseCard, styles.expenseCard2]}>
          <View style={[styles.expenseIcon, styles.expenseIcon2]} />
          <View style={styles.expenseInfo}>
            <View style={styles.expenseLine} />
            <View style={styles.expenseLineShort} />
          </View>
          <Text style={[styles.expenseAmount, styles.expenseAmount2]}>-85 VND</Text>
        </View>
      </View>
    </View>

    {/* Floating Elements */}
    <View style={[styles.floatingCard, styles.floatingCard1]}>
      <View style={styles.floatingIcon} />
      <View style={styles.floatingText}>
        <View style={styles.floatingLine} />
        <View style={styles.floatingLineShort} />
      </View>
    </View>

    <View style={[styles.floatingBadge, styles.floatingBadge1]}>
      <Text style={styles.badgeText}>✓</Text>
    </View>

    <View style={[styles.floatingBadge, styles.floatingBadge2]}>
      <Text style={styles.badgeText}>📊</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  phone: {
    width: 180,
    height: 320,
    backgroundColor: "#1A1A2E",
    borderRadius: 32,
    padding: 12,
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -90,
    marginTop: -160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
  },
  phoneHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  phoneAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  phoneHeaderText: {
    marginLeft: 12,
  },
  phoneHeaderLine: {
    width: 80,
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginBottom: 4,
  },
  phoneHeaderLineShort: {
    width: 50,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  bar: {
    width: 24,
    backgroundColor: "#0836e6",
    borderRadius: 8,
  },
  bar1: { height: 40 },
  bar2: { height: 60 },
  bar3: { height: 80 },
  bar4: { height: 50 },
  bar5: { height: 30 },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  expenseCard2: {
    backgroundColor: "#FEF2F2",
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0836e620",
  },
  expenseIcon2: {
    backgroundColor: "#DC262620",
  },
  expenseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  expenseLine: {
    width: "70%",
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginBottom: 4,
  },
  expenseLineShort: {
    width: "40%",
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0836e6",
  },
  expenseAmount2: {
    color: "#DC2626",
  },
  floatingCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingCard1: {
    right: -20,
    top: 80,
    width: 140,
  },
  floatingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0836e620",
  },
  floatingText: {
    marginLeft: 10,
  },
  floatingLine: {
    width: 50,
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginBottom: 4,
  },
  floatingLineShort: {
    width: 30,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  floatingBadge: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0836e6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0836e6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingBadge1: {
    left: -10,
    top: 200,
  },
  floatingBadge2: {
    right: -5,
    bottom: 60,
  },
  badgeText: {
    fontSize: 18,
  },
});
