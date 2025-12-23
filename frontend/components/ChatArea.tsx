"use client";

import ChatStream from "./ChatStream";
import InputBar from "./InputBar";
import EmptyState from "./EmptyState";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function ChatArea() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const theme = useThemeStore((s) => s.theme);

  const currentChat =
    currentChatId
      ? chats.find((c) => c.id === currentChatId)
      : null;

  const messages = currentChat?.messages ?? [];
  const showEmpty = messages.length === 0;

  /* 🎨 Theme tokens */
  const surface =
    theme === "dark" ? "bg-neutral-950 text-neutral-100" : "bg-neutral-50 text-neutral-900";

  const inputBg =
    theme === "dark" ? "bg-neutral-950" : "bg-neutral-50";

  return (
    <main className={`flex-1 flex flex-col h-full ${surface}`}>
      {/* CHAT CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-10">
          {showEmpty ? <EmptyState /> : <ChatStream />}
        </div>
      </div>

      {/* INPUT */}
      <div className={`sticky bottom-0 pt-4 pb-6 ${inputBg}`}>
        <InputBar />
      </div>
    </main>
  );
}
