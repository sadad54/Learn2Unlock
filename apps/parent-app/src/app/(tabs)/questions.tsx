import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { Button, Card, Chip, Page, SectionHeader } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";
import type { Question } from "@learn2unlock/shared";

type Tab = "verified_bank" | "parent_created" | "ai_generated";
export default function QuestionsScreen() {
  const [tab, setTab] = useState<Tab>("verified_bank"); const questions = useParentStore((state) => state.questions); const filtered = questions.filter((question) => question.source === tab).slice(0, 12);
  return <Page testID="questions-screen"><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}><Chip label="Verified" selected={tab === "verified_bank"} onPress={() => setTab("verified_bank")} /><Chip label="My questions" selected={tab === "parent_created"} onPress={() => setTab("parent_created")} /><Chip label="AI review" selected={tab === "ai_generated"} onPress={() => setTab("ai_generated")} /></View><SectionHeader title={`${filtered.length} questions`} action={<Pressable accessibilityRole="button" onPress={() => router.push("/questions/create")}><Text selectable style={{ color: colors.parent.primary, fontWeight: "800" }}>+ Create</Text></Pressable>} />{filtered.map((question: Question) => <Card key={question.id}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.xs }}><Chip label={question.status === "pending_review" ? "Needs review" : question.source === "verified_bank" ? "Verified" : "Parent"} tone={question.status === "pending_review" ? "warning" : "success"} /><Text selectable style={{ color: colors.parent.textMuted }}>{question.difficulty}</Text></View><Text selectable style={{ color: colors.parent.text, fontSize: 16, lineHeight: 23, fontWeight: "800" }}>{question.text}</Text><Text selectable style={{ color: colors.parent.textMuted, fontSize: 12 }}>{question.subject} · {question.topic} · {question.learningStandardCode}</Text></Card>)}<Button label="Generate questions with AI" onPress={() => router.push("/questions/generate")} /></Page>;
}
