import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  selectedValue,
  onChange,
  size = 'md',
}) => {
  const indicatorAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const index = options.findIndex((opt) => opt.value === selectedValue);
    if (index >= 0) {
      Animated.spring(indicatorAnim, {
        toValue: index,
        useNativeDriver: true,
        tension: 180,
        friction: 12,
      }).start();
    }
  }, [selectedValue, options]);

  const containerWidth = options.length * (size === 'sm' ? 72 : 108);
  const pillWidth = containerWidth / options.length;

  return (
    <View style={[styles.container, { width: containerWidth }]}>
      <Animated.View
        style={[
          styles.pill,
          {
            width: pillWidth,
            transform: [
              {
                translateX: indicatorAnim.interpolate({
                  inputRange: [0, options.length - 1],
                  outputRange: [0, (options.length - 1) * pillWidth],
                }),
              },
            ],
          },
        ]}
      />
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[styles.tab, { height: size === 'sm' ? 32 : 40 }]}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedValue === option.value && styles.tabTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 5,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  pill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    backgroundColor: colors.figma.appBg,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'none',
    fontSize: 14,
    letterSpacing: 0,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
