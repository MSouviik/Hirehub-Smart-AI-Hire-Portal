import { create } from "zustand";
import { axiosInstance } from "../lib/axios-config";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URI = "http://localhost:5001"

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isLoggingIn: false,
    isSigningUp: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    isAuthenticated: false,

    onlineUsers: [],
    socket: null,

    setAuthUser: (user) => set({ authUser: user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),

    checkAuthentication: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({ authUser: res.data, isAuthenticated: true });
            get().connectSocket();
        } catch (error) {
            console.log("Error occured while checking authentication, Error: ", error.message ?? error.stack ?? err);
            set({ authUser: null, isAuthenticated: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },
    signup: async (data) => {
        set({ isSigningUp: true })
        try {
            const response = await axiosInstance.post("/auth/signup", data);
            set({ authUser: response.data, isAuthenticated: true });
            toast.success("Account Created Successfully.");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("auth/signout");
            set({ authUser: null, isAuthenticated: false });
            toast.success("User logged out successfully.")
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const response = await axiosInstance.post("/auth/login", data);
            set({ authUser: response.data, isAuthenticated: true });
            toast.success("Login Successful.");
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfileAvatar: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const response = await axiosInstance.post("auth/update-profile", data);
            set({ authUser: response.data });
            toast.success("Avatar Updated Successfully.");
        } catch (error) {
            console.log("Error in updating avatar", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URI, { query: { userId: authUser._id } });
        socket.connect();

        set({ socket: socket });

        socket.on("getOnlineUsers", (onlineUserIds) => {
            set({ onlineUsers: onlineUserIds });
        });
    },
    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));