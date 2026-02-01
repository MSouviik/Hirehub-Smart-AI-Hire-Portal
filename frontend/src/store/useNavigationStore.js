import { create } from "zustand";

/**
 * Zustand store for managing the active tab state across the application.
 */
export const useNavigationStore = create((set) => ({
    // State
    activeTab: "jobs", // 'jobs' is the default active tab

    // Actions (Setter function)
    /**
     * Sets the currently active navigation tab.
     * @param {string} tab The ID of the tab to activate ('jobs', 'chats', 'profile').
     */
    setActiveTab: (tab) => set({ activeTab: tab }),
}));