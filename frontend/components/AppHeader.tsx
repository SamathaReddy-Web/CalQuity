"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useThemeStore } from "@/store/themeStore";

export default function AppHeader() {
  const theme = useThemeStore((s) => s.theme);

  const bg =
    theme === "dark"
      ? "bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/50 shadow-lg"
      : "bg-white/90 backdrop-blur-md border-b border-neutral-200/50 shadow-sm";

  const textColor = theme === "dark" ? "text-neutral-100" : "text-neutral-900";

  return (
    <header
      className={`
        h-16
        sticky top-0 z-50
        px-4 py-3
        ${bg}
        transition-all duration-300
      `}
    >
      <div className="h-full flex items-center justify-between max-w-full mx-auto">
        {/* LEFT — Brand */}
        <div className="flex items-center px-4">
          <span className={`text-lg font-bold tracking-wide ${textColor}`}>
            Calquity<span className="opacity-60 font-medium"> AI Search</span>
          </span>
        </div>

        {/* RIGHT — Controls */}
        <div className="flex items-center space-x-4 px-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
