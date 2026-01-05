"use client";

import { useEffect, useRef } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

/* ---------------------------------------------
   🔍 Sentence normalization
--------------------------------------------- */
function normalizeSentence(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function PdfViewer({ visible }: { visible: boolean }) {
  const citation = useChatStore((s) => s.activeCitation);
  const close = useChatStore((s) => s.closePdfViewer);
  const theme = useThemeStore((s) => s.theme);

  /* 🔑 Plugin created ONCE */
  const searchPluginRef = useRef(
    searchPlugin({
      highlightKeyword: true,
    })
  );

  const searchPluginInstance = searchPluginRef.current;

  /* 🔦 Highlight + jump */
  useEffect(() => {
    if (!citation) return;

    const keyword = normalizeSentence(citation.quote);
    searchPluginInstance.setKeyword(keyword);

    const t = setTimeout(() => {
      searchPluginInstance.jumpToMatch(0);
    }, 500);

    return () => clearTimeout(t);
  }, [citation, searchPluginInstance]);

  const panel =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100"
      : "bg-white text-neutral-900";

  const muted =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  return (
    <aside
      className={`
        h-full flex flex-col
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}
        ${panel}
      `}
    >
      {!citation ? (
        <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
          Select a citation to view the document
        </div>
      ) : (
        <>
          {/* HEADER */}
          <header className="h-14 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-sm font-medium">Source document</div>
              <div className={`text-xs ${muted}`}>
                Page {citation.page}
              </div>
            </div>

            <button
              onClick={close}
              className="h-8 px-3 rounded-md text-xs font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              ✕
            </button>
          </header>

          {/* QUOTE */}
          <div className={`px-4 py-2 text-xs italic border-b ${muted}`}>
            “{citation.quote}”
          </div>

          {/* PDF */}
          <div className="flex-1 overflow-hidden">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={`http://127.0.0.1:8000/uploads/${citation.doc_id}.pdf`}
                initialPage={Math.max(citation.page - 1, 0)}
                plugins={[searchPluginInstance]}
              />
            </Worker>
          </div>
        </>
      )}
    </aside>
  );
}
