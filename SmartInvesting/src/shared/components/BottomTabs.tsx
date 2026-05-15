import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AppTabParamList } from "../navigation/types";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
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

type TabRouteName = keyof AppTabParamList;

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabItem {
  name: TabRouteName;
  label: string;
  icon: TabIconName;
  activeIcon: TabIconName;
}

const TAB_ITEMS: Record<TabRouteName, TabItem> = {
  Dashboard: {
    name: "Dashboard",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  Finance: {
    name: "Finance",
    label: "Finance",
    icon: "trending-up-outline",
    activeIcon: "trending-up",
  },
  Portfolio: {
    name: "Portfolio",
    label: "Portfolio",
    icon: "briefcase-outline",
    activeIcon: "briefcase",
  },
  Transactions: {
    name: "Transactions",
    label: "Activity",
    icon: "time-outline",
    activeIcon: "time",
  },
};

const ACTIVE_COLOR = "#0836e6";
const INACTIVE_COLOR = "#94A3B8";

interface TabItemComponentProps {
  tab: TabItem;
  isActive: boolean;
  onPress: (name: TabRouteName) => void;
  onLongPress: (name: TabRouteName) => void;
}

const TAB_COUNT = Object.keys(TAB_ITEMS).length;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABBAR_WIDTH = SCREEN_WIDTH - 32;
const TAB_WIDTH = TABBAR_WIDTH / TAB_COUNT;
const GOOEY_WIDTH = 72;
const GOOEY_HEIGHT = 50;

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

const TabItemComponent: React.FC<TabItemComponentProps> = ({
  tab,
  isActive,
  onPress,
  onLongPress,
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

  const handleLongPress = useCallback(() => {
    onLongPress(tab.name);
  }, [onLongPress, tab.name]);

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
      onLongPress={handleLongPress}
    >
      <Animated.View style={[styles.tabContent, containerStyle]}>
        <Animated.View style={iconContainerStyle}>
          <Ionicons
            name={isActive ? tab.activeIcon : tab.icon}
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
      { duration: 220, easing: Easing.out(Easing.cubic) },
      () => {
        stretch.value = withSpring(1, { ...SPRING_CONFIG, damping: 20, stiffness: 135 });
      },
    );
    position.value = withSpring(activeIndex, {
      ...SPRING_CONFIG,
      damping: 18,
      stiffness: 135,
      mass: 0.9,
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

const LiquidGlassPill: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const position = useSharedValue(activeIndex);
  const stretch = useSharedValue(1);

  React.useEffect(() => {
    stretch.value = withTiming(
      1.16,
      { duration: 220, easing: Easing.out(Easing.cubic) },
      () => {
        stretch.value = withSpring(1, { ...SPRING_CONFIG, damping: 20, stiffness: 135 });
      },
    );
    position.value = withSpring(activeIndex, {
      ...SPRING_CONFIG,
      damping: 18,
      stiffness: 135,
      mass: 0.9,
    });
  }, [activeIndex, position, stretch]);

  const pillStyle = useAnimatedStyle(() => {
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

  return (
    <Animated.View style={[styles.liquidPillContainer, pillStyle]} pointerEvents="none">
      <GlassView
        style={styles.liquidPillGlass}
        glassEffectStyle={{
          style: "regular",
          animate: true,
          animationDuration: 0.8,
        }}
        isInteractive={false}
      />
      <View style={styles.liquidPillGlow} />
      <View style={styles.liquidPillTint} />
      <View style={styles.liquidPillBorder} />
    </Animated.View>
  );
};

export const BottomTabs: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabs = state.routes.map((route) => TAB_ITEMS[route.name as TabRouteName]);
  const activeRoute = state.routes[state.index];
  const activeIndex = state.index;
  const rippleOpacity = useSharedValue(0);
  const canUseLiquidGlass = Platform.OS === "ios" && isLiquidGlassAvailable();

  const handleTabPress = useCallback(
    (name: TabRouteName) => {
      const routeIndex = state.routes.findIndex((route) => route.name === name);
      const route = state.routes[routeIndex];

      if (!route) {
        return;
      }

      rippleOpacity.value = withTiming(1, { duration: 50 }, () => {
        rippleOpacity.value = withTiming(0, { duration: 400 });
      });

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (state.index !== routeIndex && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, rippleOpacity, state.index, state.routes],
  );

  const handleTabLongPress = useCallback(
    (name: TabRouteName) => {
      const route = state.routes.find((item) => item.name === name);

      if (!route) {
        return;
      }

      navigation.emit({
        type: "tabLongPress",
        target: route.key,
      });
    },
    [navigation, state.routes],
  );

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
  }));

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      <Animated.View style={[styles.rippleOverlay, rippleStyle]} />
      <View style={styles.glassContainer}>
        {canUseLiquidGlass ? (
          <GlassView
            style={styles.glassBackground}
            glassEffectStyle={{
              style: "regular",
              animate: true,
              animationDuration: 0.95,
            }}
            isInteractive={false}
          />
        ) : (
          <View style={styles.fallbackGlassBackground} />
        )}

        <View style={styles.glassHighlight} />
        <View style={styles.innerBorder} />

        {canUseLiquidGlass ? (
          <LiquidGlassPill activeIndex={activeIndex >= 0 ? activeIndex : 0} />
        ) : (
          <GooeyIndicator activeIndex={activeIndex >= 0 ? activeIndex : 0} />
        )}

        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TabItemComponent
              key={tab.name}
              tab={tab}
              isActive={activeRoute?.name === tab.name}
              onPress={handleTabPress}
              onLongPress={handleTabLongPress}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  rippleOverlay: {
    position: "absolute",
    top: -100,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    borderRadius: 35,
  },
  glassContainer: {
    width: TABBAR_WIDTH,
    height: 72,
    borderRadius: 35,
    overflow: "hidden",
    position: "relative",
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
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
  },
  fallbackGlassBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.68)",
  },
  glassHighlight: {
    position: "absolute",
    top: 0,
    left: 8,
    right: 8,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
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
    borderColor: "rgba(255, 255, 255, 0.56)",
  },
  gooeyIndicator: {
    position: "absolute",
    top: 11,
    width: GOOEY_WIDTH,
    height: GOOEY_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderRadius: GOOEY_HEIGHT / 2,
  },
  liquidPillContainer: {
    position: "absolute",
    top: 11,
    width: GOOEY_WIDTH,
    height: GOOEY_HEIGHT,
    borderRadius: GOOEY_HEIGHT / 2,
    overflow: "hidden",
    zIndex: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#FFFFFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  liquidPillGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GOOEY_HEIGHT / 2,
  },
  liquidPillGlow: {
    position: "absolute",
    top: 1,
    left: 6,
    right: 6,
    height: GOOEY_HEIGHT * 0.42,
    borderRadius: GOOEY_HEIGHT / 2,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
  },
  liquidPillTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GOOEY_HEIGHT / 2,
    backgroundColor: "rgba(255, 255, 255, 0.30)",
  },
  liquidPillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: GOOEY_HEIGHT / 2,
    borderWidth: 0.75,
    borderColor: "rgba(255, 255, 255, 0.48)",
  },
  tabsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    zIndex: 1,
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
    zIndex: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});

export default BottomTabs;
