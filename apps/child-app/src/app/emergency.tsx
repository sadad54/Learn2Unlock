import { router } from "expo-router";
import { Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { AppTile, Button, Card, Page } from "@/components/ui";

export default function EmergencyScreen() {
  return <Page testID="emergency-screen"><Card style={{ backgroundColor: colors.child.surfaceTint }}><Text selectable style={{ color: colors.child.primary, fontSize: 18, fontWeight: "900" }}>You can always use these apps</Text><Text selectable style={{ color: colors.child.textMuted }}>They never use your play-time balance.</Text></Card><Text selectable style={{ color: colors.child.text, fontSize: 24, fontWeight: "900" }}>Call, message, or learn</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}><AppTile label="Phone" icon="phone" /><AppTile label="Message parent" icon="message" /><AppTile label="School portal" icon="school" /><AppTile label="Emergency" icon="emergency" /></View><Card><Text selectable style={{ color: colors.child.primary, fontWeight: "900" }}>Safety note</Text><Text selectable style={{ color: colors.child.textMuted, lineHeight: 23 }}>Emergency calls are always available, even when play time is paused.</Text></Card><Button label="Back to my apps" variant="secondary" onPress={() => router.replace("/")} /></Page>;
}
