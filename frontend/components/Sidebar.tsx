"use client";

import { useChatStore } from "@/store/chatStore";

export default function Sidebar() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const startNewChat = useChatStore((s) => s.startNewChat);
  const switchChat = useChatStore((s) => s.switchChat);

  return (
    <aside className="w-64 bg-white dark:bg-black border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={startNewChat}
          className="w-full px-3 py-2 rounded-lg text-sm
            bg-neutral-100 dark:bg-neutral-900
            hover:bg-neutral-200 dark:hover:bg-neutral-800"
        >
          ➕ New chat
        </button>
      </div>

      {/* Chat history */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => switchChat(c.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm truncate
              ${
                c.id === currentChatId
                  ? "bg-neutral-200 dark:bg-neutral-800"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
              }`}
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

      {/* Footer */}
      <div className="p-3 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-800">
        CalQuity
      </div>
    </aside>
  );
}
