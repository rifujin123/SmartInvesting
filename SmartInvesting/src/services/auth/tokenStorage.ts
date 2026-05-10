import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "@smartinvesting_auth_access_token";
const REFRESH_TOKEN_KEY = "@smartinvesting_auth_refresh_token";

export const tokenStorage = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  },

  async getTokens() {
    const [[, accessToken], [, refreshToken]] = await AsyncStorage.multiGet([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
    ]);

    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
    };
  },

  async clearTokens() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
};
