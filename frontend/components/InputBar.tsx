"use client";

import { useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";
import { connectSSE } from "@/lib/sse";

export default function InputBar() {
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const appendAssistantText = useChatStore((s) => s.appendAssistantText);
  const setTyping = useChatStore((s) => s.setTyping);
  const setThinkingStage = useChatStore((s) => s.setThinkingStage);
  const addCitation = useChatStore((s) => s.addCitation);
  const setDocuments = useChatStore((s) => s.setDocuments);

  /* ---------------- FILE UPLOAD ---------------- */

  async function uploadFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    for (const file of Array.from(e.target.files)) {
      const form = new FormData();
      form.append("file", file);

      await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: form,
      });
    }

    // Refresh document list
    const res = await fetch("http://127.0.0.1:8000/documents");
    setDocuments(await res.json());

    e.target.value = "";
  }

  /* ---------------- SEND MESSAGE ---------------- */

  async function sendMessage() {
    if (!q.trim()) return;

    const query = q.trim();
    setQ("");

    addUserMessage(query);
    setTyping(true);
    setThinkingStage("searching");

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const { job_id } = await res.json();

    connectSSE(job_id, query, (event) => {
      if (!event || !event.type) return;

      switch (event.type) {
        case "typing": {
          setTyping(Boolean(event.content?.typing));
          break;
        }

        case "tool": {
          const msg = event.content?.message ?? "";

          if (msg.includes("Searching")) setThinkingStage("searching");
          else if (msg.includes("Reading")) setThinkingStage("analyzing");
          else setThinkingStage("answering");

          break;
        }

        case "text": {
          // ✅ CORRECT STRING EXTRACTION
          const value =
            typeof event.content === "string"
              ? event.content
              : event.content?.content;

          if (typeof value === "string") {
            appendAssistantText(value);
          }
          break;
        }

        case "citation": {
          addCitation(event.content);
          break;
        }

        default:
          break;
      }
    });
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-white dark:bg-neutral-900">
        {/* Attach PDF */}
        <button
          onClick={() => fileRef.current?.click()}
          className="text-lg hover:opacity-70"
          title="Upload PDF"
        >
          📎
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={uploadFiles}
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
          className="px-3 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black"
        >
          →
        </button>
      </div>
    </div>
  );
}
