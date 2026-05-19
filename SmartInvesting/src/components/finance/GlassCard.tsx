import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { shadows } from '../../theme/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, noPadding = false }) => {
  const { colors, scheme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...(scheme === 'dark' ? shadows.card : shadows.cardLight),
        },
        !noPadding && styles.cardPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardPadding: {
    padding: 16,
  },
});
