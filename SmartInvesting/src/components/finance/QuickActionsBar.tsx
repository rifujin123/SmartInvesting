import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionsBarProps {
  onDiscover?: () => void;
  onBuy?: () => void;
  onHistory?: () => void;
}

type IconName = keyof typeof Ionicons.glyphMap;

interface QuickActionProps {
  label: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  onPress?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({
  label,
  icon,
  iconBg,
  iconColor,
  onPress,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 7,
      tension: 140,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 140,
    }).start();
  };

  return (
    <Animated.View style={[styles.actionWrap, { transform: [{ scale }] }]}>
      <Pressable
        style={styles.action}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
      >
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onDiscover,
  onBuy,
  onHistory,
}) => {
  return (
    <View style={styles.container}>
      <QuickAction
        label="Discover"
        icon="search-outline"
        iconBg="#e2f6d5"
        iconColor="#054d28"
        onPress={onDiscover}
      />
      <QuickAction
        label="Buy"
        icon="add-outline"
        iconBg="#e2f6d5"
        iconColor="#163300"
        onPress={onBuy}
      />
      <QuickAction
        label="History"
        icon="time-outline"
        iconBg="#f5f6f3"
        iconColor="#454745"
        onPress={onHistory}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  actionWrap: {
    flex: 1,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 30,
    backgroundColor: '#f5f6f3',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0e0f0c',
  },
});
