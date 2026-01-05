"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function Sidebar() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);

  const startNewChat = useChatStore((s) => s.startNewChat);
  const switchChat = useChatStore((s) => s.switchChat);
  const deleteChat = useChatStore((s) => s.deleteChat);

  const theme = useThemeStore((s) => s.theme);

  const bg =
    theme === "dark"
      ? "bg-neutral-950 border-neutral-800 text-neutral-100"
      : "bg-white border-neutral-200 text-neutral-900";

  const hover =
    theme === "dark"
      ? "hover:bg-neutral-900"
      : "hover:bg-neutral-100";

  const active =
    theme === "dark"
      ? "bg-neutral-900 ring-1 ring-neutral-700"
      : "bg-neutral-200 ring-1 ring-neutral-300";

  const muted =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  return (
    <aside className={`w-64 border-r flex flex-col ${bg}`}>
      {/* ===== HEADER ===== */}
      <div className="h-14 px-4 flex items-center border-b border-inherit">
        <button
          onClick={startNewChat}
          className={`w-full flex items-center justify-center gap-2
            px-3 py-2 rounded-lg text-sm font-medium transition ${hover}`}
        >
          <span className="text-lg leading-none">＋</span>
          <span>New chat</span>
        </button>
      </div>

      {/* ===== CHAT LIST ===== */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {chats.map((c) => {
          const isActive = c.id === currentChatId;

          return (
            <div
              key={c.id}
              className={`group flex items-center gap-2
                px-3 py-2 rounded-lg text-sm truncate transition
                ${isActive ? active : hover}`}
            >
              <button
                onClick={() => switchChat(c.id)}
                className="flex-1 flex items-center gap-2 truncate"
              >
                <span className="opacity-60">💬</span>
                <span className="truncate">
                  {c.title || "Untitled chat"}
                </span>
              </button>

              {/* 🗑 Delete */}
              <button
                onClick={() => deleteChat(c.id)}
                className="opacity-0 group-hover:opacity-100
                  text-xs text-neutral-400 hover:text-red-400"
                title="Delete chat"
              >
                ✕
              </button>
            </div>
          );
        })}

        {chats.length === 0 && (
          <div className={`px-3 py-4 text-xs ${muted}`}>
            No chats yet
          </div>
        )}
      </div>

      {/* ===== FOOTER ===== */}
      <div
        className={`h-12 px-4 flex items-center
          text-xs ${muted} border-t border-inherit`}
      >
        CalQuity AI
      </div>
    </aside>
  );
}
