import { create } from "zustand";

/* ===================== TYPES ===================== */

export type FileAttachment = {
  doc_id: string;
  filename: string;
  pages: number;
  size: number;
};

export type PendingFile = {
  id: string;
  file: File;
};

export type Citation = {
  id: number;
  doc_id: string;
  page: number;
  quote: string;
};

export type UIBlock =
  | { type: "chart"; data: any }
  | { type: "table"; data: any }
  | { type: "card"; data: any };

export type AssistantResponse = {
  id: string;
  text: string;
  completed: boolean;
  citations: Citation[];
  uiBlocks: UIBlock[];
  followUpQuestions: string[];
};

export type Message =
  | {
      role: "user";
      content: string;
      files?: FileAttachment[];
    }
  | {
      role: "assistant";
      response: AssistantResponse;
    };

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
};

export type ThinkingStage = "searching" | "analyzing" | "answering" | null;

/* ===================== STATE ===================== */

type ChatState = {
  chats: ChatSession[];
  currentChatId: string | null;

  /* typing & stages */
  typing: boolean;
  thinkingStage: ThinkingStage;
  setTyping: (v: boolean) => void;
  setThinkingStage: (s: ThinkingStage) => void;

  /* files */
  pendingFiles: PendingFile[];
  addPendingFiles: (files: FileList) => void;
  removePendingFile: (id: string) => void;
  clearPendingFiles: () => void;

  /* pdf viewer */
  activeCitation: Citation | null;
  viewerOpen: boolean;

  /* chat navigation */
  startNewChat: () => void;
  switchChat: (id: string) => void;
  deleteChat: (id: string) => void;

  /* messages */
  addUserMessage: (msg: {
    content: string;
    files?: FileAttachment[];
  }) => void;

  /* assistant */
  startAssistantResponse: () => void;
  appendAssistantDelta: (delta: string) => void;
  addCitationToResponse: (citation: Citation) => void;
  addFollowUpQuestions: (questions: string[]) => void;
  finalizeAssistantResponse: () => void;

  /* follow-up actions */
  sendFollowUp: (prompt: string) => Promise<void>;

  /* citation */
  getCitationById: (id: number) => Citation | null;

  /* viewer */
  openPdfViewer: (citation: Citation) => void;
  closePdfViewer: () => void;
};

/* ===================== STORE ===================== */

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  /* ---------- typing ---------- */

  typing: false,
  thinkingStage: null,
  setTyping: (v) => set({ typing: v }),
  setThinkingStage: (s) => set({ thinkingStage: s }),

  /* ---------- files ---------- */

  pendingFiles: [],

  addPendingFiles: (files) =>
    set({
      pendingFiles: Array.from(files).map((f) => ({
        id: crypto.randomUUID(),
        file: f,
      })),
    }),

  removePendingFile: (id) =>
    set((state) => ({
      pendingFiles: state.pendingFiles.filter((pf) => pf.id !== id),
    })),

  clearPendingFiles: () => set({ pendingFiles: [] }),

  /* ---------- pdf viewer ---------- */

  activeCitation: null,
  viewerOpen: false,

  /* ---------- chat navigation ---------- */

  startNewChat: () => {
    const id = crypto.randomUUID();
    set((state) => ({
      chats: [
        {
          id,
          title: "New chat",
          messages: [],
        },
        ...state.chats,
      ],
      currentChatId: id,
      typing: false,
      thinkingStage: null,
      activeCitation: null,
      viewerOpen: false,
      pendingFiles: [],
    }));
  },

  switchChat: (id) =>
    set({
      currentChatId: id,
      typing: false,
      thinkingStage: null,
      activeCitation: null,
      viewerOpen: false,
      pendingFiles: [],
    }),

  deleteChat: (id) =>
    set((state) => {
      const remaining = state.chats.filter((c) => c.id !== id);
      return {
        chats: remaining,
        currentChatId:
          state.currentChatId === id
            ? remaining[0]?.id ?? null
            : state.currentChatId,
      };
    }),

  /* ---------- messages ---------- */

  addUserMessage: ({ content, files }) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title:
                c.messages.length === 0
                  ? content.slice(0, 40)
                  : c.title,
              messages: [...c.messages, { role: "user", content, files }],
            }
          : c
      ),
      pendingFiles: [],
    });
  },

  /* ---------- assistant ---------- */

  startAssistantResponse: () => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  role: "assistant",
                  response: {
                    id: crypto.randomUUID(),
                    text: "",
                    completed: false,
                    citations: [],
                    uiBlocks: [],
                    followUpQuestions: [],
                  },
                },
              ],
            }
          : c
      ),
      typing: true,
      thinkingStage: "searching",
    });
  },

  appendAssistantDelta: (delta) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) => {
        if (c.id !== currentChatId) return c;
        const last = c.messages.at(-1);
        if (!last || last.role !== "assistant") return c;

        return {
          ...c,
          messages: [
            ...c.messages.slice(0, -1),
            {
              role: "assistant",
              response: {
                ...last.response,
                text: last.response.text + delta,
              },
            },
          ],
        };
      }),
    });
  },

  addCitationToResponse: (citation) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) => {
        if (c.id !== currentChatId) return c;
        const last = c.messages.at(-1);
        if (!last || last.role !== "assistant") return c;

        return {
          ...c,
          messages: [
            ...c.messages.slice(0, -1),
            {
              role: "assistant",
              response: {
                ...last.response,
                citations: [...last.response.citations, citation],
              },
            },
          ],
        };
      }),
    });
  },

  addFollowUpQuestions: (questions) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) => {
        if (c.id !== currentChatId) return c;
        const last = c.messages.at(-1);
        if (!last || last.role !== "assistant") return c;

        return {
          ...c,
          messages: [
            ...c.messages.slice(0, -1),
            {
              role: "assistant",
              response: {
                ...last.response,
                followUpQuestions: questions,
              },
            },
          ],
        };
      }),
    });
  },

  finalizeAssistantResponse: () =>
    set({ typing: false, thinkingStage: null }),

  /* ---------- FOLLOW-UP ACTIONS ---------- */

  sendFollowUp: async (prompt) => {
    const { currentChatId, addUserMessage, setTyping, setThinkingStage } = get();
    if (!currentChatId) return;

    addUserMessage({ content: prompt });

    setTyping(true);
    setThinkingStage("searching");

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: prompt,
        doc_ids: [],
      }),
    });

    const { job_id } = await res.json();

    const { connectSSE } = await import("@/lib/sse");
    connectSSE(job_id, prompt, []);
  },

  /* ---------- citation ---------- */

  getCitationById: (id) => {
    const chat = get().chats.find(
      (c) => c.id === get().currentChatId
    );
    if (!chat) return null;

    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const m = chat.messages[i];
      if (m.role === "assistant") {
        const found = m.response.citations.find((c) => c.id === id);
        if (found) return found;
      }
    }
    return null;
  },

  /* ---------- viewer ---------- */

  openPdfViewer: (citation) =>
    set({ activeCitation: citation, viewerOpen: true }),

  closePdfViewer: () =>
    set({ activeCitation: null, viewerOpen: false }),
}));
