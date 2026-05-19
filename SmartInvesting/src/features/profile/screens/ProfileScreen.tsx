import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";
import { spacing, typography } from "../../../theme/tokens";
import { useAuth } from "../../../context/AuthContext";
import { ApiError } from "../../../services/api/types";
import type { AppStackParamList } from "../../../shared/navigation/types";

type ProfileNavigation = NativeStackNavigationProp<AppStackParamList, "Profile">;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigation>();
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={36} color={colors.text} />
            </View>
          )}
          <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || "No email set"}</Text>
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
            colors={colors}
          />
          <SectionCard
            icon="shield-checkmark"
            title="Security"
            subtitle="Email and password"
            onPress={() => navigation.navigate("Security")}
            colors={colors}
          />
          <SectionCard
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Service rules and conditions"
            onPress={() => {}}
            colors={colors}
          />
          <SectionCard
            icon="reader-outline"
            title="Terms of Use"
            subtitle="App usage guidelines"
            onPress={() => {}}
            colors={colors}
          />
          <SectionCard
            icon="log-out-outline"
            title="Log Out"
            subtitle="Sign out of your account"
            onPress={() => {
              void logout();
            }}
            colors={colors}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>Jan 2024</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
            <Text style={[styles.infoValue, { color: colors.gain }]}>Active</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>1.0.0</Text>
          </View>
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
  colors: any;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, subtitle, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.sectionIcon, { backgroundColor: colors.primary }]}>
      <Ionicons name={icon} size={24} color={colors.text} />
    </View>
    <View style={styles.sectionTextBlock}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
  </TouchableOpacity>
);

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.getDisplayMessage(fallback) : fallback;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.heading.h1,
  },
  headerSpacer: {
    width: 40,
  },
  heroCard: {
    margin: spacing.xl,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  name: {
    ...typography.heading.h1,
    marginTop: spacing.base,
  },
  email: {
    ...typography.body.regular,
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
    ...typography.body.regular,
  },
  successText: {
    color: "#16A34A",
  },
  errorText: {
    color: "#DC2626",
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
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.base,
  },
  sectionTextBlock: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.heading.h3,
  },
  sectionSubtitle: {
    ...typography.body.small,
    marginTop: spacing.xs,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
  },
  infoLabel: {
    ...typography.body.regular,
  },
  infoValue: {
    ...typography.body.regular,
    fontWeight: "600",
  },
});
