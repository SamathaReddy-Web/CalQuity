import { useChatStore } from "@/store/chatStore";

/*
  SSE event protocol (expected):

  {
    type: "start"
  }

  {
    type: "text_delta",
    content: "partial text"
  }

  {
    type: "citation",
    content: { id, doc_id, page, quote }
  }

  {
    type: "ui_block",
    content: { type: "chart" | "table" | "card", data }
  }

  {
    type: "done"
  }
*/

let activeEventSource: EventSource | null = null;

/* ================================
   CONNECT SSE
================================ */
export function connectSSE(
  jobId: string,
  query: string,
  docIds: string[]
) {
  // Close any existing stream
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
    addUIBlockToResponse,
    finalizeAssistantResponse,
    setTyping,
    setThinkingStage,
  } = useChatStore.getState();

  const es = new EventSource(
    `http://127.0.0.1:8000/stream/${jobId}?${params.toString()}`
  );

  activeEventSource = es;

  /* ---- OPEN ---- */
  es.onopen = () => {
    setTyping(true);
    setThinkingStage("answering");
    startAssistantResponse();
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

        case "ui_block":
          addUIBlockToResponse(data.content);
          break;

        case "done":
          finalizeAssistantResponse();
          cleanup();
          break;

        default:
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
   STOP STREAM (ChatGPT-style ⏹)
================================ */
export function stopSSE() {
  const {
    finalizeAssistantResponse,
    setTyping,
    setThinkingStage,
  } = useChatStore.getState();

  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  setTyping(false);
  setThinkingStage(null);
  finalizeAssistantResponse();
}


function cleanup() {
  if (activeEventSource) {
    activeEventSource.close();
    activeEventSource = null;
  }

  const { setTyping, setThinkingStage } = useChatStore.getState();
  setTyping(false);
  setThinkingStage(null);
}
