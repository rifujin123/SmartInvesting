import React, { useEffect, useRef } from 'react';
import { StyleSheet, ViewStyle, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ShimmerBarProps {
  width: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const ShimmerBar: React.FC<ShimmerBarProps> = ({
  width,
  height = 16,
  borderRadius = 8,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.65,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  const animatedWidth = typeof width === 'string' ? width : width;

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width: animatedWidth,
          height,
          borderRadius,
          backgroundColor: colors.shimmer,
          opacity,
        } as any,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bar: {},
});
