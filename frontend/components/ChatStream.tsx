"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import Citation from "./Citation";

export default function ChatStream() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const typing = useChatStore((s) => s.typing);
  const thinkingStage = useChatStore((s) => s.thinkingStage);
  const theme = useThemeStore((s) => s.theme);

  const chat = currentChatId
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

  /* 🎨 Theme tokens */
  const userBubble =
    theme === "dark"
      ? "bg-neutral-800 text-neutral-100"
      : "bg-neutral-200 text-neutral-900";

  const assistantBubble =
    theme === "dark"
      ? "bg-neutral-900 text-neutral-100"
      : "bg-white text-neutral-900";

  const mutedText =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

    function normalizeText(content: any): string {
    if (typeof content === "string") return content;
    if (typeof content === "object" && typeof content?.content === "string") {
      return content.content;
    }
    return "";
  }

  /* ---------- Assistant rendering ---------- */
  function renderAssistant(content: string) {
    // if (!content.trim()) {
    //   return <span className={mutedText}>Thinking…</span>;
    // }

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

  /* ---------- File attachment rendering ---------- */
  function renderFiles(files: any[]) {
    return (
      <div className="mb-3 space-y-2">
        {files.map((f) => (
          <div
            key={f.doc_id}
            className={`
              flex items-center gap-3
              rounded-lg px-4 py-2
              border text-sm
              ${
                theme === "dark"
                  ? "bg-neutral-800 border-neutral-700"
                  : "bg-neutral-100 border-neutral-300"
              }
            `}
          >
            <span className="text-lg">📄</span>

            <div className="flex-1 overflow-hidden">
              <div className="font-medium truncate">{f.filename}</div>
              <div className={`text-xs ${mutedText}`}>
                {f.pages ? `${f.pages} pages` : "PDF document"}
                {f.size && ` • ${(f.size / 1024).toFixed(1)} KB`}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 px-6 max-w-3xl mx-auto">
      {messages.map((m, i) => {
        const isUser = m.role === "user";

        const text = normalizeText(m.content);

        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[80%]
                rounded-2xl px-6 py-4
                shadow-sm
                ${isUser ? userBubble : assistantBubble}
                text-[15.5px] leading-7
              `}
            >
              {/* 📎 FILE ATTACHMENTS */}
              {Array.isArray((m as any).files) &&
                (m as any).files.length > 0 &&
                renderFiles((m as any).files)}

              {/* 💬 MESSAGE CONTENT */}
              {m.role === "assistant"
                ? renderAssistant(text)
                : text}
            </div>
          </div>
        );
      })}

      {/* ⏳ TYPING STATE */}
      {typing && stageText && (
        <div
          className={`flex items-center gap-2 text-xs ${mutedText} animate-pulse`}
        >
          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
          <span>{stageText}…</span>
        </div>
      )}
    </div>
  );
}
