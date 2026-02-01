import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("ui-theme-store") || "light",
    setTheme: (theme) => {
        localStorage.setItem("ui-theme-store", theme);
        set({ theme })
    }
}));