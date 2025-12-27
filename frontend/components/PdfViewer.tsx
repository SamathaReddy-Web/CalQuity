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

  const pdfUrl = `http://127.0.0.1:8000/uploads/${citation.doc_id}.pdf`;

  return (
    <div className={`h-full flex flex-col border-l ${panel}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-inherit">
        <div className="text-sm">
          Page {citation.page}
        </div>
        <button
          onClick={close}
          className="text-xs text-red-500 hover:underline"
        >
          Close
        </button>
      </div>

      {/* PDF */}
      <div className="flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            initialPage={Math.max(citation.page - 1, 0)}
          />
        </Worker>
      </div>
    </div>
  );
}
