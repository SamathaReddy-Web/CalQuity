"use client";

import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import ChatStream from "./ChatStream";
import InputBar from "./InputBar";
import PendingFilesBar from "./PendingFilesBar";
import EmptyState from "./EmptyState";

export default function ChatArea() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const startNewChat = useChatStore((s) => s.startNewChat);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (!currentChatId) startNewChat();
  }, [currentChatId, startNewChat]);

  const currentChat = chats.find((c) => c.id === currentChatId);
  const isEmpty = !currentChat || currentChat.messages.length === 0;

  const bg =
    theme === "dark"
      ? "bg-neutral-950 text-neutral-100"
      : "bg-neutral-50 text-neutral-900";

  return (
    <section className={`h-full flex flex-col ${bg}`}>
      {/* MESSAGE AREA (ONLY THIS CAN BE OVERLAYED) */}
      <div className="relative flex-1 overflow-y-auto px-6 py-10">
        {isEmpty ? <EmptyState /> : <ChatStream />}
      </div>

      {/* INPUT AREA (NEVER COVERED) */}
      <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 px-4 py-3">
        <PendingFilesBar />
        <InputBar />
      </div>
    </section>
  );
}
