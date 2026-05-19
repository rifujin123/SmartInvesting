import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { formatVnd } from '../../utils/formatCurrency';

export interface WalletPillProps {
  wallet: {
    id: string;
    name: string;
    balance: number;
    currency: string;
    isPaper: boolean;
  };
  isActive?: boolean;
  onPress?: () => void;
}

export const WalletPill: React.FC<WalletPillProps> = ({
  wallet,
  isActive = false,
  onPress,
}) => {
  const { colors } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.pill,
          isActive && [styles.pillActive, { backgroundColor: colors.accentSubtle, borderColor: colors.accent }],
          { backgroundColor: colors.surface2, borderColor: colors.cardBorder },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <View style={styles.pillContent}>
          <View style={styles.pillLeft}>
            <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
              <Ionicons
                name={wallet.isPaper ? 'cloud-outline' : 'wallet-outline'}
                size={16}
                color={isActive ? colors.accent : colors.textSecondary}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.walletName, isActive && [styles.walletNameActive, { color: colors.text }]]}>
                {wallet.name}
              </Text>
              <Text style={[styles.walletType, { color: colors.textTertiary }]}>
                {wallet.isPaper ? 'Paper' : 'Real'}
              </Text>
            </View>
          </View>
          <View style={styles.pillRight}>
            <Text style={[styles.balance, isActive && [styles.balanceActive, { color: colors.accent }], { color: colors.textSecondary }]}>
              {formatVnd(wallet.balance)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  pillActive: {},
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(59,224,208,0.18)',
  },
  textContainer: {
    gap: 2,
  },
  walletName: {
    ...typography.label.medium,
    fontWeight: '600',
  },
  walletNameActive: {},
  walletType: {
    ...typography.label.small,
    fontSize: 10,
  },
  pillRight: {
    alignItems: 'flex-end',
  },
  balance: {
    ...typography.mono.small,
    fontWeight: '600',
  },
  balanceActive: {},
});
