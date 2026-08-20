/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        "background-elevated": "var(--color-background-elevated)",
        "background-subtle": "var(--color-background-subtle)",
        foreground: "var(--color-foreground)",
        "foreground-muted": "var(--color-foreground-muted)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        "border-subtle": "var(--color-border-subtle)",
        accent: "var(--color-accent)",
        "accent-muted": "var(--color-accent-muted)",
        "accent-glow": "var(--color-accent-glow)",
        signal: "var(--color-signal)",
        biological: "var(--color-biological)",
        positive: "var(--color-positive)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      maxWidth: {
        prose: "720px",
        content: "1120px",
        wide: "1320px",
      },
      spacing: {
        section: "clamp(5rem, 12vh, 9rem)",
      },
      borderRadius: {
        scientific: "2px",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
