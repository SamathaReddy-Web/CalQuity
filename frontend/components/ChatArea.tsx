"use client";

import ChatStream from "./ChatStream";
import InputBar from "./InputBar";
import PendingFilesBar from "./PendingFilesBar";
import EmptyState from "./EmptyState";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

export default function ChatArea() {
  const theme = useThemeStore((s) => s.theme);

  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);

  const currentChat = chats.find((c) => c.id === currentChatId);
  const isEmpty = !currentChat || currentChat.messages.length === 0;

  const bg =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100"
      : "bg-neutral-50 text-neutral-900";

  return (
    <section className={`h-full flex flex-col ${bg}`}>
      {/* CHAT CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-10 relative">
        {isEmpty ? <EmptyState /> : <ChatStream />}
      </div>

      {/* INPUT AREA */}
      <div className="px-4 py-3">
        <PendingFilesBar />
        <InputBar />
      </div>
    </section>
  );
}
