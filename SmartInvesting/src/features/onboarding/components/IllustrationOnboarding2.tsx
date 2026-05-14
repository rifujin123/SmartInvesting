import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IllustrationOnboarding2Props {
  width: number;
  height: number;
}

export const IllustrationOnboarding2: React.FC<IllustrationOnboarding2Props> = ({
  width,
  height,
}) => (
  <View style={[styles.container, { width, height }]}>
    {/* Main Card */}
    <View style={styles.mainCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardLogo} />
        <Text style={styles.cardTitle}>Smart Pay</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>Send Money</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currency}>VND</Text>
          <Text style={styles.amount}>2,450</Text>
        </View>

        <View style={styles.recipientContainer}>
          <View style={styles.recipientAvatar} />
          <View style={styles.recipientInfo}>
            <View style={styles.recipientName} />
            <View style={styles.recipientBank} />
          </View>
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Pay Now</Text>
        </View>
      </View>
    </View>

    {/* Floating Elements */}
    <View style={[styles.floatingCard, styles.floatingCard1]}>
      <View style={styles.floatingIcon}>
        <Text style={styles.floatingIconText}>💳</Text>
      </View>
      <View style={styles.floatingContent}>
        <View style={styles.floatingLine} />
        <View style={styles.floatingLineShort} />
      </View>
      <Text style={styles.floatingAmount}>+120 VND</Text>
    </View>

    <View style={[styles.floatingCard, styles.floatingCard2]}>
      <View style={[styles.floatingIcon, styles.floatingIconGreen]}>
        <Text style={styles.floatingIconText}>📱</Text>
      </View>
      <View style={styles.floatingContent}>
        <View style={styles.floatingLine} />
        <View style={styles.floatingLineShort} />
      </View>
      <Text style={[styles.floatingAmount, styles.floatingAmountGreen]}>Success</Text>
    </View>

    {/* Coins */}
    <View style={[styles.coin, styles.coin1]}>
      <Text style={styles.coinText}>VND</Text>
    </View>
    <View style={[styles.coin, styles.coin2]}>
      <Text style={styles.coinText}>€</Text>
    </View>
    <View style={[styles.coin, styles.coin3]}>
      <Text style={styles.coinText}>£</Text>
    </View>

    {/* Dots Pattern */}
    <View style={styles.dotsPattern}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  mainCard: {
    width: 280,
    backgroundColor: "#0F172A",
    borderRadius: 24,
    padding: 24,
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -140,
    marginTop: -140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 30,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0836e6",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  cardBody: {
    alignItems: "center",
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  currency: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 8,
  },
  amount: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    width: "100%",
  },
  recipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0836e640",
  },
  recipientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recipientName: {
    width: "60%",
    height: 12,
    backgroundColor: "#475569",
    borderRadius: 6,
    marginBottom: 6,
  },
  recipientBank: {
    width: "40%",
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0836e6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cardFooter: {
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#0836e6",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  floatingCard1: {
    left: -30,
    top: 100,
    width: 160,
  },
  floatingCard2: {
    right: -20,
    bottom: 120,
    width: 150,
  },
  floatingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingIconGreen: {
    backgroundColor: "#D1FAE5",
  },
  floatingIconText: {
    fontSize: 18,
  },
  floatingContent: {
    flex: 1,
    marginLeft: 10,
  },
  floatingLine: {
    width: "70%",
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginBottom: 4,
  },
  floatingLineShort: {
    width: "40%",
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  floatingAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#DC2626",
  },
  floatingAmountGreen: {
    color: "#0836e6",
  },
  coin: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  coin1: {
    right: 20,
    top: 50,
  },
  coin2: {
    left: 10,
    bottom: 150,
  },
  coin3: {
    right: -5,
    top: 220,
  },
  coinText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F59E0B",
  },
  dotsPattern: {
    position: "absolute",
    flexDirection: "row",
    flexWrap: "wrap",
    width: 60,
    right: 0,
    top: 300,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    margin: 3,
  },
});
