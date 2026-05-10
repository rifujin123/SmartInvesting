export const API_BASE_URL = (() => {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    throw new Error("Missing EXPO_PUBLIC_API_BASE_URL environment variable");
  }

  return configuredBaseUrl.replace(/\/$/, "");
})();
