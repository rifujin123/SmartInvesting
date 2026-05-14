import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export interface MoneyTextProps {
  amount: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'success' | 'loss' | 'muted' | string;
  showSign?: boolean;
  style?: any;
}

export const MoneyText: React.FC<MoneyTextProps> = ({
  amount,
  currency = 'VND',
  size = 'md',
  color = 'primary',
  showSign = false,
  style,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(val));
  };

  const getColor = () => {
    if (color === 'success') return colors.success;
    if (color === 'loss') return colors.loss;
    if (color === 'muted') return colors.textSecondary;
    if (color === 'primary') return colors.textPrimary;
    return color;
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'md': return 16;
      case 'lg': return 20;
      case 'xl': return 28;
      default: return 16;
    }
  };

  return (
    <Text
      style={[
        styles.money,
        {
          color: getColor(),
          fontSize: getFontSize(),
          fontFamily: 'Courier', // Monospace for tabular numbers
        },
        style,
      ]}
      suppressHighlighting
    >
      {showSign && amount !== 0 ? (amount > 0 ? '+' : '−') : ''}
      {formatCurrency(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  money: {
    fontWeight: '600',
    letterSpacing: -0.5,
  },
});
