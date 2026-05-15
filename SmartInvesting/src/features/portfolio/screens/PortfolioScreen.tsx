import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { AppHeader } from "../../../shared/components";
import { formatCurrency, formatNumber } from "../../../shared/utils/formatCurrency";
import { getStocks, searchAssets } from "../../../services/assets/assetService";
import { AssetSearchResult } from "../../../services/assets/types";
import { transactionsService } from "../../../services/transactions/transactionsService";
import { useAuth } from "../../../context/AuthContext";
import { walletsService } from "../../../services/wallets/walletsService";
import { dashboardService } from "../../../services/dashboard/dashboardService";
import type { WalletDto } from "../../../services/wallets/types";
import type { DashboardSummaryDto } from "../../../services/dashboard/dashboardService";

interface PortfolioScreenProps {}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = () => {
  const { accessToken } = useAuth();
  const [activeWallet, setActiveWallet] = useState<WalletDto | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "stock" | "etf" | "gold">("all");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetSearchResult | null>(null);
  const [assets, setAssets] = useState<AssetSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [buyAmount, setBuyAmount] = useState("");
  const [buyShares, setBuyShares] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [buyLoading, setBuyLoading] = useState(false);

  // Load wallet + summary on mount
  useEffect(() => {
    const loadData = async () => {
      if (!accessToken) return;
      try {
        const [walletsRes, summaryRes] = await Promise.all([
          walletsService.getMyWallets(accessToken),
          dashboardService.getSummary(accessToken),
        ]);
        if (walletsRes.items.length > 0) {
          setActiveWallet(walletsRes.items[0]);
        }
        setSummary(summaryRes);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, [accessToken]);

  const loadAssets = useCallback(
    async (reset = false) => {
      if (!hasMore && !reset) return;
      try {
        const limit = 20;
        const offset = reset ? 0 : (page - 1) * limit;
        let data: AssetSearchResult[];
        if (searchQuery.length >= 2) {
          data = await searchAssets(searchQuery, limit, offset);
        } else {
          data = await getStocks(limit, offset);
        }
        if (reset) {
          setAssets(data);
          setPage(1);
        } else {
          setAssets((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      } catch (error) {
        console.error("Failed to load assets:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, page, hasMore]
  );

  useEffect(() => {
    loadAssets(true);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      loadAssets(false);
    }
  }, [page]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadAssets(true);
    // Reload summary on refresh
    if (accessToken) {
      dashboardService.getSummary(accessToken).then(setSummary).catch(console.error);
    }
  }, [loadAssets, accessToken]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleBuy = (asset: AssetSearchResult) => {
    if (!activeWallet) {
      // TODO: show toast "Create wallet first"
      return;
    }
    setSelectedAsset(asset);
    setBuyPrice(asset.latestPrice?.toString() || "0");
    setBuyAmount("");
    setBuyShares("");
    setShowBuyModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!accessToken || !activeWallet || !selectedAsset) return;
    try {
      setBuyLoading(true);
      const amount = parseFloat(buyAmount) || parseFloat(buyShares) * parseFloat(buyPrice);
      if (amount <= 0) {
        // TODO: show error toast
        return;
      }
      await transactionsService.createTransaction(accessToken, activeWallet.id, {
        amount: -amount,
        note: `Buy ${selectedAsset.symbol}`,
        categoryId: 0,
        assetId: selectedAsset.id,
      });
      setShowBuyModal(false);
      // TODO: show success toast
    } catch (error) {
      console.error("Buy failed:", error);
      // TODO: show error toast
    } finally {
      setBuyLoading(false);
    }
  };

  const filteredAssets = activeTab === "all" ? assets : assets.filter((a) => a.type === activeTab);

  const renderTab = (tab: "all" | "stock" | "etf" | "gold", label: string) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAssetItem = ({ item }: { item: AssetSearchResult }) => (
    <TouchableOpacity
      style={styles.assetCard}
      onPress={() => handleBuy(item)}
      activeOpacity={0.7}
    >
      <View style={styles.assetLeft}>
        <View style={styles.assetIcon}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{item.name}</Text>
          <Text style={styles.assetSymbol}>{item.symbol}</Text>
        </View>
      </View>
      <View style={styles.assetRight}>
        <Text style={styles.assetPrice}>{formatCurrency(item.latestPrice || 0)}</Text>
        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => handleBuy(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.buyBtnText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <AppHeader />

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroRow}>
              <Text style={styles.heroLabel}>Portfolio Value</Text>
              <TouchableOpacity>
                <Text style={styles.chiTietText}>Details</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.heroTitle}>
              {summary ? formatNumber(summary.totalWealth) : "---"} <Text style={styles.currencyText}>VND</Text>
            </Text>
            <View style={styles.profitLossRow}>
              <Text
                style={[
                  styles.profitLossText,
                  {
                    color: !summary
                      ? colors.success
                      : summary.portfolioProfitLoss >= 0
                      ? colors.success
                      : colors.loss,
                  },
                ]}
              >
                {summary
                  ? `${summary.portfolioProfitLoss >= 0 ? "+" : ""}${formatNumber(
                      summary.portfolioProfitLoss
                    )}`
                  : "---"}
              </Text>
              <View
                style={[
                  styles.percentBadge,
                  {
                    borderColor: !summary
                      ? colors.success
                      : summary.portfolioProfitLoss >= 0
                      ? colors.success
                      : colors.loss,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.percentText,
                    {
                      color: !summary
                        ? colors.success
                        : summary.portfolioProfitLoss >= 0
                        ? colors.success
                        : colors.loss,
                    },
                  ]}
                >
                  {summary
                    ? `${summary.portfolioProfitLossPercent >= 0 ? "+" : ""}${summary.portfolioProfitLossPercent.toFixed(2)}%`
                    : "---%"}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.cashRow}>
            <Text style={styles.cashLabel}>Cash: <Text style={styles.cashValue}>{summary ? formatNumber(summary.totalWealth - summary.portfolioNav) : "---"}</Text></Text>
            <TouchableOpacity style={styles.napTienBtn}>
              <Text style={styles.napTienText}>Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {renderTab("all", "All")}
            {renderTab("stock", "Stocks")}
            {renderTab("etf", "ETFs")}
            {renderTab("gold", "Gold")}
          </ScrollView>
        </View>

        {/* Assets List */}
        <View style={styles.section}>
          {loading && assets.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredAssets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No assets found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredAssets}
              renderItem={renderAssetItem}
              keyExtractor={(item) => item.symbol}
              scrollEnabled={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                hasMore && !loading ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Buy Modal */}
      <Modal visible={showBuyModal} transparent animationType="slide" onRequestClose={() => setShowBuyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.buyModalContent}>
            <View style={styles.modalHandle} />
            {selectedAsset && (
              <>
                <Text style={styles.modalTitle}>Buy {selectedAsset.symbol}</Text>
                <View style={styles.modalAssetInfo}>
                  <Text style={styles.modalAssetName}>{selectedAsset.name}</Text>
                  <Text style={styles.modalAssetPrice}>{formatCurrency(selectedAsset.latestPrice || 0)}</Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>Amount (VND)</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={buyAmount}
                      onChangeText={setBuyAmount}
                    />
                  </View>
                </View>

                <View style={styles.modalDivider} />

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>Shares</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={buyShares}
                      onChangeText={setBuyShares}
                    />
                  </View>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalInputLabel}>Price per Share</Text>
                  <View style={styles.modalInputContainer}>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={buyPrice}
                      onChangeText={setBuyPrice}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel]}
                    onPress={() => setShowBuyModal(false)}
                    disabled={buyLoading}
                  >
                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnConfirm]}
                    onPress={handleConfirmBuy}
                    disabled={buyLoading}
                  >
                    {buyLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalBtnConfirmText}>Confirm Buy</Text>
                    )}
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
    backgroundColor: colors.background,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  heroHeader: {
    marginBottom: spacing.base,
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  chiTietText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: spacing.sm,
  },
  currencyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  profitLossRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  profitLossText: {
    fontSize: 18,
    fontWeight: "600",
  },
  percentBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  percentText: {
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.base,
  },
  cashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cashLabel: {
    fontSize: 16,
    color: "#64748b",
  },
  cashValue: {
    fontWeight: "600",
    color: "#1e293b",
  },
  napTienBtn: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  napTienText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  searchContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.base,
    ...typography.body,
    color: colors.textPrimary,
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
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.heroText,
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.base,
  },
  assetCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  assetLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  assetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  assetInfo: {
    flex: 1,
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
    gap: spacing.sm,
  },
  assetPrice: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  buyBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  buyBtnText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.heroText,
  },
  loadMoreContainer: {
    paddingVertical: spacing.base,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  buyModalContent: {
    backgroundColor: colors.surfaceCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: "80%",
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
  modalAssetInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  modalAssetName: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalAssetPrice: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
    marginTop: spacing.sm,
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
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.base,
    marginTop: spacing.lg,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: colors.surface,
  },
  modalBtnCancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  modalBtnConfirm: {
    backgroundColor: colors.primary,
  },
  modalBtnConfirmText: {
    ...typography.button,
    color: colors.heroText,
  },
});
