"use client";

import { useEffect, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";

const ACTIONS = [
  { title: "Summarize PDFs", prompt: "Summarize the uploaded documents", icon: "🧾" },
  { title: "Find information", prompt: "Find key information", icon: "🔍" },
  { title: "Explain concept", prompt: "Explain the main concept", icon: "🧠" },
  { title: "Compare data", prompt: "Compare important points", icon: "📊" },
];

export default function EmptyState() {
  const theme = useThemeStore((s) => s.theme);
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

  const cardBg =
    theme === "dark" ? "bg-neutral-900 hover:bg-neutral-800" : "bg-neutral-100 hover:bg-neutral-200";

  const chipBg =
    theme === "dark" ? "bg-neutral-800 hover:bg-neutral-700" : "bg-neutral-200 hover:bg-neutral-300";

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-10">
        <h1 className="text-3xl font-semibold">
          What do you want to explore?
        </h1>

        <div className="grid sm:grid-cols-2 gap-4">
          {ACTIONS.map((a) => (
            <button
              key={a.title}
              onClick={() => sendPrompt(a.prompt)}
              className={`
                text-left p-5 rounded-2xl
                ${cardBg}
                hover:scale-[1.02]
                transition-all duration-200
                shadow-sm hover:shadow-md
              `}
            >
              <div className="flex gap-4 items-start">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {a.prompt}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {recent.length > 0 && (
          <div className="text-left">
            <div className="text-xs text-neutral-400 mb-2">Recent</div>
            <div className="flex gap-2 flex-wrap">
              {recent.map((r, i) => (
                <button
                  key={i}
                  onClick={() => sendPrompt(r)}
                  className={`px-3 py-1 rounded-full text-xs ${chipBg} transition`}
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
