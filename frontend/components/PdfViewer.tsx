"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { searchPlugin } from "@react-pdf-viewer/search";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";
import "@/styles/pdf-highlight.css";

import { usePdfStore } from "@/store/pdfStore";
import { useThemeStore } from "@/store/themeStore";

export default function PdfViewer() {
  const { activeCitation, allCitations, close } = usePdfStore();
  const theme = useThemeStore((s) => s.theme);

  if (!activeCitation) return null;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const keywords = allCitations
    .map((c) => c?.quote)
    .filter((q): q is string => typeof q === "string" && q.length > 0);

  const searchPluginInstance = searchPlugin({
    keyword: keywords,
    highlightAll: true,
  });

  const pdfUrl = `http://127.0.0.1:8000/uploads/${activeCitation.doc_id}.pdf`;

  const panel =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100 border-neutral-800"
      : "bg-white text-neutral-900 border-neutral-200";

  const subText =
    theme === "dark" ? "text-neutral-300" : "text-neutral-600";

  const quoteBg =
    theme === "dark"
      ? "bg-yellow-900/30 text-yellow-200"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className={`h-full flex flex-col border-l ${panel}`}>
      {/* Header */}
      <div className="p-3 flex justify-between items-center border-b border-inherit">
        <div className={`text-sm ${subText}`}>
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
      <div className={`p-3 text-xs ${quoteBg}`}>
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
