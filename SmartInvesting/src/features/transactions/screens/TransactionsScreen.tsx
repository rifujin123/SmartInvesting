import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { AppHeader } from "../../../shared/components";
import { MoneyText } from "../../../components/finance/MoneyText";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { walletsService } from "../../../services/wallets/walletsService";
import { transactionsService } from "../../../services/transactions/transactionsService";
import type { TransactionDto } from "../../../services/transactions/types";

type FilterKey = "all" | "income" | "expense";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "income", label: "Income" },
  { key: "expense", label: "Expense" },
];

export const TransactionsScreen: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadToken = useCallback(async () => {
    const { accessToken } = await tokenStorage.getTokens();
    if (accessToken) setToken(accessToken);
  }, []);

  const loadWallets = useCallback(async () => {
    if (!token) return;
    try {
      const { items } = await walletsService.getMyWallets(token);
      if (items.length > 0) setWalletId(items[0].id);
    } catch (e) {
      console.error("loadWallets error", e);
    }
  }, [token]);

  const loadTransactions = useCallback(async () => {
    if (!token || !walletId) return;
    try {
      const data = await transactionsService.getTransactionsByWallet(
        token,
        walletId,
        page,
        20,
      );
      setTransactions(data.items);
      setTotalCount(data.totalCount);
    } catch (e) {
      console.error("loadTransactions error", e);
    }
  }, [token, walletId, page]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (token) loadWallets();
  }, [token, loadWallets]);

  useEffect(() => {
    if (token && walletId) loadTransactions();
  }, [token, walletId, page, loadTransactions]);

  const filtered = activeFilter === "all"
    ? transactions
    : transactions.filter((t) =>
        activeFilter === "income" ? t.amount >= 0 : t.amount < 0,
      );

  const totalFlow = filtered.reduce((sum, t) => sum + t.amount, 0);

  const getTypeIcon = (t: TransactionDto): string => {
    if (t.categoryIcon) return t.categoryIcon;
    return t.amount >= 0 ? "arrow-down-circle" : "arrow-up-circle";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <AppHeader />

        <View style={styles.overviewCard}>
          <Text style={styles.eyebrow}>NET CASHFLOW</Text>
          <MoneyText
            amount={totalFlow}
            size="xl"
            color="default"
            showSign
            style={{ color: "#FFFFFF" }}
          />
          <Text style={styles.overviewCaption}>
            {filtered.length} transactions
          </Text>
        </View>

        <View style={styles.filterBar}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listLabel}>ENTRIES</Text>
            <Text style={styles.listCount}>{filtered.length}</Text>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            filtered.map((tx) => (
              <View key={tx.id} style={styles.txRow}>
                <View
                  style={[
                    styles.txIcon,
                    {
                      backgroundColor:
                        tx.amount >= 0 ? "#DCFCE7" : "#FEE2E2",
                    },
                  ]}
                >
                  <Ionicons
                    name={getTypeIcon(tx) as any}
                    size={20}
                    color={tx.amount >= 0 ? "#059669" : "#DC2626"}
                  />
                </View>
                <View style={styles.txMiddle}>
                  <Text style={styles.txTitle}>
                    {tx.note || tx.categoryName}
                  </Text>
                  <Text style={styles.txSubtitle}>{tx.categoryName}</Text>
                </View>
                <View style={styles.txRight}>
                  <MoneyText
                    amount={tx.amount}
                    size="md"
                    color={tx.amount >= 0 ? "success" : "loss"}
                    showSign
                  />
                  <Text style={styles.txDate}>
                    {new Date(tx.transactionDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.figma.surface },
  overviewCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.figma.appBg,
    borderRadius: 20,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  eyebrow: {
    ...typography.body,
    color: "#DBEAFE",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  overviewCaption: {
    ...typography.body,
    color: "#93C5FD",
    marginTop: spacing.xs,
    fontWeight: "500",
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  filterChipActive: {
    backgroundColor: colors.figma.appBg,
    borderColor: colors.figma.appBg,
  },
  filterText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: 13,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  listCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: 120,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  listLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  listCount: {
    ...typography.body,
    color: colors.textMuted,
    fontWeight: "600",
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  txMiddle: { flex: 1, gap: 2 },
  txTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  txSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  txRight: { alignItems: "flex-end", gap: 2 },
  txDate: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
  },
});