import React, { useCallback, useEffect, useState } from "react";
import { Alert, View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../context/AuthContext";
import { biometricService } from "../../../services/auth/biometricService";
import { tokenStorage } from "../../../services/auth/tokenStorage";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

type IconName = keyof typeof Ionicons.glyphMap;

interface SettingsRowProps {
  icon: IconName;
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  value?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  isLast?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  iconBg,
  iconColor,
  label,
  subtitle,
  value,
  rightElement,
  onPress,
  isLast,
}) => (
  <TouchableOpacity
    style={[styles.settingRow, isLast && styles.settingRowLast]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.settingRowLeft}>
      <View style={[styles.iconTile, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.settingRowText}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {rightElement || (value && <Text style={styles.settingValue}>{value}</Text>)}
  </TouchableOpacity>
);

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { refreshBiometricAvailability, refreshToken, user } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric Login");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricUpdating, setIsBiometricUpdating] = useState(false);

  const displayName = (() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return fullName || user?.userName || "Minh";
  })();

  const email = user?.email || "minh@example.com";
  const accountId = user?.id || "SMRT-2026-8149";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  const loadBiometricSetting = useCallback(async () => {
    try {
      const [enabled, capabilities] = await Promise.all([
        biometricService.getBiometricEnabled(),
        biometricService.getBiometricCapabilities(),
      ]);

      setBiometricEnabled(enabled && capabilities.isAvailable);
      setBiometricAvailable(capabilities.isAvailable);
      setBiometricLabel(capabilities.label);

      if (enabled && !capabilities.isAvailable) {
        await biometricService.setBiometricEnabled(false);
        await refreshBiometricAvailability();
      }
    } catch {
      setBiometricEnabled(false);
      setBiometricAvailable(false);
      setBiometricLabel("Biometric Login");
    }
  }, [refreshBiometricAvailability]);

  useEffect(() => {
    void loadBiometricSetting();
  }, [loadBiometricSetting]);

  const handleBiometricToggle = useCallback(async (enabled: boolean) => {
    setIsBiometricUpdating(true);

    try {
      const capabilities = await biometricService.getBiometricCapabilities();
      setBiometricAvailable(capabilities.isAvailable);
      setBiometricLabel(capabilities.label);

      if (enabled) {
        if (!capabilities.isAvailable) {
          setBiometricEnabled(false);
          await biometricService.setBiometricEnabled(false);
          Alert.alert("Biometric Login Unavailable", "Set up Face ID or fingerprint on this device first.");
          return;
        }

        if (!refreshToken) {
          setBiometricEnabled(false);
          await biometricService.setBiometricEnabled(false);
          await tokenStorage.clearBiometricRefreshToken();
          Alert.alert("Biometric Login", "Sign in again before enabling Biometric Login.");
          return;
        }

        const authenticated = await biometricService.authenticate(capabilities.label);

        if (!authenticated) {
          setBiometricEnabled(false);
          return;
        }

        await tokenStorage.saveBiometricRefreshToken(refreshToken);
      } else {
        await tokenStorage.clearBiometricRefreshToken();
      }

      await biometricService.setBiometricEnabled(enabled);
      setBiometricEnabled(enabled);
      await refreshBiometricAvailability();
    } catch {
      setBiometricEnabled(false);
      Alert.alert("Biometric Login", "Unable to update biometric login setting. Please try again.");
    } finally {
      setIsBiometricUpdating(false);
    }
  }, [refreshBiometricAvailability, refreshToken]);

  const handleCopyAccountId = () => {
    Alert.alert("Account ID", accountId);
  };

  const handleNavigateSecurity = () => {
    try {
      (navigation as any).navigate("Security");
    } catch {
      // Security route not available
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>ACCOUNT</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              icon="card-outline"
              iconBg="#E2F6D5"
              iconColor="#163300"
              label="Account ID"
              subtitle={accountId}
              rightElement={
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyAccountId} activeOpacity={0.7}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              }
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              iconBg="rgba(56, 200, 255, 0.12)"
              iconColor="#0077B6"
              label="Security"
              onPress={handleNavigateSecurity}
              rightElement={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
            />
            <SettingsRow
              icon="notifications-outline"
              iconBg="#FDE8E8"
              iconColor="#D03238"
              label="Notifications"
              rightElement={
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: colors.border, true: "#9FE870" }}
                  thumbColor="#FFFFFF"
                />
              }
              isLast
            />
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>PREFERENCES</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              icon="cash-outline"
              iconBg={colors.surface}
              iconColor={colors.textSecondary}
              label="Currency"
              value="USD"
            />
            <SettingsRow
              icon="finger-print-outline"
              iconBg={colors.surface}
              iconColor={colors.textSecondary}
              label={biometricLabel}
              rightElement={
                <Switch
                  value={biometricEnabled}
                  onValueChange={(value) => {
                    void handleBiometricToggle(value);
                  }}
                  disabled={isBiometricUpdating || !biometricAvailable}
                  trackColor={{ false: colors.border, true: "#9FE870" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingsRow
              icon="language-outline"
              iconBg={colors.surface}
              iconColor={colors.textSecondary}
              label="Language"
              value="English"
              isLast
            />
          </View>
        </View>

        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>SUPPORT</Text>
          <View style={styles.settingsList}>
            <SettingsRow
              icon="help-circle-outline"
              iconBg={colors.surface}
              iconColor={colors.textSecondary}
              label="Help Center"
              rightElement={<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />}
            />
            <SettingsRow
              icon="information-circle-outline"
              iconBg={colors.surface}
              iconColor={colors.textSecondary}
              label="About SmartInvest"
              value="v1.0.0"
              isLast
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SmartInvest v1.0.0 · Build 2026.05.17</Text>
          <Text style={styles.footerText}>Not a bank. Investment-only platform.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceCard,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  profileCard: {
    padding: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.surfaceCard,
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    borderRadius: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9FE870",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.base,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#163300",
  },
  profileName: {
    ...typography.heading.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    ...typography.body.regular,
    color: colors.textSecondary,
  },
  settingsGroup: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.xl,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    marginBottom: spacing.base,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  settingsList: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.base,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    flex: 1,
  },
  iconTile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  settingRowText: {
    flex: 1,
  },
  settingLabel: {
    ...typography.body.regular,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  settingSubtitle: {
    ...typography.body.xsmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingValue: {
    ...typography.body.regular,
    color: colors.textSecondary,
  },
  copyButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  copyButtonText: {
    ...typography.body.xsmall,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  footer: {
    alignItems: "center",
    padding: spacing.xl,
    marginHorizontal: spacing.base,
  },
  footerText: {
    ...typography.body.xsmall,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
