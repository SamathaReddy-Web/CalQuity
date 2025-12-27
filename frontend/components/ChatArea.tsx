"use client";

import ChatStream from "./ChatStream";
import InputBar from "./InputBar";
import PendingFilesBar from "./PendingFilesBar";
import dynamic from "next/dynamic";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import { motion, AnimatePresence } from "framer-motion";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
});

export default function ChatArea() {
  const viewerOpen = useChatStore((s) => s.viewerOpen);
  const theme = useThemeStore((s) => s.theme);

  const bg =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100"
      : "bg-neutral-50 text-neutral-900";

  return (
    <main className={`h-screen flex overflow-hidden ${bg}`}>
      {/* Chat */}
      <motion.div
        animate={{ width: viewerOpen ? "60%" : "100%" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="flex flex-col h-full"
      >
        <div className="flex-1 overflow-y-auto px-6 py-10">
          <ChatStream />
        </div>

        <div className="border-t p-4">
          <PendingFilesBar />
          <InputBar />
        </div>
      </motion.div>

      {/* PDF Viewer */}
      <AnimatePresence>
        {viewerOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-[40%] h-full"
          >
            <PdfViewer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
