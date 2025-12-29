"use client";

import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { usePdfStore } from "@/store/pdfStore";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

// 🔴 Disable SSR for PDF viewer
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

export default function Page() {
  const isOpen = usePdfStore((s) => s.isOpen);

  return (
    <div className="flex h-full w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* CHAT */}
        <motion.div
          animate={{ width: isOpen ? "60%" : "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="h-full bg-white dark:bg-neutral-900"
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
              className="w-[40%] h-full border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
            >
              <PdfViewer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
