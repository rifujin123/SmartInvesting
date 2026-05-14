import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRIC_ENABLED_KEY = "@smartinvesting_biometric_enabled";

async function setItem(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    await AsyncStorage.setItem(key, value);
  }
}

async function getItem(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return AsyncStorage.getItem(key);
  }
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  label: string;
}

export const biometricService = {
  async getBiometricEnabled() {
    const value = await getItem(BIOMETRIC_ENABLED_KEY);
    return value === "true";
  },

  async setBiometricEnabled(enabled: boolean) {
    await setItem(BIOMETRIC_ENABLED_KEY, enabled ? "true" : "false");
  },

  async getBiometricCapabilities(): Promise<BiometricCapabilities> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return { isAvailable: false, label: "Biometric Login" };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (Platform.OS === "ios") {
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return { isAvailable: true, label: "Face ID" };
      }

      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return { isAvailable: true, label: "Touch ID" };
      }
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return { isAvailable: true, label: "Fingerprint" };
    }

    return { isAvailable: true, label: "Biometric Login" };
  },

  async authenticate(label: string) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Sign in with ${label}`,
      cancelLabel: "Cancel",
      fallbackLabel: "",
      disableDeviceFallback: true,
    });

    if (!result.success) {
      throw new Error(result.error ?? "Biometric authentication failed");
    }

    return true;
  },
};