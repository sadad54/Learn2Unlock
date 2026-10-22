import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { Badge, Button, Card, Mascot, Page } from "@/components/ui";
import { useChildStore } from "@/store/use-child-store";

export default function RestrictionScreen() {
  const [loading, setLoading] = useState(false);
  const start = useChildStore((state) => state.startChallenge);
  const error = useChildStore((state) => state.error);
  const begin = async () => { setLoading(true); try { await start(); router.push("/challenge"); } catch { /* Store renders error. */ } finally { setLoading(false); } };
  return <Page testID="restriction-screen"><Mascot size={156} mood={error ? "encourage" : "idle"} /><View style={{ alignItems: "center", gap: spacing.xs }}><Text selectable style={{ color: colors.child.text, fontSize: 30, fontWeight: "900", textAlign: "center" }}>Play time is paused</Text><Text selectable style={{ color: colors.child.textMuted, fontSize: 17, lineHeight: 25, textAlign: "center" }}>You used today’s game time. You can earn more with a quick challenge.</Text></View>{error ? <Card style={{ borderColor: colors.child.coral }}><Text selectable style={{ color: colors.child.coral, fontWeight: "800" }}>{error}</Text></Card> : null}<Card><Badge label="Your challenge" /><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}><View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}><Text selectable style={{ color: colors.child.text, fontSize: 36, fontWeight: "900" }}>5</Text><Text selectable style={{ color: colors.child.textMuted }}>questions</Text></View><View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}><Text selectable style={{ color: colors.child.text, fontSize: 36, fontWeight: "900" }}>80%</Text><Text selectable style={{ color: colors.child.textMuted }}>to pass</Text></View></View><View style={{ height: 1, backgroundColor: colors.child.border }} /><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text selectable style={{ color: colors.child.textMuted }}>Reward</Text><Text selectable style={{ color: colors.child.primary, fontSize: 20, fontWeight: "900" }}>+10 minutes</Text></View></Card><Card style={{ alignItems: "center" }}><Text selectable style={{ color: colors.child.textMuted, fontSize: 12 }}>NEXT FREE PLAY TIME</Text><Text selectable style={{ color: colors.child.text, fontSize: 25, fontWeight: "900" }}>Tomorrow · 7:00 AM</Text></Card><Button label={loading ? "Starting…" : "Start challenge"} disabled={loading} onPress={() => void begin()} testID="start-challenge" /><Button label="Back to allowed apps" variant="secondary" onPress={() => router.back()} /></Page>;
}
