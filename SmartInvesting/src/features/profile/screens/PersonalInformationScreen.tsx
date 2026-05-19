import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import { profileService } from "../../../services/profile/profileService";

export const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.avatarBlock}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={36} color="#FFFFFF" />
              </View>
            )}
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
            <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.primary }]} onPress={handlePickAvatar} activeOpacity={0.8}>
              <Ionicons name="image" size={18} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Change Avatar</Text>
            </TouchableOpacity>
          </View>

          {(message || error) && (
            <View style={[styles.banner, error ? styles.errorBanner : styles.successBanner, { borderColor: error ? colors.loss : colors.gain }]}>
              <Text style={[styles.bannerText, { color: error ? colors.loss : colors.gain }]}>
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
  headerTitle: { ...typography.sectionHeader },
  headerSpacer: { width: 40 },
  formSection: {
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  avatarBlock: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  name: { ...typography.title, marginTop: spacing.base },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: { ...typography.button },
  banner: {
    marginBottom: spacing.base,
    padding: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
  },
  successBanner: { backgroundColor: "rgba(74,222,128,0.12)" },
  errorBanner: { backgroundColor: "rgba(251,113,133,0.12)" },
  bannerText: { ...typography.body.regular },
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
