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

type ThinkingStage = "searching" | "analyzing" | "answering" | null;

type DocumentMeta = {
  doc_id: string;
  filename: string;
  pages: number;
};

/* ===================== STATE ===================== */

type ChatState = {
  chats: ChatSession[];
  currentChatId: string | null;

  typing: boolean;
  thinkingStage: ThinkingStage;

  documents: DocumentMeta[];
  pendingFiles: PendingFile[];

  /* PDF Viewer */
  activeCitation: Citation | null;
  viewerOpen: boolean;

  /* ---------- CHAT ---------- */
  startNewChat: () => void;
  ensureChatExists: () => void;
  addUserMessage: (msg: {
    content: string;
    files?: FileAttachment[];
  }) => void;

  /* ---------- ASSISTANT STREAM ---------- */
  startAssistantResponse: () => void;
  appendAssistantDelta: (delta: string) => void;
  addCitationToResponse: (citation: Citation) => void;
  finalizeAssistantResponse: () => void;

  /* ---------- CITATION SELECTOR ---------- */
  getCitationById: (id: number) => Citation | null;

  /* ---------- VIEWER ---------- */
  openPdfViewer: (citation: Citation) => void;
  closePdfViewer: () => void;

  /* ---------- STATE ---------- */
  setTyping: (v: boolean) => void;
  setThinkingStage: (s: ThinkingStage) => void;
  setDocuments: (d: DocumentMeta[]) => void;

  /* ---------- FILES ---------- */
  addPendingFiles: (files: FileList) => void;
  clearPendingFiles: () => void;
};

/* ===================== STORE ===================== */

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  typing: false,
  thinkingStage: null,

  documents: [],
  pendingFiles: [],

  activeCitation: null,
  viewerOpen: false,

  /* ---------- CHAT ---------- */

  ensureChatExists: () => {
    if (!get().currentChatId) get().startNewChat();
  },

  startNewChat: () => {
    const id = crypto.randomUUID();
    set({
      chats: [{ id, title: "New chat", messages: [] }],
      currentChatId: id,
      typing: false,
      thinkingStage: null,
      activeCitation: null,
      viewerOpen: false,
    });
  },

  addUserMessage: ({ content, files }) => {
    get().ensureChatExists();
    const { chats, currentChatId } = get();

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
    });
  },

  /* ---------- ASSISTANT STREAM ---------- */

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
                  },
                },
              ],
            }
          : c
      ),
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

  finalizeAssistantResponse: () =>
    set({ typing: false, thinkingStage: null }),

  /* ---------- SAFE CITATION SELECTOR ---------- */

  getCitationById: (id) => {
    const { chats, currentChatId } = get();
    const chat = chats.find((c) => c.id === currentChatId);
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

  /* ---------- PDF VIEWER ---------- */

  openPdfViewer: (citation) =>
    set({
      activeCitation: citation,
      viewerOpen: true,
    }),

  closePdfViewer: () =>
    set({
      activeCitation: null,
      viewerOpen: false,
    }),

  /* ---------- STATE ---------- */

  setTyping: (v) => set({ typing: v }),
  setThinkingStage: (s) => set({ thinkingStage: s }),
  setDocuments: (d) => set({ documents: d }),

  /* ---------- FILES ---------- */

  addPendingFiles: (files) =>
    set({
      pendingFiles: Array.from(files).map((f) => ({
        id: crypto.randomUUID(),
        file: f,
      })),
    }),

  clearPendingFiles: () => set({ pendingFiles: [] }),
}));
