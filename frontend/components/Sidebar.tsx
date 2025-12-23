"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function Sidebar() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const startNewChat = useChatStore((s) => s.startNewChat);
  const switchChat = useChatStore((s) => s.switchChat);
  const theme = useThemeStore((s) => s.theme);

  const bg =
    theme === "dark" ? "bg-neutral-950 border-neutral-800" : "bg-white border-neutral-200";

  const item =
    theme === "dark"
      ? "hover:bg-neutral-900"
      : "hover:bg-neutral-100";

  const active =
    theme === "dark"
      ? "bg-neutral-900"
      : "bg-neutral-200";

  return (
    <aside className={`w-64 border-r flex flex-col ${bg}`}>
      <div className="p-4 border-b border-neutral-200">
        <button
          onClick={startNewChat}
          className={`w-full px-3 py-2 rounded-lg text-sm ${item}`}
        >
          ➕ New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => switchChat(c.id)}
            className={`
              w-full text-left px-3 py-2 rounded-lg text-sm truncate
              ${c.id === currentChatId ? active : item}
            `}
          >
            💬 {c.title}
          </button>
        ))}

        {chats.length === 0 && (
          <div className="text-xs text-neutral-400 p-3">
            No chats yet
          </div>
        )}
      </div>

      <div className="p-3 text-xs text-neutral-500 border-t border-neutral-200">
        CalQuity
      </div>
    </aside>
  );
}
