"use client";

import { useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import { connectSSE, stopSSE } from "@/lib/sse";

export default function InputBar() {
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const theme = useThemeStore((s) => s.theme);

  const {
    addUserMessage,
    setTyping,
    setThinkingStage,
    pendingFiles,
    addPendingFiles,
    clearPendingFiles,
    typing,
  } = useChatStore();

  /* ===== THEME TOKENS ===== */
  const container =
    theme === "dark"
      ? "bg-neutral-900 border border-neutral-600 shadow-lg"
      : "bg-white border border-neutral-300";

  const inputText =
    theme === "dark"
      ? "text-neutral-100 placeholder:text-neutral-400"
      : "text-neutral-900 placeholder:text-neutral-500";

  const sendBtn =
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md"
      : "bg-neutral-900 hover:bg-neutral-800 text-white";

  const disabledBtn =
    theme === "dark"
      ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
      : "bg-neutral-200 text-neutral-400 cursor-not-allowed";

  /* 📎 Select files */
  function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    addPendingFiles(e.target.files);
    e.target.value = "";
  }

  async function sendMessage() {
    if (!q.trim() && pendingFiles.length === 0) return;

    const uploaded = [];

    for (const pf of pendingFiles) {
      const form = new FormData();
      form.append("file", pf.file);

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      uploaded.push({
        doc_id: data.doc_id,
        filename: data.filename,
        pages: data.pages,
        size: pf.file.size,
      });
    }

    addUserMessage({ content: q, files: uploaded });
    clearPendingFiles();
    setQ("");

    setTyping(true);
    setThinkingStage("searching");

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: q,
        doc_ids: uploaded.map((f) => f.doc_id),
      }),
    });

    const { job_id } = await res.json();
    connectSSE(job_id, q, uploaded.map((f) => f.doc_id));
  }

  function stopStreaming() {
    stopSSE();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2 transition ${container}`}
      >
        {/* Attach */}
        <button
          onClick={() => fileRef.current?.click()}
          className={`p-1.5 rounded-md ${
            theme === "dark"
              ? "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              : "text-neutral-500 hover:bg-neutral-100"
          }`}
        >
          📎
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={onSelectFiles}
        />

        {/* Input */}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !typing && sendMessage()}
          placeholder="Ask anything…"
          className={`flex-1 bg-transparent outline-none text-sm ${inputText}`}
          disabled={typing}
        />

        {/* Send / Stop */}
        <button
          onClick={typing ? stopStreaming : sendMessage}
          disabled={!typing && !q.trim() && pendingFiles.length === 0}
          className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition
            ${
              typing
                ? "bg-red-600 hover:bg-red-500 text-white"
                : !q.trim() && pendingFiles.length === 0
                ? disabledBtn
                : sendBtn
            }`}
        >
          {typing ? "⏹" : "➤"}
        </button>
      </div>
    </div>
  );
}
