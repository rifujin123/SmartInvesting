import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import { AppStackParamList } from "../../../shared/navigation/types";

const stats = [
  { label: "Portfolio Value", value: "28,450 VND" },
  { label: "Wallet Balance", value: "5,000 VND" },
  { label: "Member Since", value: "Jan 2024" },
];

type ProfileNavigation = NativeStackNavigationProp<AppStackParamList, "Profile">;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigation>();
  const { accessToken, user, loadUser, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) {
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await loadUser();
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load profile"));
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [accessToken, loadUser]);

  const displayName = useMemo(() => {
    const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
    return fullName || user?.userName || "Your Profile";
  }, [user?.firstName, user?.lastName, user?.userName]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heroCard}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color="#FFFFFF" />
            </View>
          )}
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email || "No email set"}</Text>
        </View>

        {(error || isLoading) && (
          <View style={[styles.banner, error ? styles.errorBanner : styles.successBanner]}>
            <Text style={[styles.bannerText, error ? styles.errorText : styles.successText]}>
              {error ?? "Loading profile..."}
            </Text>
          </View>
        )}

        <View style={styles.sectionCards}>
          <SectionCard
            icon="person-circle"
            title="Personal Information"
            subtitle="Name, username, avatar"
            onPress={() => navigation.navigate("PersonalInformation")}
          />
          <SectionCard
            icon="shield-checkmark"
            title="Security"
            subtitle="Email and password"
            onPress={() => navigation.navigate("Security")}
          />
          <SectionCard
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Service rules and conditions"
            onPress={() => {}}
          />
          <SectionCard
            icon="reader-outline"
            title="Terms of Use"
            subtitle="App usage guidelines"
            onPress={() => {}}
          />
          <SectionCard
            icon="log-out-outline"
            title="Log Out"
            subtitle="Sign out of your account"
            onPress={() => {
              void logout();
            }}
          />
        </View>

        <View style={styles.section}>
          {stats.map((item) => (
            <View key={item.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

interface SectionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.sectionCard} onPress={onPress} activeOpacity={0.75}>
    <View style={styles.sectionIcon}>
      <Ionicons name={icon} size={24} color="#FFFFFF" />
    </View>
    <View style={styles.sectionTextBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
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
  heroCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surfaceCard,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  email: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  banner: {
    marginHorizontal: spacing.xl,
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
  sectionCards: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.base,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  sectionTextBlock: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textPrimary,
  },
});
