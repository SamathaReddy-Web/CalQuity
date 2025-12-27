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

export function connectSSE(
  jobId: string,
  query: string,
  docIds: string[]
) {
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

  es.onopen = () => {
    setTyping(true);
    setThinkingStage("answering");
    startAssistantResponse();
  };

  es.onmessage = (event) => {
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
          es.close();
          break;

        default:
          break;
      }
    } catch (e) {
      console.error("SSE parse error", e);
    }
  };

  es.onerror = () => {
    finalizeAssistantResponse();
    es.close();
  };

  return es;
}
