import { useState } from "react";
import { Text, View } from "react-native";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { Button, Card, Chip, Input, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";

export default function GenerateScreen() {
  const [topic, setTopic] = useState("Properties of materials");
  const [instructions, setInstructions] = useState("No brand names or trick questions");
  const [loading, setLoading] = useState(false);
  const generated = useParentStore((state) => state.generatedQuestions);
  const error = useParentStore((state) => state.error);
  const generate = useParentStore((state) => state.generateQuestions);
  const approve = useParentStore((state) => state.approveGenerated);
  const discard = useParentStore((state) => state.discardGenerated);

  const run = async () => {
    setLoading(true);
    try { await generate(topic, instructions); }
    catch { /* The store renders the server error. */ }
    finally { setLoading(false); }
  };

  if (generated.length === 0) {
    return <Page testID="generate-screen">
      <Title eyebrow="Curriculum setup" subtitle="Generated content never changes rules or awards time.">Create a review batch</Title>
      {error ? <Card style={{ borderColor: colors.parent.danger }}><Text selectable style={{ color: colors.parent.danger, fontWeight: "800" }}>{error}</Text></Card> : null}
      <View style={{ flexDirection: "row", gap: spacing.xs }}><View style={{ flex: 1 }}><Input label="School year" value="Year 4" editable={false} /></View><View style={{ flex: 1 }}><Input label="Language" value="English" editable={false} /></View></View>
      <Input label="Subject" value="Science" editable={false} />
      <Input label="Topic" value={topic} onChangeText={setTopic} />
      <Input label="Learning standard" value="4.7.1 · Compare materials" editable={false} />
      <Input label="Additional instructions" value={instructions} onChangeText={setInstructions} multiline style={{ minHeight: 82, paddingTop: 14 }} />
      <Card style={{ borderColor: colors.parent.accent }}><Text selectable style={{ color: colors.parent.accent, fontWeight: "900" }}>Every question needs your review</Text><Text selectable style={{ color: colors.parent.textMuted }}>Low-confidence items cannot be bulk-approved.</Text></Card>
      <Button label={loading ? "Generating…" : "Generate 5 questions"} disabled={loading} onPress={() => void run()} testID="generate-questions" />
    </Page>;
  }

  return <Page testID="generate-screen">
    <Title eyebrow="Parent review" subtitle={`${generated.length} questions are waiting. Review each item before it enters the bank.`}>Check generated questions</Title>
    {generated.map((question) => <Card key={question.id} style={{ borderColor: question.confidence === "low" ? colors.parent.accent : colors.parent.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Chip label={question.confidence === "low" ? "Needs review" : "High confidence"} tone={question.confidence === "low" ? "warning" : "success"} /><Text selectable style={{ color: colors.parent.textMuted }}>{question.difficulty}</Text></View>
      <Text selectable style={{ color: colors.parent.text, fontSize: 17, fontWeight: "900" }}>{question.text}</Text>
      <Text selectable style={{ color: colors.parent.primary, fontWeight: "800" }}>Answer: {question.correctAnswer}</Text>
      <Text selectable style={{ color: colors.parent.textMuted }}>{question.explanation}</Text>
      <View style={{ flexDirection: "row", gap: spacing.xs }}><View style={{ flex: 1 }}><Button label="Discard" variant="secondary" onPress={() => void discard(question.id)} /></View><View style={{ flex: 1 }}><Button label="Approve" onPress={() => void approve(question.id)} /></View></View>
    </Card>)}
  </Page>;
}
