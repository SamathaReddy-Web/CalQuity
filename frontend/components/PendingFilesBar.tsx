"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function PendingFilesBar() {
  const pendingFiles = useChatStore((s) => s.pendingFiles ?? []);
  const removePendingFile = useChatStore((s) => s.removePendingFile);
  const theme = useThemeStore((s) => s.theme);

  if (pendingFiles.length === 0) return null;

  const surface =
    theme === "dark"
      ? "bg-neutral-900 border-neutral-800 text-neutral-100"
      : "bg-neutral-100 border-neutral-300 text-neutral-900";

  const muted =
    theme === "dark" ? "text-neutral-400" : "text-neutral-600";

  return (
    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
      {pendingFiles.map((pf) => {
        const sizeKB = (pf.file.size / 1024).toFixed(1);

        return (
          <div
            key={pf.id}
            className={`
              flex items-center gap-3
              px-3 py-2 rounded-lg border
              text-sm shadow-sm
              ${surface}
            `}
          >
            <span className="text-base opacity-70">📄</span>

            <div className="max-w-[180px] truncate">
              <div className="font-medium truncate">
                {pf.file.name}
              </div>
              <div className={`text-xs ${muted}`}>
                {sizeKB} KB
              </div>
            </div>

            <button
              onClick={() => removePendingFile(pf.id)}
              className="
                ml-1 text-xs opacity-50
                hover:opacity-100 transition
              "
              title="Remove file"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
