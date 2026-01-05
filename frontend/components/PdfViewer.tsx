"use client";

import { useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

/* ---------------------------------------------
   Normalize sentence → stable keyword
--------------------------------------------- */
function normalizeSentence(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PdfViewer() {
  /* 🔴 ALL HOOKS MUST BE AT TOP — NO EARLY RETURN */
  const citation = useChatStore((s) => s.activeCitation);
  const close = useChatStore((s) => s.closePdfViewer);
  const theme = useThemeStore((s) => s.theme);

  /* 🔑 Create plugin ONCE PER MOUNT */
  const searchPluginInstance = searchPlugin({
    keyword: citation ? normalizeSentence(citation.quote) : "",
    highlightKeyword: true,
  });

  const { jumpToMatch } = searchPluginInstance;

  /* 🎯 Jump after text layer is ready */
  useEffect(() => {
    if (!citation) return;

    const t = setTimeout(() => {
      jumpToMatch(0);
    }, 500);

    return () => clearTimeout(t);
  }, [citation, jumpToMatch]);

  /* Safe guard AFTER hooks */
  if (!citation) return null;

  const panel =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100 border-neutral-800"
      : "bg-white text-neutral-900 border-neutral-200";

  const muted =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  const pdfUrl = `http://127.0.0.1:8000/uploads/${citation.doc_id}.pdf`;

  return (
    <aside className={`h-full flex flex-col border-l ${panel}`}>
      {/* HEADER */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-inherit">
        <div>
          <div className="text-sm font-medium">Source document</div>
          <div className={`text-xs ${muted}`}>
            Page {citation.page}
          </div>
        </div>

        <button
          onClick={close}
          className="
            h-8 px-3 rounded-md text-xs font-medium
            border border-neutral-300 dark:border-neutral-700
            hover:bg-neutral-100 dark:hover:bg-neutral-900
            transition
          "
        >
          ✕
        </button>
      </header>

      {/* QUOTE */}
      <div className={`px-4 py-2 text-xs italic border-b border-inherit ${muted}`}>
        “{citation.quote}”
      </div>

      {/* PDF */}
      <div className="flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            key={`${citation.doc_id}-${citation.page}`}
            fileUrl={pdfUrl}
            initialPage={Math.max(citation.page - 1, 0)}
            plugins={[searchPluginInstance]}
          />
        </Worker>
      </div>
    </aside>
  );
}
