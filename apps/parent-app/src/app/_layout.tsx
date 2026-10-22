import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@learn2unlock/shared/theme";

const parentTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.parent.background, card: colors.parent.background, text: colors.parent.text, border: colors.parent.border, primary: colors.parent.primary },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={parentTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.parent.background }, headerTintColor: colors.parent.text, headerShadowVisible: false, headerBackButtonDisplayMode: "minimal", contentStyle: { backgroundColor: colors.parent.background } }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Parent access" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding/profile" options={{ title: "Add a child" }} />
        <Stack.Screen name="onboarding/pair-device" options={{ title: "Pair device" }} />
        <Stack.Screen name="onboarding/apps" options={{ title: "Choose apps" }} />
        <Stack.Screen name="onboarding/rules" options={{ title: "Screen-time rules" }} />
        <Stack.Screen name="onboarding/rewards" options={{ title: "Challenge rules" }} />
        <Stack.Screen name="questions/generate" options={{ title: "Generate with AI" }} />
        <Stack.Screen name="questions/create" options={{ title: "Create question", presentation: "modal" }} />
        <Stack.Screen name="requests" options={{ title: "Time requests" }} />
      </Stack>
    </ThemeProvider>
  );
}
