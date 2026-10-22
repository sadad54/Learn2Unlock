import { router } from "expo-router";
import { Switch, Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { Button, Card, Chip, Page, ProgressBar, Stat, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";

export default function RewardsScreen() {
  const state = useParentStore();
  const potential = state.rewardMinutes * state.maxAttempts;
  const finish = async () => { try { await state.completeOnboarding(); router.replace("/(tabs)"); } catch { /* Store keeps the user on this screen. */ } };
  return <Page testID="rewards-screen">
    <Title eyebrow="Step 5 of 5" subtitle="Aina sees these requirements before starting a challenge.">Set challenge rewards</Title>
    <Card><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Stat label="Questions" value={state.questionCount} /><Stat label="Passing score" value={`${state.passingScore}%`} /></View></Card>
    <Text selectable style={{ color: colors.parent.textMuted, fontSize: 12, fontWeight: "900" }}>MINUTES EARNED PER PASS</Text>
    <View style={{ flexDirection: "row", gap: spacing.xs }}>{([5, 10, 15] as const).map((minutes) => <Chip key={minutes} label={`${minutes} min`} selected={state.rewardMinutes === minutes} onPress={() => state.updateRewardRules({ rewardMinutes: minutes })} />)}</View>
    <Card style={{ borderColor: colors.parent.accent }}><View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}><View><Text selectable style={{ color: colors.parent.accent, fontSize: 12, fontWeight: "900" }}>DAILY REWARD CEILING</Text><Text selectable style={{ color: colors.parent.textMuted }}>Hard cap protects the routine.</Text></View><Stat label="Maximum" value={state.maxReward} suffix="min" /></View><ProgressBar value={(potential / state.maxReward) * 100} color={colors.parent.accent} /><Text selectable style={{ color: potential > state.maxReward ? colors.parent.danger : colors.parent.textMuted }}>{potential > state.maxReward ? "Current setup can exceed the cap; later rewards will stop." : `Current setup can earn up to ${potential} minutes/day.`}</Text></Card>
    <Card><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}><View style={{ flex: 1 }}><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>Parent approval</Text><Text selectable style={{ color: colors.parent.textMuted }}>Review before time is added</Text></View><Switch value={state.requiresApproval} onValueChange={(requiresApproval) => state.updateRewardRules({ requiresApproval })} trackColor={{ false: colors.parent.border, true: colors.parent.primary }} /></View></Card>
    {state.error ? <Text selectable style={{ color: colors.parent.danger, fontWeight: "800" }}>{state.error}</Text> : null}
    <Button label={state.loading ? "Saving…" : "Finish setup"} disabled={state.loading} onPress={() => void finish()} testID="finish-setup" />
  </Page>;
}
