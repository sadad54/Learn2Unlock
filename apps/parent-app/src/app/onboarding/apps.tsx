import { router } from "expo-router";
import { Text, View, Switch } from "react-native";
import { seedData } from "@learn2unlock/shared";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { AppGlyph, Button, Card, Chip, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";

export default function AppsScreen() {
  const controlled = useParentStore((state) => state.controlledApps); const toggle = useParentStore((state) => state.toggleApp); const essential = seedData.applications.filter((app) => app.isEssential); const optional = seedData.applications.filter((app) => !app.isEssential);
  return <Page testID="apps-screen"><Title eyebrow="Step 3 of 5" subtitle="Essential apps always remain available.">Choose controlled apps</Title><Text selectable style={{ color: colors.parent.accent, fontSize: 12, fontWeight: "900" }}>ALWAYS ALLOWED</Text><Card>{essential.map((app) => <View key={app.id} style={{ minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm }}><AppGlyph label={app.displayName} /><View style={{ flex: 1 }}><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>{app.displayName}</Text><Text selectable style={{ color: colors.parent.textMuted, fontSize: 12 }}>Essential app</Text></View><Chip label="Pinned" /></View>)}</Card><Text selectable style={{ color: colors.parent.textMuted, fontSize: 12, fontWeight: "900" }}>SET LIMITS</Text><Card>{optional.map((app) => <View key={app.id} style={{ minHeight: 58, flexDirection: "row", alignItems: "center", gap: spacing.sm }}><AppGlyph label={app.displayName} /><View style={{ flex: 1 }}><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>{app.displayName}</Text><Text selectable style={{ color: colors.parent.textMuted, fontSize: 12 }}>{app.category}</Text></View><Switch value={controlled.includes(app.id)} onValueChange={() => toggle(app.id)} trackColor={{ false: colors.parent.border, true: colors.parent.primary }} /></View>)}</Card><Button label="Continue to rules" onPress={() => router.push("/onboarding/rules")} /></Page>;
}
