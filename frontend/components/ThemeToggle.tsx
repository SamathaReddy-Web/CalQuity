"use client";

import { useThemeStore } from "@/store/themeStore";

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  const btn =
    theme === "dark"
      ? "bg-neutral-800 text-neutral-100"
      : "bg-neutral-200 text-neutral-900";

  return (
    <button
      onClick={toggle}
      className={`px-3 py-2 rounded-md transition ${btn}`}
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
