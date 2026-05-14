import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { useAuth } from "../../../context/AuthContext";
import { financeService } from "../../../services/finance/financeService";
import { GoalDto } from "../../../services/finance/types";
import { AppStackParamList } from "../../../shared/navigation/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";

type Props = NativeStackScreenProps<AppStackParamList, "GoalDetail">;

const formatDeadline = (deadline: string | null) => {
  if (!deadline) return "No deadline";
  return new Date(deadline).toLocaleDateString();
};

export const GoalDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accessToken } = useAuth();
  const [goal, setGoal] = useState<GoalDto | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = useMemo(() => {
    if (!goal?.targetAmount) return 0;
    return Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100);
  }, [goal]);

  const remaining = goal ? Math.max(Number(goal.targetAmount) - Number(goal.currentAmount), 0) : 0;

  const loadGoal = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!accessToken) return;
      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);

      try {
        setError(null);
        const data = await financeService.getGoal(accessToken, route.params.goalId);
        setGoal(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load goal");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken, route.params.goalId],
  );

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  const handleContribution = async () => {
    if (!accessToken || !goal) return;

    const contribution = Number(amount);
    if (!amount.trim() || Number.isNaN(contribution) || contribution <= 0) {
      setError("Contribution amount must be greater than 0");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await financeService.addGoalContribution(accessToken, goal.id, {
        amount: contribution,
      });
      setGoal(updated);
      setAmount("");
      Alert.alert("Success", "Goal contribution added.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add contribution");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.figma.primary} />
        </View>
      ) : !goal ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error ?? "Goal not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadGoal()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadGoal("refresh")} />
          }
        >
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          <View style={[styles.heroCard, { backgroundColor: goal.color || "#DBEAFE" }]}>
            <View style={styles.goalIcon}>
              <Ionicons name={(goal.icon || "flag") as keyof typeof Ionicons.glyphMap} size={28} color={colors.textPrimary} />
            </View>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.deadline}>Target: {formatDeadline(goal.deadline)}</Text>
            {goal.isCompleted ? <Text style={styles.completedBadge}>Completed</Text> : null}
          </View>

          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Saved</Text>
                <Text style={styles.statValue}>{formatCurrency(Number(goal.currentAmount))}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Target</Text>
                <Text style={styles.statValue}>{formatCurrency(Number(goal.targetAmount))}</Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{Number(goal.progressPercent || progress).toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.remainingText}>{formatCurrency(remaining)} remaining</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Add Contribution</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleContribution}
              disabled={isSubmitting}
            >
              <Text style={styles.submitText}>{isSubmitting ? "Saving..." : "Add Contribution"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.sectionHeader, color: colors.textPrimary },
  headerSpacer: { width: 40 },
  content: { padding: spacing.xl, paddingBottom: 120 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  inlineError: {
    ...typography.caption,
    color: colors.loss,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  errorText: { ...typography.body, color: colors.loss, textAlign: "center" },
  retryButton: {
    marginTop: spacing.base,
    backgroundColor: colors.figma.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retryText: { ...typography.button, color: "#FFFFFF" },
  heroCard: {
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  goalName: { ...typography.title, color: colors.textPrimary, textAlign: "center" },
  deadline: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  completedBadge: {
    marginTop: spacing.md,
    color: colors.success,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.base,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { ...typography.caption, color: colors.textSecondary },
  statValue: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginTop: spacing.xs },
  divider: { width: 1, height: 40, backgroundColor: colors.border },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  progressLabel: { ...typography.body, fontWeight: "600", color: colors.textPrimary },
  progressValue: { ...typography.body, fontWeight: "700", color: colors.figma.primary },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: colors.figma.primary },
  remainingText: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },
  sectionTitle: { ...typography.sectionHeader, color: colors.textPrimary, marginBottom: spacing.base },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.figma.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: spacing.base,
    marginTop: spacing.base,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { ...typography.button, color: "#FFFFFF" },
});