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
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { formatVnd } from "../../../utils/formatCurrency";
import { getStocks, searchAssets } from "../../../services/assets/assetService";
import { AssetSearchResult } from "../../../services/assets/types";
import { transactionsService } from "../../../services/transactions/transactionsService";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { walletsService } from "../../../services/wallets/walletsService";
import { dashboardService } from "../../../services/dashboard/dashboardService";
import type { WalletDto } from "../../../services/wallets/types";
import type { DashboardSummaryDto } from "../../../services/dashboard/dashboardService";
import { ShimmerBar } from "../../../components/finance";

interface PortfolioScreenProps {}

export const PortfolioScreen: React.FC<PortfolioScreenProps> = () => {
  const { colors } = useTheme();
  const [token, setToken] = useState<string | null>(null);
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

  useEffect(() => {
    const loadData = async () => {
      const { accessToken } = await tokenStorage.getTokens();
      if (!accessToken) return;
      setToken(accessToken);
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
  }, []);

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
    if (token) {
      dashboardService.getSummary(token).then(setSummary).catch(console.error);
    }
  }, [loadAssets, token]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleBuy = (asset: AssetSearchResult) => {
    if (!activeWallet) {
      return;
    }
    setSelectedAsset(asset);
    setBuyPrice(asset.latestPrice?.toString() || "0");
    setBuyAmount("");
    setBuyShares("");
    setShowBuyModal(true);
  };

  const handleConfirmBuy = async () => {
    if (!token || !activeWallet || !selectedAsset) return;
    try {
      setBuyLoading(true);
      const amount = parseFloat(buyAmount) || parseFloat(buyShares) * parseFloat(buyPrice);
      if (amount <= 0) {
        return;
      }
      await transactionsService.createTransaction(token, activeWallet.id, {
        amount: -amount,
        note: `Buy ${selectedAsset.symbol}`,
        categoryId: 0,
        assetId: selectedAsset.id,
      });
      setShowBuyModal(false);
    } catch (error) {
      console.error("Buy failed:", error);
    } finally {
      setBuyLoading(false);
    }
  };

  const filteredAssets = activeTab === "all" ? assets : assets.filter((a) => a.type === activeTab);

  const renderTab = (tab: "all" | "stock" | "etf" | "gold", label: string) => (
    <TouchableOpacity
      style={[
        styles.tab,
        { borderColor: colors.cardBorder },
        activeTab === tab && [styles.tabActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
      ]}
      onPress={() => setActiveTab(tab)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, { color: activeTab === tab ? colors.text : colors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAssetItem = ({ item }: { item: AssetSearchResult }) => (
    <TouchableOpacity
      style={[styles.assetCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => handleBuy(item)}
      activeOpacity={0.7}
    >
      <View style={styles.assetLeft}>
        <View style={[styles.assetIcon, { backgroundColor: colors.surface }]}>
          <Ionicons name="trending-up" size={20} color={colors.primary} />
        </View>
        <View style={styles.assetInfo}>
          <Text style={[styles.assetName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.assetSymbol, { color: colors.textSecondary }]}>{item.symbol}</Text>
        </View>
      </View>
      <View style={styles.assetRight}>
        <Text style={[styles.assetPrice, { color: colors.text }]}>{formatVnd(item.latestPrice || 0)}</Text>
        <TouchableOpacity
          style={[styles.buyBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleBuy(item)}
          activeOpacity={0.7}
        >
          <Text style={[styles.buyBtnText, { color: colors.text }]}>Buy</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderShimmer = () => (
    <View style={styles.skeletonStack}>
      <ShimmerBar width="100%" height={160} borderRadius={16} />
      <ShimmerBar width="100%" height={50} borderRadius={12} style={{ marginTop: spacing.lg }} />
      <ShimmerBar width="100%" height={200} borderRadius={16} style={{ marginTop: spacing.lg }} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroRow}>
              <Text style={[styles.heroLabel, { color: colors.text }]}>Portfolio Value</Text>
              <TouchableOpacity>
                <Text style={[styles.chiTietText, { color: colors.primary }]}>Details</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              {summary ? formatVnd(summary.totalWealth) : "---"}
            </Text>
            <View style={styles.profitLossRow}>
              <Text
                style={[
                  styles.profitLossText,
                  {
                    color: !summary
                      ? colors.gain
                      : summary.portfolioProfitLoss >= 0
                      ? colors.gain
                      : colors.loss,
                  },
                ]}
              >
                {summary
                  ? `${summary.portfolioProfitLoss >= 0 ? "+" : ""}${formatVnd(
                      summary.portfolioProfitLoss
                    )}`
                  : "---"}
              </Text>
              <View
                style={[
                  styles.percentBadge,
                  {
                    borderColor: !summary
                      ? colors.gain
                      : summary.portfolioProfitLoss >= 0
                      ? colors.gain
                      : colors.loss,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.percentText,
                    {
                      color: !summary
                        ? colors.gain
                        : summary.portfolioProfitLoss >= 0
                        ? colors.gain
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
          <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.cashRow}>
            <Text style={[styles.cashLabel, { color: colors.textSecondary }]}>
              Cash: <Text style={[styles.cashValue, { color: colors.text }]}>{summary ? formatVnd(summary.totalWealth - summary.portfolioNav) : "---"}</Text>
            </Text>
            <TouchableOpacity style={[styles.napTienBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.napTienText, { color: colors.text }]}>Deposit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search assets..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

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

        <View style={styles.section}>
          {loading && assets.length === 0 ? (
            renderShimmer()
          ) : filteredAssets.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No assets found</Text>
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

      <Modal visible={showBuyModal} transparent animationType="slide" onRequestClose={() => setShowBuyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.buyModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.cardBorder }]} />
            {selectedAsset && (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Buy {selectedAsset.symbol}</Text>
                <View style={[styles.modalAssetInfo, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.modalAssetName, { color: colors.textSecondary }]}>{selectedAsset.name}</Text>
                  <Text style={[styles.modalAssetPrice, { color: colors.text }]}>{formatVnd(selectedAsset.latestPrice || 0)}</Text>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={[styles.modalInputLabel, { color: colors.text }]}>Amount (VND)</Text>
                  <View style={[styles.modalInputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <TextInput
                      style={[styles.modalInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={buyAmount}
                      onChangeText={setBuyAmount}
                    />
                  </View>
                </View>

                <View style={[styles.modalDivider, { backgroundColor: colors.cardBorder }]} />

                <View style={styles.modalInputGroup}>
                  <Text style={[styles.modalInputLabel, { color: colors.text }]}>Shares</Text>
                  <View style={[styles.modalInputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <TextInput
                      style={[styles.modalInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={buyShares}
                      onChangeText={setBuyShares}
                    />
                  </View>
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={[styles.modalInputLabel, { color: colors.text }]}>Price per Share</Text>
                  <View style={[styles.modalInputContainer, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <TextInput
                      style={[styles.modalInput, { color: colors.text }]}
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={buyPrice}
                      onChangeText={setBuyPrice}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel, { backgroundColor: colors.surface }]}
                    onPress={() => setShowBuyModal(false)}
                    disabled={buyLoading}
                  >
                    <Text style={[styles.modalBtnCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnConfirm, { backgroundColor: colors.primary }]}
                    onPress={handleConfirmBuy}
                    disabled={buyLoading}
                  >
                    {buyLoading ? (
                      <ActivityIndicator size="small" color={colors.text} />
                    ) : (
                      <Text style={[styles.modalBtnConfirmText, { color: colors.text }]}>Confirm Buy</Text>
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
  },
  skeletonStack: {
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
  heroCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
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
  },
  chiTietText: {
    fontSize: 16,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: spacing.sm,
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
    marginVertical: spacing.base,
  },
  cashRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cashLabel: {
    fontSize: 16,
  },
  cashValue: {
    fontWeight: "600",
  },
  napTienBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  napTienText: {
    fontWeight: "700",
    fontSize: 16,
  },
  searchContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.base,
    ...typography.body.regular,
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
    borderRadius: 20,
    borderWidth: 1,
  },
  tabActive: {
    borderWidth: 1,
  },
  tabText: {
    ...typography.body.small,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    ...typography.body.regular,
    marginTop: spacing.base,
  },
  assetCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    ...typography.body.regular,
    fontWeight: "500",
  },
  assetSymbol: {
    ...typography.body.small,
    marginTop: 2,
  },
  assetRight: {
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  assetPrice: {
    ...typography.body.regular,
    fontWeight: "600",
  },
  buyBtn: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  buyBtnText: {
    ...typography.body.small,
    fontWeight: "600",
  },
  loadMoreContainer: {
    paddingVertical: spacing.base,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  buyModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: spacing.base,
  },
  modalTitle: {
    ...typography.heading.h2,
    textAlign: "center",
    marginBottom: spacing.base,
  },
  modalAssetInfo: {
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  modalAssetName: {
    ...typography.body.regular,
  },
  modalAssetPrice: {
    ...typography.heading.h3,
    marginTop: spacing.sm,
  },
  modalInputGroup: {
    marginBottom: spacing.base,
  },
  modalInputLabel: {
    ...typography.body.regular,
    fontWeight: "500",
    marginBottom: spacing.sm,
  },
  modalInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
  },
  modalInput: {
    fontSize: 18,
    fontWeight: "600",
    padding: spacing.base,
    textAlign: "center",
  },
  modalDivider: {
    height: 1,
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
  modalBtnCancel: {},
  modalBtnCancelText: {
    ...typography.label.large,
  },
  modalBtnConfirm: {},
  modalBtnConfirmText: {
    ...typography.label.large,
  },
});
