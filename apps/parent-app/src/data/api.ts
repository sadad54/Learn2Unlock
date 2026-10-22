import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { Learn2UnlockApiClient, type TokenStore } from "@learn2unlock/shared/api";

const TOKEN_KEY = "learn2unlock.parent.session";
const tokenStore: TokenStore = {
  async get() { return Platform.OS === "web" ? globalThis.localStorage?.getItem(TOKEN_KEY) ?? null : SecureStore.getItemAsync(TOKEN_KEY); },
  async set(token) { if (Platform.OS === "web") globalThis.localStorage?.setItem(TOKEN_KEY, token); else await SecureStore.setItemAsync(TOKEN_KEY, token); },
  async remove() { if (Platform.OS === "web") globalThis.localStorage?.removeItem(TOKEN_KEY); else await SecureStore.deleteItemAsync(TOKEN_KEY); },
};

function resolveApiUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  const localDevelopmentUrl = configuredUrl ?? "http://localhost:4000/api/v1";

  if (Platform.OS === "web" || !/^http:\/\/(localhost|127\.0\.0\.1)(?::\d+)?\b/i.test(localDevelopmentUrl)) {
    return localDevelopmentUrl;
  }

  const metroHost = Constants.expoConfig?.hostUri;
  if (!metroHost) return localDevelopmentUrl;

  try {
    const hostname = new URL(metroHost.includes("://") ? metroHost : `http://${metroHost}`).hostname;
    return `http://${hostname}:4000/api/v1`;
  } catch {
    return localDevelopmentUrl;
  }
}

export const apiBaseUrl = resolveApiUrl();
export const api = new Learn2UnlockApiClient(apiBaseUrl, tokenStore);
