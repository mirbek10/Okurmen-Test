import { create } from "zustand";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export const useTestStatus = create((set, get) => ({
    loading: false,
    error: null,
    status: null,
    getStatus: async (code) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.get(`test/status/${code}`);
            const user = response.data;

            set({ status: user });
        } catch (error) {
            set({ error: (error).message });
        } finally {
            set({ loading: false });
        }
    },
    logout: () => {
        set({ user: null });
    }
}));