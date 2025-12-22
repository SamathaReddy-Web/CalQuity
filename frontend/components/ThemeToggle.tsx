"use client";

import { useThemeStore } from "@/store/themeStore";

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <button onClick={toggle}>
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
