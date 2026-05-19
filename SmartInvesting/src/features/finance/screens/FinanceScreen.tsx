import React, { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { walletsService } from "../../../services/wallets/walletsService";
import { financeService } from "../../../services/finance/financeService";
import { transactionsService } from "../../../services/transactions/transactionsService";
import { formatVnd } from "../../../utils/formatCurrency";
import type { WalletDto } from "../../../services/wallets/types";
import type { BudgetDto, BudgetSummaryDto, GoalDto } from "../../../services/finance/types";
import type { TransactionDto } from "../../../services/transactions/types";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabParamList } from "../../../shared/navigation/types";
import { AppHeader } from "../../../shared/components";
import { SegmentedControl, TransactionRow, WalletPill } from "../../../components/finance";
import { GlassCard } from "../../../components/finance";
import { ShimmerBar } from "../../../components/finance";

type FinanceTab = "overview" | "transactions" | "budgets";
type FinanceNavigation = BottomTabNavigationProp<AppTabParamList, "Finance">;

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const FinanceScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<FinanceNavigation>();

  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");
  const [token, setToken] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletDto[]>([]);
  const [activeWallet, setActiveWallet] = useState<WalletDto | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });

  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [budgetSummaries, setBudgetSummaries] = useState<BudgetSummaryDto[]>([]);
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [recentTx, setRecentTx] = useState<TransactionDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");
  const [walletCurrency, setWalletCurrency] = useState("VND");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTargetAmount, setGoalTargetAmount] = useState("");
  const [goalIcon, setGoalIcon] = useState("flag");
  const [goalColor, setGoalColor] = useState<string>(colors.primary);
  const [goalSubmitting, setGoalSubmitting] = useState(false);
  const [goalModalError, setGoalModalError] = useState<string | null>(null);

  const loadToken = useCallback(async () => {
    const { accessToken } = await tokenStorage.getTokens();
    if (accessToken) setToken(accessToken);
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [walletsRes, budgetsRes] = await Promise.all([
        walletsService.getMyWallets(token),
        financeService.getBudgets(token),
      ]);

      setWallets(walletsRes.items);

      if (walletsRes.items.length > 0) {
        setActiveWallet(walletsRes.items[0]);
      }

      const filteredBudgets = budgetsRes.filter(
        (b) => b.month === currentMonth.month && b.year === currentMonth.year,
      );
      setBudgets(filteredBudgets);

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

      const goalsData = await financeService.getGoals(token);
      setGoals(goalsData.filter((g) => !g.isCompleted));

      if (walletsRes.items.length > 0) {
        const txRes = await transactionsService.getTransactionsByWallet(
          token,
          walletsRes.items[0].id,
          1,
          5
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

  useMemo(() => {
    loadToken();
  }, [loadToken]);

  useMemo(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  const totalBudget = budgets.reduce((sum, b) => sum + b.amountLimit, 0);
  const totalSpent = budgetSummaries.reduce((sum, b) => sum + b.totalSpent, 0);
  const remaining = budgetSummaries.reduce((sum, b) => sum + b.remaining, 0);
  const monthLabel = `${monthNames[currentMonth.month - 1]} ${currentMonth.year}`;
  const progressPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return colors.loss;
    if (percent >= 70) return colors.warning;
    return colors.gain;
  };

  const changeMonth = (delta: number) => {
    let m = currentMonth.month + delta;
    let y = currentMonth.year;
    if (m > 12) { m = 1; y += 1; }
    else if (m < 1) { m = 12; y -= 1; }
    setCurrentMonth({ month: m, year: y });
  };

  const handleAddGoal = () => {
    setGoalName("");
    setGoalTargetAmount("");
    setGoalIcon("flag");
    setGoalColor(colors.primary);
    setGoalModalError(null);
    setShowCreateGoalModal(true);
  };

  const handleViewAllTx = () => {
    navigation.navigate("Transactions");
  };

  const resetCreateWalletForm = () => {
    setWalletName("");
    setWalletBalance("0");
    setWalletCurrency("VND");
    setModalError(null);
  };

  const openCreateWalletModal = () => {
    resetCreateWalletForm();
    setShowCreateModal(true);
  };

  const closeCreateWalletModal = () => {
    setShowCreateModal(false);
    setIsSubmitting(false);
    setModalError(null);
  };

  const submitCreateWallet = async () => {
    if (!token) return;

    const name = walletName.trim();
    if (!name) {
      setModalError("Wallet name required");
      return;
    }
    if (name.length > 50) {
      setModalError("Wallet name too long");
      return;
    }

    const balanceNum = Number(walletBalance);
    if (!Number.isFinite(balanceNum) || balanceNum < 0) {
      setModalError("Balance must be number >= 0");
      return;
    }

    if (!["VND", "USD"].includes(walletCurrency)) {
      setModalError("Currency invalid");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      const created = await walletsService.createWallet(token, {
        name,
        balance: balanceNum,
        currency: walletCurrency,
        isPaper: false,
      });

      await loadData();
      setActiveWallet(created);

      closeCreateWalletModal();
      Alert.alert("Wallet created", `Created: ${created.name}`);
    } catch (e) {
      console.error("createWallet error", e);
      setModalError("Create wallet failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeCreateGoalModal = () => {
    setShowCreateGoalModal(false);
    setGoalSubmitting(false);
    setGoalModalError(null);
  };

  const submitCreateGoal = async () => {
    if (!token) return;

    const name = goalName.trim();
    const targetAmount = Number(goalTargetAmount);

    if (!name) {
      setGoalModalError("Goal name required");
      return;
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      setGoalModalError("Target amount must be greater than 0");
      return;
    }

    try {
      setGoalSubmitting(true);
      setGoalModalError(null);

      const createdGoal = await financeService.createGoal(token, {
        name,
        targetAmount,
        icon: goalIcon,
        color: goalColor,
      });

      setGoals((prev) => [createdGoal, ...prev.filter((goal) => goal.id !== createdGoal.id)]);
      closeCreateGoalModal();
      Alert.alert("Goal created", `Created: ${createdGoal.name}`);
    } catch (e) {
      console.error("createGoal error", e);
      setGoalModalError("Create goal failed");
    } finally {
      setGoalSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader />
        <View style={styles.screenPad}>
          <ShimmerBar width="100%" height={200} borderRadius={20} />
          <ShimmerBar width="100%" height={100} borderRadius={16} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader />
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Please login</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Sign in to view your finances</Text>
        </View>
      </View>
    );
  }

  if (wallets.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader />
        <View style={styles.emptyState}>
          <Ionicons name="add-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Create your first wallet</Text>
          <TouchableOpacity style={[styles.createWalletBtn, { backgroundColor: colors.primary }]} onPress={openCreateWalletModal}>
            <Text style={[styles.createWalletText, { color: colors.text }]}>NEW WALLET</Text>
          </TouchableOpacity>
        </View>
        {renderCreateWalletModal()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        <AppHeader />

        <TouchableOpacity style={[styles.hero, { backgroundColor: "#0F172A" }]} activeOpacity={0.9}>
          <View style={styles.heroTopline}>
            <TouchableOpacity style={styles.monthPicker} onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity style={styles.monthPicker} onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle}>REMAINING</Text>
          <Text style={[styles.heroBalance, { color: colors.text }]}>{formatVnd(remaining)}</Text>

          <View style={styles.budgetRow}>
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>SPENT</Text>
              <Text style={[styles.budgetValue, { color: colors.textSecondary }]}>{formatVnd(totalSpent)}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetItem}>
              <Text style={styles.budgetLabel}>BUDGET</Text>
              <Text style={[styles.budgetValue, { color: colors.text }]}>{formatVnd(totalBudget)}</Text>
            </View>
          </View>

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

        <View style={styles.kpiGrid}>
          <GlassCard>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>BUDGETS</Text>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{budgets.length}</Text>
              <Text style={[styles.kpiCaption, { color: colors.textSecondary }]}>active this month</Text>
            </View>
          </GlassCard>
          <GlassCard>
            <View style={styles.kpiCard}>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>GOALS</Text>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{goals.length}</Text>
              <Text style={[styles.kpiCaption, { color: colors.textSecondary }]}>in progress</Text>
            </View>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>GOALS</Text>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddGoal}>
              <Ionicons name="add" size={16} color={colors.text} />
              <Text style={[styles.addBtnText, { color: colors.text }]}>NEW</Text>
            </TouchableOpacity>
          </View>

          {goals.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="flag-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>No goals yet</Text>
              <Text style={[styles.emptyCardSubtext, { color: colors.textSecondary }]}>Start a savings goal</Text>
            </GlassCard>
          ) : (
            <GlassCard>
              {goals.slice(0, 3).map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[styles.goalRow, { borderBottomColor: colors.cardBorder }]}
                  onPress={() => {}}
                >
                  <View style={styles.goalLeft}>
                    <View
                      style={[
                        styles.goalIcon,
                        { backgroundColor: goal.color || colors.primary }
                      ]}
                    >
                      <Ionicons
                        name={(goal.icon as keyof typeof Ionicons.glyphMap) || "flag"}
                        size={16}
                        color={colors.text}
                      />
                    </View>
                    <View>
                      <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                      <Text style={[styles.goalAmount, { color: colors.textSecondary }]}>
                        {formatVnd(goal.currentAmount)} / {formatVnd(goal.targetAmount)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.goalPercent, { color: colors.text }]}>
                    {Math.round(goal.progressPercent)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>RECENT TRANSACTIONS</Text>
            <TouchableOpacity onPress={handleViewAllTx}>
              <Text style={[styles.sectionAction, { color: colors.primary }]}>VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color={colors.textSecondary} />
              <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>No transactions yet</Text>
            </GlassCard>
          ) : (
            <GlassCard>
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
            </GlassCard>
          )}
        </View>
      </ScrollView>
      {renderCreateWalletModal()}
      {renderCreateGoalModal()}
    </View>
  );

  function renderCreateWalletModal() {
    return (
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCreateWalletModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Wallet</Text>

            {modalError ? (
              <Text style={[styles.modalError, { color: colors.loss }]}>{modalError}</Text>
            ) : null}

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Wallet Name *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
              value={walletName}
              onChangeText={setWalletName}
              placeholder="e.g. Cash, Bank, Momo"
              maxLength={50}
              editable={!isSubmitting}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Initial Balance</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
              value={walletBalance}
              onChangeText={setWalletBalance}
              placeholder="0"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Currency</Text>
            <View style={styles.currencyRow}>
              {["VND", "USD"].map((cur) => (
                <TouchableOpacity
                  key={cur}
                  style={[
                    styles.currencyChip,
                    walletCurrency === cur && [styles.currencyChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    { borderColor: colors.cardBorder },
                  ]}
                  onPress={() => setWalletCurrency(cur)}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.currencyChipText,
                      { color: walletCurrency === cur ? colors.text : colors.textSecondary },
                    ]}
                  >
                    {cur}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.cardBorder }]}
                onPress={closeCreateWalletModal}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalCreateBtn,
                  isSubmitting && styles.modalCreateBtnDisabled,
                  { backgroundColor: colors.primary },
                ]}
                onPress={submitCreateWallet}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={[styles.modalCreateText, { color: colors.text }]}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  function renderCreateGoalModal() {
    return (
      <Modal
        visible={showCreateGoalModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeCreateGoalModal}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Goal</Text>

            {goalModalError ? (
              <Text style={[styles.modalError, { color: colors.loss }]}>{goalModalError}</Text>
            ) : null}

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Goal Name *</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
              value={goalName}
              onChangeText={setGoalName}
              placeholder="e.g. Emergency Fund"
              maxLength={50}
              editable={!goalSubmitting}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Target Amount</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
              value={goalTargetAmount}
              onChangeText={setGoalTargetAmount}
              placeholder="10000000"
              keyboardType="decimal-pad"
              editable={!goalSubmitting}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Icon</Text>
            <View style={styles.currencyRow}>
              {["flag", "wallet", "card", "cash"].map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.currencyChip,
                    goalIcon === icon && [styles.currencyChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    { borderColor: colors.cardBorder },
                  ]}
                  onPress={() => setGoalIcon(icon)}
                  disabled={goalSubmitting}
                >
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={goalIcon === icon ? colors.text : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Color</Text>
            <View style={styles.colorRow}>
              {[colors.primary, colors.gain, colors.warning, colors.loss].map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorChip,
                    { backgroundColor: color },
                    goalColor === color && styles.colorChipActive,
                  ]}
                  onPress={() => setGoalColor(color)}
                  disabled={goalSubmitting}
                />
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.cardBorder }]}
                onPress={closeCreateGoalModal}
                disabled={goalSubmitting}
              >
                <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalCreateBtn,
                  goalSubmitting && styles.modalCreateBtnDisabled,
                  { backgroundColor: colors.primary },
                ]}
                onPress={submitCreateGoal}
                disabled={goalSubmitting}
              >
                {goalSubmitting ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <Text style={[styles.modalCreateText, { color: colors.text }]}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenPad: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing["2xl"],
    borderRadius: 20,
    shadowColor: "#0F172A",
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
    ...typography.body.regular,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  heroTitle: {
    ...typography.label.small,
    color: "#94A3B8",
    fontWeight: "600",
    letterSpacing: 1,
  },
  heroBalance: {
    fontSize: 36,
    fontWeight: "700",
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
    ...typography.body.small,
    color: "#94A3B8",
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  budgetValue: {
    ...typography.body.regular,
    fontWeight: "600",
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
  segmentWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  kpiGrid: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  kpiCard: {
    padding: spacing.lg,
  },
  kpiLabel: {
    ...typography.label.small,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  kpiCaption: {
    ...typography.label.small,
    marginTop: spacing.xs,
  },
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
    ...typography.body.regular,
    fontWeight: "700",
  },
  sectionAction: {
    ...typography.label.small,
    fontWeight: "600",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  addBtnText: {
    ...typography.label.small,
    fontWeight: "600",
  },
  emptyCard: {
    padding: spacing["2xl"],
    alignItems: "center",
  },
  emptyCardText: {
    ...typography.body.regular,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  emptyCardSubtext: {
    ...typography.label.small,
    marginTop: spacing.xs,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
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
    ...typography.body.regular,
    fontWeight: "600",
  },
  goalAmount: {
    ...typography.label.small,
  },
  goalPercent: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing["2xl"],
  },
  emptyTitle: {
    ...typography.display.regular,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body.regular,
    marginTop: spacing.sm,
  },
  createWalletBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: 12,
  },
  createWalletText: {
    ...typography.label.large,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 20,
    padding: spacing["2xl"],
    marginHorizontal: spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.heading.h2,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  modalError: {
    ...typography.label.small,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalLabel: {
    ...typography.body.regular,
    fontWeight: "600",
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.base,
    ...typography.body.regular,
  },
  currencyRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  currencyChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
  },
  currencyChipActive: {
    borderWidth: 1,
  },
  currencyChipText: {
    ...typography.body.regular,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorChipActive: {
    borderColor: "#0F172A",
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing["2xl"],
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCancelText: {
    ...typography.label.large,
    fontWeight: "600",
  },
  modalCreateBtn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  modalCreateBtnDisabled: {
    opacity: 0.6,
  },
  modalCreateText: {
    ...typography.label.large,
    fontWeight: "600",
  },
});
