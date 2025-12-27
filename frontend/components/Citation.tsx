"use client";

import { useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { usePdfStore } from "@/store/pdfStore";
import { useThemeStore } from "@/store/themeStore";

export default function Citation({ id }: { id: number }) {
  const theme = useThemeStore((s) => s.theme);
  const openPdf = usePdfStore((s) => s.open);

  // ✅ stable selector
  const citation = useChatStore((s) => s.getCitationById(id));

  const [hover, setHover] = useState(false);

  if (!citation) return <sup>[{id}]</sup>;

  const badge =
    theme === "dark"
      ? "bg-blue-900 text-blue-200"
      : "bg-blue-100 text-blue-700";

  return (
    <sup
      className={`mx-1 px-1.5 py-0.5 rounded cursor-pointer text-xs ${badge}`}
      onClick={() => openPdf(citation)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      [{id}]
    </sup>
  );
}
