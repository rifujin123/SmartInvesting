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

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { refreshBiometricAvailability, refreshToken } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric Login");
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [isBiometricUpdating, setIsBiometricUpdating] = useState(false);

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

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Get market alerts and account updates</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: colors.border, true: colors.figma.primary }} />
          </View>
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingTitle}>Biometric Login</Text>
              <Text style={styles.settingSubtitle}>Use {biometricLabel} to sign in</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => {
                void handleBiometricToggle(value);
              }}
              disabled={isBiometricUpdating || !biometricAvailable}
              trackColor={{ false: colors.border, true: colors.figma.primary }}
            />
          </View>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
            <Text style={styles.linkText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  section: {
    margin: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.base,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  settingSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  linkText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});
