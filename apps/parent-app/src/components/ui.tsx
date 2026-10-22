import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, ScrollView, Text, TextInput as NativeTextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import { colors, radii, spacing, touchTargets } from "@learn2unlock/shared/theme";
import { ParentIconBadge, ParentSymbol, appIconForLabel } from "@/components/themed-icon";

const palette = colors.parent;

export function Page({ children, centered = false, testID }: PropsWithChildren<{ centered?: boolean; testID?: string }>) {
  return <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center" }} testID={testID}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" style={{ width: "100%" }} contentContainerStyle={{ width: "100%", maxWidth: 520, alignSelf: "center", padding: spacing.lg, paddingBottom: 120, gap: spacing.md, flexGrow: centered ? 1 : undefined, justifyContent: centered ? "center" : undefined }}>{children}</ScrollView></View>;
}

export function Card({ children, style, testID }: PropsWithChildren<{ style?: ViewStyle; testID?: string }>) {
  return <View testID={testID} style={[{ backgroundColor: palette.surface, borderColor: "rgba(255,255,255,0.07)", borderWidth: 1, borderRadius: radii.lg, borderCurve: "continuous", padding: spacing.md, gap: spacing.sm }, style]}>{children}</View>;
}

export function Button({ label, onPress, variant = "primary", disabled = false, testID }: { label: string; onPress: () => void; variant?: "primary" | "secondary" | "danger"; disabled?: boolean; testID?: string }) {
  const primary = variant === "primary"; const danger = variant === "danger";
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} testID={testID} style={({ pressed }) => ({ minHeight: touchTargets.minimum, paddingHorizontal: spacing.lg, borderRadius: radii.md, borderCurve: "continuous", alignItems: "center", justifyContent: "center", backgroundColor: primary ? palette.primary : danger ? palette.danger : "transparent", borderWidth: primary ? 0 : 1, borderColor: danger ? palette.danger : palette.textMuted, opacity: disabled ? 0.42 : pressed ? 0.78 : 1 })}><Text selectable style={{ color: primary || danger ? palette.background : palette.text, fontSize: 15, fontWeight: "800" }}>{label}</Text></Pressable>;
}

export function Chip({ label, selected = false, tone = "default", onPress }: { label: string; selected?: boolean; tone?: "default" | "warning" | "success"; onPress?: () => void }) {
  const backgroundColor = selected ? palette.primary : tone === "warning" ? "#3B3423" : tone === "success" ? "#173E39" : palette.surfaceRaised;
  const color = selected ? palette.background : tone === "warning" ? palette.accent : tone === "success" ? palette.success : palette.textMuted;
  const content = <Text selectable style={{ color, fontSize: 12, fontWeight: "800" }}>{label}</Text>;
  if (!onPress) return <View style={{ minHeight: 34, borderRadius: radii.pill, paddingHorizontal: spacing.sm, alignItems: "center", justifyContent: "center", backgroundColor }}>{content}</View>;
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => ({ minHeight: 42, borderRadius: radii.pill, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", backgroundColor, opacity: pressed ? 0.75 : 1 })}>{content}</Pressable>;
}

export function Input({ label, error, ...props }: TextInputProps & { label: string; error?: string }) {
  return <View style={{ gap: spacing.xs }}><Text selectable style={{ color: palette.textMuted, fontSize: 12, fontWeight: "700" }}>{label}</Text><NativeTextInput placeholderTextColor={palette.textMuted} {...props} style={[{ minHeight: 52, borderRadius: radii.md, borderCurve: "continuous", borderWidth: 1, borderColor: error ? palette.danger : palette.border, backgroundColor: "#0F2035", color: palette.text, paddingHorizontal: spacing.md, fontSize: 16 }, props.style]} />{error ? <Text selectable accessibilityRole="alert" style={{ color: palette.danger, fontSize: 12 }}>{error}</Text> : null}</View>;
}

export function Title({ children, eyebrow, subtitle }: { children: ReactNode; eyebrow?: string; subtitle?: string }) {
  return <View style={{ gap: spacing.xs }}>{eyebrow ? <Text selectable style={{ color: palette.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1 }}>{eyebrow.toUpperCase()}</Text> : null}<Text selectable style={{ color: palette.text, fontSize: 28, lineHeight: 34, fontWeight: "900" }}>{children}</Text>{subtitle ? <Text selectable style={{ color: palette.textMuted, fontSize: 15, lineHeight: 22 }}>{subtitle}</Text> : null}</View>;
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) { return <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm }}><Text selectable style={{ color: palette.text, fontSize: 16, fontWeight: "800" }}>{title}</Text>{action}</View>; }
export function ProgressBar({ value, color = palette.primary }: { value: number; color?: string }) { return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }} style={{ height: 9, borderRadius: radii.pill, backgroundColor: palette.border, overflow: "hidden" }}><View style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%", borderRadius: radii.pill, backgroundColor: color }} /></View>; }
export function Avatar({ name, color = "#F7D5B5" }: { name: string; color?: string }) { return <View accessibilityLabel={`${name} profile`} style={{ width: 48, height: 48, borderRadius: 16, borderCurve: "continuous", backgroundColor: color, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)" }}><ParentSymbol name="child" size={27} color="#57331F" /></View>; }
export function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) { return <View style={{ gap: 3 }}><Text selectable style={{ color: palette.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }}>{label.toUpperCase()}</Text><Text selectable style={{ color: palette.text, fontSize: 26, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{value}{suffix ? <Text style={{ fontSize: 13, color: palette.textMuted }}> {suffix}</Text> : null}</Text></View>; }
export function AppGlyph({ label }: { label: string; color?: string }) { return <View accessibilityLabel={`${label} icon`}><ParentIconBadge name={appIconForLabel(label)} /></View>; }
