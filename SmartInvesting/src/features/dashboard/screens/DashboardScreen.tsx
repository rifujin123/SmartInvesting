import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  GreetingHeader,
  HoldingsList,
  PortfolioCard,
  QuickActionsBar,
  QuickBuySheet,
  ShimmerBar,
  TipCard,
} from "../../../components/finance";
import type { DashboardHoldingItem } from "../../../components/finance/HoldingsList";
import type { PopularAsset } from "../../../components/finance/QuickBuySheet";
import { spacing } from "../../../theme/tokens";

interface DashboardScreenProps {
  onBuyAsset?: (type: "stock" | "etf" | "gold") => void;
}

const MOCK_PORTFOLIO = {
  totalValue: 4287.5,
  change: 312.4,
  changePercent: 7.87,
  sparklineData: [40, 35, 38, 28, 30, 18, 20, 10, 8, 5],
};

const MOCK_HOLDINGS: DashboardHoldingItem[] = [
  {
    id: "1",
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    shares: 12.483,
    value: 2691.08,
    gain: 191.08,
    bg: "#e2f6d5",
    fg: "#163300",
  },
  {
    id: "2",
    ticker: "AAPL",
    name: "Apple Inc.",
    shares: 8.2,
    value: 1596.42,
    gain: 121.32,
    bg: "#fde8e8",
    fg: "#d03238",
  },
  {
    id: "3",
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    shares: 0,
    value: 0,
    gain: 0,
    price: 498.22,
    bg: "rgba(56,200,255,0.12)",
    fg: "#0077B6",
    watchlist: true,
  },
];

const MOCK_POPULAR_ASSETS: PopularAsset[] = [
  {
    ticker: "VTI",
    name: "Vanguard Total Market",
    price: 215.62,
    bg: "#e2f6d5",
    fg: "#163300",
  },
  {
    ticker: "VOO",
    name: "Vanguard S&P 500",
    price: 498.22,
    bg: "rgba(56,200,255,0.12)",
    fg: "#0077B6",
  },
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onBuyAsset }) => {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickBuyOpen, setQuickBuyOpen] = useState(false);

  const safeNavigate = useCallback(
    (route: string, params?: Record<string, unknown>) => {
      try {
        navigation.navigate(route, params);
      } catch {
        // Some reference routes are not wired yet.
      }
    },
    [navigation],
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    setError(null);
    setTimeout(() => setRefreshing(false), 450);
  }, []);

  const renderShimmer = () => (
    <View style={styles.skeletonStack}>
      <ShimmerBar width="100%" height={72} borderRadius={18} />
      <ShimmerBar width="100%" height={196} borderRadius={30} />
      <ShimmerBar width="100%" height={96} borderRadius={30} />
      <ShimmerBar width="100%" height={184} borderRadius={16} />
    </View>
  );

  const renderError = () => (
    <View style={styles.errorBanner}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={18} color="#d03238" />
      </View>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={refresh} activeOpacity={0.8}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
      >
        {loading ? (
          renderShimmer()
        ) : error ? (
          renderError()
        ) : (
          <>
            <GreetingHeader
              userName="Minh"
              onSettingsPress={() => safeNavigate("Settings")}
            />
            <PortfolioCard
              totalValue={MOCK_PORTFOLIO.totalValue}
              change={MOCK_PORTFOLIO.change}
              changePercent={MOCK_PORTFOLIO.changePercent}
              sparklineData={MOCK_PORTFOLIO.sparklineData}
            />
            <QuickActionsBar
              onDiscover={() => safeNavigate("Discovery")}
              onBuy={() => {
                setQuickBuyOpen(true);
                onBuyAsset?.("stock");
              }}
              onHistory={() => safeNavigate("Transactions")}
            />
            <HoldingsList
              holdings={MOCK_HOLDINGS}
              onSeeAll={() => safeNavigate("Holdings")}
              onHoldingPress={(holding) =>
                safeNavigate("AssetDetail", { ticker: holding.ticker })
              }
            />
            <TipCard />
          </>
        )}
      </ScrollView>

      <QuickBuySheet
        visible={quickBuyOpen}
        onClose={() => setQuickBuyOpen(false)}
        popularAssets={MOCK_POPULAR_ASSETS}
        onAssetSelect={(asset) => safeNavigate("AssetDetail", { ticker: asset.ticker })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingTop: 8,
    paddingBottom: spacing["2xl"],
  },
  skeletonStack: {
    gap: spacing.base,
    paddingHorizontal: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fde8e8",
    borderWidth: 1,
    borderColor: "rgba(208,50,56,0.18)",
    borderRadius: 16,
    padding: spacing.base,
    marginHorizontal: 16,
  },
  errorIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: "#d03238",
  },
  retryBtn: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: "#d03238",
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",

  },
});
