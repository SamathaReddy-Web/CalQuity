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
      ? "bg-blue-900 text-blue-200"
      : "bg-blue-100 text-blue-700";

  const preview =
    theme === "dark"
      ? "bg-neutral-900 border-neutral-700 text-neutral-100"
      : "bg-white border-neutral-200 text-neutral-900";

  const sub =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Citation badge */}
      <sup
        onClick={() => openPdfViewer(citation)}
        className={`
          mx-1 px-1.5 py-0.5
          rounded cursor-pointer
          text-xs font-medium
          ${badge}
          hover:opacity-80
        `}
      >
        [{id}]
      </sup>

      {/* Hover preview */}
      {hover && (
        <div
          className={`
            absolute z-50 mt-2 w-72
            rounded-xl border p-3 shadow-xl
            ${preview}
          `}
        >
          <div className="text-xs font-medium">
            Page {citation.page}
          </div>

          <div className={`mt-1 text-xs italic line-clamp-3 ${sub}`}>
            “{citation.quote}”
          </div>
        </div>
      )}
    </span>
  );
}
