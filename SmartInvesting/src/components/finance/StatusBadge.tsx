import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface StatusBadgeProps {
  variant: 'success' | 'gain' | 'loss' | 'warning' | 'info' | 'neutral';
  label: string;
  filled?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ variant, label, filled = false, style }) => {
  const { colors } = useTheme();

  const badgeConfigs = {
    success: { bg: filled ? colors.gainBg : 'transparent', text: colors.gain, border: colors.gain },
    gain: { bg: filled ? colors.gainBg : 'transparent', text: colors.gain, border: colors.gain },
    loss: { bg: filled ? colors.lossBg : 'transparent', text: colors.loss, border: colors.loss },
    warning: { bg: filled ? colors.warningBg : 'transparent', text: colors.warning, border: colors.warning },
    info: { bg: filled ? colors.infoBg : 'transparent', text: colors.info, border: colors.info },
    neutral: { bg: 'transparent', text: colors.textSecondary, border: colors.cardBorder },
  };

  const badgeConfig = badgeConfigs[variant] || badgeConfigs.neutral;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeConfig.bg,
          borderColor: filled ? 'transparent' : badgeConfig.border,
          borderWidth: filled ? 0 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: badgeConfig.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
