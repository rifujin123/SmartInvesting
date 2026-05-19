import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatVnd } from '../../utils/formatCurrency';

export interface DashboardHoldingItem {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  value: number;
  gain: number;
  price?: number;
  bg: string;
  fg: string;
  watchlist?: boolean;
}

interface HoldingsListProps {
  holdings: DashboardHoldingItem[];
  onHoldingPress?: (holding: DashboardHoldingItem) => void;
  onSeeAll?: () => void;
}

export const HoldingsList: React.FC<HoldingsListProps> = ({
  holdings,
  onHoldingPress,
  onSeeAll,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Your Holdings</Text>
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {holdings.map((holding, index) => {
        const isWatchlist = holding.watchlist || holding.shares === 0;
        const isLast = index === holdings.length - 1;

        return (
          <TouchableOpacity
            key={holding.id}
            style={[styles.row, isLast && styles.rowLast]}
            onPress={() => onHoldingPress?.(holding)}
            activeOpacity={0.75}
          >
            <View style={[styles.badge, { backgroundColor: holding.bg }]}>
              <Text style={[styles.badgeText, { color: holding.fg }]} numberOfLines={1}>
                {holding.ticker}
              </Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {holding.name}
              </Text>
              <Text style={styles.shares}>
                {isWatchlist ? '0.00 shares' : `${holding.shares.toFixed(3)} shares`}
              </Text>
            </View>

            <View style={styles.valueWrap}>
              <Text style={[styles.amount, isWatchlist && styles.mutedAmount]}>
                {isWatchlist ? 'On watchlist' : formatVnd(holding.value)}
              </Text>
              <Text style={[styles.returnText, { color: isWatchlist ? '#868685' : '#054d28' }]}>
                {isWatchlist
                  ? formatVnd(holding.price ?? 0)
                  : `${holding.gain >= 0 ? '+' : ''}${formatVnd(holding.gain)}`}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0e0f0c',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#163300',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(14,15,12,0.12)',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0e0f0c',
  },
  shares: {
    marginTop: 2,
    fontSize: 13,
    color: '#868685',
  },
  valueWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0e0f0c',
    fontVariant: ['tabular-nums'],
  },
  mutedAmount: {
    color: '#868685',
  },
  returnText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
