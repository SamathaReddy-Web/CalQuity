"use client";

import ChatStream from "./ChatStream";
import InputBar from "./InputBar";
import EmptyState from "./EmptyState";
import { useChatStore } from "@/store/chatStore";

export default function ChatArea() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);

  const currentChat =
    currentChatId
      ? chats.find((c) => c.id === currentChatId)
      : null;

  const messages = currentChat?.messages ?? [];
  const showEmpty = messages.length === 0;

  return (
    <main className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          {showEmpty ? <EmptyState /> : <ChatStream />}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white dark:bg-black pt-4 pb-6">
        <InputBar />
      </div>
    </main>
  );
}
