import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import { profileService } from "../../../services/profile/profileService";

export const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { accessToken, user, setUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setUserName(user.userName ?? "");
    }
  }, [user]);

  const avatarUri = selectedAvatarUri ?? user?.avatarUrl ?? "";

  const displayName = useMemo(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || userName || "Your Profile";
  }, [firstName, lastName, userName]);

  const handlePickAvatar = async () => {
    setMessage(null);
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library permission is required to choose an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled) {
      setSelectedAvatarUri(result.assets[0]?.uri ?? null);
    }
  };

  const handleSave = async () => {
    if (!accessToken) {
      setError("You must be logged in to update your profile.");
      return;
    }

    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const updated = await profileService.updateProfile(accessToken, {
        firstName: firstName.trim() || null,
        lastName: lastName.trim() || null,
        userName: userName.trim(),
        avatarUrl: user?.avatarUrl ?? null,
      });
      const latestProfile = selectedAvatarUri
        ? await profileService.uploadAvatar(accessToken, selectedAvatarUri)
        : updated;
      setUser(latestProfile);
      setSelectedAvatarUri(null);
      setMessage(selectedAvatarUri ? "Profile and avatar updated." : "Profile updated.");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.formSection}>
          <View style={styles.avatarBlock}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={36} color="#FFFFFF" />
              </View>
            )}
            <Text style={styles.name}>{displayName}</Text>
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePickAvatar} activeOpacity={0.8}>
              <Ionicons name="image" size={18} color={colors.figma.primary} />
              <Text style={styles.secondaryButtonText}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {(message || error) && (
            <View style={[styles.banner, error ? styles.errorBanner : styles.successBanner]}>
              <Text style={[styles.bannerText, error ? styles.errorText : styles.successText]}>
                {error ?? message}
              </Text>
            </View>
          )}

          <ProfileInput label="First name" value={firstName} onChangeText={setFirstName} placeholder="First name" />
          <ProfileInput label="Last name" value={lastName} onChangeText={setLastName} placeholder="Last name" />
          <ProfileInput label="Username" value={userName} onChangeText={setUserName} placeholder="Username" autoCapitalize="none" />
          <PrimaryButton label={isSaving ? "Saving..." : "Save Changes"} disabled={isSaving} onPress={handleSave} />
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
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  formSection: {
    margin: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.figma.primary,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.figma.primary,
  },
  banner: {
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
