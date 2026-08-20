/**
 * Biotech Arbitrage Engine — design tokens
 */

export const colors = {
  background: "var(--color-background)",
  backgroundElevated: "var(--color-background-elevated)",
  backgroundSubtle: "var(--color-background-subtle)",
  foreground: "var(--color-foreground)",
  foregroundMuted: "var(--color-foreground-muted)",
  muted: "var(--color-muted)",
  border: "var(--color-border)",
  borderSubtle: "var(--color-border-subtle)",
  accent: "var(--color-accent)",
  accentMuted: "var(--color-accent-muted)",
  signal: "var(--color-signal)",
  biological: "var(--color-biological)",
} as const;

export const typography = {
  fontSans: "var(--font-sans)",
  fontDisplay: "var(--font-display)",
  fontMono: "var(--font-mono)",
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    display: "clamp(2.5rem, 6vw, 5.5rem)",
    hero: "clamp(3rem, 8vw, 7rem)",
  },
  lineHeight: {
    tight: "1.1",
    snug: "1.25",
    normal: "1.5",
    relaxed: "1.65",
  },
  letterSpacing: {
    tight: "-0.03em",
    normal: "0",
    wide: "0.08em",
    wider: "0.15em",
  },
} as const;

export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "3rem",
  "3xl": "4rem",
  "4xl": "6rem",
  "5xl": "8rem",
  section: "clamp(5rem, 12vh, 9rem)",
} as const;

export const radius = {
  none: "0",
  sm: "2px",
  md: "4px",
  lg: "6px",
} as const;

export const borders = {
  width: "1px",
  style: "solid",
  color: colors.border,
} as const;

export const shadows = {
  none: "none",
  subtle: "0 1px 0 0 rgba(255, 255, 255, 0.04)",
  glow: "0 0 40px -12px var(--color-accent-glow)",
} as const;

export const containers = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
  prose: "720px",
  content: "1120px",
  wide: "1320px",
} as const;

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

export const motion = {
  durationFast: "150ms",
  durationNormal: "300ms",
  durationSlow: "500ms",
  durationSlower: "800ms",
  easeDefault: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

export const zIndex = {
  base: 0,
  elevated: 10,
  overlay: 20,
  modal: 30,
} as const;
