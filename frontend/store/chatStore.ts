import { create } from "zustand";

/* ---------- Types ---------- */

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

export type Message = {
  role: "user" | "assistant";
  content: string;
  files?: FileAttachment[];
};

export type Citation = {
  id: number;
  doc_id: string;
  page: number;
  quote: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  citations: Citation[];
};

type ThinkingStage = "searching" | "analyzing" | "answering" | null;

type DocumentMeta = {
  doc_id: string;
  filename: string;
  pages: number;
};

type ChatState = {
  chats: ChatSession[];
  currentChatId: string | null;

  typing: boolean;
  thinkingStage: ThinkingStage;

  documents: DocumentMeta[];

  /* 🔑 NEW */
  pendingFiles: PendingFile[];

  /* ---------- Chat ---------- */
  startNewChat: () => void;
  ensureChatExists: () => void;
  switchChat: (id: string) => void;

  addUserMessage: (msg: Message) => void;
  appendAssistantText: (text: string) => void;
  addCitation: (c: Citation) => void;

  /* ---------- State ---------- */
  setTyping: (v: boolean) => void;
  setThinkingStage: (s: ThinkingStage) => void;

  setDocuments: (d: DocumentMeta[]) => void;

  /* ---------- Pending files ---------- */
  addPendingFiles: (files: FileList) => void;
  removePendingFile: (id: string) => void;
  clearPendingFiles: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  typing: false,
  thinkingStage: null,

  documents: [],
  pendingFiles: [],

  ensureChatExists: () => {
    if (!get().currentChatId) get().startNewChat();
  },

  startNewChat: () => {
    const id = crypto.randomUUID();
    set((s) => ({
      chats: [{ id, title: "New chat", messages: [], citations: [] }, ...s.chats],
      currentChatId: id,
      pendingFiles: [],
      typing: false,
      thinkingStage: null,
    }));
  },

  switchChat: (id) =>
    set({ currentChatId: id, typing: false, thinkingStage: null }),

  addUserMessage: (msg) => {
    get().ensureChatExists();
    const { chats, currentChatId } = get();

    set({
      chats: chats.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title:
                c.messages.length === 0
                  ? msg.content.slice(0, 40)
                  : c.title,
              messages: [...c.messages, msg],
            }
          : c
      ),
    });
  },

  appendAssistantText: (text) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) => {
        if (c.id !== currentChatId) return c;
        const last = c.messages[c.messages.length - 1];

        if (!last || last.role !== "assistant") {
          return {
            ...c,
            messages: [...c.messages, { role: "assistant", content: text }],
          };
        }

        return {
          ...c,
          messages: [
            ...c.messages.slice(0, -1),
            { role: "assistant", content: last.content + text },
          ],
        };
      }),
    });
  },

  addCitation: (cit) =>
    set((s) => ({
      chats: s.chats.map((c) =>
        c.id === s.currentChatId
          ? { ...c, citations: [...c.citations, cit] }
          : c
      ),
    })),

  setTyping: (v) => set({ typing: v }),
  setThinkingStage: (s) => set({ thinkingStage: s }),
  setDocuments: (d) => set({ documents: d }),

  /* ---------- Pending files ---------- */

  addPendingFiles: (files) =>
    set((s) => ({
      pendingFiles: [
        ...s.pendingFiles,
        ...Array.from(files).map((f) => ({
          id: crypto.randomUUID(),
          file: f,
        })),
      ],
    })),

  removePendingFile: (id) =>
    set((s) => ({
      pendingFiles: s.pendingFiles.filter((f) => f.id !== id),
    })),

  clearPendingFiles: () => set({ pendingFiles: [] }),
}));
