import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Button, Card, Chip, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";
import { colors, spacing } from "@learn2unlock/shared/theme";

export default function PairDeviceScreen() {
  const [seconds, setSeconds] = useState(272); const paired = useParentStore((state) => state.devicePaired); const pairDevice = useParentStore((state) => state.pairDevice);
  useEffect(() => { if (seconds <= 0 || paired) return; const timer = setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000); return () => clearInterval(timer); }, [seconds, paired]);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <Page testID="pair-screen"><Title eyebrow="Step 2 of 5" subtitle="Open Learn2Unlock Child and use this pairing code.">Connect the devices</Title><View style={{ alignItems: "center", gap: spacing.md }}><View style={{ width: 190, height: 190, backgroundColor: colors.parent.text, padding: 16, flexDirection: "row", flexWrap: "wrap", gap: 5 }}>{Array.from({ length: 64 }, (_, index) => <View key={index} style={{ width: 14, height: 14, backgroundColor: index % 3 === 0 || index % 7 === 0 ? colors.parent.background : colors.parent.text }} />)}</View><Text selectable style={{ color: colors.parent.textMuted }}>Or enter this 6-digit code</Text><Text selectable style={{ color: colors.parent.text, fontSize: 28, fontWeight: "900", letterSpacing: 7 }}>482 715</Text><Chip label={`Expires in ${time}`} tone="warning" /></View><Card><Text selectable style={{ color: paired ? colors.parent.success : colors.parent.primary, fontWeight: "900" }}>{paired ? "Device connected" : "Waiting for Aina’s device…"}</Text><Text selectable style={{ color: colors.parent.textMuted }}>{paired ? "Pixel 7a is ready to configure." : "For the web demo, use the button below to simulate pairing."}</Text></Card>{paired ? <Button label="Choose controlled apps" onPress={() => router.push("/onboarding/apps")} /> : <Button label="Simulate device connection" onPress={pairDevice} testID="simulate-pair" />}</Page>;
}
