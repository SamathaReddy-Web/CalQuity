"use client";

import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function PdfViewer() {
  const citation = useChatStore((s) => s.activeCitation);
  const close = useChatStore((s) => s.closePdfViewer);
  const theme = useThemeStore((s) => s.theme);

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
      {/* ===== HEADER ===== */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-inherit">
        <div className="leading-tight">
          <div className="text-sm font-medium">Source document</div>
          <div className={`text-xs ${muted}`}>
            Page {citation.page}
          </div>
        </div>

        <button
          onClick={close}
          aria-label="Close PDF viewer"
          className="
            h-8 px-3
            rounded-md text-xs font-medium
            border border-neutral-300 dark:border-neutral-700
            hover:bg-neutral-100 dark:hover:bg-neutral-900
            transition
          "
        >
          ✕
        </button>
      </header>

      {/* ===== QUOTE PREVIEW ===== */}
      <div
        className={`
          px-4 py-2 text-xs italic
          border-b border-inherit
          ${muted}
          line-clamp-3
        `}
      >
        “{citation.quote}”
      </div>

      {/* ===== PDF VIEW ===== */}
      <div className="flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            initialPage={Math.max(citation.page - 1, 0)}
          />
        </Worker>
      </div>
    </aside>
  );
}
