"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function Citation({ id }: { id: number }) {
  const theme = useThemeStore((s) => s.theme);
  const citation = useChatStore((s) => s.getCitationById(id));
  const openPdfViewer = useChatStore((s) => s.openPdfViewer);

  const [hover, setHover] = useState(false);

  if (!citation) return <sup>[{id}]</sup>;

  const badge =
    theme === "dark"
      ? "bg-blue-900/40 text-blue-200 border border-blue-800/60"
      : "bg-blue-100 text-blue-700 border border-blue-200";

  const preview =
    theme === "dark"
      ? "bg-neutral-900 border-neutral-700 text-neutral-100"
      : "bg-white border-neutral-200 text-neutral-900";

  const sub =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  return (
    <span
      className="relative inline-block align-middle select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Citation badge */}
      <sup
        onClick={() => openPdfViewer(citation)}
        className={`
          mx-1 px-2 py-0.5
          rounded-full cursor-pointer
          text-[11px] font-medium
          transition-all duration-150
          hover:scale-105 hover:opacity-90
          ${badge}
        `}
      >
        [{id}]
      </sup>

      {/* Hover preview */}
      {hover && (
        <div
          className={`
            absolute left-0 top-full mt-2 z-50
            w-72 rounded-xl border p-3
            shadow-xl animate-in fade-in zoom-in-95
            ${preview}
          `}
        >
          <span className="text-[11px] font-medium block">
            Page {citation.page}
          </span>

          <div className={`mt-1 text-xs italic line-clamp-3 ${sub}`}>
            “{citation.quote}”
          </div>
        </div>
      )}
    </span>
  );
}
