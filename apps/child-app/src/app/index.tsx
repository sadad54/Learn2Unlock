import { router } from "expo-router";
import { Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { AppTile, Button, Card, Page, ProgressBar, TimeRing } from "@/components/ui";
import { useChildStore } from "@/store/use-child-store";

export default function ChildHomeScreen() {
  const remaining = useChildStore((state) => state.remainingMinutes);
  return <Page testID="child-home"><View style={{ alignItems: "center", gap: spacing.md }}><Text selectable style={{ color: colors.child.textMuted, fontSize: 18 }}>You’ve got play time ready</Text><TimeRing value={remaining} label="minutes left" /><Button label="Earn more time" onPress={() => router.push("/restriction")} testID="earn-more-time" /></View><Card><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text selectable style={{ color: colors.child.text, fontWeight: "900" }}>Today’s learning path</Text><Text selectable style={{ color: colors.child.primary, fontWeight: "900" }}>60%</Text></View><ProgressBar value={60} /><Text selectable style={{ color: colors.child.textMuted }}>3 of 5 questions completed</Text></Card><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm }}><Text selectable style={{ color: colors.child.text, fontSize: 22, fontWeight: "900" }}>My apps</Text><Button label="Ask parent" variant="secondary" onPress={() => router.push("/ask-parent")} /></View><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}><AppTile label="Math Lab" icon="math" /><AppTile label="School" icon="school" /><AppTile label="Videos" icon="video" /><AppTile label="Galaxy" icon="game" locked /><AppTile label="Chat" icon="chat" locked /><AppTile label="Art Pad" icon="art" /></View><Button label="Emergency and school apps" variant="secondary" onPress={() => router.push("/emergency")} /></Page>;
}
