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
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { useAuth } from "../../../context/AuthContext";
import { financeService } from "../../../services/finance/financeService";
import { BudgetSummaryDto } from "../../../services/finance/types";
import { AppStackParamList } from "../../../shared/navigation/types";
import { formatCurrency } from "../../../shared/utils/formatCurrency";

type Props = NativeStackScreenProps<AppStackParamList, "BudgetDetail">;

const getProgressColor = (spent: number, limit: number, colors: any) => {
  if (limit === 0) return colors.textSecondary;
  const pct = (spent / limit) * 100;
  if (pct >= 90) return colors.loss;
  if (pct >= 70) return "#F59E0B";
  return colors.gain;
};

export const BudgetDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
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
  const progressColor = getProgressColor(spent, limit, colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Budget Detail</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !summary ? (
        <View style={styles.centerState}>
          <Text style={[styles.errorText, { color: colors.loss }]}>{error ?? "Budget not found"}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={() => loadSummary()}>
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
          {error ? <Text style={[styles.inlineError, { color: colors.loss }]}>{error}</Text> : null}

          <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.iconRow}>
              <View style={[styles.categoryIcon, { backgroundColor: colors.accentSubtle }]}>
                <Ionicons name="wallet" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.categoryName, { color: colors.text }]}>{summary.categoryName}</Text>
            </View>
            <Text style={[styles.periodLabel, { color: colors.textSecondary }]}>
              {summary.month}/{summary.year}
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Limit</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(limit)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Spent</Text>
                <Text style={[styles.statValue, { color: progressColor }]}>{formatCurrency(spent)}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
                <Text style={[styles.statValue, { color: remaining < 0 ? colors.loss : colors.gain }]}>
                  {formatCurrency(remaining)}
                </Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.text }]}>Usage</Text>
              <Text style={[styles.progressValue, { color: progressColor }]}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
            </View>
            {remaining < 0 ? <Text style={[styles.overBudgetText, { color: colors.loss }]}>Over budget by {formatCurrency(Math.abs(remaining))}</Text> : null}
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
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
  },
  iconRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: { ...typography.sectionHeader },
  periodLabel: { ...typography.caption, marginTop: spacing.xs },
  card: {
    borderRadius: 16,
    padding: spacing.base,
    borderWidth: 1,
    marginTop: spacing.base,
  },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { ...typography.caption },
  statValue: { fontSize: 15, fontWeight: "700", marginTop: spacing.xs },
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
  overBudgetText: { ...typography.caption, marginTop: spacing.sm },
});
