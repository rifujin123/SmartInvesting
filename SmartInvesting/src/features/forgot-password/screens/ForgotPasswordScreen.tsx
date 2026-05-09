import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  LayoutChangeEvent,
} from "react-native";

interface ForgotPasswordScreenProps {
  onBackPress: () => void;
  onSendCode: () => void;
}

type VerificationMethod = "email" | "phone";

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onBackPress,
  onSendCode,
}) => {
  const [method, setMethod] = useState<VerificationMethod>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);
  const [methodTabWidth, setMethodTabWidth] = useState(0);

  const methodSwitcherPosition = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  const handleMethodContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    const tabWidth = width / 2;
    setMethodTabWidth(tabWidth);
  };

  useEffect(() => {
    if (methodTabWidth === 0) return;
    
    const targetPosition = method === "phone" ? 1 : 0;

    Animated.sequence([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(methodSwitcherPosition, {
          toValue: targetPosition,
          tension: 150,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [method, methodTabWidth]);

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

  const validatePhone = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    const phoneRegex = /^[\d\s\-+()]{10,}$/;
    if (!phoneRegex.test(value)) {
      return "Please enter a valid phone number";
    }
    return undefined;
  };

  const handleContinue = () => {
    setTouched(true);
    
    if (method === "email") {
      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }
      setError("");
      onSendCode();
    } else {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
      setError("");
      onSendCode();
    }
  };

  const handleMethodChange = (newMethod: VerificationMethod) => {
    setMethod(newMethod);
    setError("");
    setTouched(false);
  };

  const getCurrentValue = () => method === "email" ? email : phone;
  
  const setCurrentValue = (value: string) => {
    if (method === "email") {
      setEmail(value);
      if (touched) setError(validateEmail(value) || "");
    } else {
      setPhone(value);
      if (touched) setError(validatePhone(value) || "");
    }
  };

  const getPlaceholder = () => method === "email" ? "Enter your email address" : "Enter your phone number";
  
  const getKeyboardType = () => method === "email" ? "email-address" : "phone-pad";

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
            Enter your registered email or phone number to receive a verification code
          </Text>
        </View>

        <View style={styles.methodSelector} onLayout={handleMethodContainerLayout}>
          <Animated.View
            style={[
              styles.methodSwitcher,
              {
                width: methodTabWidth > 0 ? methodTabWidth - 4 : undefined,
                transform: [
                  {
                    translateX: methodSwitcherPosition.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, methodTabWidth > 0 ? methodTabWidth : 96],
                    }),
                  },
                ],
              },
            ]}
          />
          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => handleMethodChange("email")}
            activeOpacity={0.7}
          >
            <Text style={[styles.methodText, method === "email" && styles.methodTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => handleMethodChange("phone")}
            activeOpacity={0.7}
          >
            <Text style={[styles.methodText, method === "phone" && styles.methodTextActive]}>
              SMS
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.inputGroup,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={styles.label}>
            {method === "email" ? "Email Address" : "Phone Number"}
          </Text>
          <TextInput
            style={[styles.input, error && styles.inputError]}
            placeholder={getPlaceholder()}
            placeholderTextColor="#94A3B8"
            value={getCurrentValue()}
            onChangeText={setCurrentValue}
            keyboardType={getKeyboardType()}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {error ? (
            <Text style={styles.helperText}>{error}</Text>
          ) : (
            <Text style={styles.helperHint}>
              {method === "email"
                ? "We'll send a verification link to this email"
                : "We'll send a verification code via SMS"}
            </Text>
          )}
        </Animated.View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Send Verification Code</Text>
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.infoContainer,
            {
              opacity: contentOpacity,
            },
          ]}
        >
          <Text style={styles.infoText}>
            {method === "email"
              ? "Didn't receive the email? Check your spam folder or try SMS verification instead."
              : "SMS may incur carrier charges. Alternatively, use email verification."}
          </Text>
        </Animated.View>
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
  methodSelector: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
  },
  methodSwitcher: {
    position: "absolute",
    top: 4,
    left: 4,
    minWidth: 96,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 0,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    zIndex: 1,
  },
  methodText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#64748B",
  },
  methodTextActive: {
    color: "#0836e6",
    fontWeight: "600",
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
