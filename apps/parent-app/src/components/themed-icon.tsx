import { SymbolView } from "expo-symbols";
import medium from "expo-symbols/androidWeights/medium";
import { View } from "react-native";
import { colors, radii } from "@learn2unlock/shared/theme";

export type ParentIconName = "home" | "questions" | "reports" | "settings" | "phone" | "message" | "school" | "game" | "video" | "social" | "art" | "child";

const symbols = {
  home: { ios: "house.fill", android: "home", web: "home" },
  questions: { ios: "text.book.closed.fill", android: "quiz", web: "quiz" },
  reports: { ios: "chart.bar.fill", android: "bar_chart", web: "bar_chart" },
  settings: { ios: "gearshape.fill", android: "settings", web: "settings" },
  phone: { ios: "phone.fill", android: "call", web: "call" },
  message: { ios: "message.fill", android: "chat_bubble", web: "chat_bubble" },
  school: { ios: "graduationcap.fill", android: "school", web: "school" },
  game: { ios: "gamecontroller.fill", android: "sports_esports", web: "sports_esports" },
  video: { ios: "play.rectangle.fill", android: "smart_display", web: "smart_display" },
  social: { ios: "person.2.fill", android: "group", web: "group" },
  art: { ios: "paintpalette.fill", android: "palette", web: "palette" },
  child: { ios: "person.crop.circle.fill", android: "face", web: "face" },
} as const;

export function ParentSymbol({ name, size = 22, color = colors.parent.text }: { name: ParentIconName; size?: number; color?: string }) {
  return <SymbolView accessible={false} name={symbols[name]} tintColor={color} size={size} weight={{ ios: "semibold", android: medium }} />;
}

export function ParentIconBadge({ name, size = 44, active = false, color }: { name: ParentIconName; size?: number; active?: boolean; color?: string }) {
  const foreground = color ?? (active ? colors.parent.background : colors.parent.primary);
  return <View style={{ width: size, height: size, borderRadius: Math.min(radii.lg, size * 0.34), borderCurve: "continuous", backgroundColor: active ? colors.parent.primary : colors.parent.surfaceRaised, borderWidth: 1, borderColor: active ? "rgba(72,214,189,0.72)" : "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 5px 16px rgba(72,214,189,0.24)" : "inset 0 1px 0 rgba(255,255,255,0.06)" }}><View style={{ position: "absolute", top: 5, left: 7, width: size * 0.38, height: 2, borderRadius: 2, backgroundColor: active ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.07)" }} /><ParentSymbol name={name} size={Math.round(size * 0.52)} color={foreground} /></View>;
}

export function appIconForLabel(label: string): ParentIconName {
  const value = label.toLowerCase();
  if (value.includes("phone")) return "phone";
  if (value.includes("message") || value.includes("chat")) return "message";
  if (value.includes("school")) return "school";
  if (value.includes("youtube") || value.includes("video")) return "video";
  if (value.includes("galaxy") || value.includes("game")) return "game";
  if (value.includes("art")) return "art";
  return "social";
}
