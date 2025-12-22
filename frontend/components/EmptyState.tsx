"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";

const ACTIONS = [
  { title: "Summarize PDFs", prompt: "Summarize the uploaded documents", icon: "🧾" },
  { title: "Find information", prompt: "Find key information", icon: "🔍" },
  { title: "Explain concept", prompt: "Explain the main concept", icon: "🧠" },
  { title: "Compare data", prompt: "Compare important points", icon: "📊" },
];

export default function EmptyState() {
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const setTyping = useChatStore((s) => s.setTyping);

  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const r = localStorage.getItem("recent-prompts");
    if (r) setRecent(JSON.parse(r));
  }, []);

  function sendPrompt(p: string) {
    addUserMessage(p);
    setTyping(true);

    const updated = [p, ...recent.filter((x) => x !== p)].slice(0, 3);
    setRecent(updated);
    localStorage.setItem("recent-prompts", JSON.stringify(updated));
  }

  return (
    /* 🔑 Absolute centering inside chat area */
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        
        {/* Title */}
        <h1 className="text-3xl font-semibold text-black dark:text-white">
          What do you want to explore?
        </h1>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {ACTIONS.map((a) => (
            <button
              key={a.title}
              onClick={() => sendPrompt(a.prompt)}
              className="
                text-left p-5 rounded-2xl
                bg-neutral-100 dark:bg-neutral-900
                hover:bg-neutral-200 dark:hover:bg-neutral-800
                hover:scale-[1.02]
                transition-all duration-200
                shadow-sm hover:shadow-md
              "
            >
              <div className="flex gap-4 items-start">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-medium text-black dark:text-white">
                    {a.title}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {a.prompt}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent prompts */}
        {recent.length > 0 && (
          <div className="text-left">
            <div className="text-xs text-neutral-400 mb-2">
              Recent
            </div>
            <div className="flex gap-2 flex-wrap">
              {recent.map((r, i) => (
                <button
                  key={i}
                  onClick={() => sendPrompt(r)}
                  className="
                    px-3 py-1 rounded-full text-xs
                    bg-neutral-200 dark:bg-neutral-800
                    hover:bg-neutral-300 dark:hover:bg-neutral-700
                    transition
                  "
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
