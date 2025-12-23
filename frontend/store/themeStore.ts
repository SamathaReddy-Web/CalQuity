import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  // 🔒 Same on server & client → avoids hydration issues
  theme: "light",

  toggle: () =>
    set((state) => {
      const next = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      return { theme: next };
    }),

  setTheme: (theme) =>
    set(() => {
      localStorage.setItem("theme", theme);
      return { theme };
    }),
}));
