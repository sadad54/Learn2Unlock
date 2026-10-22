import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Button, Card, Chip, Input, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";
import { colors, spacing } from "@learn2unlock/shared/theme";
import type { Question } from "@learn2unlock/shared";

const subjectOptions: { id: Question["subject"]; label: string }[] = [{ id: "math", label: "Mathematics" }, { id: "science", label: "Science" }, { id: "bm", label: "Bahasa Melayu" }, { id: "english", label: "English" }];

export default function ProfileScreen() {
  const current = useParentStore(); const [nickname, setNickname] = useState(current.childNickname); const [year, setYear] = useState(current.schoolYear); const [language, setLanguage] = useState<"en" | "ms">(current.language); const [subjects, setSubjects] = useState<Question["subject"][]>(current.subjects);
  const toggleSubject = (id: Question["subject"]) => setSubjects((value) => value.includes(id) ? value.filter((subject) => subject !== id) : [...value, id]);
  const next = () => { current.setProfile(nickname.trim(), year, language, subjects); router.push("/onboarding/pair-device"); };
  return <Page testID="profile-screen"><Title eyebrow="Step 1 of 5" subtitle="Use a nickname rather than a full legal name.">Create a child profile</Title><Input label="Nickname" value={nickname} maxLength={30} onChangeText={setNickname} /><Card><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>School year</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>{[1,2,3,4,5,6].map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: year === item }} onPress={() => setYear(item)} style={{ width: "30%", minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: year === item ? colors.parent.primary : colors.parent.border, alignItems: "center", justifyContent: "center" }}><Text selectable style={{ color: year === item ? colors.parent.primary : colors.parent.text }}>Year {item}</Text></Pressable>)}</View></Card><Card><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>Learning language</Text><View style={{ flexDirection: "row", gap: spacing.xs }}><Chip label="English" selected={language === "en"} onPress={() => setLanguage("en")} /><Chip label="Bahasa Melayu" selected={language === "ms"} onPress={() => setLanguage("ms")} /></View></Card><Card><Text selectable style={{ color: colors.parent.text, fontWeight: "800" }}>Subjects</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>{subjectOptions.map((subject) => <Chip key={subject.id} label={subject.label} selected={subjects.includes(subject.id)} onPress={() => toggleSubject(subject.id)} />)}</View></Card><Button label="Continue" disabled={!nickname.trim() || subjects.length === 0} onPress={next} /></Page>;
}
