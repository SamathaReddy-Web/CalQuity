// import { create } from "zustand";

// type Theme = "light" | "dark";

// type ThemeState = {
//   theme: Theme;
//   toggle: () => void;
// };

// export const useThemeStore = create<ThemeState>((set) => ({
//   theme: "dark",
//   toggle: () =>
//     set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
// }));

import { create } from "zustand";

type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
};

export const useThemeStore = create<ThemeState>((set) => ({
  // 🔒 ALWAYS same on server & client
  theme: "light",

  toggle: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", nextTheme);
      return { theme: nextTheme };
    }),

  setTheme: (theme) =>
    set(() => {
      localStorage.setItem("theme", theme);
      return { theme };
    }),
}));
