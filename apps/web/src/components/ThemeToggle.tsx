import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group inline-flex items-center gap-2 border border-border bg-background-elevated/60 px-2.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-foreground-muted transition-colors hover:border-accent/40 hover:text-foreground ${className}`}
      style={{ borderRadius: "2px" }}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      <span className="relative flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
        {isLight ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current">
            <circle cx="8" cy="8" r="3.25" strokeWidth="1.2" />
            <path d="M8 1.2v1.4M8 13.4v1.4M1.2 8h1.4M13.4 8h1.4M3.1 3.1l1 1M11.9 11.9l1 1M3.1 12.9l1-1M11.9 4.1l1-1" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current">
            <path
              d="M8 2.2a5.2 5.2 0 1 0 5.2 5.2 4.2 4.2 0 0 1-5.2-5.2Z"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className="hidden sm:inline">{isLight ? "Light" : "Dark"}</span>
    </button>
  );
}
