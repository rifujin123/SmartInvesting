import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export type TabName = "dashboard" | "finance" | "portfolio" | "transactions";

interface TabItem {
  name: TabName;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: TabItem[] = [
  {
    name: "dashboard",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    name: "finance",
    label: "Finance",
    icon: "trending-up-outline",
    activeIcon: "trending-up",
  },
  {
    name: "portfolio",
    label: "Portfolio",
    icon: "briefcase-outline",
    activeIcon: "briefcase",
  },
  {
    name: "transactions",
    label: "Activity",
    icon: "time-outline",
    activeIcon: "time",
  },
];

const ACTIVE_COLOR = "#0836e6";
const INACTIVE_COLOR = "#94A3B8";

interface BottomTabsProps {
  activeTab: TabName;
  onTabPress: (tab: TabName) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABBAR_WIDTH = SCREEN_WIDTH - 32;
const TAB_WIDTH = TABBAR_WIDTH / TABS.length;
const GOOEY_WIDTH = 64;
const GOOEY_HEIGHT = 44;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.8,
};

const BOUNCE_CONFIG = {
  damping: 12,
  stiffness: 200,
  mass: 0.5,
};

const jsTriggerHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const triggerHaptic = () => {
  "worklet";
  scheduleOnRN(jsTriggerHaptic);
};

interface TabItemComponentProps {
  tab: TabItem;
  index: number;
  isActive: boolean;
  onPress: (name: TabName) => void;
}

const TabItemComponent: React.FC<TabItemComponentProps> = ({
  tab,
  index,
  isActive,
  onPress,
}) => {
  const pressScale = useSharedValue(1);
  const iconBounce = useSharedValue(0);
  const hapticFired = useSharedValue(false);

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.9, SPRING_CONFIG);
    hapticFired.value = false;
  }, [pressScale, hapticFired]);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1.1, BOUNCE_CONFIG, (finished) => {
      if (finished && !hapticFired.value) {
        hapticFired.value = true;
        triggerHaptic();
      }
    });
    pressScale.value = withSpring(1, SPRING_CONFIG);
  }, [pressScale, hapticFired]);

  const handlePress = useCallback(() => {
    onPress(tab.name);
  }, [onPress, tab.name]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const iconContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(iconBounce.value, [0, 0.5, 1], [0, -4, 0]);
    return { transform: [{ translateY }] };
  });

  return (
    <Pressable
      style={styles.tabItem}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View style={[styles.tabContent, containerStyle]}>
        <Animated.View style={iconContainerStyle}>
          <Ionicons
            name={(isActive ? tab.activeIcon : tab.icon) as any}
            size={26}
            color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

interface GooeyIndicatorProps {
  activeIndex: number;
}

const GooeyIndicator: React.FC<GooeyIndicatorProps> = ({ activeIndex }) => {
  const position = useSharedValue(activeIndex);
  const stretch = useSharedValue(1);

  React.useEffect(() => {
    stretch.value = withTiming(
      1.2,
      { duration: 120, easing: Easing.out(Easing.cubic) },
      () => {
        stretch.value = withSpring(1, { ...SPRING_CONFIG, damping: 18 });
      },
    );
    position.value = withSpring(activeIndex, {
      ...SPRING_CONFIG,
      stiffness: 180,
    });
  }, [activeIndex, position, stretch]);

  const indicatorStyle = useAnimatedStyle(() => {
    const left = position.value * TAB_WIDTH;
    const translateX = left + (TAB_WIDTH - GOOEY_WIDTH) / 2;
    return {
      transform: [
        { translateX },
        { scaleX: stretch.value },
        { scaleY: 1 / Math.sqrt(stretch.value) },
      ],
    };
  });

  return <Animated.View style={[styles.gooeyIndicator, indicatorStyle]} />;
};

export const BottomTabs: React.FC<BottomTabsProps> = ({
  activeTab,
  onTabPress,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const activeIndex = TABS.findIndex((t) => t.name === activeTab);
  const rippleOpacity = useSharedValue(0);

  const handleTabPress = useCallback(
    (name: TabName) => {
      rippleOpacity.value = withTiming(1, { duration: 50 }, () => {
        rippleOpacity.value = withTiming(0, { duration: 400 });
      });
      onTabPress(name);
    },
    [onTabPress, rippleOpacity],
  );

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
  }));

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <Animated.View style={[styles.rippleOverlay, rippleStyle]} />
      <View style={styles.glassContainer}>
        <View style={styles.glassHighlight} />
        <View style={styles.innerBorder} />

        <GooeyIndicator activeIndex={activeIndex >= 0 ? activeIndex : 0} />

        <View style={styles.tabsContainer}>
          {TABS.map((tab, index) => (
            <TabItemComponent
              key={tab.name}
              tab={tab}
              index={index}
              isActive={activeTab === tab.name}
              onPress={handleTabPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  rippleOverlay: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(8, 54, 230, 0.06)",
    borderRadius: 35,
  },
  glassContainer: {
    width: TABBAR_WIDTH,
    height: 72,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.28,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 8,
    right: 8,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  innerBorder: {
    position: "absolute",
    top: 0.5,
    left: 0.5,
    right: 0.5,
    bottom: 0.5,
    borderRadius: 34.5,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.9)",
  },
  gooeyIndicator: {
    position: "absolute",
    top: 14,
    width: GOOEY_WIDTH,
    height: GOOEY_HEIGHT,
    backgroundColor: "rgba(8, 54, 230, 0.12)",
    borderRadius: GOOEY_HEIGHT / 2,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 72,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

export default BottomTabs;
