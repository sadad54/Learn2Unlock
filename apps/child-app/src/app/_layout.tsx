import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@learn2unlock/shared/theme";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useChildStore } from "@/store/use-child-store";

const childTheme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.child.background, card: colors.child.background, text: colors.child.text, border: colors.child.border, primary: colors.child.primary } };
export default function RootLayout() {
  const initialize = useChildStore((state) => state.initialize);
  useEffect(() => { void initialize(); }, [initialize]);
  return <GestureHandlerRootView style={{ flex: 1 }}><ThemeProvider value={childTheme}><StatusBar style="dark" /><Stack screenOptions={{ headerStyle: { backgroundColor: colors.child.background }, headerTintColor: colors.child.text, headerShadowVisible: false, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.child.background } }}><Stack.Screen name="index" options={{ title: "Hi, Aina!", headerBackVisible: false }} /><Stack.Screen name="restriction" options={{ title: "Play time" }} /><Stack.Screen name="challenge" options={{ title: "Science challenge", gestureEnabled: false }} /><Stack.Screen name="result" options={{ title: "Challenge complete", gestureEnabled: false }} /><Stack.Screen name="ask-parent" options={{ title: "Ask parent" }} /><Stack.Screen name="emergency" options={{ title: "Always available" }} /></Stack></ThemeProvider></GestureHandlerRootView>;
}
