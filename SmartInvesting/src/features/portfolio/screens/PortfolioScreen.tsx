import React, { useState } from "react";
import { formatCurrency, formatNumber } from "../../../shared/utils/formatCurrency";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { AppHeader } from "../../../shared/components";

interface PortfolioScreenProps {}

interface Holding {
  id: string;
  name: string;
  symbol: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number;
  changePercent: number;
  type: "stock" | "etf" | "gold";
}

const mockHoldings: Holding[] = [
  { id: "1", name: "Apple Inc.", symbol: "AAPL", shares: 10, avgPrice: 145.0, currentPrice: 178.5, value: 1785.0, change: 335.0, changePercent: 23.1, type: "stock" },
  { id: "2", name: "S&P 500 ETF", symbol: "SPY", shares: 5, avgPrice: 420.0, currentPrice: 478.2, value: 2391.0, change: 291.0, changePercent: 13.86, type: "etf" },
  { id: "3", name: "Gold", symbol: "XAU", shares: 2, avgPrice: 1900.0, currentPrice: 2320.0, value: 4640.0, change: 840.0, changePercent: 22.1, type: "gold" },
  { id: "4", name: "Tesla Inc.", symbol: "TSLA", shares: 8, avgPrice: 220.0, currentPrice: 248.5, value: 1988.0, change: 228.0, changePercent: 12.95, type: "stock" },
];

export const PortfolioScreen: React.FC<PortfolioScreenProps> = () => {
  const [activeTab, setActiveTab] = useState<"all" | "stock" | "etf" | "gold">("all");
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);

  const totalValue = mockHoldings.reduce((acc, h) => acc + h.value, 0);
  const totalProfit = mockHoldings.reduce((acc, h) => acc + h.change, 0);

  const filteredHoldings = activeTab === "all" ? mockHoldings : mockHoldings.filter(h => h.type === activeTab);

  const renderTab = (tab: "all" | "stock" | "etf" | "gold", label: string) => (
    <TouchableOpacity style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const handleSell = (holding: Holding) => {
    setSelectedHolding(holding);
    setShowSellModal(true);
  };

  const getTypeColor = (type: Holding["type"]) => {
    switch (type) {
      case "stock": return "#DCFCE7";
      case "etf": return "#DBEAFE";
      case "gold": return "#FEF3C7";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader />

        {/* Portfolio Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryMain}>
            <Text style={styles.summaryLabel}>Total Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalValue)}</Text>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatLabel}>Total Profit</Text>
              <Text style={styles.summaryStatValue}>+{formatNumber(totalProfit)} VND</Text>
            </View>
            <View style={styles.summaryStatDivider} />
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatLabel}>Holdings</Text>
              <Text style={styles.summaryStatValue}>{mockHoldings.length}</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {renderTab("all", "All")}
            {renderTab("stock", "Stocks")}
            {renderTab("etf", "ETFs")}
            {renderTab("gold", "Gold")}
          </ScrollView>
        </View>

        {/* Holdings List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Holdings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.holdingsList}>
            {filteredHoldings.map((holding) => (
              <View key={holding.id} style={styles.holdingCard}>
                <View style={styles.holdingHeader}>
                  <View style={styles.holdingLeft}>
                    <View style={[styles.holdingBadge, { backgroundColor: getTypeColor(holding.type) }]}>
                      <Ionicons
                        name={holding.type === "stock" ? "trending-up" : holding.type === "etf" ? "bar-chart" : "diamond"}
                        size={18}
                        color={holding.type === "stock" ? "#16A34A" : holding.type === "etf" ? "#2563EB" : "#D97706"}
                      />
                    </View>
                    <View>
                      <Text style={styles.holdingName}>{holding.name}</Text>
                      <Text style={styles.holdingSymbol}>{holding.symbol}</Text>
                    </View>
                  </View>
                  <View style={styles.holdingRight}>
                    <Text style={styles.holdingValue}>{formatCurrency(holding.value)}</Text>
                    <Text style={[styles.holdingChange, { color: holding.change >= 0 ? colors.success : colors.loss }]}>
                      {holding.change >= 0 ? "+" : ""}{holding.changePercent.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sell Modal */}
      <Modal visible={showSellModal} transparent animationType="slide" onRequestClose={() => setShowSellModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sellModalContent}>
            <View style={styles.modalHandle} />
            {selectedHolding && (
              <>
                <Text style={styles.modalTitle}>Sell {selectedHolding.symbol}</Text>
                <View style={styles.modalBalanceInfo}>
                  <Text style={styles.modalBalanceLabel}>Available Shares</Text>
                  <Text style={styles.modalBalanceValue}>{selectedHolding.shares}</Text>
                </View>
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>Shares to Sell</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowSellModal(false)}>
                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={() => setShowSellModal(false)}>
                    <Text style={styles.modalBtnConfirmText}>Preview Sell</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  summaryCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.figma.primary,
    borderRadius: 16,
  },
  summaryMain: {},
  summaryLabel: {
    ...typography.caption,
    color: "rgba(255,255,255,0.8)",
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: spacing.xs,
  },
  summaryStats: {
    flexDirection: "row",
    marginTop: spacing.base,
    alignItems: "center",
  },
  summaryStat: {
    flex: 1,
  },
  summaryStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.base,
  },
  summaryStatLabel: {
    ...typography.caption,
    color: "rgba(255,255,255,0.7)",
  },
  summaryStatValue: {
    ...typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
  },
  filterContainer: {
    marginTop: spacing.base,
  },
  filterScroll: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.figma.primary,
    borderColor: colors.figma.primary,
  },
  tabText: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.body,
    fontWeight: "500",
    color: colors.figma.primary,
  },
  holdingsList: {
    marginTop: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  holdingCard: {
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  holdingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  holdingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  holdingBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  holdingBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  holdingName: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  holdingSymbol: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  holdingRight: {
    alignItems: "flex-end",
  },
  holdingValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  holdingChange: {
    ...typography.caption,
    fontWeight: "500",
    marginTop: 2,
  },
  sellButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  sellButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.loss,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sellModalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
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
    textAlign: "center",
    marginBottom: spacing.base,
  },
  modalBalanceInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalBalanceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalBalanceValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modalInputGroup: {
    marginBottom: spacing.base,
  },
  modalInputLabel: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalInputContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalInput: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    padding: spacing.base,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
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
