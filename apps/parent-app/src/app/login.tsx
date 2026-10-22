import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { Button, Card, Input, Page, Title } from "@/components/ui";
import { useParentStore } from "@/store/use-parent-store";
import { colors, spacing } from "@learn2unlock/shared/theme";

const LoginSchema = z.object({ email: z.string().email("Enter a valid email address."), password: z.string().min(8, "Use at least 8 characters.") });
type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
  const login = useParentStore((state) => state.login);
  const register = useParentStore((state) => state.register);
  const serverError = useParentStore((state) => state.error);
  const [mode, setMode] = useState<"login" | "register">("login");
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(LoginSchema), defaultValues: { email: "parent@example.com", password: "password" } });
  const submitLogin = handleSubmit(async ({ email, password }) => { setMode("login"); try { await login(email, password); router.replace("/onboarding/profile"); } catch { /* The store exposes a friendly error below. */ } });
  const submitRegister = handleSubmit(async ({ email, password }) => { setMode("register"); try { await register(email, password); router.replace("/onboarding/profile"); } catch { /* The store exposes a friendly error below. */ } });
  return <Page testID="parent-login"><Title eyebrow="Parent access" subtitle="Sign in to manage learning goals and screen time.">Welcome back</Title><View style={{ gap: spacing.md }}><Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => <Input label="Email" value={value} onChangeText={onChange} onBlur={onBlur} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} /><Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => <Input label="Password" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={errors.password?.message} />}/>{serverError ? <Text selectable style={{ color: colors.parent.danger, fontWeight: "700" }}>{serverError}</Text> : null}<Pressable accessibilityRole="button" onPress={() => Alert.alert("Forgot password", "Password reset isn't available in this pilot yet. Please contact support to reset your password.")}><Text selectable style={{ color: colors.parent.primary, textAlign: "right", fontWeight: "700" }}>Forgot password?</Text></Pressable><Button label={isSubmitting && mode === "login" ? "Signing in…" : "Sign in"} onPress={() => void submitLogin()} disabled={isSubmitting} testID="sign-in" /><Button label={isSubmitting && mode === "register" ? "Creating account…" : "Create a parent account"} variant="secondary" onPress={() => void submitRegister()} /></View><Card><Text selectable style={{ color: colors.parent.accent, fontWeight: "800" }}>Your rules stay private</Text><Text selectable style={{ color: colors.parent.textMuted }}>Protected with your PIN or biometrics.</Text></Card></Page>;
}
