import { router } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { QuestionSchema } from "@learn2unlock/shared";
import { colors, spacing } from "@learn2unlock/shared/theme";
import { Button, Card, Chip, Input, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";

const subjectOptions: { id: "math" | "science" | "bm" | "english"; label: string }[] = [{ id: "math", label: "Mathematics" }, { id: "science", label: "Science" }, { id: "bm", label: "Bahasa Melayu" }, { id: "english", label: "English" }];

export default function CreateQuestionScreen() {
  const [text, setText] = useState(""); const [answer, setAnswer] = useState(""); const [explanation, setExplanation] = useState(""); const [subject, setSubject] = useState<"math"|"science"|"bm"|"english">("math"); const add = useParentStore((state) => state.addQuestion);
  const save = async () => { const question = QuestionSchema.parse({ id: `question-parent-${Date.now()}`, text, type: "mcq", options: [answer, "Alternative A", "Alternative B", "Alternative C"], correctAnswer: answer, explanation, subject, topic: "Parent-created", learningStandardCode: "CUSTOM", difficulty: "medium", language: subject === "bm" ? "ms" : "en", source: "parent_created", status: "approved", createdAt: new Date().toISOString() }); await add(question); router.back(); };
  return <Page testID="create-question"><Title eyebrow="Manual question" subtitle="Add the correct answer and a child-friendly explanation.">Create question</Title><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>{subjectOptions.map((item) => <Chip key={item.id} label={item.label} selected={subject === item.id} onPress={() => setSubject(item.id)} />)}</View><Input label="Question" value={text} onChangeText={setText} multiline style={{ minHeight: 88, paddingTop: 14 }} /><Input label="Correct answer" value={answer} onChangeText={setAnswer} /><Input label="Explanation" value={explanation} onChangeText={setExplanation} multiline style={{ minHeight: 88, paddingTop: 14 }} /><Card><Text selectable style={{ color: colors.parent.textMuted }}>Three placeholder alternatives will be added for this UI prototype. The final editor will support reordering and validation.</Text></Card><Button label="Save question" disabled={!text.trim() || !answer.trim() || !explanation.trim()} onPress={() => void save()} /></Page>;
}
