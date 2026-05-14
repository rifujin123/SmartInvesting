import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import { typography } from "../../theme/typography";
import { useAuth } from "../../context/AuthContext";
import type { AppStackParamList } from "../navigation";

type AppHeaderNavigationProp = NativeStackNavigationProp<AppStackParamList>;

export const AppHeader: React.FC = () => {
  const navigation = useNavigation<AppHeaderNavigationProp>();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isProfileMenuMounted, setIsProfileMenuMounted] = useState(false);
  const profileMenuOpacity = useRef(new Animated.Value(0)).current;
  const profileMenuTranslateY = useRef(new Animated.Value(-8)).current;
  const profileMenuScale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (showProfileMenu) {
      setIsProfileMenuMounted(true);
      profileMenuOpacity.setValue(0);
      profileMenuTranslateY.setValue(-8);
      profileMenuScale.setValue(0.96);

      Animated.parallel([
        Animated.timing(profileMenuOpacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(profileMenuTranslateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(profileMenuScale, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isProfileMenuMounted) {
      Animated.parallel([
        Animated.timing(profileMenuOpacity, {
          toValue: 0,
          duration: 140,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(profileMenuTranslateY, {
          toValue: -6,
          duration: 140,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(profileMenuScale, {
          toValue: 0.98,
          duration: 140,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsProfileMenuMounted(false);
        }
      });
    }
  }, [isProfileMenuMounted, profileMenuOpacity, profileMenuScale, profileMenuTranslateY, showProfileMenu]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = (() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return fullName || user?.userName || "Your Profile";
  })();

  const avatarUrl = user?.avatarUrl;

  const handleOpenProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleCloseProfileMenu = (callback?: () => void) => {
    setShowProfileMenu(false);
    callback?.();
  };

  return (
    <View style={styles.headerContainer}>
      {isProfileMenuMounted && (
        <TouchableOpacity style={styles.profileMenuBackdrop} activeOpacity={1} onPress={() => handleCloseProfileMenu()} />
      )}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{displayName}</Text>
        </View>
        <View style={styles.profileMenuWrapper}>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={handleOpenProfileMenu}
            accessibilityRole="button"
            accessibilityLabel="Open profile menu"
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
            ) : (
              <Ionicons name="person" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
          {isProfileMenuMounted && (
            <Animated.View
              style={[
                styles.profileDropdown,
                {
                  opacity: profileMenuOpacity,
                  transform: [{ translateY: profileMenuTranslateY }, { scale: profileMenuScale }],
                },
              ]}
            >
              <TouchableOpacity style={styles.profileDropdownItem} onPress={() => handleCloseProfileMenu(() => navigation.getParent()?.navigate("Profile"))} activeOpacity={0.7}>
                <View style={styles.profileDropdownLeft}>
                  <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.profileDropdownText}>Profile</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.profileDropdownItem} onPress={() => handleCloseProfileMenu(() => navigation.getParent()?.navigate("Settings"))} activeOpacity={0.7}>
                <View style={styles.profileDropdownLeft}>
                  <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.profileDropdownText}>Settings</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileDropdownItem, styles.profileDropdownItemLast]}
                onPress={() => handleCloseProfileMenu(() => {
                  void logout();
                })}
                activeOpacity={0.7}
              >
                <View style={styles.profileDropdownLeft}>
                  <Ionicons name="log-out-outline" size={18} color={colors.loss} />
                  <Text style={[styles.profileDropdownText, styles.logoutText]}>Logout</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
    zIndex: 12,
  },
  headerLeft: {},
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 22,
  },
  profileMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 11,
  },
  profileMenuWrapper: {
    position: "relative",
    zIndex: 13,
  },
  profileDropdown: {
    position: "absolute",
    right: 0,
    top: 54,
    minWidth: 180,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
    zIndex: 14,
  },
  profileDropdownItem: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileDropdownItemLast: {
    borderBottomWidth: 0,
  },
  profileDropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  profileDropdownText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  logoutText: {
    color: colors.loss,
  },
});
