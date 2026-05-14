import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

interface ForgotPasswordScreenProps {
  onBackPress: () => void;
  onSendResetLink: (email: string) => void | Promise<void>;
  isSubmitting?: boolean;
  serverError?: string | null;
  clearServerError?: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackPress,
  onSendResetLink,
  isSubmitting = false,
  serverError = null,
  clearServerError,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const handleContinue = async () => {
    setTouched(true);
    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    setError("");
    clearServerError?.();

    await onSendResetLink(email.trim());
    setSuccessMessage("If an account exists for that email, a password reset link has been sent.");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.titleText}>Reset Password</Text>
          <Text style={styles.subtitleText}>
            Enter your registered email address and we'll send you a password reset link.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, (error || serverError) && styles.inputError]}
            placeholder="Enter your email address"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setSuccessMessage(null);
              clearServerError?.();
              if (touched) {
                setError(validateEmail(value) || "");
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? (
            <Text style={styles.helperText}>{error}</Text>
          ) : serverError ? (
            <Text style={styles.helperText}>{serverError}</Text>
          ) : successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : (
            <Text style={styles.helperHint}>We'll email a reset link to this address.</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, isSubmitting && styles.continueButtonDisabled]}
          onPress={() => {
            void handleContinue();
          }}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Check your inbox and spam folder. The reset link will let you choose a new password.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  backIcon: {
    fontSize: 24,
    color: "#0F172A",
    fontWeight: "500",
  },
  header: {
    marginBottom: 32,
  },
  titleText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#0F172A",
  },
  inputError: {
    borderColor: "#DC2626",
    backgroundColor: "#FEF2F2",
  },
  helperText: {
    fontSize: 13,
    color: "#DC2626",
    marginTop: 6,
    marginLeft: 4,
  },
  helperHint: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    fontSize: 13,
    color: "#15803D",
    marginTop: 6,
    marginLeft: 4,
  },
  continueButton: {
    backgroundColor: "#0836e6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0836e6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#0836e6",
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
});
