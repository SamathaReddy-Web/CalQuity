"use client";

import { motion } from "framer-motion";
import { useThemeStore } from "@/store/themeStore";

export default function ToolStep({ text }: { text: string }) {
  const theme = useThemeStore((s) => s.theme);

  const textColor =
    theme === "dark" ? "text-neutral-400" : "text-neutral-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`text-xs flex gap-2 items-center ${textColor}`}
    >
      <span>⚙️</span>
      <span>{text}</span>
    </motion.div>
  );
}
