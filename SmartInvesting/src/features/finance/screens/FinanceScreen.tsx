import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AppTabParamList } from "../../../shared/navigation/types";
import { AppHeader } from "../../../shared/components";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { MoneyText } from "../../../components/finance/MoneyText";
import { SegmentedControl } from "../../../components/finance/SegmentedControl";
import { TransactionRow } from "../../../components/finance/TransactionRow";
import { SkeletonCard } from "../../../components/finance/SkeletonCard";
import { BudgetsScreen } from "./BudgetsScreen";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { walletsService } from "../../../services/wallets/walletsService";
import { transactionsService } from "../../../services/transactions/transactionsService";
import { financeService } from "../../../services/finance/financeService";
import type { WalletDto } from "../../../services/wallets/types";
import type { TransactionDto } from "../../../services/transactions/types";
import type { BudgetDto, BudgetSummaryDto, GoalDto } from "../../../services/finance/types";

type FinanceTab = "overview" | "transactions" | "budgets";
type FinanceNavigation = BottomTabNavigationProp<AppTabParamList, "Finance">;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Design tokens from DESIGN_FLOWCHART.md
const designTokens = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceCard: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  primary: "#3B82F6",
  primaryHover: "#2563EB",
  primaryPressed: "#1D4ED8",
  primaryLight: "#EFF6FF",
  success: "#22C55E",
  successLight: "#F0FDF4",
  loss: "#EF4444",
  lossLight: "#FEF2F2",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  heroBg: "#0F172A",
  heroText: "#FFFFFF",
  heroMuted: "#94A3B8",
};

export const FinanceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");
  const navigation = useNavigation<FinanceNavigation>();

  // Auth & Wallet state
  const [token, setToken] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletDto | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  // Data state
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [budgetSummaries, setBudgetSummaries] = useState<BudgetSummaryDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionDto[]>([]);

  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load auth token
  const loadToken = useCallback(async () => {
    const { accessToken } = await tokenStorage.getTokens();
    if (accessToken) setToken(accessToken);
  }, []);

  // Load all data in parallel (per flowchart)
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      // Parallel requests per DESIGN_FLOWCHART.md flowchart
      const [walletsRes, budgetsRes] = await Promise.all([
        walletsService.getMyWallets(token),
        financeService.getBudgets(token),
      ]);

      setWallets(walletsRes.items);

      // Select active wallet (first one)
      if (walletsRes.items.length > 0) {
        setActiveWallet(walletsRes.items[0]);
      }

      // Filter budgets by current month/year
      const filteredBudgets = budgetsRes.filter(
        (b) => b.month === currentMonth.month && b.year === currentMonth.year,
      );
      setBudgets(filteredBudgets);

      // Get budget summaries in parallel
      const summaries = await Promise.all(
        filteredBudgets.map(async (budget) => {
          try {
            return await financeService.getBudgetSummary(token, budget.id);
          } catch {
            return {
              ...budget,
              budgetId: budget.id,
              totalSpent: 0,
              remaining: budget.amountLimit,
            };
          }
        }),
      );
      setBudgetSummaries(summaries);

      // Load goals (filter not completed)
      const goalsData = await financeService.getGoals(token);
      setGoals(goalsData.filter((g) => !g.isCompleted));

      // Load recent transactions (top 5)
      if (walletsRes.items.length > 0) {
        const txRes = await transactionsService.getTransactionsByWallet(
          token,
          walletsRes.items[0].id,
          1, // page
          5  // pageSize
        );
        setRecentTx(txRes.items);
      }
    } catch (e) {
      console.error("loadData error", e);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, currentMonth]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  // Computed values
  const totalBudget = budgets.reduce((sum, b) => sum + b.amountLimit, 0);
  const totalSpent = budgetSummaries.reduce((sum, b) => sum + b.totalSpent, 0);
  const remaining = budgetSummaries.reduce((sum, b) => sum + b.remaining, 0);
  const monthLabel = `${monthNames[currentMonth.month - 1]} ${currentMonth.year}`;
  const progressPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Progress bar color per token spec
  const getProgressColor = (percent: number) => {
    if (percent >= 90) return designTokens.loss;
    if (percent >= 70) return designTokens.warning;
    return designTokens.success;
  };

  const changeMonth = (delta: number) => {
    let m = currentMonth.month + delta;
    let y = currentMonth.year;
    if (m > 12) { m = 1; y += 1; }
    else if (m < 1) { m = 12; y -= 1; }
    setCurrentMonth({ month: m, year: y });
  };

  const handleAddTransaction = () => {
    navigation.navigate("Transactions");
  };

  const handleAddGoal = () => {
    // TODO: navigate to Goals screen when available
  };

  const handleViewAllTx = () => {
    navigation.navigate("Transactions");
  };

  const handleGoalPress = (_goalId: number) => {
    // TODO: navigate to GoalDetail when available
  };

  // Budgets tab
  if (activeTab === "budgets") {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader />
          <View style={styles.segmentWrap}>
            <SegmentedControl
              options={[
                { label: "Overview", value: "overview" },
                { label: "Transactions", value: "transactions" },
                { label: "Budgets", value: "budgets" },
              ]}
              selectedValue={activeTab}
              onChange={(value) => setActiveTab(value as FinanceTab)}
            />
          </View>
          <BudgetsScreen embedded />
        </ScrollView>
      </View>
    );
  }

  // Transactions tab
  if (activeTab === "transactions") {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppHeader />
          <View style={styles.segmentWrap}>
            <SegmentedControl
              options={[
                { label: "Overview", value: "overview" },
                { label: "Transactions", value: "transactions" },
                { label: "Budgets", value: "budgets" },
              ]}
              selectedValue={activeTab}
              onChange={(value) => setActiveTab(value as FinanceTab)}
            />
          </View>
          {/* Recent tx list - navigate to Transactions screen */}
          <TouchableOpacity onPress={handleViewAllTx} style={styles.viewAllCard}>
            <Text style={styles.viewAllText}>View all transactions →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Loading state - skeleton per DESIGN_FLOWCHART.md
  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.heroSkeleton}>
          <SkeletonCard height={200} />
        </View>
        <View style={styles.contentPad}>
          <SkeletonCard height={100} />
        </View>
      </View>
    );
  }

  // No token - empty state
  if (!token) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color={designTokens.textMuted} />
          <Text style={styles.emptyTitle}>Please login</Text>
          <Text style={styles.emptySubtitle}>Sign in to view your finances</Text>
        </View>
      </View>
    );
  }

  // No wallet - onboarding
  if (wallets.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color={designTokens.textMuted} />
          <Text style={styles.emptyTitle}>Create your first wallet</Text>
          <TouchableOpacity style={styles.createWalletBtn}>
            <Text style={styles.createWalletText}>NEW WALLET</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <AppHeader />

        {/* HERO CARD - Dark hero per token spec */}
        <TouchableOpacity style={styles.hero} activeOpacity={0.9}>
          <View style={styles.heroTopline}>
            <TouchableOpacity
              style={styles.monthPicker}
              onPress={() => changeMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color={designTokens.heroText} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity
              style={styles.monthPicker}
              onPress={() => changeMonth(1)}
            >
              <Ionicons name="chevron-forward" size={20} color={designTokens.heroText} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>REMAINING</Text>
          <MoneyText
            amount={remaining}
            size="lg"
            style={styles.heroBalance}
            color={designTokens.heroText}
          />

          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>SPENT</Text>
              <MoneyText amount={totalSpent} size="md" color={designTokens.heroMuted} />
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>BUDGET</Text>
              <MoneyText amount={totalBudget} size="md" color={designTokens.heroText} />
            </View>
          </View>

          {/* Progress bar per token spec */}
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(progressPercent, 100)}%`,
                  backgroundColor: getProgressColor(progressPercent),
                },
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* SEGMENTED TABS */}
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={[
              { label: "Overview", value: "overview" },
              { label: "Transactions", value: "transactions" },
              { label: "Budgets", value: "budgets" },
            ]}
            selectedValue={activeTab}
            onChange={(value) => setActiveTab(value as FinanceTab)}
          />
        </View>

        {/* KPI GRID */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>BUDGETS</Text>
            <Text style={styles.kpiValue}>{budgets.length}</Text>
            <Text style={styles.kpiCaption}>active this month</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>GOALS</Text>
            <Text style={styles.kpiValue}>{goals.length}</Text>
            <Text style={styles.kpiCaption}>in progress</Text>
          </View>
        </View>

        {/* GOALS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>GOALS</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddGoal}>
              <Ionicons name="add" size={16} color={designTokens.heroText} />
              <Text style={styles.addBtnText}>NEW</Text>
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="flag-outline" size={32} color={designTokens.textMuted} />
              <Text style={styles.emptyCardText}>No goals yet</Text>
              <Text style={styles.emptyCardSubtext}>Start a savings goal</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {goals.slice(0, 3).map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={styles.goalRow}
                  onPress={() => handleGoalPress(goal.id)}
                >
                  <View style={styles.goalLeft}>
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: goal.color || designTokens.primary }
                      ]}
                    >
                      <Ionicons
                        name={(goal.icon as keyof typeof Ionicons.glyphMap) || "flag"}
                        size={16}
                        color={designTokens.heroText}
                      />
                    </View>
                    <View>
                      <Text style={styles.goalName}>{goal.name}</Text>
                      <Text style={styles.goalAmount}>
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.goalPercent}>
                    {Math.round(goal.progressPercent)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* RECENT TRANSACTIONS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT TRANSACTIONS</Text>
            <TouchableOpacity onPress={handleViewAllTx}>
              <Text style={styles.sectionAction}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color={designTokens.textMuted} />
              <Text style={styles.emptyCardText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {recentTx.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={{
                    id: tx.id,
                    type: tx.amount >= 0 ? 'deposit' : 'withdraw',
                    title: tx.categoryName || 'Transaction',
                    subtitle: tx.note || '',
                    amount: tx.amount,
                    date: tx.transactionDate,
                    icon: tx.categoryIcon as any,
                  }}
                  onPress={() => {}}
                />
              ))}
            </View>
          )}
        </View>

        {/* Bottom spacer for FAB */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB - Add Transaction */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTransaction}>
        <Ionicons name="add" size={28} color={designTokens.heroText} />
      </TouchableOpacity>
    </View>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designTokens.background,
  },
  contentPad: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  // Hero card per design token spec
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing["2xl"],
    backgroundColor: designTokens.heroBg,
    borderRadius: 20,
    shadowColor: designTokens.heroBg,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  monthPicker: {
    padding: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  monthLabel: {
    ...typography.body,
    color: designTokens.heroText,
    fontWeight: "600",
  },
  heroTitle: {
    ...typography.caption,
    color: designTokens.heroMuted,
    fontWeight: "600",
    letterSpacing: 1,
  },
  heroBalance: {
    fontSize: 36,
    fontWeight: "700",
    color: designTokens.heroText,
    marginTop: spacing.xs,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
  },
  budgetItem: { flex: 1 },
  budgetLabel: {
    ...typography.body,
    color: designTokens.heroMuted,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  budgetDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: spacing.lg,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Segmented tabs
  segmentWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  // KPI grid
  kpiGrid: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: designTokens.surfaceCard,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: designTokens.border,
  },
  kpiLabel: {
    ...typography.caption,
    color: designTokens.textSecondary,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "700",
    color: designTokens.textPrimary,
    marginTop: spacing.xs,
  },
  kpiCaption: {
    ...typography.caption,
    color: designTokens.textMuted,
    marginTop: spacing.xs,
  },

  // Section
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: designTokens.textPrimary,
    fontWeight: "700",
  },
  sectionAction: {
    ...typography.caption,
    color: designTokens.primary,
    fontWeight: "600",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: designTokens.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  addBtnText: {
    ...typography.caption,
    color: designTokens.heroText,
    fontWeight: "600",
  },

  // Empty & List cards
  emptyCard: {
    marginHorizontal: spacing.xl,
    padding: spacing["2xl"],
    backgroundColor: designTokens.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: designTokens.border,
    alignItems: "center",
  },
  emptyCardText: {
    ...typography.body,
    color: designTokens.textSecondary,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  emptyCardSubtext: {
    ...typography.caption,
    color: designTokens.textMuted,
    marginTop: spacing.xs,
  },
  listCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: designTokens.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: designTokens.border,
    overflow: "hidden",
  },

  // Goal row
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: designTokens.borderLight,
  },
  goalLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  goalName: {
    ...typography.body,
    color: designTokens.textPrimary,
    fontWeight: "600",
  },
  goalAmount: {
    ...typography.caption,
    color: designTokens.textSecondary,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: "700",
    color: designTokens.textPrimary,
  },

  // Loading skeleton
  heroSkeleton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.title,
    color: designTokens.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    color: designTokens.textMuted,
    marginTop: spacing.sm,
  },
  createWalletBtn: {
    marginTop: spacing.lg,
    backgroundColor: designTokens.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: 12,
  },
  createWalletText: {
    ...typography.button,
    color: designTokens.heroText,
  },

  // View all card
  viewAllCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: designTokens.surfaceCard,
    borderRadius: 16,
    alignItems: "center",
  },
  viewAllText: {
    ...typography.body,
    color: designTokens.primary,
    fontWeight: "600",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: spacing["2xl"],
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: designTokens.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: designTokens.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Bottom spacer
  bottomSpacer: {
    height: 100,
  },
});