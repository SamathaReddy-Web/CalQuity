"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import { useChatStore } from "@/store/chatStore";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
});

export default function Page() {
  const viewerOpen = useChatStore((s) => s.viewerOpen);

  // % width of chat pane
  const [chatWidth, setChatWidth] = useState(60);
  const draggingRef = useRef(false);

  function startDrag() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none"; // 🔒 prevent text selection
  }

  function stopDrag() {
    draggingRef.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }

  function onDrag(e: MouseEvent) {
    if (!draggingRef.current) return;

    const percent = (e.clientX / window.innerWidth) * 100;

    // Clamp resize range
    if (percent > 30 && percent < 80) {
      setChatWidth(percent);
    }
  }

  /* ------------------------------------------------
     ✅ Attach window events safely (client only)
  ------------------------------------------------ */
  useEffect(() => {
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      window.removeEventListener("mousemove", onDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, []);

  return (
    <div className="flex h-full w-screen bg-neutral-50 dark:bg-neutral-950">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN SPLIT AREA */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* CHAT */}
        <div
          style={{ width: viewerOpen ? `${chatWidth}%` : "100%" }}
          className="
            h-full flex flex-col min-h-0
    bg-white dark:bg-neutral-900
    transition-all
          "
        >
          <ChatArea />
        </div>

        {/* DRAG HANDLE */}
        {viewerOpen && (
          <div
            onMouseDown={startDrag}
            className="
              w-1 cursor-col-resize
              bg-neutral-200 dark:bg-neutral-800
              hover:bg-blue-500/50
              transition
            "
          />
        )}

        {/* PDF */}
        <AnimatePresence>
          {viewerOpen && (
            <motion.div
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 200, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ width: `${100 - chatWidth}%` }}
              className="
                h-full bg-white dark:bg-neutral-950
                border-l border-neutral-200 dark:border-neutral-800
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
