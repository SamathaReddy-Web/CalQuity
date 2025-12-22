"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { usePdfStore } from "@/store/pdfStore";
import { Citation as CitationType } from "@/store/chatStore";

export default function Citation({ citation }: { citation: CitationType }) {
  const open = usePdfStore((s) => s.open);
  const documents = useChatStore((s) => s.documents ?? []);
  const citations = useChatStore((s) => s.citations ?? []);

  const [hover, setHover] = useState(false);

  if (!citation || typeof citation.id !== "number") return null;

  const doc = documents.find((d) => d.doc_id === citation.doc_id);

  return (
    <span
      className="relative inline-block align-middle"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Badge */}
      <button
        onClick={() => open(citation, citations)}
        className="
          inline-flex items-center justify-center
          px-2 py-0.5 ml-1
          text-[11px] font-medium
          rounded-full
          bg-blue-100 text-blue-700
          dark:bg-blue-900 dark:text-blue-200
          hover:opacity-80
          transition
        "
      >
        [{citation.id}]
      </button>

      {/* Hover preview */}
      {hover && doc && (
        <div className="
          absolute z-50 mt-2 w-72
          rounded-xl border p-3 text-xs shadow-xl
          bg-white dark:bg-neutral-900
          text-black dark:text-white
          border-neutral-200 dark:border-neutral-800
        ">
          <div className="font-medium truncate">{doc.filename}</div>
          <div className="mt-1 text-neutral-400">
            Page {citation.page}
          </div>
          <div className="mt-2 italic text-neutral-600 dark:text-neutral-300 line-clamp-3">
            “{citation.quote}”
          </div>
        </div>
      )}
    </span>
  );
}
