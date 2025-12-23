"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function UploadedFiles() {
  const documents = useChatStore((s) => s.documents);
  const selectedDocs = useChatStore((s) => s.selectedDocs);
  const toggleDoc = useChatStore((s) => s.toggleDoc);
  const theme = useThemeStore((s) => s.theme);

  if (!documents.length) return null;

  const active =
    theme === "dark"
      ? "bg-white text-black"
      : "bg-black text-white";

  const inactive =
    theme === "dark"
      ? "bg-neutral-800 text-neutral-300"
      : "bg-neutral-200 text-neutral-700";

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {documents.map((d) => {
        const isActive = selectedDocs.includes(d.doc_id);

        return (
          <button
            key={d.doc_id}
            onClick={() => toggleDoc(d.doc_id)}
            className={`
              px-3 py-1 rounded-full text-xs flex items-center gap-1
              border transition
              ${isActive ? active : inactive}
            `}
          >
            📄 {d.filename}
            {isActive && " ✓"}
          </button>
        );
      })}
    </div>
  );
}
