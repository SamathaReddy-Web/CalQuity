"use client";

import { useChatStore } from "@/store/chatStore";

export default function UploadedFiles() {
  const documents = useChatStore((s) => s.documents);
  const selectedDocs = useChatStore((s) => s.selectedDocs);
  const toggleDoc = useChatStore((s) => s.toggleDoc);

  if (!documents.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {documents.map((d) => {
        const active = selectedDocs.includes(d.doc_id);

        return (
          <button
            key={d.doc_id}
            onClick={() => toggleDoc(d.doc_id)}
            className={`
              px-3 py-1 rounded-full text-xs flex items-center gap-1
              border transition
              ${
                active
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              }
            `}
          >
            📄 {d.filename}
            {active && " ✓"}
          </button>
        );
      })}
    </div>
  );
}
