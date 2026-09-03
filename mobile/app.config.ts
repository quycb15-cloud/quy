import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Cao su CN386",
  slug: "cao-su-cn386",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "caosu-cn386",
  userInterfaceStyle: "light",
  experiments: { typedRoutes: true },
  plugins: ["expo-router", "expo-secure-store"],
  ios: { supportsTablet: true, bundleIdentifier: "vn.cn386.caosu" },
  android: { package: "vn.cn386.caosu" },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    oauthPortalUrl: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL,
    appId: process.env.EXPO_PUBLIC_APP_ID,
  },
};

export default config;
