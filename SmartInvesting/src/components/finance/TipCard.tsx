import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

type IconName = keyof typeof Ionicons.glyphMap;

interface TipCardProps {
  title?: string;
  content?: string;
  icon?: IconName;
}

export const TipCard: React.FC<TipCardProps> = ({
  title = 'SmartInvest Tip',
  content = 'ETFs are great for beginners because they give you a slice of hundreds of companies in one buy. Consider starting with a broad index fund like VTI or VOO.',
  icon = 'bulb-outline' as IconName,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={18} color="#163300" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{content}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f6f3',
    borderRadius: 30,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9fe870',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0e0f0c',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: '#454745',
  },
});
