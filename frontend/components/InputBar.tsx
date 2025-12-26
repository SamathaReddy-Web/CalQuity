"use client";

import { useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import { connectSSE } from "@/lib/sse";

export default function InputBar() {
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const theme = useThemeStore((s) => s.theme);

  const {
    addUserMessage,
    appendAssistantText,
    setTyping,
    setThinkingStage,
    addCitation,
    setDocuments,
    pendingFiles,
    addPendingFiles,
    clearPendingFiles,
  } = useChatStore();

  const surface =
    theme === "dark"
      ? "bg-neutral-900 border-neutral-800"
      : "bg-white border-neutral-300";

  const sendBtn =
    theme === "dark" ? "bg-white text-black" : "bg-black text-white";

  /* ✅ ONLY STORE FILES LOCALLY */
  function onSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    addPendingFiles(e.target.files);
    e.target.value = "";
  }

  async function sendMessage() {
    if (!q.trim() && pendingFiles.length === 0) return;

    /* 1️⃣ Upload files */
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

    /* 2️⃣ Store USER message with files */
    addUserMessage({
      role: "user",
      content: q,
      files: uploaded,
    });

    clearPendingFiles();
    setQ("");

    /* 3️⃣ Send to backend */
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

    connectSSE(job_id, q, uploaded.map((f) => f.doc_id), (event) => {
      if (!event?.type) return;

      if (event.type === "typing") setTyping(event.content.typing);
      if (event.type === "text") appendAssistantText(event.content);
      if (event.type === "citation") addCitation(event.content);
    });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${surface}`}>
        <button onClick={() => fileRef.current?.click()} className="text-lg">
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

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything about your documents…"
          className="flex-1 bg-transparent outline-none text-sm"
        />

        <button
          onClick={sendMessage}
          className={`px-3 py-1 rounded-lg ${sendBtn}`}
        >
          →
        </button>
      </div>
    </div>
  );
}
