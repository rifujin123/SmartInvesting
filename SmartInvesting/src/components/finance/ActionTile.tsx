import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';

type ActionType = 'buy' | 'sell' | 'addTx' | 'transfer' | 'budget' | 'goal';

interface ActionTileProps {
  type: ActionType;
  label: string;
  subtitle?: string;
  onPress?: () => void;
}

const TYPE_CONFIG: Record<ActionType, { icon: keyof typeof Ionicons.glyphMap; bgColor: string; iconColor: string }> = {
  buy: { icon: 'trending-up', bgColor: 'rgba(59,224,208,0.14)', iconColor: '#3BE0D0' },
  sell: { icon: 'trending-down', bgColor: 'rgba(251,113,133,0.14)', iconColor: '#FB7185' },
  addTx: { icon: 'add-circle', bgColor: 'rgba(96,165,250,0.14)', iconColor: '#60A5FA' },
  transfer: { icon: 'swap-horizontal', bgColor: 'rgba(251,191,36,0.14)', iconColor: '#FBBF24' },
  budget: { icon: 'pie-chart', bgColor: 'rgba(167,139,250,0.14)', iconColor: '#A78BFA' },
  goal: { icon: 'flag', bgColor: 'rgba(74,222,128,0.14)', iconColor: '#4ADE80' },
};

export const ActionTile: React.FC<ActionTileProps> = ({ type, label, subtitle, onPress }) => {
  const { colors } = useTheme();
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.addTx;

  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: colors.surface2, borderColor: colors.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.icon, { backgroundColor: config.bgColor }]}>
        <Ionicons name={config.icon} size={22} color={config.iconColor} />
      </View>
      <Text style={[typography.heading.h3, { color: colors.text }]}>{label}</Text>
      {subtitle ? (
        <Text style={[typography.body.xsmall, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.base,
    gap: spacing.sm,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
