import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { MoneyText } from './MoneyText';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  icon?: keyof typeof Ionicons.glyphMap;
  category?: string;
  categoryType?: number;
  note?: string;
  categoryName?: string;
}

export interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

const getCategoryIcon = (icon?: string): keyof typeof Ionicons.glyphMap => {
  if (!icon) return 'receipt';
  return icon as keyof typeof Ionicons.glyphMap;
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
  });
};

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  onPress,
}) => {
  const isPositive = transaction.amount >= 0;

  // Map from TransactionDto if it has categoryType
  const isExpense = (transaction as any).categoryType === 0;
  const type = isExpense ? 'withdraw' : isPositive ? 'deposit' : 'withdraw';

  const getTypeIcon = () => {
    if (transaction.icon) return transaction.icon;
    return 'receipt';
  };

  const getIconBg = () => {
    if (isExpense) return '#FEE2E2';
    if (isPositive) return '#DCFCE7';
    return '#FEF3C7';
  };

  const getIconColor = () => {
    if (isExpense) return '#EF4444';
    if (isPositive) return '#22C55E';
    return '#F59E0B';
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: getIconBg() }]}>
        <Ionicons name={getTypeIcon()} size={20} color={getIconColor()} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.title}>{transaction.title || transaction.categoryName || 'Transaction'}</Text>
        <Text style={styles.subtitle}>{transaction.subtitle || transaction.note || formatDate(transaction.date)}</Text>
      </View>

      <View style={styles.right}>
        <MoneyText
          amount={transaction.amount}
          size="md"
          color={isPositive ? 'success' : 'loss'}
          showSign
        />
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middle: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  date: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
