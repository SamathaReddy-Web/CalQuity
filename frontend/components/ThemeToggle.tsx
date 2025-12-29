"use client";

import { useThemeStore } from "@/store/themeStore";

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  const base =
    "h-9 w-9 flex items-center justify-center rounded-full transition";

  const style =
    theme === "dark"
      ? "bg-neutral-800 text-neutral-100 hover:bg-neutral-700"
      : "bg-neutral-200 text-neutral-900 hover:bg-neutral-300";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`${base} ${style}`}
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
