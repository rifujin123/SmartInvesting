import React, { useCallback, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppHeader } from "../../../shared/components";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { walletsService } from "../../../services/wallets/walletsService";
import type { WalletDto } from "../../../services/wallets/types";
import { transactionsService } from "../../../services/transactions/transactionsService";
import { MoneyText } from "../../../components/finance/MoneyText";
import { SkeletonCard } from "../../../components/finance/SkeletonCard";

interface DashboardScreenProps {
  onBuyAsset?: (type: "stock" | "etf" | "gold") => void;
}

const DASHBOARD_BLUE = "#3B82F6";
const HERO_BG = "#0F172A";
const SUCCESS = "#22C55E";
const LOSS = "#EF4444";
const SURFACE = "#F8FAFC";

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBuyAsset }) => {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [monthlyPnL, setMonthlyPnL] = useState(0);

  const netWorth = useMemo(
    () => wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setError(null);
      const { accessToken } = await tokenStorage.getTokens();

      if (!accessToken) {
        setWallets([]);
        setMonthlySpend(0);
        setMonthlyPnL(0);
        return;
      }

      const walletsRes = await walletsService.getMyWallets(accessToken);

      const walletItems = walletsRes.items ?? [];
      setWallets(walletItems);

      if (walletItems.length === 0) {
        setMonthlySpend(0);
        setMonthlyPnL(0);
        return;
      }

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const txResponses = await Promise.all(
        walletItems.map((wallet) =>
          transactionsService.getTransactionsByWallet(accessToken, wallet.id, 1, 100),
        ),
      );

      const monthlyTxs = txResponses
        .flatMap((res) => res.items ?? [])
        .filter((tx) => {
          const date = new Date(tx.transactionDate);
          return date.getMonth() === month && date.getFullYear() === year;
        });

      setMonthlySpend(
        monthlyTxs.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
      );
      setMonthlyPnL(monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData(false);
    }, [loadData]),
  );

  const openTransactions = useCallback(() => {
    navigation.navigate("Transactions");
  }, [navigation]);
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadData(true)} />}
      >
        <AppHeader />

        <View style={styles.screenPad}>
          {loading ? (
            <View style={styles.skeletonStack}>
              <SkeletonCard height={196} />
              <SkeletonCard height={128} />
              <SkeletonCard height={116} />
              <SkeletonCard height={184} />
            </View>
          ) : (
            <>
              {error ? (
                <View style={styles.errorBanner}>
                  <View style={styles.errorIcon}>
                    <Ionicons name="alert-circle" size={18} color={LOSS} />
                  </View>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => void loadData(false)}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.heroCard}>
                <View style={styles.heroGridAccent} />
                <View style={styles.heroTopRow}>
                  <View>
                    <Text style={styles.overline}>SMART SNAPSHOT</Text>
                    <Text style={styles.heroTitle}>Net Worth</Text>
                  </View>
                  <View style={styles.heroBadge}>
                    <Ionicons name="wallet" size={18} color="#FFFFFF" />
                  </View>
                </View>

                <MoneyText amount={netWorth} color="#FFFFFF" size="xl" style={styles.heroMoney} />

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatBlock}>
                    <Text style={styles.heroStatLabel}>MONTH P&L</Text>
                    <MoneyText
                      amount={monthlyPnL}
                      showSign
                      size="md"
                      color={monthlyPnL >= 0 ? SUCCESS : LOSS}
                      style={styles.heroStatMoney}
                    />
                  </View>
                  <View style={styles.heroDivider} />
                  <View style={styles.heroStatBlock}>
                    <Text style={styles.heroStatLabel}>WALLETS</Text>
                    <Text style={styles.heroStatNumber}>{wallets.length}</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.monthCard} activeOpacity={0.82} onPress={openTransactions}>
                <View style={styles.monthLeftRail} />
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardTitle}>Monthly Spend</Text>
                    <Text style={styles.cardCaption}>Current month expenses</Text>
                  </View>
                  <View style={styles.arrowPill}>
                    <Ionicons name="arrow-forward" size={16} color={DASHBOARD_BLUE} />
                  </View>
                </View>
                <View style={styles.monthAmountRow}>
                  <MoneyText amount={monthlySpend} color={LOSS} size="lg" style={styles.monthMoney} />
                  <Text style={[styles.pillText, { color: monthlyPnL >= 0 ? SUCCESS : LOSS }]}>
                    {monthlyPnL >= 0 ? "Cashflow +" : "Cashflow −"}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actionGrid}>
                <TouchableOpacity style={styles.actionCard} activeOpacity={0.82} onPress={() => onBuyAsset?.("stock")}>
                  <View style={[styles.actionIcon, { backgroundColor: "#DBEAFE" }]}>
                    <Ionicons name="trending-up" size={22} color="#2563EB" />
                  </View>
                  <Text style={styles.actionTitle}>Buy Asset</Text>
                  <Text style={styles.actionCaption}>Stock · ETF · gold</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionCard} activeOpacity={0.82} onPress={openTransactions}>
                  <View style={[styles.actionIcon, { backgroundColor: "#DCFCE7" }]}>
                    <Ionicons name="add-circle" size={22} color="#16A34A" />
                  </View>
                  <Text style={styles.actionTitle}>Add Tx</Text>
                  <Text style={styles.actionCaption}>Income or expense</Text>
                </TouchableOpacity>
              </View>

              {wallets.length === 0 ? (
                <View style={styles.emptyWalletCard}>
                  <Ionicons name="wallet-outline" size={24} color={DASHBOARD_BLUE} />
                  <View style={styles.emptyWalletTextWrap}>
                    <Text style={styles.emptyTitle}>No wallet yet</Text>
                    <Text style={styles.emptyText}>Create a wallet in Finance to unlock net worth tracking.</Text>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const cardShadow = {
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.08,
  shadowRadius: 18,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screenPad: {
    paddingHorizontal: 20,
    paddingBottom: spacing["2xl"],
    gap: spacing.xl,
  },
  skeletonStack: {
    gap: spacing.base,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 16,
    padding: spacing.base,
  },
  errorIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: LOSS,
  },
  retryBtn: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: LOSS,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  heroCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: HERO_BG,
    borderRadius: 20,
    padding: spacing.xl,
    ...cardShadow,
    shadowOpacity: 0.18,
  },
  heroGridAccent: {
    position: "absolute",
    right: -42,
    top: -34,
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "rgba(59,130,246,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.4,
    color: "#94A3B8",
  },
  heroTitle: {
    marginTop: 2,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  heroMoney: {
    marginTop: spacing.lg,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.4,
  },
  heroStatsRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: spacing.base,
  },
  heroStatBlock: {
    flex: 1,
  },
  heroDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginHorizontal: spacing.base,
  },
  heroStatLabel: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  heroStatMoney: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
  },
  heroStatNumber: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  monthCard: {
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.base,
    ...cardShadow,
  },
  monthLeftRail: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: LOSS,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  cardCaption: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  arrowPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthAmountRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  monthMoney: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
  },
  pillText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
  actionGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.base,
    minHeight: 118,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  actionCaption: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  emptyState: {
    marginTop: spacing.lg,
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: spacing.sm,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptyWalletCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 16,
    padding: spacing.base,
  },
  emptyWalletTextWrap: {
    flex: 1,
  },
});
