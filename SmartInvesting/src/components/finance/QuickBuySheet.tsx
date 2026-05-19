import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../theme/tokens';
import { formatVnd } from '../../utils/formatCurrency';

export interface PopularAsset {
  ticker: string;
  name: string;
  price: number;
  bg: string;
  fg: string;
}

interface QuickBuySheetProps {
  visible: boolean;
  onClose: () => void;
  onAssetSelect?: (asset: PopularAsset) => void;
  popularAssets?: PopularAsset[];
}

export const QuickBuySheet: React.FC<QuickBuySheetProps> = ({
  visible,
  onClose,
  onAssetSelect,
  popularAssets = [
    {
      ticker: 'VTI',
      name: 'Vanguard Total Market',
      price: 215.62,
      bg: '#e2f6d5',
      fg: '#163300',
    },
    {
      ticker: 'VOO',
      name: 'Vanguard S&P 500',
      price: 498.22,
      bg: 'rgba(56,200,255,0.12)',
      fg: '#0077B6',
    },
  ],
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleOverlayPress = () => {
    onClose();
  };

  const handleAssetSelect = (asset: PopularAsset) => {
    onAssetSelect?.(asset);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>Quick Buy</Text>
          <Text style={styles.subtitle}>Search for a stock or ETF to invest in</Text>

          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#868685" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stocks & ETFs..."
              placeholderTextColor="#868685"
              returnKeyType="search"
              autoFocus
            />
          </View>

          <Text style={styles.popularLabel}>Popular</Text>

          <View style={styles.popularList}>
            {popularAssets.map((asset) => (
              <TouchableOpacity
                key={asset.ticker}
                style={styles.popularItem}
                onPress={() => handleAssetSelect(asset)}
                activeOpacity={0.7}
              >
                <View style={[styles.badge, { backgroundColor: asset.bg }]}>
                  <Text style={[styles.badgeText, { color: asset.fg }]}>
                    {asset.ticker}
                  </Text>
                </View>
                <View style={styles.popularInfo}>
                  <Text style={styles.popularName} numberOfLines={1}>
                    {asset.name}
                  </Text>
                </View>
                <Text style={styles.popularPrice}>{formatVnd(asset.price)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 15, 12, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 32,
    shadowColor: '#0e0f0c',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(14, 15, 12, 0.12)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0e0f0c',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#868685',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6f3',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0e0f0c',
    paddingVertical: 12,
  },
  popularLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#868685',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  popularList: {
    paddingHorizontal: 20,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  popularInfo: {
    flex: 1,
    minWidth: 0,
  },
  popularName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c',
  },
  popularPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c',
    fontVariant: ['tabular-nums'],
  },
});
