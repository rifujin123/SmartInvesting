import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { MoneyText } from "../../../components/finance/MoneyText";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { financeService } from "../../../services/finance/financeService";
import type { BudgetDto, BudgetSummaryDto, CategoryDto } from "../../../services/finance/types";

interface BudgetsScreenProps {
  embedded?: boolean;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getTone = (ratio: number, colors: any) => {
  if (ratio >= 0.9) return colors.loss;
  if (ratio >= 0.7) return colors.warning;
  return colors.gain;
};

const now = new Date();

export const BudgetsScreen: React.FC<BudgetsScreenProps> = () => {
  const { colors } = useTheme();
  const [token, setToken] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<BudgetSummaryDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetSummaryDto | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [amountLimit, setAmountLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const [budgetRows, categoryRows] = await Promise.all([
        financeService.getBudgets(token),
        financeService.getCategories(token),
      ]);

      setCategories(categoryRows);

      const summaries = await Promise.all(
        budgetRows.map(async (budget) => {
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

      setBudgets(summaries);
    } catch (e) {
      console.error("load budgets error", e);
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    tokenStorage.getTokens().then(({ accessToken }) => setToken(accessToken));
  }, []);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  const totalLimit = budgets.reduce((sum, item) => sum + item.amountLimit, 0);
  const totalSpent = budgets.reduce((sum, item) => sum + item.totalSpent, 0);
  const ratio = totalLimit > 0 ? totalSpent / totalLimit : 0;

  const existingCategoryIds = useMemo(() => {
    return new Set(
      budgets
        .filter((b) => b.month === currentMonth && b.year === currentYear && b.budgetId !== editingBudget?.budgetId)
        .map((b) => b.categoryId),
    );
  }, [budgets, currentMonth, currentYear, editingBudget?.budgetId]);

  const openCreateModal = () => {
    setEditingBudget(null);
    setSelectedCategoryId(null);
    setAmountLimit("");
    setModalError(null);
    setModalVisible(true);
  };

  const openEditModal = (budget: BudgetSummaryDto) => {
    setEditingBudget(budget);
    setSelectedCategoryId(budget.categoryId);
    setAmountLimit(String(budget.amountLimit));
    setModalError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSubmitting(false);
    setModalError(null);
  };

  const submitBudget = async () => {
    if (!token) return;

    const parsedAmount = Number(amountLimit);

    if (!selectedCategoryId) {
      setModalError("Choose category");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setModalError("Budget must be greater than 0");
      return;
    }
    if (existingCategoryIds.has(selectedCategoryId)) {
      setModalError("Category already has budget for this month");
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      const payload = {
        categoryId: selectedCategoryId,
        amountLimit: parsedAmount,
        month: currentMonth,
        year: currentYear,
      };

      if (editingBudget) {
        await financeService.updateBudget(token, editingBudget.budgetId, payload);
      } else {
        await financeService.createBudget(token, payload);
      }

      await loadData();
      closeModal();
    } catch (e) {
      console.error("save budget error", e);
      setModalError("Save budget failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderModal = () => (
    <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{editingBudget ? "Edit Budget" : "Create Budget"}</Text>
          {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}

          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => {
              const disabled = existingCategoryIds.has(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    { borderColor: colors.cardBorder, backgroundColor: colors.surface2 },
                    selectedCategoryId === category.id && [styles.categoryChipActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                    disabled && styles.categoryChipDisabled,
                  ]}
                  onPress={() => !disabled && setSelectedCategoryId(category.id)}
                  disabled={disabled || submitting}
                >
                  <Ionicons
                    name={(category.icon as keyof typeof Ionicons.glyphMap) || "pricetag"}
                    size={14}
                    color={selectedCategoryId === category.id ? "#FFFFFF" : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      { color: colors.textSecondary },
                      selectedCategoryId === category.id && [styles.categoryChipTextActive, { color: "#FFFFFF" }],
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Budget amount</Text>
          <TextInput
            style={[styles.modalInput, { borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface2 }]}
            value={amountLimit}
            onChangeText={setAmountLimit}
            placeholder="5000000"
            keyboardType="decimal-pad"
            editable={!submitting}
          />

          <Text style={[styles.currentPeriodText, { color: colors.textTertiary }]}>
            Applied to {monthNames[currentMonth - 1]} {currentYear}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: colors.cardBorder }]} onPress={closeModal} disabled={submitting}>
              <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }, submitting && styles.disabledBtn]} onPress={submitBudget} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalSaveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.wrapper}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={loadData}>
          <Text style={styles.addButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>MONTHLY BUDGET</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>SPENT</Text>
            <MoneyText amount={totalSpent} size="lg" color="loss" />
          </View>
          <View style={styles.summaryRight}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>LIMIT</Text>
            <MoneyText amount={totalLimit} size="lg" />
          </View>
        </View>
        <View style={[styles.masterBar, { backgroundColor: colors.surface2 }]}>
          <View style={[styles.masterFill, { width: `${Math.min(ratio * 100, 100)}%`, backgroundColor: getTone(ratio, colors) }]} />
        </View>
        <Text style={[styles.ratioText, { color: getTone(ratio, colors) }]}>{Math.round(ratio * 100)}% USED</Text>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.text }]}>CAPS</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} activeOpacity={0.75} onPress={openCreateModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>NEW CAP</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="wallet-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No budgets yet</Text>
        </View>
      ) : (
        budgets.map((budget, index) => {
          const itemRatio = budget.amountLimit > 0 ? budget.totalSpent / budget.amountLimit : 0;
          const tone = getTone(itemRatio, colors);
          return (
            <TouchableOpacity key={budget.budgetId} style={[styles.budgetRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} onPress={() => openEditModal(budget)}>
              <View style={styles.rowTop}>
                <View style={styles.rowLeft}>
                  <View style={[styles.numberPlate, { backgroundColor: index % 2 ? colors.primary : colors.surface2 }]}>
                    <Text style={styles.numberPlateText}>{String(index + 1).padStart(2, "0")}</Text>
                  </View>
                  <View style={[styles.iconBox, { borderColor: colors.cardBorder, backgroundColor: colors.surface2 }]}>
                    <Ionicons name="pricetag" size={18} color={colors.text} />
                  </View>
                  <View style={styles.budgetTextWrap}>
                    <Text style={[styles.budgetName, { color: colors.text }]}>{budget.categoryName}</Text>
                    <Text style={[styles.budgetPeriod, { color: colors.textTertiary }]}>{monthNames[budget.month - 1]} {budget.year}</Text>
                  </View>
                </View>
                <Text style={[styles.percent, { color: tone }]}>{Math.round(itemRatio * 100)}%</Text>
              </View>
              <View style={styles.amountRow}>
                <MoneyText amount={budget.totalSpent} size="sm" color="loss" />
                <Text style={[styles.slash, { color: colors.textTertiary }]}>/</Text>
                <MoneyText amount={budget.amountLimit} size="sm" color="muted" />
              </View>
              <View style={[styles.bar, { backgroundColor: colors.surface2 }]}>
                <View style={[styles.fill, { width: `${Math.min(itemRatio * 100, 100)}%`, backgroundColor: tone }]} />
              </View>
            </TouchableOpacity>
          );
        })
      )}
      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: spacing.xl, marginTop: spacing.lg, paddingBottom: 120 },
  headerCard: { borderWidth: 1, padding: spacing.lg, borderRadius: 20 },
  eyebrow: { ...typography.caption, fontWeight: "600", letterSpacing: 0.5, textTransform: "none" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.base },
  summaryRight: { alignItems: "flex-end" },
  summaryLabel: { ...typography.body.regular, fontWeight: "500" },
  masterBar: { height: 10, marginTop: spacing.base, borderRadius: 5 },
  masterFill: { height: "100%", borderRadius: 5 },
  ratioText: { ...typography.body.regular, marginTop: spacing.sm, fontWeight: "600" },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.md },
  listTitle: { ...typography.body.large, fontWeight: "700" },
  addButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
  addButtonText: { ...typography.body.regular, color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  budgetRow: { borderWidth: 1, padding: spacing.base, marginBottom: spacing.md, borderRadius: 16 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  numberPlate: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  numberPlateText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  iconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  budgetTextWrap: { flex: 1 },
  budgetName: { ...typography.body.large, fontWeight: "600" },
  budgetPeriod: { ...typography.caption, marginTop: 2 },
  percent: { fontWeight: "700", fontSize: 17 },
  amountRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  slash: { fontWeight: "500" },
  bar: { height: 8, marginTop: spacing.sm, borderRadius: 4 },
  fill: { height: "100%", borderRadius: 4 },
  emptyCard: { borderWidth: 1, padding: spacing.xl, borderRadius: 16, alignItems: "center" },
  emptyText: { ...typography.body.regular, marginTop: spacing.sm },
  errorText: { ...typography.body.regular, color: "#FB7185", marginBottom: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxWidth: 420, borderRadius: 20, padding: spacing.xl },
  modalTitle: { ...typography.title, textAlign: "center", marginBottom: spacing.md },
  modalError: { ...typography.caption, color: "#FB7185", textAlign: "center", marginBottom: spacing.md },
  modalLabel: { ...typography.body.regular, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.sm },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: spacing.base },
  categoryScroll: { maxHeight: 54 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm },
  categoryChipActive: {},
  categoryChipDisabled: { opacity: 0.35 },
  categoryChipText: { ...typography.caption, fontWeight: "600" },
  categoryChipTextActive: {},
  currentPeriodText: { ...typography.caption, marginTop: spacing.sm },
  modalActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  modalCancelBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: spacing.base, alignItems: "center" },
  modalCancelText: { ...typography.button },
  modalSaveBtn: { flex: 1, borderRadius: 12, paddingVertical: spacing.base, alignItems: "center", minHeight: 48, justifyContent: "center" },
  modalSaveText: { ...typography.button, color: "#FFFFFF" },
  disabledBtn: { opacity: 0.6 },
});
