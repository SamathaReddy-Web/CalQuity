"use client";

import { motion } from "framer-motion";

export default function ToolStep({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="text-xs text-neutral-600 dark:text-neutral-400 flex gap-2 items-center"
    >
      <span>⚙️</span>
      <span>{text}</span>
    </motion.div>
  );
}
