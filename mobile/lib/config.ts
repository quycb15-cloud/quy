import Constants from "expo-constants";

const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
  oauthPortalUrl?: string;
  appId?: string;
};

export const API_BASE_URL = (
  extra.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || ""
).replace(/\/$/, "");
export const OAUTH_PORTAL_URL = (
  extra.oauthPortalUrl || process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL || ""
).replace(/\/$/, "");
export const APP_ID = extra.appId || process.env.EXPO_PUBLIC_APP_ID || "";

export function assertMobileConfig() {
  if (!API_BASE_URL || !OAUTH_PORTAL_URL || !APP_ID) {
    throw new Error(
      "Thiếu EXPO_PUBLIC_API_BASE_URL, EXPO_PUBLIC_OAUTH_PORTAL_URL hoặc EXPO_PUBLIC_APP_ID"
    );
  }
}
