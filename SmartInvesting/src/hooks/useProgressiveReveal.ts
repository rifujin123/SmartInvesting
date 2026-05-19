import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

export interface ProgressiveStage {
  key: string;
  delay: number;
}

/**
 * Reveal screen sections one by one after data loads.
 */
export function useProgressiveReveal(stages: ProgressiveStage[], enabled = true) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const animations = useRef<Record<string, Animated.Value>>({});

  stages.forEach((stage) => {
    if (!animations.current[stage.key]) {
      animations.current[stage.key] = new Animated.Value(0);
    }
  });

  useEffect(() => {
    if (!enabled) {
      setVisible({});
      Object.values(animations.current).forEach((value) => value.setValue(0));
      return;
    }

    const timers = stages.map((stage) =>
      setTimeout(() => {
        setVisible((prev) => ({ ...prev, [stage.key]: true }));
        Animated.timing(animations.current[stage.key], {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }).start();
      }, stage.delay),
    );

    return () => timers.forEach(clearTimeout);
  }, [enabled, stages]);

  const getAnimatedStyle = (key: string) => {
    const value = animations.current[key] ?? new Animated.Value(1);
    return {
      opacity: value,
      transform: [
        {
          translateY: value.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 0],
          }),
        },
      ],
    };
  };

  return { visible, getAnimatedStyle };
}
