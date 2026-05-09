import React, { useState } from "react";
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

interface DashboardScreenProps {
  onLogout?: () => void;
}

interface Asset {
  id: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  type: "stock" | "etf" | "gold";
}

const mockAssets: Asset[] = [
  { id: "1", name: "Apple Inc.", symbol: "AAPL", value: 2450.5, change: 2.34, type: "stock" },
  { id: "2", name: "S&P 500 ETF", symbol: "SPY", value: 1820.75, change: 1.12, type: "etf" },
  { id: "3", name: "Gold", symbol: "XAU", value: 3200.0, change: -0.45, type: "gold" },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<"stock" | "etf" | "gold">("stock");

  const totalAssets = 28450.0;
  const totalProfit = 1250.75;
  const profitPercentage = 4.59;
  const walletBalance = 5000.0;

  const handleAddFunds = () => {
    setShowAddFunds(false);
    setFundAmount("");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTypeIcon = (type: Asset["type"]): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "stock": return "trending-up";
      case "etf": return "bar-chart";
      case "gold": return "diamond";
    }
  };

  const getTypeColor = (type: Asset["type"]) => {
    switch (type) {
      case "stock": return "#DCFCE7";
      case "etf": return "#DBEAFE";
      case "gold": return "#FEF3C7";
    }
  };

  const getTypeIconColor = (type: Asset["type"]) => {
    switch (type) {
      case "stock": return "#16A34A";
      case "etf": return "#2563EB";
      case "gold": return "#D97706";
    }
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

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletCardHeader}>
            <Text style={styles.walletLabel}>Total Assets</Text>
            <TouchableOpacity style={styles.walletActionBtn} onPress={() => setShowAddFunds(true)} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.walletActionText}>Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.walletBalance}>${totalAssets.toLocaleString()}</Text>
          <View style={styles.walletStats}>
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Profit</Text>
              <Text style={styles.walletStatValue}>+${totalProfit.toLocaleString()}</Text>
            </View>
            <View style={styles.walletStatDivider} />
            <View style={styles.walletStat}>
              <Text style={styles.walletStatLabel}>Return</Text>
              <Text style={[styles.walletStatValue, { color: "#FFFFFF" }]}>+{profitPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction} onPress={() => { setSelectedAssetType("stock"); setShowBuyModal(true); }} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DCFCE7" }]}>
                <Ionicons name="trending-up" size={24} color="#16A34A" />
              </View>
              <Text style={styles.quickActionLabel}>Buy Stock</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => { setSelectedAssetType("etf"); setShowBuyModal(true); }} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="bar-chart" size={24} color="#2563EB" />
              </View>
              <Text style={styles.quickActionLabel}>Buy ETF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => { setSelectedAssetType("gold"); setShowBuyModal(true); }} activeOpacity={0.7}>
              <View style={[styles.quickActionIcon, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="diamond" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionLabel}>Buy Gold</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Assets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.assetsList}>
            {mockAssets.map((asset) => (
              <View key={asset.id} style={styles.assetItem}>
                <View style={styles.assetLeft}>
                  <View style={[styles.assetBadge, { backgroundColor: getTypeColor(asset.type) }]}>
                    <Ionicons name={getTypeIcon(asset.type)} size={20} color={getTypeIconColor(asset.type)} />
                  </View>
                  <View>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                  </View>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetValue}>${asset.value.toLocaleString()}</Text>
                  <Text style={[styles.assetChange, { color: asset.change >= 0 ? colors.success : colors.loss }]}>
                    {asset.change >= 0 ? "+" : ""}{asset.change}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Add Funds Modal */}
      <Modal visible={showAddFunds} transparent animationType="fade" onRequestClose={() => setShowAddFunds(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Funds</Text>
            <Text style={styles.modalSubtitle}>Enter amount to add to your wallet</Text>
            <View style={styles.modalInputContainer}>
              <Text style={styles.modalCurrency}>$</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={fundAmount}
                onChangeText={setFundAmount}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setShowAddFunds(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm]} onPress={handleAddFunds}>
                <Text style={styles.modalBtnConfirmText}>Add Funds</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Buy Modal */}
      <Modal visible={showBuyModal} transparent animationType="slide" onRequestClose={() => setShowBuyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.buyModalContent}>
            <View style={styles.buyModalHandle} />
            <Text style={styles.buyModalTitle}>
              Buy {selectedAssetType === "stock" ? "Stock" : selectedAssetType === "etf" ? "ETF" : "Gold"}
            </Text>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceValue}>${walletBalance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={[styles.modalBtn, styles.modalBtnConfirm, styles.fullWidth]} onPress={() => setShowBuyModal(false)}>
              <Text style={styles.modalBtnConfirmText}>Continue to Search</Text>
            </TouchableOpacity>
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
  walletCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.figma.primary,
    borderRadius: 16,
  },
  walletCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLabel: {
    ...typography.caption,
    color: "rgba(255,255,255,0.8)",
  },
  walletActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    gap: 4,
  },
  walletActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: spacing.xs,
  },
  walletStats: {
    flexDirection: "row",
    marginTop: spacing.base,
    alignItems: "center",
  },
  walletStat: {
    flex: 1,
  },
  walletStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: spacing.base,
  },
  walletStatLabel: {
    ...typography.caption,
    color: "rgba(255,255,255,0.7)",
  },
  walletStatValue: {
    ...typography.body,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 2,
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.base,
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  quickActionLabel: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  assetsList: {
    marginTop: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  assetItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  assetBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  assetName: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  assetSymbol: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  assetRight: {
    alignItems: "flex-end",
  },
  assetValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  assetChange: {
    ...typography.caption,
    fontWeight: "500",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    padding: spacing.xl,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: spacing.base,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCurrency: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  modalInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: colors.textPrimary,
    paddingVertical: spacing.base,
    paddingLeft: spacing.sm,
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
  fullWidth: {
    width: "100%",
  },
  buyModalContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    paddingTop: spacing.base,
  },
  buyModalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.base,
  },
  buyModalTitle: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  balanceInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  balanceValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
