import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../shared/navigation/types";
import { getStocks, searchAssets } from "../../../services/assets/assetService";
import { AssetSearchResult } from "../../../services/assets/types";

type BuyAssetsScreenProps = NativeStackScreenProps<AppStackParamList, "BuyAssets">;
type StockListItem = AssetSearchResult & { id: string };

const STOCK_PAGE_SIZE = 20;
const NAVY = "#070A43";
const MUTED = "#9AA0AE";
const SEARCH_BG = "#F4F6FA";
const DIVIDER = "#EEF0F4";
const LOGO_BG = "#F7F8FC";

export const BuyAssetsScreen: React.FC<BuyAssetsScreenProps> = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [stockResults, setStockResults] = useState<AssetSearchResult[]>([]);
  const [stockPage, setStockPage] = useState(0);
  const [hasMoreStocks, setHasMoreStocks] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const canLoadMoreRef = useRef(false);

  const normalizedQuery = query.trim();
  const isSearchMode = normalizedQuery.length >= 2;

  useEffect(() => {
    setStockPage(0);
    setStockResults([]);
    setHasMoreStocks(true);
    setIsLoadingMore(false);
  }, [normalizedQuery]);

  useEffect(() => {
    let cancelled = false;
    const isFirstPage = stockPage === 0;
    const offset = stockPage * STOCK_PAGE_SIZE;

    if (isFirstPage) {
      setIsSearching(true);
    } else {
      setIsLoadingMore(true);
    }
    setSearchError(null);

    const fetchStocks = isSearchMode
      ? searchAssets(normalizedQuery, STOCK_PAGE_SIZE, offset)
      : getStocks(STOCK_PAGE_SIZE, offset);

    fetchStocks
      .then((results) => {
        if (cancelled) return;
        setStockResults((current) => {
          const merged = isFirstPage ? results : [...current, ...results];
          return Array.from(new Map(merged.map((stock) => [stock.symbol, stock])).values());
        });
        setHasMoreStocks(results.length === STOCK_PAGE_SIZE);
      })
      .catch((error) => {
        if (cancelled) return;
        if (isFirstPage) setStockResults([]);
        setHasMoreStocks(false);
        setSearchError(error instanceof Error ? error.message : "Không thể tải danh sách cổ phiếu lúc này.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsSearching(false);
        setIsLoadingMore(false);
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedQuery, stockPage, isSearchMode]);

  const stocks: StockListItem[] = stockResults.map((stock) => ({ ...stock, id: stock.symbol }));

  const handleLoadMore = () => {
    if (!canLoadMoreRef.current) return;
    if (isSearching || isLoadingMore || !hasMoreStocks || stockResults.length === 0) return;

    canLoadMoreRef.current = false;
    setStockPage((value) => value + 1);
  };

  const renderLogo = (item: StockListItem) => {
    if (item.imageUrl) {
      return <Image source={{ uri: item.imageUrl }} style={styles.logoImage} resizeMode="contain" />;
    }

    return (
      <View style={styles.logoFallback}>
        <Text style={styles.logoFallbackText} numberOfLines={1}>{item.symbol.slice(0, 3)}</Text>
      </View>
    );
  };

  const renderStock = ({ item }: { item: StockListItem }) => (
    <TouchableOpacity style={styles.stockRow} activeOpacity={0.75}>
      <View style={styles.logoBox}>{renderLogo(item)}</View>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName} numberOfLines={1}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (isSearching && stocks.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="small" color={NAVY} />
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>{searchError ?? "Không tìm thấy cổ phiếu"}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreFooter}>
          <ActivityIndicator size="small" color={NAVY} />
          <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
        </View>
      );
    }

    if (!hasMoreStocks && stocks.length > 0) {
      return (
        <View style={styles.loadingMoreFooter}>
          <Text style={styles.loadingMoreText}>Hết danh sách</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigation.goBack} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={NAVY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mã cổ phiếu"
            placeholderTextColor={MUTED}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery("")} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={18} color={MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.id}
        renderItem={renderStock}
        contentContainerStyle={[styles.listContent, stocks.length === 0 && styles.listContentEmpty]}
        showsVerticalScrollIndicator
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        onMomentumScrollBegin={() => { canLoadMoreRef.current = true; }}
        onScrollBeginDrag={() => { canLoadMoreRef.current = true; }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    gap: 8,
  },
  backButton: {
    width: 28,
    height: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  searchBox: {
    flex: 1,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: SEARCH_BG,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    color: NAVY,
    paddingVertical: 0,
  },
  listContent: {
    paddingTop: 14,
    paddingHorizontal: 22,
    paddingBottom: 28,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  stockRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  logoBox: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  logoFallback: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: LOGO_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  logoFallbackText: {
    maxWidth: 36,
    fontSize: 11,
    fontWeight: "900",
    color: NAVY,
    letterSpacing: -0.3,
  },
  stockInfo: {
    flex: 1,
    justifyContent: "center",
  },
  stockSymbol: {
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    color: NAVY,
    letterSpacing: 0.2,
  },
  stockName: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: MUTED,
  },
  emptyState: {
    flex: 1,
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MUTED,
    textAlign: "center",
  },
  loadingMoreFooter: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
  },
});
