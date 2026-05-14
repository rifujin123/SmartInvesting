import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IllustrationOnboarding3Props {
  width: number;
  height: number;
}

export const IllustrationOnboarding3: React.FC<IllustrationOnboarding3Props> = ({
  width,
  height,
}) => (
  <View style={[styles.container, { width, height }]}>
    {/* Main Loan Card */}
    <View style={styles.loanCard}>
      <View style={styles.loanHeader}>
        <View style={styles.loanIcon}>
          <Text style={styles.loanIconText}>🏦</Text>
        </View>
        <View style={styles.loanHeaderText}>
          <Text style={styles.loanTitle}>Personal Loan</Text>
          <Text style={styles.loanSubtitle}>Low interest rate</Text>
        </View>
      </View>

      <View style={styles.loanAmount}>
        <Text style={styles.loanCurrency}>VND</Text>
        <Text style={styles.loanValue}>50,000</Text>
      </View>

      <View style={styles.loanDetails}>
        <View style={styles.loanDetail}>
          <Text style={styles.loanDetailLabel}>Interest</Text>
          <Text style={styles.loanDetailValue}>5.5%</Text>
        </View>
        <View style={styles.loanDivider} />
        <View style={styles.loanDetail}>
          <Text style={styles.loanDetailLabel}>Term</Text>
          <Text style={styles.loanDetailValue}>36 mo</Text>
        </View>
        <View style={styles.loanDivider} />
        <View style={styles.loanDetail}>
          <Text style={styles.loanDetailLabel}>Monthly</Text>
          <Text style={styles.loanDetailValue}>1,520 VND</Text>
        </View>
      </View>

      <View style={styles.loanProgress}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.progressText}>75% approved</Text>
      </View>

      <View style={styles.loanButton}>
        <Text style={styles.loanButtonText}>Apply Now</Text>
      </View>
    </View>

    {/* Floating Elements */}
    <View style={[styles.floatingCard, styles.floatingCard1]}>
      <View style={styles.floatingCheck}>
        <Text style={styles.floatingCheckText}>✓</Text>
      </View>
      <View style={styles.floatingContent}>
        <Text style={styles.floatingTitle}>Approved!</Text>
        <Text style={styles.floatingSubtitle}>Just now</Text>
      </View>
    </View>

    <View style={[styles.floatingCard, styles.floatingCard2]}>
      <View style={styles.floatingIcon}>
        <Text style={styles.floatingIconText}>📈</Text>
      </View>
      <View style={styles.floatingContent}>
        <View style={styles.floatingLine} />
        <View style={styles.floatingLineShort} />
      </View>
    </View>

    {/* Coins Stack */}
    <View style={[styles.coinStack, styles.coinStack1]}>
      <View style={styles.coin} />
      <View style={[styles.coin, styles.coinOffset]} />
      <View style={[styles.coin, styles.coinOffset2]} />
    </View>

    <View style={[styles.coinStack, styles.coinStack2]}>
      <View style={[styles.coin, styles.coinSmall]} />
      <View style={[styles.coin, styles.coinSmall, styles.coinOffset]} />
    </View>

    {/* Decorative Circles */}
    <View style={[styles.decorCircle, styles.decorCircle1]} />
    <View style={[styles.decorCircle, styles.decorCircle2]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  loanCard: {
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -150,
    marginTop: -120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loanHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  loanIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0836e615",
    justifyContent: "center",
    alignItems: "center",
  },
  loanIconText: {
    fontSize: 24,
  },
  loanHeaderText: {
    marginLeft: 14,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  loanSubtitle: {
    fontSize: 14,
    color: "#0836e6",
    marginTop: 2,
  },
  loanAmount: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  loanCurrency: {
    fontSize: 24,
    fontWeight: "600",
    color: "#0F172A",
    marginTop: 6,
  },
  loanValue: {
    fontSize: 44,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -1,
  },
  loanDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  loanDetail: {
    alignItems: "center",
    flex: 1,
  },
  loanDetailLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  loanDetailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  loanDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#E2E8F0",
  },
  loanProgress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "75%",
    backgroundColor: "#0836e6",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  loanButton: {
    backgroundColor: "#0836e6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  loanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  floatingCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  floatingCard1: {
    right: -10,
    top: 60,
    width: 140,
  },
  floatingCard2: {
    left: -20,
    bottom: 100,
    width: 130,
  },
  floatingCheck: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0836e6",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingCheckText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  floatingContent: {
    marginLeft: 10,
  },
  floatingTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  floatingSubtitle: {
    fontSize: 12,
    color: "#64748B",
  },
  floatingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },
  floatingIconText: {
    fontSize: 18,
  },
  floatingLine: {
    width: 60,
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    marginBottom: 4,
  },
  floatingLineShort: {
    width: 40,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
  },
  coinStack: {
    position: "absolute",
  },
  coinStack1: {
    left: -15,
    top: 150,
  },
  coinStack2: {
    right: 0,
    bottom: 50,
  },
  coin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    position: "absolute",
  },
  coinSmall: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  coinOffset: {
    top: -6,
    left: 4,
  },
  coinOffset2: {
    top: -12,
    left: 8,
  },
  decorCircle: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  decorCircle1: {
    width: 80,
    height: 80,
    right: 30,
    bottom: 150,
  },
  decorCircle2: {
    width: 50,
    height: 50,
    left: 20,
    top: 50,
  },
});
