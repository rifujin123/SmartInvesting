import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { AppTabParamList } from "../navigation/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

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
  Discovery: {
    name: "Discovery",
    label: "Discover",
    icon: "search-outline",
    activeIcon: "search",
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

const ACTIVE_COLOR = "#163300";
const INACTIVE_COLOR = "#868685";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TABBAR_WIDTH = SCREEN_WIDTH - 32;
const TAB_WIDTH = TABBAR_WIDTH / Object.keys(TAB_ITEMS).length;

const jsTriggerHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

interface TabItemComponentProps {
  tab: TabItem;
  isActive: boolean;
  onPress: (name: TabRouteName) => void;
  onLongPress: (name: TabRouteName) => void;
}

const TabItemComponent: React.FC<TabItemComponentProps> = ({
  tab,
  isActive,
  onPress,
  onLongPress,
}) => {
  const handlePress = useCallback(() => {
    jsTriggerHaptic();
    onPress(tab.name);
  }, [onPress, tab.name]);

  return (
    <Pressable
      style={styles.tabItem}
      onPress={handlePress}
      onLongPress={() => onLongPress(tab.name)}
    >
      <View style={styles.tabContent}>
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={24}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isActive ? ACTIVE_COLOR : INACTIVE_COLOR },
          ]}
        >
          {tab.label}
        </Text>
      </View>
    </Pressable>
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

  const handleTabPress = useCallback(
    (name: TabRouteName) => {
      const routeIndex = state.routes.findIndex((route) => route.name === name);
      const route = state.routes[routeIndex];

      if (!route) {
        return;
      }

      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (state.index !== routeIndex && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    },
    [navigation, state.index, state.routes],
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

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
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
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "rgba(14,15,12,0.12)",
  },
  tabsContainer: {
    width: TABBAR_WIDTH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: 0.2,
  },
});
