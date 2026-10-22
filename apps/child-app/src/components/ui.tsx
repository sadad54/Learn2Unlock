import { useEffect, useState, type PropsWithChildren } from "react";
import { Image } from "expo-image";
import { AccessibilityInfo, Pressable, ScrollView, Text, View, type ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { colors, radii, spacing, touchTargets } from "@learn2unlock/shared/theme";
import { ChildIconBadge, type ChildIconName } from "@/components/themed-icon";

const palette = colors.child;
export function Page({ children, testID }: PropsWithChildren<{ testID?: string }>) { return <View style={{ flex: 1, backgroundColor: palette.background, alignItems: "center" }} testID={testID}><ScrollView contentInsetAdjustmentBehavior="automatic" style={{ width: "100%" }} contentContainerStyle={{ width: "100%", maxWidth: 520, alignSelf: "center", padding: spacing.lg, paddingBottom: 100, gap: spacing.lg }}>{children}</ScrollView></View>; }
export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) { return <View style={[{ backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radii.lg, borderCurve: "continuous", padding: spacing.md, gap: spacing.sm, boxShadow: "0 8px 20px rgba(71,52,22,0.06)" }, style]}>{children}</View>; }
export function Button({ label, onPress, variant = "primary", disabled = false, testID }: { label: string; onPress: () => void; variant?: "primary" | "secondary"; disabled?: boolean; testID?: string }) { const primary = variant === "primary"; return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} testID={testID} style={({ pressed }) => ({ width: "100%", minHeight: touchTargets.childPrimary, borderRadius: radii.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.lg, backgroundColor: primary ? palette.primary : palette.surface, borderWidth: primary ? 0 : 1, borderColor: palette.border, opacity: disabled ? 0.42 : pressed ? 0.78 : 1, transform: [{ translateY: pressed && primary ? 3 : 0 }] })}><Text selectable style={{ color: primary ? colors.shared.white : palette.text, fontSize: 17, fontWeight: "900" }}>{label}</Text></Pressable>; }
export function ProgressBar({ value }: { value: number }) { return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: value }} style={{ height: 10, borderRadius: radii.pill, backgroundColor: "#E6DED1", overflow: "hidden" }}><View style={{ width: `${Math.min(100, Math.max(0,value))}%`, height: "100%", borderRadius: radii.pill, backgroundColor: palette.accent }} /></View>; }
export function TimeRing({ value, label }: { value: number; label: string }) { const tone = value <= 5 ? palette.coral : value <= 15 ? palette.accent : palette.primary; return <View accessibilityLabel={`${value} ${label}`} style={{ width: 190, height: 190, borderRadius: 95, borderWidth: 16, borderColor: tone, alignItems: "center", justifyContent: "center" }}><Text selectable style={{ color: palette.text, fontSize: 48, fontWeight: "900", fontVariant: ["tabular-nums"] }}>{value}</Text><Text selectable style={{ color: palette.text, fontSize: 17, fontWeight: "800" }}>{label}</Text></View>; }
export function AppTile({ label, icon, locked = false }: { label: string; icon: ChildIconName; locked?: boolean }) { return <View accessibilityLabel={`${label}${locked ? ", locked" : ""}`} style={{ width: "30%", minWidth: 100, minHeight: 132, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, alignItems: "center", justifyContent: "center", gap: spacing.sm, opacity: locked ? 0.58 : 1, boxShadow: locked ? undefined : "0 8px 18px rgba(71,52,22,0.05)" }}><ChildIconBadge name={icon} locked={locked} /><Text selectable style={{ color: palette.text, fontWeight: "800", textAlign: "center" }}>{label}</Text>{locked ? <Text selectable style={{ color: palette.textMuted, fontSize: 11, fontWeight: "700" }}>Locked</Text> : null}</View>; }
export type MascotMood = "idle" | "celebrate" | "encourage";

export function Mascot({ size = 160, mood = "idle" }: { size?: number; mood?: MascotMood }) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((value) => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.("reduceMotionChanged", setReduceMotion);
    return () => { active = false; subscription?.remove?.(); };
  }, []);

  const floatY = useSharedValue(0);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const rotateZ = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) { floatY.value = 0; return; }
    floatY.value = withRepeat(withSequence(withTiming(-10, { duration: 1600, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) })), -1, true);
    return () => cancelAnimation(floatY);
  }, [reduceMotion, floatY]);

  useEffect(() => {
    if (reduceMotion || mood === "idle") return;
    if (mood === "celebrate") {
      scale.value = withSequence(withSpring(1.22, { damping: 5, stiffness: 220 }), withSpring(1, { damping: 6, stiffness: 180 }));
      rotateZ.value = withSequence(withTiming(-8, { duration: 120 }), withTiming(8, { duration: 160 }), withTiming(-5, { duration: 140 }), withSpring(0, { damping: 8 }));
      rotateY.value = withSequence(withTiming(18, { duration: 220 }), withSpring(0, { damping: 7 }));
    } else if (mood === "encourage") {
      rotateZ.value = withSequence(withTiming(-6, { duration: 180 }), withTiming(6, { duration: 220 }), withSpring(0, { damping: 8 }));
    }
  }, [mood, reduceMotion, scale, rotateZ, rotateY]);

  const tap = Gesture.Tap().onEnd(() => {
    if (reduceMotion) return;
    scale.value = withSequence(withSpring(1.12, { damping: 6, stiffness: 260 }), withSpring(1, { damping: 7, stiffness: 200 }));
    rotateY.value = withSequence(withTiming(-14, { duration: 140 }), withSpring(0, { damping: 6 }));
  });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      rotateY.value = Math.max(-18, Math.min(18, event.translationX / 4));
      rotateX.value = Math.max(-14, Math.min(14, -event.translationY / 5));
    })
    .onEnd(() => {
      if (reduceMotion) { rotateY.value = 0; rotateX.value = 0; return; }
      rotateY.value = withSpring(0, { damping: 8 });
      rotateX.value = withSpring(0, { damping: 8 });
    });

  const gesture = Gesture.Race(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 700 },
      { translateY: floatY.value },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View accessible accessibilityRole="image" accessibilityLabel="Milo the Learn2Unlock otter holding a star clock" accessibilityHint="Tap or drag to play with Milo" style={[{ alignSelf: "center" }, animatedStyle]}>
        <Image source={require("../../assets/images/milo-mascot.png")} style={{ width: size, height: size }} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}
export function Badge({ label }: { label: string }) { return <View style={{ alignSelf: "flex-start", minHeight: 38, borderRadius: radii.pill, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.surfaceTint }}><Text selectable style={{ color: palette.primary, fontWeight: "900" }}>{label}</Text></View>; }
