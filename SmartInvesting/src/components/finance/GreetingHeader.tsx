import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/tokens';

interface GreetingHeaderProps {
  userName: string;
  onSettingsPress?: () => void;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  onSettingsPress,
}) => {
  const { colors } = useTheme();

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>
          Good {getTimeOfDay()},
        </Text>
        <Text style={[styles.name, { color: '#000000' }]}>{userName}</Text>
      </View>
      <TouchableOpacity
        style={[styles.settingsBtn, { backgroundColor: colors.surface }]}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Ionicons name="person-circle-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
