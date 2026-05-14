import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import { profileService } from "../../../services/profile/profileService";

export const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { accessToken, user, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email ?? "");
  }, [user?.email]);

  const handleSaveEmail = async () => {
    if (!accessToken) {
      setError("You must be logged in to update your email.");
      return;
    }

    setIsSavingEmail(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await profileService.changeEmail(accessToken, { newEmail: email.trim() });
      setUser(updated);
      setMessage("Email updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update email"));
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    if (!accessToken) {
      setError("You must be logged in to change your password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);
    setError(null);

    try {
      await profileService.changePassword(accessToken, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to change password"));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security</Text>
          <View style={styles.headerSpacer} />
        </View>

        {(message || error) && (
          <View style={[styles.banner, error ? styles.errorBanner : styles.successBanner]}>
            <Text style={[styles.bannerText, error ? styles.errorText : styles.successText]}>
              {error ?? message}
            </Text>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Email</Text>
          <ProfileInput label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" />
          <PrimaryButton label={isSavingEmail ? "Saving..." : "Save Email"} disabled={isSavingEmail} onPress={handleSaveEmail} />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Password</Text>
          <ProfileInput label="Current password" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry />
          <ProfileInput label="New password" value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry />
          <ProfileInput label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm password" secureTextEntry />
          <PrimaryButton label={isChangingPassword ? "Changing..." : "Change Password"} disabled={isChangingPassword} onPress={handleChangePassword} />
        </View>
      </ScrollView>
    </View>
  );
};

interface ProfileInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address";
  secureTextEntry?: boolean;
}

const ProfileInput: React.FC<ProfileInputProps> = ({ label, ...props }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
  </View>
);

interface PrimaryButtonProps {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, disabled, onPress }) => (
  <TouchableOpacity style={[styles.primaryButton, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
    <Text style={styles.primaryButtonText}>{label}</Text>
  </TouchableOpacity>
);

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.getDisplayMessage(fallback) : fallback;
}

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
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.base,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
  },
  successBanner: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  errorBanner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  bannerText: {
    ...typography.body,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.loss,
  },
  formSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  inputGroup: {
    marginBottom: spacing.base,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  primaryButton: {
    backgroundColor: colors.figma.primary,
    borderRadius: 12,
    paddingVertical: spacing.base,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    ...typography.button,
    color: "#FFFFFF",
  },
});
