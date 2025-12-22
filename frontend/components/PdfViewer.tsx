"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin } from "@react-pdf-viewer/search";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import "@/styles/pdf-highlight.css";

import { usePdfStore } from "@/store/pdfStore";

export default function PdfViewer() {
  const { activeCitation, allCitations, close } = usePdfStore();

  if (!activeCitation) return null;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // 🔑 highlight only valid strings
  const keywords = allCitations
    .map((c) => c?.quote)
    .filter((q): q is string => typeof q === "string" && q.length > 0);

  const searchPluginInstance = searchPlugin({
    keyword: keywords,
    highlightAll: true,
  });

  const pdfUrl = `http://127.0.0.1:8000/uploads/${activeCitation.doc_id}.pdf`;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 text-black dark:text-white border-l border-neutral-200 dark:border-neutral-800">
      {/* Header */}
      <div className="p-3 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-sm text-neutral-600 dark:text-neutral-300">
          Source · Page {activeCitation.page}
        </div>
        <button
          onClick={close}
          className="text-xs text-red-500 hover:text-red-400"
        >
          Close
        </button>
      </div>

      {/* Active citation */}
      <div className="p-3 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
        <blockquote className="italic leading-relaxed">
          “{activeCitation.quote}”
        </blockquote>
      </div>

      {/* PDF */}
      <div className="flex-1 overflow-hidden">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={pdfUrl}
            initialPage={Math.max(activeCitation.page - 1, 0)}
            plugins={[defaultLayoutPluginInstance, searchPluginInstance]}
          />
        </Worker>
      </div>
    </div>
  );
}
