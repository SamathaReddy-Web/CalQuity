"use client";

import { useChatStore } from "@/store/chatStore";
import Citation from "./Citation";

export default function ChatStream() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const typing = useChatStore((s) => s.typing);
  const thinkingStage = useChatStore((s) => s.thinkingStage);

  const chat =
    currentChatId
      ? chats.find((c) => c.id === currentChatId)
      : null;

  const messages = chat?.messages ?? [];

  const stageText =
    thinkingStage === "searching"
      ? "🔍 Searching documents"
      : thinkingStage === "analyzing"
      ? "🧠 Analyzing context"
      : thinkingStage === "answering"
      ? "✍️ Generating answer"
      : null;

  function renderAssistant(content: string) {
    const lines = content
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    return (
      <ul className="space-y-2 list-disc pl-5">
        {lines.map((line, i) => {
          const parts = line.split(/(\[\d+\])/g);

          return (
            <li key={i} className="leading-7">
              {parts.map((p, idx) => {
                const match = p.match(/\[(\d+)\]/);
                if (match) {
                  return <Citation key={idx} id={Number(match[1])} />;
                }
                return <span key={idx}>{p}</span>;
              })}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="space-y-10 px-6 max-w-3xl mx-auto">
      {messages.map((m, i) => {
        const safeContent = String(m?.content ?? "");

        return (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`
                max-w-[80%]
                rounded-2xl px-6 py-4
                shadow-sm
                ${
                  m.role === "user"
                    ? "bg-neutral-200 dark:bg-neutral-800 text-right"
                    : "bg-neutral-100 dark:bg-neutral-900"
                }
                text-[15.5px] leading-7
              `}
            >
              {m.role === "assistant"
                ? renderAssistant(safeContent)
                : safeContent}
            </div>
          </div>
        );
      })}

      {typing && stageText && (
        <div className="flex items-center gap-2 text-xs text-neutral-500 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
          <span>{stageText}…</span>
        </div>
      )}
    </div>
  );
}
