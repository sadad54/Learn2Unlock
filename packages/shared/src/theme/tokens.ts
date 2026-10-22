export const colors = {
  parent: {
    background: "#0D1B2D",
    surface: "#14263D",
    surfaceRaised: "#1B304B",
    border: "#29415E",
    primary: "#48D6BD",
    primaryPressed: "#2EBCA5",
    accent: "#F5C451",
    danger: "#F47C6C",
    text: "#F7FBFF",
    textMuted: "#9FB0C5",
    success: "#70E1CD",
  },
  child: {
    background: "#FFF8E9",
    surface: "#FFFDF7",
    surfaceTint: "#EAF8F4",
    border: "#EADFCB",
    primary: "#1E9E8A",
    primaryPressed: "#147565",
    accent: "#F5C451",
    coral: "#F47C6C",
    text: "#183153",
    textMuted: "#65758A",
    disabled: "#A5AEA9",
  },
  shared: {
    white: "#FFFFFF",
    transparent: "transparent",
    scrim: "rgba(4, 12, 23, 0.62)",
  },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  phone: 38,
  pill: 999,
} as const;

export const typography = {
  parent: {
    display: { fontFamily: "System", fontSize: 32, lineHeight: 38, fontWeight: "800" },
    title: { fontFamily: "System", fontSize: 24, lineHeight: 30, fontWeight: "800" },
    body: { fontFamily: "System", fontSize: 16, lineHeight: 24, fontWeight: "400" },
    label: { fontFamily: "System", fontSize: 12, lineHeight: 16, fontWeight: "700" },
    data: { fontFamily: "System", fontSize: 28, lineHeight: 34, fontWeight: "800" },
  },
  child: {
    display: { fontFamily: "System", fontSize: 36, lineHeight: 42, fontWeight: "800" },
    title: { fontFamily: "System", fontSize: 28, lineHeight: 34, fontWeight: "800" },
    body: { fontFamily: "System", fontSize: 18, lineHeight: 27, fontWeight: "400" },
    label: { fontFamily: "System", fontSize: 15, lineHeight: 20, fontWeight: "700" },
    data: { fontFamily: "System", fontSize: 44, lineHeight: 50, fontWeight: "900" },
  },
} as const;

export const touchTargets = {
  minimum: 48,
  childPrimary: 56,
  icon: 48,
} as const;

export const motion = {
  quick: 150,
  standard: 240,
  celebration: 400,
} as const;

export const theme = { colors, spacing, radii, typography, touchTargets, motion } as const;

export type Learn2UnlockTheme = typeof theme;
