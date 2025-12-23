export function themeClasses(theme: "light" | "dark") {
  return {
    appBg: theme === "dark" ? "bg-neutral-950" : "bg-neutral-50",
    panelBg: theme === "dark" ? "bg-neutral-900" : "bg-white",
    softBg: theme === "dark" ? "bg-neutral-800" : "bg-neutral-100",
    text: theme === "dark" ? "text-neutral-100" : "text-neutral-900",
    mutedText: theme === "dark" ? "text-neutral-400" : "text-neutral-600",
    border: theme === "dark" ? "border-neutral-800" : "border-neutral-200",
  };
}
