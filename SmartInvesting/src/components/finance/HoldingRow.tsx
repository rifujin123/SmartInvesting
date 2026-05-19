import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { formatVnd } from '../../utils/formatCurrency';

interface HoldingRowProps {
  ticker: string;
  assetName: string;
  totalQuantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  onPress?: () => void;
}

export const HoldingRow: React.FC<HoldingRowProps> = ({
  ticker,
  assetName,
  totalQuantity,
  avgPrice,
  currentPrice,
  unrealizedPnL,
  unrealizedPnLPercent,
  onPress,
}) => {
  const { colors } = useTheme();
  const isGain = unrealizedPnL >= 0;

  return (
    <TouchableOpacity
      style={[styles.row, { borderColor: colors.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View style={styles.symbolContainer}>
          <Text style={[styles.ticker, { color: colors.text }]}>{ticker}</Text>
          <Text style={[styles.assetName, { color: colors.textSecondary }]}>{assetName}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.qty, { color: colors.textSecondary }]}>
            {totalQuantity.toFixed(2)} shares
          </Text>
          <Text style={[styles.avgPrice, { color: colors.textTertiary }]}>
            Avg: {formatVnd(avgPrice)}
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.currentPrice, { color: colors.text }]}>{formatVnd(currentPrice)}</Text>
        <View style={styles.pnlContainer}>
          <Text
            style={[
              styles.pnlAmount,
              { color: isGain ? colors.gain : colors.loss },
            ]}
          >
            {isGain ? '+' : ''}{formatVnd(unrealizedPnL)}
          </Text>
          <Text
            style={[
              styles.pnlPercent,
              { color: isGain ? colors.gain : colors.loss },
            ]}
          >
            ({isGain ? '+' : ''}{unrealizedPnLPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
    gap: spacing.xs,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  ticker: {
    ...typography.heading.h3,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  assetName: {
    ...typography.body.xsmall,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  qty: {
    ...typography.body.xsmall,
  },
  avgPrice: {
    ...typography.body.xsmall,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  currentPrice: {
    ...typography.mono.regular,
    fontWeight: '600',
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  pnlAmount: {
    ...typography.mono.small,
    fontWeight: '700',
  },
  pnlPercent: {
    ...typography.mono.small,
    fontWeight: '600',
  },
});
