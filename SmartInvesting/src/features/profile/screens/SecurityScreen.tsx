import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import { profileService } from "../../../services/profile/profileService";

export const SecurityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
          <View style={styles.headerSpacer} />
        </View>

        {(message || error) && (
          <View style={[styles.banner, error ? styles.errorBanner : styles.successBanner, { borderColor: error ? colors.loss : colors.gain }]}>
            <Text style={[styles.bannerText, { color: error ? colors.loss : colors.gain }]}>
              {error ?? message}
            </Text>
          </View>
        )}

        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Email</Text>
          <ProfileInput label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" autoCapitalize="none" keyboardType="email-address" />
          <PrimaryButton label={isSavingEmail ? "Saving..." : "Save Email"} disabled={isSavingEmail} onPress={handleSaveEmail} />
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Password</Text>
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

const ProfileInput: React.FC<ProfileInputProps> = ({ label, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput style={[styles.input, { borderColor: colors.cardBorder, color: colors.text, backgroundColor: colors.surface }]} placeholderTextColor={colors.textTertiary} {...props} />
    </View>
  );
};

interface PrimaryButtonProps {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, disabled, onPress }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }, disabled && styles.disabledButton]} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.getDisplayMessage(fallback) : fallback;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...typography.title },
  headerSpacer: { width: 40 },
  banner: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.base,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
  },
  successBanner: { backgroundColor: "rgba(74,222,128,0.12)" },
  errorBanner: { backgroundColor: "rgba(251,113,133,0.12)" },
  bannerText: { ...typography.body.regular },
  formSection: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: { ...typography.sectionHeader, marginBottom: spacing.base },
  inputGroup: { marginBottom: spacing.base },
  inputLabel: { ...typography.caption, marginBottom: spacing.xs },
  input: {
    ...typography.body.regular,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: spacing.base,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.6 },
  primaryButtonText: { ...typography.button, color: "#FFFFFF" },
});
