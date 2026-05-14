import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "@smartinvesting_auth_access_token";
const REFRESH_TOKEN_KEY = "@smartinvesting_auth_refresh_token";
const BIOMETRIC_REFRESH_TOKEN_KEY = "@smartinvesting_auth_biometric_refresh_token";

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

async function deleteItem(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    await AsyncStorage.removeItem(key);
  }
}

export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await Promise.all([
      setItem(ACCESS_TOKEN_KEY, accessToken),
      setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },

  async getTokens() {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
    ]);

    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    };
  },

  async saveBiometricRefreshToken(refreshToken: string) {
    await setItem(BIOMETRIC_REFRESH_TOKEN_KEY, refreshToken);
  },

  async getBiometricRefreshToken() {
    return (await getItem(BIOMETRIC_REFRESH_TOKEN_KEY)) ?? null;
  },

  async clearBiometricRefreshToken() {
    await deleteItem(BIOMETRIC_REFRESH_TOKEN_KEY);
  },

  async clearTokens() {
    await Promise.all([
      deleteItem(ACCESS_TOKEN_KEY),
      deleteItem(REFRESH_TOKEN_KEY),
    ]);
  },
};
