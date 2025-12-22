import { create } from "zustand";

/* ---------- Types ---------- */

export type Message = {
  role: "user" | "assistant";
  content: string;
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

type UploadingFile = {
  name: string;
  progress: number;
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
  selectedDocs: string[]; // ✅ NEW
  uploading: UploadingFile[];

  startNewChat: () => void;
  ensureChatExists: () => void;
  switchChat: (id: string) => void;

  addUserMessage: (text: string) => void;
  appendAssistantText: (text: string) => void;
  addCitation: (c: Citation) => void;

  setTyping: (v: boolean) => void;
  setThinkingStage: (s: ThinkingStage) => void;

  setDocuments: (d: DocumentMeta[]) => void;
  toggleDoc: (docId: string) => void;
  clearSelectedDocs: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChatId: null,

  typing: false,
  thinkingStage: null,

  documents: [],
  selectedDocs: [],
  uploading: [],

  ensureChatExists: () => {
    if (get().currentChatId) return;
    get().startNewChat();
  },

  startNewChat: () => {
    const id = crypto.randomUUID();
    set((s) => ({
      chats: [
        { id, title: "New chat", messages: [], citations: [] },
        ...s.chats,
      ],
      currentChatId: id,
      selectedDocs: [], // reset attachments
      typing: false,
      thinkingStage: null,
    }));
  },

  switchChat: (id) =>
    set({ currentChatId: id, typing: false, thinkingStage: null }),

  addUserMessage: (text) => {
    get().ensureChatExists();
    const { chats, currentChatId } = get();

    set({
      chats: chats.map((c) =>
        c.id === currentChatId
          ? {
              ...c,
              title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
              messages: [...c.messages, { role: "user", content: text }],
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
          return { ...c, messages: [...c.messages, { role: "assistant", content: text }] };
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

  addCitation: (cit) => {
    const { chats, currentChatId } = get();
    if (!currentChatId) return;

    set({
      chats: chats.map((c) =>
        c.id === currentChatId
          ? { ...c, citations: [...c.citations, cit] }
          : c
      ),
    });
  },

  setTyping: (v) => set({ typing: v }),
  setThinkingStage: (s) => set({ thinkingStage: s }),

  setDocuments: (d) => set({ documents: d }),

  toggleDoc: (docId) =>
    set((s) => ({
      selectedDocs: s.selectedDocs.includes(docId)
        ? s.selectedDocs.filter((id) => id !== docId)
        : [...s.selectedDocs, docId],
    })),

  clearSelectedDocs: () => set({ selectedDocs: [] }),
}));
