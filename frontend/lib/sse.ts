import { useChatStore } from "@/store/chatStore";

let activeEventSource: EventSource | null = null;

/* ================================
   CONNECT SSE
================================ */
export function connectSSE(
  jobId: string,
  query: string,
  docIds: string[]
) {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  const params = new URLSearchParams({
    query,
    doc_ids: docIds.join(","),
  });

  const {
    startAssistantResponse,
    appendAssistantDelta,
    addCitationToResponse,
    addFollowUpQuestions,
    finalizeAssistantResponse,
    setTyping,
    setThinkingStage,
  } = useChatStore.getState();

  // ✅ CREATE assistant message ONCE
  startAssistantResponse();

  const es = new EventSource(
    `http://127.0.0.1:8000/stream/${jobId}?${params.toString()}`
  );

  activeEventSource = es;

  /* ---- OPEN ---- */
  es.onopen = () => {
    setTyping(true);
    setThinkingStage("answering");
  };

  /* ---- MESSAGE ---- */
  es.onmessage = (event) => {
    if (!event.data) return;

    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "text_delta":
          appendAssistantDelta(data.content);
          break;

        case "citation":
          addCitationToResponse(data.content);
          break;

        case "follow_up":
          addFollowUpQuestions(data.content);
          break;

        case "done":
          finalizeAssistantResponse();
          cleanup();
          break;
      }
    } catch (err) {
      console.error("SSE parse error", err);
    }
  };

  /* ---- ERROR ---- */
  es.onerror = () => {
    finalizeAssistantResponse();
    cleanup();
  };

  return es;
}

/* ================================
   STOP STREAM (⏹)
================================ */
export function stopSSE() {
  const { finalizeAssistantResponse } = useChatStore.getState();

  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  finalizeAssistantResponse();
}

function cleanup() {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }
}
