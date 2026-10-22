import { router } from "expo-router";
import { Text, View } from "react-native";
import { Button, Page } from "@/components/ui";
import { colors, spacing } from "@learn2unlock/shared/theme";

export default function SplashScreen() {
  return (
    <Page centered testID="parent-splash">
      <View style={{ alignItems: "center", gap: spacing.lg, paddingVertical: 80 }}>
        <View style={{ width: 82, height: 82, borderRadius: 26, backgroundColor: colors.parent.primary, alignItems: "center", justifyContent: "center" }}>
          <Text selectable style={{ color: colors.parent.background, fontSize: 24, fontWeight: "900" }}>L2</Text>
        </View>
        <View style={{ alignItems: "center", gap: spacing.xs }}>
          <Text selectable style={{ color: colors.parent.text, fontSize: 32, fontWeight: "900" }}>Learn2Unlock</Text>
          <Text selectable style={{ color: colors.parent.textMuted, fontSize: 16 }}>Learn a little. Unlock a little.</Text>
        </View>
        <Button label="Open parent app" onPress={() => router.push("/login")} testID="open-parent-app" />
        <Button label="Skip to dashboard" variant="secondary" onPress={() => router.replace("/(tabs)")} />
      </View>
    </Page>
  );
}
