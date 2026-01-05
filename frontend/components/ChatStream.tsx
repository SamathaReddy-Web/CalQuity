"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import Citation from "./Citation";

export default function ChatStream() {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const typing = useChatStore((s) => s.typing);
  const thinkingStage = useChatStore((s) => s.thinkingStage);
  const sendFollowUp = useChatStore((s) => s.sendFollowUp);
  const theme = useThemeStore((s) => s.theme);

  const chat = currentChatId
    ? chats.find((c) => c.id === currentChatId)
    : null;

  const messages = chat?.messages ?? [];

  const mutedText =
    theme === "dark" ? "text-neutral-400" : "text-neutral-500";

  function renderAssistantText(text: string) {
    const paragraphs = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    return (
      <div className="space-y-3">
        {paragraphs.map((para, i) => {
          const parts = para.split(/(\[\d+\])/g);

          return (
            <div key={i} className="leading-7">
              {parts.map((p, idx) => {
                const match = p.match(/\[(\d+)\]/);
                if (match) {
                  return <Citation key={idx} id={Number(match[1])} />;
                }
                return <span key={idx}>{p}</span>;
              })}
            </div>
          );
        })}
      </div>
    );
  }

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
                {f.pages} pages • {(f.size / 1024).toFixed(1)} KB
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 max-w-3xl mx-auto">
      {messages.map((m, i) => {
        const isUser = m.role === "user";

        return (
          <div
            key={i}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[75%]
                rounded-2xl px-6 py-4
                shadow-sm
                ${
                  isUser
                    ? theme === "dark"
                      ? "bg-neutral-800 text-neutral-100"
                      : "bg-neutral-200 text-neutral-900"
                    : theme === "dark"
                    ? "bg-neutral-900 text-neutral-100"
                    : "bg-white text-neutral-900 border border-neutral-200"
                }
              `}
            >
              {isUser &&
                Array.isArray(m.files) &&
                m.files.length > 0 &&
                renderFiles(m.files)}

              {m.role === "assistant"
                ? renderAssistantText(m.response.text)
                : m.content}

              {/* ✅ FOLLOW-UPS NOW WORK */}
              {m.role === "assistant" &&
                m.response.completed &&
                !typing &&
                m.response.followUpQuestions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {m.response.followUpQuestions.map((f, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendFollowUp(f)}
                        className={`
                          px-3 py-1.5 text-xs rounded-full
                          transition
                          ${
                            theme === "dark"
                              ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                          }
                        `}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        );
      })}

      {typing && thinkingStage && (
        <div className={`flex items-center gap-2 text-xs ${mutedText}`}>
          <span className="w-2 h-2 rounded-full bg-neutral-400 animate-pulse" />
          <span>{thinkingStage}…</span>
        </div>
      )}
    </div>
  );
}
