import { SymbolView } from "expo-symbols";
import medium from "expo-symbols/androidWeights/medium";
import { View } from "react-native";
import { colors, radii } from "@learn2unlock/shared/theme";

export type ChildIconName = "math" | "school" | "video" | "game" | "chat" | "art" | "phone" | "message" | "emergency" | "lock";

const symbols = {
  math: { ios: "function", android: "calculate", web: "calculate" },
  school: { ios: "graduationcap.fill", android: "school", web: "school" },
  video: { ios: "play.rectangle.fill", android: "smart_display", web: "smart_display" },
  game: { ios: "gamecontroller.fill", android: "sports_esports", web: "sports_esports" },
  chat: { ios: "message.fill", android: "chat_bubble", web: "chat_bubble" },
  art: { ios: "paintpalette.fill", android: "palette", web: "palette" },
  phone: { ios: "phone.fill", android: "call", web: "call" },
  message: { ios: "bubble.left.and.bubble.right.fill", android: "forum", web: "forum" },
  emergency: { ios: "cross.case.fill", android: "emergency", web: "emergency" },
  lock: { ios: "lock.fill", android: "lock", web: "lock" },
} as const;

const tones: Record<ChildIconName, { background: string; foreground: string }> = {
  math: { background: "#DFF6F0", foreground: "#147565" },
  school: { background: "#E8EEFF", foreground: "#4866A8" },
  video: { background: "#FFF0D0", foreground: "#A76613" },
  game: { background: "#EEE7FF", foreground: "#7551A6" },
  chat: { background: "#FFE5E1", foreground: "#B75C50" },
  art: { background: "#FFE8F2", foreground: "#A84F79" },
  phone: { background: "#DFF6F0", foreground: "#147565" },
  message: { background: "#E8EEFF", foreground: "#4866A8" },
  emergency: { background: "#FFE5E1", foreground: "#B75C50" },
  lock: { background: colors.child.surface, foreground: colors.child.textMuted },
};

export function ChildSymbol({ name, size = 26, color }: { name: ChildIconName; size?: number; color?: string }) {
  return <SymbolView accessible={false} name={symbols[name]} tintColor={color ?? tones[name].foreground} size={size} weight={{ ios: "semibold", android: medium }} />;
}

export function ChildIconBadge({ name, locked = false }: { name: ChildIconName; locked?: boolean }) {
  const tone = tones[name];
  return <View style={{ width: 58, height: 58, borderRadius: radii.lg, borderCurve: "continuous", backgroundColor: tone.background, borderWidth: 1, borderColor: "rgba(24,49,83,0.07)", alignItems: "center", justifyContent: "center", boxShadow: "0 7px 14px rgba(71,52,22,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}><View style={{ position: "absolute", top: 6, left: 9, width: 20, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.72)" }} /><ChildSymbol name={name} size={29} />{locked ? <View style={{ position: "absolute", right: -6, bottom: -5, width: 25, height: 25, borderRadius: 10, borderCurve: "continuous", backgroundColor: colors.child.text, borderWidth: 3, borderColor: colors.child.surface, alignItems: "center", justifyContent: "center" }}><ChildSymbol name="lock" size={12} color={colors.shared.white} /></View> : null}</View>;
}
