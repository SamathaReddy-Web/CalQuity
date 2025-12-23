"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { usePdfStore } from "@/store/pdfStore";
import { useThemeStore } from "@/store/themeStore";
import { Citation as CitationType } from "@/store/chatStore";

export default function Citation({ citation }: { citation: CitationType }) {
  const open = usePdfStore((s) => s.open);
  const documents = useChatStore((s) => s.documents ?? []);
  const citations = useChatStore((s) => s.citations ?? []);
  const theme = useThemeStore((s) => s.theme);

  const [hover, setHover] = useState(false);

  if (!citation || typeof citation.id !== "number") return null;

  const doc = documents.find((d) => d.doc_id === citation.doc_id);

  const badge =
    theme === "dark"
      ? "bg-blue-900 text-blue-200"
      : "bg-blue-100 text-blue-700";

  const previewBg =
    theme === "dark"
      ? "bg-neutral-900 text-neutral-100 border-neutral-800"
      : "bg-white text-neutral-900 border-neutral-200";

  const quoteText =
    theme === "dark" ? "text-neutral-300" : "text-neutral-600";

  return (
    <span
      className="relative inline-block align-middle"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => open(citation, citations)}
        className={`
          inline-flex items-center justify-center
          px-2 py-0.5 ml-1
          text-[11px] font-medium rounded-full
          ${badge}
          hover:opacity-80 transition
        `}
      >
        [{citation.id}]
      </button>

      {hover && doc && (
        <div
          className={`
            absolute z-50 mt-2 w-72
            rounded-xl border p-3 text-xs shadow-xl
            ${previewBg}
          `}
        >
          <div className="font-medium truncate">{doc.filename}</div>
          <div className="mt-1 text-neutral-400">
            Page {citation.page}
          </div>
          <div className={`mt-2 italic line-clamp-3 ${quoteText}`}>
            “{citation.quote}”
          </div>
        </div>
      )}
    </span>
  );
}
