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
} from "react-native";

interface RegisterScreenProps {
  onRegister: () => void;
  onLoginPress: () => void;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onLoginPress,
}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{
    username: boolean;
    email: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateUsername = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Username is required";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

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

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return "Password must contain uppercase, lowercase, and a number";
    }
    return undefined;
  };

  const validateConfirmPassword = (value: string, pwd: string): string | undefined => {
    if (!value) {
      return "Please confirm your password";
    }
    if (value !== pwd) {
      return "Passwords do not match";
    }
    return undefined;
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    switch (field) {
      case "username":
        setErrors((prev) => ({ ...prev, username: validateUsername(username) }));
        break;
      case "email":
        setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
        break;
      case "password":
        setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
        break;
      case "confirmPassword":
        setErrors((prev) => ({
          ...prev,
          confirmPassword: validateConfirmPassword(confirmPassword, password),
        }));
        break;
    }
  };

  const handleRegister = () => {
    const usernameError = validateUsername(username);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    setErrors({
      username: usernameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });
    setTouched({ username: true, email: true, password: true, confirmPassword: true });

    if (!usernameError && !emailError && !passwordError && !confirmPasswordError) {
      onRegister();
    }
  };

  const getPasswordStrength = (): { level: number; text: string; color: string } => {
    const pwd = password;
    if (!pwd) return { level: 0, text: "", color: "#E2E8F0" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 1) return { level: 1, text: "Weak", color: "#DC2626" };
    if (strength <= 2) return { level: 2, text: "Fair", color: "#F59E0B" };
    if (strength <= 3) return { level: 3, text: "Good", color: "#0F766E" };
    return { level: 4, text: "Strong", color: "#059669" };
  };

  const passwordStrength = getPasswordStrength();

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
        <View style={styles.header}>
          <Text style={styles.titleText}>Create Account</Text>
          <Text style={styles.subtitleText}>
            Start your investment journey by creating an account
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[
                styles.input,
                touched.username && errors.username && styles.inputError,
              ]}
              placeholder="Choose a username"
              placeholderTextColor="#94A3B8"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (touched.username) {
                  setErrors((prev) => ({ ...prev, username: validateUsername(text) }));
                }
              }}
              onBlur={() => handleBlur("username")}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {touched.username && errors.username && (
              <Text style={styles.helperText}>{errors.username}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                touched.email && errors.email && styles.inputError,
              ]}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (touched.email) {
                  setErrors((prev) => ({ ...prev, email: validateEmail(text) }));
                }
              }}
              onBlur={() => handleBlur("email")}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {touched.email && errors.email && (
              <Text style={styles.helperText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  touched.password && errors.password && styles.inputError,
                ]}
                placeholder="Create a password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (touched.password) {
                    setErrors((prev) => ({ ...prev, password: validatePassword(text) }));
                  }
                }}
                onBlur={() => handleBlur("password")}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor:
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "#E2E8F0",
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text
                  style={[styles.strengthText, { color: passwordStrength.color }]}
                >
                  {passwordStrength.text}
                </Text>
              </View>
            )}
            {touched.password && errors.password && (
              <Text style={styles.helperText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  touched.confirmPassword &&
                    errors.confirmPassword &&
                    styles.inputError,
                ]}
                placeholder="Confirm your password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (touched.confirmPassword) {
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(text, password),
                    }));
                  }
                }}
                onBlur={() => handleBlur("confirmPassword")}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.showPasswordText}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.helperText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onLoginPress} activeOpacity={0.7}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
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
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 60,
  },
  showPasswordButton: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  showPasswordText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0836e6",
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
  },
  strengthBar: {
    width: 32,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#0836e6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#0836e6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    gap: 6,
  },
  footerText: {
    fontSize: 15,
    color: "#64748B",
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0836e6",
  },
});
