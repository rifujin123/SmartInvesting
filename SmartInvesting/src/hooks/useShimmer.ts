import { useCallback, useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Animated shimmer bar. Returns opacity Animated.Value to drive layout.
 */
export function useShimmer(active: boolean) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [active, opacity]);

  return opacity;
}
