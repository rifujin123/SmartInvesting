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
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
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
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Goal Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !goal ? (
        <View style={styles.centerState}>
          <Text style={[styles.errorText, { color: colors.loss }]}>{error ?? "Goal not found"}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => loadGoal()}>
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
          {error ? <Text style={[styles.inlineError, { color: colors.loss }]}>{error}</Text> : null}

          <View style={[styles.heroCard, { backgroundColor: goal.color || colors.accentSubtle, borderColor: colors.cardBorder }]}>
            <View style={styles.goalIcon}>
              <Ionicons name={(goal.icon || "flag") as keyof typeof Ionicons.glyphMap} size={28} color={colors.text} />
            </View>
            <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
            <Text style={[styles.deadline, { color: colors.textSecondary }]}>Target: {formatDeadline(goal.deadline)}</Text>
            {goal.isCompleted ? <Text style={[styles.completedBadge, { color: colors.gain }]}>Completed</Text> : null}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(Number(goal.currentAmount))}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Target</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(Number(goal.targetAmount))}</Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Progress</Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>{Number(goal.progressPercent || progress).toFixed(0)}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.remainingText, { color: colors.textSecondary }]}>{formatCurrency(remaining)} remaining</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add Contribution</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: colors.primary },
                isSubmitting && styles.submitButtonDisabled,
              ]}
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"],
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.sectionHeader },
  headerSpacer: { width: 40 },
  content: { padding: spacing.xl, paddingBottom: 120 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  inlineError: {
    ...typography.caption,
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
  },
  errorText: { ...typography.body.regular, textAlign: "center" },
  retryButton: {
    marginTop: spacing.base,
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
  goalName: { ...typography.title, textAlign: "center" },
  deadline: { ...typography.caption, marginTop: spacing.xs },
  completedBadge: {
    marginTop: spacing.md,
    fontWeight: "700",
  },
  card: {
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    marginTop: spacing.base,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { ...typography.caption },
  statValue: { fontSize: 16, fontWeight: "700", marginTop: spacing.xs },
  divider: { width: 1, height: 40 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  progressLabel: { ...typography.body.regular, fontWeight: "600" },
  progressValue: { ...typography.body.regular, fontWeight: "700" },
  progressBar: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  remainingText: { ...typography.caption, marginTop: spacing.sm },
  sectionTitle: { ...typography.sectionHeader, marginBottom: spacing.base },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: spacing.base,
    marginTop: spacing.base,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { ...typography.button, color: "#FFFFFF" },
});
