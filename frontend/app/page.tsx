"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import ThemeToggle from "@/components/ThemeToggle";
import { usePdfStore } from "@/store/pdfStore";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

// 🔴 IMPORTANT: Disable SSR for PDF viewer
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

export default function Page() {
  const isOpen = usePdfStore((s) => s.isOpen);

  return (
    <div
      className="
        flex h-screen w-full
        bg-white text-black
        dark:bg-black dark:text-white
        transition-colors
      "
    >
      {/* LEFT SIDEBAR (Chat History) */}
      <Sidebar />

      {/* RIGHT MAIN AREA */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* 🌗 Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* CHAT AREA */}
        <motion.div
          animate={{ width: isOpen ? "60%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full"
        >
          <ChatArea />
        </motion.div>

        {/* PDF VIEWER */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="
                w-[40%] h-full
                border-l border-neutral-300
                dark:border-neutral-800
                bg-white dark:bg-neutral-950
              "
            >
              <PdfViewer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
