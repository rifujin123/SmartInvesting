import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: "week" | "month";
  category:
    | "food"
    | "transport"
    | "entertainment"
    | "shopping"
    | "bills"
    | "other";
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    name: "Food & Dining",
    amount: 500,
    spent: 320,
    period: "month",
    category: "food",
  },
  {
    id: "2",
    name: "Transportation",
    amount: 200,
    spent: 85,
    period: "month",
    category: "transport",
  },
  {
    id: "3",
    name: "Entertainment",
    amount: 150,
    spent: 120,
    period: "month",
    category: "entertainment",
  },
];

const mockGoals: Goal[] = [
  {
    id: "1",
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: "Dec 2026",
    icon: "shield-checkmark",
    color: "#DCFCE7",
  },
  {
    id: "2",
    name: "Vacation",
    targetAmount: 5000,
    currentAmount: 2800,
    deadline: "Aug 2026",
    icon: "airplane",
    color: "#DBEAFE",
  },
  {
    id: "3",
    name: "New Car",
    targetAmount: 25000,
    currentAmount: 5000,
    deadline: "Dec 2027",
    icon: "car",
    color: "#FEF3C7",
  },
];

const categories = [
  {
    key: "food" as const,
    label: "Food",
    icon: "restaurant" as const,
    color: "#FEF3C7",
    iconColor: "#D97706",
  },
  {
    key: "transport" as const,
    label: "Transport",
    icon: "car" as const,
    color: "#DBEAFE",
    iconColor: "#2563EB",
  },
  {
    key: "entertainment" as const,
    label: "Entertainment",
    icon: "game-controller" as const,
    color: "#F3E8FF",
    iconColor: "#9333EA",
  },
  {
    key: "shopping" as const,
    label: "Shopping",
    icon: "cart" as const,
    color: "#FFEDD5",
    iconColor: "#EA580C",
  },
  {
    key: "bills" as const,
    label: "Bills",
    icon: "document-text" as const,
    color: "#CCFBF1",
    iconColor: "#0D9488",
  },
  {
    key: "other" as const,
    label: "Other",
    icon: "ellipsis-horizontal" as const,
    color: "#E2E8F0",
    iconColor: "#64748B",
  },
];

export const FinanceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"budget" | "goals">("budget");
  const [budgetPeriod, setBudgetPeriod] = useState<"week" | "month">("month");
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showSetTotalBudgetModal, setShowSetTotalBudgetModal] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState("");
  const [newBudgetAmount, setNewBudgetAmount] = useState("");
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [totalBudgetAmount, setTotalBudgetAmount] = useState("1500");

  // Animations
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;
  const periodIndicatorAnim = useRef(new Animated.Value(1)).current;

  const filteredBudgets = mockBudgets.filter((b) => b.period === budgetPeriod);

  const totalBudgetAmountNum = parseFloat(totalBudgetAmount) || 0;
  const totalBudget = filteredBudgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpent = filteredBudgets.reduce((acc, b) => acc + b.spent, 0);
  const remaining = totalBudgetAmountNum - totalSpent;

  const handleTabChange = (tab: "budget" | "goals") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.spring(tabIndicatorAnim, {
      toValue: tab === "budget" ? 0 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 15,
    }).start();
    setActiveTab(tab);
  };

  const handlePeriodChange = (period: "week" | "month") => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.spring(periodIndicatorAnim, {
      toValue: period === "week" ? 0 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 15,
    }).start();
    setBudgetPeriod(period);
  };

  const handleAddBudget = () => {
    setShowAddBudgetModal(false);
    setNewBudgetName("");
    setNewBudgetAmount("");
  };

  const handleAddGoal = () => {
    setShowAddGoalModal(false);
    setNewGoalName("");
    setNewGoalAmount("");
  };

  const handleSetTotalBudget = () => {
    setShowSetTotalBudgetModal(false);
  };

  const getCategoryInfo = (category: Budget["category"]) => {
    return categories.find((c) => c.key === category) || categories[5];
  };

  const getProgressColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 90) return colors.loss;
    if (percentage >= 70) return "#F59E0B";
    return colors.success;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector with Animated Indicator */}
        <View style={styles.tabContainer}>
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                transform: [
                  {
                    translateX: tabIndicatorAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 108],
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange("budget")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === "budget" ? "wallet" : "wallet-outline"}
              size={20}
              color={activeTab === "budget" ? "#FFFFFF" : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "budget" && styles.tabTextActive,
              ]}
            >
              Budget
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange("goals")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={activeTab === "goals" ? "flag" : "flag-outline"}
              size={20}
              color={activeTab === "goals" ? "#FFFFFF" : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "goals" && styles.tabTextActive,
              ]}
            >
              Goals
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "budget" ? (
          <>
            {/* Period Switch with Animated Indicator */}
            <View style={styles.periodContainer}>
              <Animated.View
                style={[
                  styles.periodIndicator,
                  {
                    transform: [
                      {
                        translateX: periodIndicatorAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 64],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <TouchableOpacity
                style={styles.periodButton}
                onPress={() => handlePeriodChange("week")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    budgetPeriod === "week" && styles.periodTextActive,
                  ]}
                >
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.periodButton}
                onPress={() => handlePeriodChange("month")}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    budgetPeriod === "month" && styles.periodTextActive,
                  ]}
                >
                  Month
                </Text>
              </TouchableOpacity>
            </View>

            {/* Budget Summary Card */}
            <TouchableOpacity
              style={styles.summaryCard}
              onPress={() => setShowSetTotalBudgetModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Budget</Text>
                  <Text style={styles.summaryValue}>
                    ${totalBudgetAmountNum}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Spent</Text>
                  <Text style={[styles.summaryValue, { color: colors.loss }]}>
                    ${totalSpent}
                  </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Left</Text>
                  <Text
                    style={[styles.summaryValue, { color: colors.success }]}
                  >
                    ${remaining}
                  </Text>
                </View>
              </View>
              <View style={styles.summaryEditHint}>
                <Ionicons name="pencil" size={12} color={colors.textMuted} />
                <Text style={styles.summaryEditText}>Tap to edit budget</Text>
              </View>
            </TouchableOpacity>

            {/* Budget List */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Your Budgets</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddBudgetModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {filteredBudgets.map((budget) => {
                const category = getCategoryInfo(budget.category);
                const progress = (budget.spent / budget.amount) * 100;
                const progressColor = getProgressColor(
                  budget.spent,
                  budget.amount,
                );
                return (
                  <View key={budget.id} style={styles.budgetCard}>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetLeft}>
                        <View
                          style={[
                            styles.budgetIcon,
                            { backgroundColor: category.color },
                          ]}
                        >
                          <Ionicons
                            name={category.icon}
                            size={20}
                            color={category.iconColor}
                          />
                        </View>
                        <Text style={styles.budgetName}>{budget.name}</Text>
                      </View>
                      <Text style={styles.budgetAmount}>${budget.amount}</Text>
                    </View>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: progressColor,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.progressLabels}>
                        <Text style={styles.progressText}>
                          ${budget.spent} spent
                        </Text>
                        <Text
                          style={[
                            styles.progressText,
                            { color: progressColor },
                          ]}
                        >
                          {progress.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
            {/* Goals Summary */}
            <View style={styles.goalsSummaryCard}>
              <View style={styles.goalsSummaryHeader}>
                <Ionicons name="trophy" size={24} color="#F59E0B" />
                <Text style={styles.goalsSummaryTitle}>Active Goals</Text>
                <Text style={styles.goalsSummaryCount}>{mockGoals.length}</Text>
              </View>
              <Text style={styles.goalsSummarySubtitle}>
                $
                {mockGoals
                  .reduce((acc, g) => acc + g.currentAmount, 0)
                  .toLocaleString()}{" "}
                saved of $
                {mockGoals
                  .reduce((acc, g) => acc + g.targetAmount, 0)
                  .toLocaleString()}
              </Text>
            </View>

            {/* Goals List */}
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Your Goals</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddGoalModal(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {mockGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                return (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <View
                        style={[
                          styles.goalIcon,
                          { backgroundColor: goal.color },
                        ]}
                      >
                        <Ionicons
                          name={goal.icon}
                          size={24}
                          color={colors.textPrimary}
                        />
                      </View>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalName}>{goal.name}</Text>
                        <Text style={styles.goalDeadline}>
                          Target: {goal.deadline}
                        </Text>
                      </View>
                      <View style={styles.goalPercentage}>
                        <Text style={styles.goalPercentageText}>
                          {progress.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <View style={styles.goalProgressContainer}>
                      <View style={styles.goalProgressBar}>
                        <View
                          style={[
                            styles.goalProgressFill,
                            { width: `${progress}%` },
                          ]}
                        />
                      </View>
                    </View>
                    <View style={styles.goalAmounts}>
                      <Text style={styles.goalCurrent}>
                        ${goal.currentAmount.toLocaleString()}
                      </Text>
                      <Text style={styles.goalTarget}>
                        of ${goal.targetAmount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddBudgetModal}
        transparent
        onRequestClose={() => setShowAddBudgetModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalTitleRow}>
                      <Text style={styles.modalTitle}>Add Budget</Text>
                      <TouchableOpacity
                        style={styles.modalCloseBtn}
                        onPress={() => setShowAddBudgetModal(false)}
                      >
                        <Ionicons
                          name="close"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.modalForm}>
                    <Text style={styles.modalLabel}>Budget Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g., Food & Dining"
                      placeholderTextColor={colors.textMuted}
                      value={newBudgetName}
                      onChangeText={setNewBudgetName}
                    />
                    <Text
                      style={[styles.modalLabel, { marginTop: spacing.base }]}
                    >
                      Amount ($)
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={newBudgetAmount}
                      onChangeText={setNewBudgetAmount}
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnCancel]}
                      onPress={() => setShowAddBudgetModal(false)}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnConfirm]}
                      onPress={handleAddBudget}
                    >
                      <Text style={styles.modalBtnConfirmText}>
                        Create Budget
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddGoalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddGoalModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalTitleRow}>
                      <Text style={styles.modalTitle}>Add Goal</Text>
                      <TouchableOpacity
                        style={styles.modalCloseBtn}
                        onPress={() => setShowAddGoalModal(false)}
                      >
                        <Ionicons
                          name="close"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.modalForm}>
                    <Text style={styles.modalLabel}>Goal Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g., Emergency Fund"
                      placeholderTextColor={colors.textMuted}
                      value={newGoalName}
                      onChangeText={setNewGoalName}
                    />
                    <Text
                      style={[styles.modalLabel, { marginTop: spacing.base }]}
                    >
                      Target Amount ($)
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={newGoalAmount}
                      onChangeText={setNewGoalAmount}
                    />
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnCancel]}
                      onPress={() => setShowAddGoalModal(false)}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnConfirm]}
                      onPress={handleAddGoal}
                    >
                      <Text style={styles.modalBtnConfirmText}>
                        Create Goal
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Set Total Budget Modal */}
      <Modal
        visible={showSetTotalBudgetModal}
        transparent
        onRequestClose={() => setShowSetTotalBudgetModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalKeyboardView}
            >
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalHandle} />
                    <View style={styles.modalTitleRow}>
                      <Text style={styles.modalTitle}>Set Total Budget</Text>
                      <TouchableOpacity
                        style={styles.modalCloseBtn}
                        onPress={() => setShowSetTotalBudgetModal(false)}
                      >
                        <Ionicons
                          name="close"
                          size={20}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.modalSubtitle}>
                      How much can you spend this {budgetPeriod}?
                    </Text>
                  </View>
                  <View style={styles.modalForm}>
                    <Text style={styles.modalLabel}>Budget Amount ($)</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={totalBudgetAmount}
                      onChangeText={setTotalBudgetAmount}
                      autoFocus
                    />
                  </View>
                  <View style={styles.periodQuickSelect}>
                    <Text style={styles.quickSelectLabel}>Quick select:</Text>
                    <View style={styles.quickSelectButtons}>
                      {[500, 1000, 1500, 2000].map((amount) => (
                        <TouchableOpacity
                          key={amount}
                          style={[
                            styles.quickSelectBtn,
                            totalBudgetAmount === String(amount) &&
                              styles.quickSelectBtnActive,
                          ]}
                          onPress={() => setTotalBudgetAmount(String(amount))}
                        >
                          <Text
                            style={[
                              styles.quickSelectBtnText,
                              totalBudgetAmount === String(amount) &&
                                styles.quickSelectBtnTextActive,
                            ]}
                          >
                            ${amount}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnCancel]}
                      onPress={() => setShowSetTotalBudgetModal(false)}
                    >
                      <Text style={styles.modalBtnCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalBtn, styles.modalBtnConfirm]}
                      onPress={handleSetTotalBudget}
                    >
                      <Text style={styles.modalBtnConfirmText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
  },
  headerLeft: {},
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
    width: 216,
    alignSelf: "flex-start",
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: 100,
    backgroundColor: colors.figma.primary,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    zIndex: 1,
  },
  tabText: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  periodContainer: {
    flexDirection: "row",
    marginHorizontal: spacing.xl,
    marginTop: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
    position: "relative",
    width: 128,
  },
  periodIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 4,
    width: 60,
    backgroundColor: colors.figma.primary,
    borderRadius: 8,
  },
  periodButton: {
    width: 60,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 1,
  },
  periodButtonActive: {},
  periodText: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: "#FFFFFF",
  },
  summaryCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryEditHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    gap: 4,
  },
  summaryEditText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  listSection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    paddingBottom: 100,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  listTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  budgetName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  budgetAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  progressContainer: {},
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  goalsSummaryCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.base,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  goalsSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  goalsSummaryTitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
  },
  goalsSummaryCount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#D97706",
  },
  goalsSummarySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 32,
  },
  goalCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  goalDeadline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  goalPercentage: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  goalPercentageText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.figma.primary,
  },
  goalProgressContainer: {
    marginTop: spacing.base,
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: colors.figma.primary,
    borderRadius: 4,
  },
  goalAmounts: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  goalCurrent: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  goalTarget: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalKeyboardView: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? spacing["2xl"] : spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    position: "relative",
  },
  modalCloseBtn: {
    position: "absolute",
    right: 0,
    padding: spacing.xs,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.base,
  },
  modalTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  modalForm: {},
  modalLabel: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  periodQuickSelect: {
    marginTop: spacing.base,
  },
  quickSelectLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  quickSelectButtons: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  quickSelectBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  quickSelectBtnActive: {
    backgroundColor: colors.figma.primary,
    borderColor: colors.figma.primary,
  },
  quickSelectBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  quickSelectBtnTextActive: {
    color: "#FFFFFF",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.base,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: colors.surface,
  },
  modalBtnCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalBtnConfirm: {
    backgroundColor: colors.figma.primary,
  },
  modalBtnConfirmText: {
    ...typography.button,
    color: "#FFFFFF",
  },
});
