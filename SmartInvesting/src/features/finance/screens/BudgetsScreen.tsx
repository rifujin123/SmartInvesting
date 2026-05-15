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
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
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

const getTone = (ratio: number) => {
  if (ratio >= 0.9) return colors.loss;
  if (ratio >= 0.7) return colors.expenseAccent;
  return colors.success;
};

const now = new Date();

export const BudgetsScreen: React.FC<BudgetsScreenProps> = () => {
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
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingBudget ? "Edit Budget" : "Create Budget"}</Text>
          {modalError ? <Text style={styles.modalError}>{modalError}</Text> : null}

          <Text style={styles.modalLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => {
              const disabled = existingCategoryIds.has(category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategoryId === category.id && styles.categoryChipActive,
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
                      selectedCategoryId === category.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.modalLabel}>Budget amount</Text>
          <TextInput
            style={styles.modalInput}
            value={amountLimit}
            onChangeText={setAmountLimit}
            placeholder="5000000"
            keyboardType="decimal-pad"
            editable={!submitting}
          />

          <Text style={styles.currentPeriodText}>
            Applied to {monthNames[currentMonth - 1]} {currentYear}
          </Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={closeModal} disabled={submitting}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalSaveBtn, submitting && styles.disabledBtn]} onPress={submitBudget} disabled={submitting}>
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
        <ActivityIndicator color={colors.figma.appBg} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.addButton} onPress={loadData}>
          <Text style={styles.addButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.addButton} activeOpacity={0.75} onPress={openCreateModal}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>NEW CAP</Text>
        </TouchableOpacity>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="wallet-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>No budgets yet</Text>
        </View>
      ) : (
        budgets.map((budget, index) => {
          const itemRatio = budget.amountLimit > 0 ? budget.totalSpent / budget.amountLimit : 0;
          const tone = getTone(itemRatio);
          return (
            <TouchableOpacity key={budget.budgetId} style={styles.budgetRow} onPress={() => openEditModal(budget)}>
              <View style={styles.rowTop}>
                <View style={styles.rowLeft}>
                  <View style={[styles.numberPlate, { backgroundColor: index % 2 ? colors.textPrimary : colors.figma.appBg }]}>
                    <Text style={styles.numberPlateText}>{String(index + 1).padStart(2, "0")}</Text>
                  </View>
                  <View style={styles.iconBox}>
                    <Ionicons name="pricetag" size={18} color={colors.textPrimary} />
                  </View>
                  <View style={styles.budgetTextWrap}>
                    <Text style={styles.budgetName}>{budget.categoryName}</Text>
                    <Text style={styles.budgetPeriod}>{monthNames[budget.month - 1]} {budget.year}</Text>
                  </View>
                </View>
                <Text style={[styles.percent, { color: tone }]}>{Math.round(itemRatio * 100)}%</Text>
              </View>
              <View style={styles.amountRow}>
                <MoneyText amount={budget.totalSpent} size="sm" color="loss" />
                <Text style={styles.slash}>/</Text>
                <MoneyText amount={budget.amountLimit} size="sm" color="muted" />
              </View>
              <View style={styles.bar}>
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
  headerCard: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.figma.appBg, padding: spacing.lg, borderRadius: 20, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 },
  eyebrow: { ...typography.caption, color: colors.textSecondary, fontWeight: "600", letterSpacing: 0.5, textTransform: "none" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: spacing.base },
  summaryRight: { alignItems: "flex-end" },
  summaryLabel: { ...typography.body, color: colors.textSecondary, fontWeight: "500", letterSpacing: 0 },
  masterBar: { height: 10, backgroundColor: colors.border, marginTop: spacing.base, borderRadius: 5 },
  masterFill: { height: "100%", borderRadius: 5 },
  ratioText: { ...typography.body, marginTop: spacing.sm, fontWeight: "600", letterSpacing: 0, color: colors.textPrimary },
  listHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.xl, marginBottom: spacing.md },
  listTitle: { ...typography.body, color: colors.textPrimary, fontWeight: "700", letterSpacing: 0, textTransform: "none" },
  addButton: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: colors.figma.appBg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 12 },
  addButtonText: { ...typography.body, color: "#FFFFFF", fontWeight: "600", fontSize: 13, letterSpacing: 0 },
  budgetRow: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.border, padding: spacing.base, marginBottom: spacing.md, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  numberPlate: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  numberPlateText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  iconBox: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.figma.surface },
  budgetTextWrap: { flex: 1 },
  budgetName: { ...typography.body, color: colors.textPrimary, fontWeight: "600", letterSpacing: 0 },
  budgetPeriod: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  percent: { fontWeight: "700", fontSize: 17, color: colors.textPrimary },
  amountRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.sm },
  slash: { color: colors.textMuted, fontWeight: "500" },
  bar: { height: 8, backgroundColor: colors.border, marginTop: spacing.sm, borderRadius: 4 },
  fill: { height: "100%", borderRadius: 4 },
  emptyCard: { backgroundColor: colors.surfaceCard, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, borderRadius: 16, alignItems: "center" },
  emptyText: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm },
  errorText: { ...typography.body, color: colors.loss, marginBottom: spacing.md },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxWidth: 420, backgroundColor: colors.surfaceCard, borderRadius: 20, padding: spacing.xl },
  modalTitle: { ...typography.title, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.md },
  modalError: { ...typography.caption, color: colors.loss, textAlign: "center", marginBottom: spacing.md },
  modalLabel: { ...typography.body, color: colors.textSecondary, fontWeight: "600", marginTop: spacing.md, marginBottom: spacing.sm },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.base, color: colors.textPrimary, backgroundColor: colors.figma.surface },
  categoryScroll: { maxHeight: 54 },
  categoryChip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginRight: spacing.sm, backgroundColor: colors.figma.surface },
  categoryChipActive: { backgroundColor: colors.figma.appBg, borderColor: colors.figma.appBg },
  categoryChipDisabled: { opacity: 0.35 },
  categoryChipText: { ...typography.caption, color: colors.textSecondary, fontWeight: "600" },
  categoryChipTextActive: { color: "#FFFFFF" },
  currentPeriodText: { ...typography.caption, color: colors.textMuted, marginTop: spacing.sm },
  modalActions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xl },
  modalCancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: spacing.base, alignItems: "center" },
  modalCancelText: { ...typography.button, color: colors.textSecondary },
  modalSaveBtn: { flex: 1, backgroundColor: colors.figma.appBg, borderRadius: 12, paddingVertical: spacing.base, alignItems: "center", minHeight: 48, justifyContent: "center" },
  modalSaveText: { ...typography.button, color: "#FFFFFF" },
  disabledBtn: { opacity: 0.6 },
});
