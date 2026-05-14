import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
import { BudgetSummaryDto } from "../../../services/finance/types";
import { AppStackParamList } from "../../../shared/navigation/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";

type Props = NativeStackScreenProps<AppStackParamList, "BudgetDetail">;

const getProgressColor = (spent: number, limit: number) => {
  if (limit === 0) return colors.textSecondary;
  const pct = (spent / limit) * 100;
  if (pct >= 90) return colors.loss;
  if (pct >= 70) return "#F59E0B";
  return colors.success;
};

export const BudgetDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accessToken } = useAuth();
  const [summary, setSummary] = useState<BudgetSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadSummary = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!accessToken) return;
      if (mode === "initial") setIsLoading(true);
      if (mode === "refresh") setIsRefreshing(true);

      try {
        setError(null);
        const data = await financeService.getBudgetSummary(accessToken, route.params.budgetId);
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load budget");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken, route.params.budgetId],
  );

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const limit = Number(summary?.amountLimit ?? 0);
  const spent = Number(summary?.totalSpent ?? 0);
  const remaining = Number(summary?.remaining ?? limit - spent);
  const progress = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const progressColor = getProgressColor(spent, limit);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.figma.primary} />
        </View>
      ) : !summary ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error ?? "Budget not found"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadSummary()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={() => loadSummary("refresh")} />
          }
        >
          {error ? <Text style={styles.inlineError}>{error}</Text> : null}

          <View style={styles.heroCard}>
            <View style={styles.iconRow}>
              <View style={styles.categoryIcon}>
                <Ionicons name="wallet" size={24} color={colors.figma.primary} />
              </View>
              <Text style={styles.categoryName}>{summary.categoryName}</Text>
            </View>
            <Text style={styles.periodLabel}>
              {summary.month}/{summary.year}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Limit</Text>
                <Text style={styles.statValue}>{formatCurrency(limit)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Spent</Text>
                <Text style={[styles.statValue, { color: progressColor }]}>{formatCurrency(spent)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={[styles.statValue, { color: remaining < 0 ? colors.loss : colors.success }]}>
                  {formatCurrency(remaining)}
                </Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Usage</Text>
              <Text style={[styles.progressValue, { color: progressColor }]}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            {remaining < 0 ? <Text style={styles.overBudgetText}>Over budget by {formatCurrency(Math.abs(remaining))}</Text> : null}
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
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: { ...typography.sectionHeader, color: colors.textPrimary },
  periodLabel: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
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
  statValue: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, marginTop: spacing.xs },
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
  progressFill: { height: "100%", borderRadius: 5 },
  overBudgetText: { ...typography.caption, color: colors.loss, marginTop: spacing.sm },
});