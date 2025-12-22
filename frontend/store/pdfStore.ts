import { create } from "zustand";
import { Citation } from "./chatStore";

type PdfState = {
  isOpen: boolean;
  activeCitation: Citation | null;
  allCitations: Citation[];

  open: (c: Citation, all: Citation[]) => void;
  close: () => void;
};

export const usePdfStore = create<PdfState>((set) => ({
  isOpen: false,
  activeCitation: null,
  allCitations: [],

  open: (c, all) =>
    set({
      isOpen: true,
      activeCitation: c,
      allCitations: Array.isArray(all) ? all : [],
    }),

  close: () =>
    set({
      isOpen: false,
      activeCitation: null,
      allCitations: [],
    }),
}));
