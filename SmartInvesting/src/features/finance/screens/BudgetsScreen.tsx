import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { MoneyText } from "../../../components/finance/MoneyText";

interface BudgetsScreenProps {
  embedded?: boolean;
}

const budgets = [
  { id: "1", name: "FOOD", limit: 7200000, spent: 5100000, icon: "fast-food" as const },
  { id: "2", name: "RENT", limit: 7800000, spent: 7200000, icon: "home" as const },
  { id: "3", name: "TRANSPORT", limit: 2400000, spent: 890000, icon: "car" as const },
  { id: "4", name: "ENTERTAINMENT", limit: 3200000, spent: 3010000, icon: "game-controller" as const },
];

const getTone = (ratio: number) => {
  if (ratio >= 0.9) return colors.loss;
  if (ratio >= 0.7) return colors.expenseAccent;
  return colors.success;
};

export const BudgetsScreen: React.FC<BudgetsScreenProps> = () => {
  const totalLimit = budgets.reduce((sum, item) => sum + item.limit, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.spent, 0);
  const ratio = totalSpent / totalLimit;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>MONTHLY BUDGET</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>SPENT</Text>
            <MoneyText amount={totalSpent} size="lg" color="loss" />
          </View>
          <View style={styles.summaryRight}>
            <Text style={styles.summaryLabel}>LIMIT</Text>
            <MoneyText amount={totalLimit} size="lg" />
          </View>
        </View>
        <View style={styles.masterBar}>
          <View style={[styles.masterFill, { width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: getTone(ratio) }]} />
        </View>
        <Text style={[styles.ratioText, { color: getTone(ratio) }]}>{Math.round(ratio * 100)}% USED</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>CAPS</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.75}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>NEW CAP</Text>
        </TouchableOpacity>
      </View>

      {budgets.map((budget, index) => {
        const itemRatio = budget.spent / budget.limit;
        const tone = getTone(itemRatio);
        return (
          <View key={budget.id} style={styles.budgetRow}>
            <View style={styles.rowTop}>
              <View style={styles.rowLeft}>
                <View style={[styles.numberPlate, { backgroundColor: index % 2 ? colors.textPrimary : colors.figma.appBg }]}>
                  <Text style={styles.numberPlateText}>{String(index + 1).padStart(2, "0")}</Text>
                </View>
                <View style={styles.iconBox}>
                  <Ionicons name={budget.icon} size={18} color={colors.textPrimary} />
                </View>
                <Text style={styles.budgetName}>{budget.name}</Text>
              </View>
              <Text style={[styles.percent, { color: tone }]}>{Math.round(itemRatio * 100)}%</Text>
            </View>
            <View style={styles.amountRow}>
              <MoneyText amount={budget.spent} size="sm" color="loss" />
              <Text style={styles.slash}>/</Text>
              <MoneyText amount={budget.limit} size="sm" color="muted" />
            </View>
            <View style={styles.bar}>
              <View style={[styles.fill, { width: `${Math.min(itemRatio * 100, 100)}%`, backgroundColor: tone }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, paddingBottom: 120 },
  headerCard: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.figma.appBg, padding: spacing.lg, borderRadius: 20, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  eyebrow: { ...typography.caption, color: colors.textSecondary, fontWeight: '600', letterSpacing: 0.5, textTransform: 'none' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.base },
  summaryRight: { alignItems: 'flex-end' },
  summaryLabel: { ...typography.body, color: colors.textSecondary, fontWeight: '500', letterSpacing: 0 },
  masterBar: { height: 10, backgroundColor: colors.border, marginTop: spacing.base, borderRadius: 5 },
  masterFill: { height: '100%', borderRadius: 5 },
  ratioText: { ...typography.body, marginTop: spacing.sm, fontWeight: '600', letterSpacing: 0, color: colors.textPrimary },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.md },
  listTitle: { ...typography.body, color: colors.textPrimary, fontWeight: '700', letterSpacing: 0, textTransform: 'none' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, backgroundColor: colors.figma.appBg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
  addButtonText: { ...typography.body, color: '#FFFFFF', fontWeight: '600', fontSize: 13, letterSpacing: 0 },
  budgetRow: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.border, padding: spacing.base, marginBottom: spacing.md, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  numberPlate: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  numberPlateText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  iconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.figma.surface },
  budgetName: { ...typography.body, color: colors.textPrimary, fontWeight: '600', letterSpacing: 0, flex: 1 },
  percent: { fontWeight: '700', fontSize: 17, color: colors.textPrimary },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  slash: { color: colors.textMuted, fontWeight: '500' },
  bar: { height: 8, backgroundColor: colors.border, marginTop: spacing.sm, borderRadius: 4 },
  fill: { height: '100%', borderRadius: 4 },
});
