"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ThemeToggle from "@/components/ThemeToggle";
import { usePdfStore } from "@/store/pdfStore";
import { useThemeStore } from "@/store/themeStore";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

// 🔴 Disable SSR for PDF viewer
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

export default function Page() {
  const isOpen = usePdfStore((s) => s.isOpen);
  const theme = useThemeStore((s) => s.theme);

  /* 🎨 Theme tokens */
  const appBg =
    theme === "dark" ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900";

  const panelBg =
    theme === "dark" ? "bg-neutral-900" : "bg-white";

  const pdfBg =
    theme === "dark" ? "bg-neutral-950" : "bg-white";

  const border =
    theme === "dark" ? "border-neutral-800" : "border-neutral-200";

  return (
    <div className={`flex h-screen w-full ${appBg}`}>
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* THEME TOGGLE */}
        <div className="absolute top-4 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* CHAT */}
        <motion.div
          animate={{ width: isOpen ? "60%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`h-full ${panelBg}`}
        >
          <ChatArea />
        </motion.div>

        {/* PDF */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`w-[40%] h-full border-l ${pdfBg} ${border}`}
            >
              <PdfViewer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
