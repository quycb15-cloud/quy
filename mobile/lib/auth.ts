import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { API_BASE_URL, APP_ID, OAUTH_PORTAL_URL, assertMobileConfig } from "./config";

const SESSION_KEY = "cn386_mobile_session";

export async function getSessionToken() {
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function clearSessionToken() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function loginWithManus() {
  assertMobileConfig();
  const redirectUri = Linking.createURL("oauth/callback");
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const state = btoa(JSON.stringify({ redirectUri, nonce }));
  const url = new URL(`${OAUTH_PORTAL_URL}/app-auth`);
  url.searchParams.set("appId", APP_ID);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  const result = await WebBrowser.openAuthSessionAsync(url.toString(), redirectUri);
  if (result.type !== "success") return false;

  const parsed = Linking.parse(result.url);
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : undefined;
  const returnedState = typeof parsed.queryParams?.state === "string" ? parsed.queryParams.state : undefined;
  if (!code || returnedState !== state) throw new Error("Phiên đăng nhập không hợp lệ");

  const response = await fetch(`${API_BASE_URL}/api/oauth/mobile-exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, state }),
  });
  if (!response.ok) throw new Error("Không thể hoàn tất đăng nhập Manus");
  const payload = (await response.json()) as { sessionToken?: string };
  if (!payload.sessionToken) throw new Error("Backend không trả về session token");
  await SecureStore.setItemAsync(SESSION_KEY, payload.sessionToken);
  return true;
}
