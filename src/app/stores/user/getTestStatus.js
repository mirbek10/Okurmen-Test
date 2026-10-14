import { create } from "zustand";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export const useTestStatus = create((set, get) => ({
    loading: false,
    error: null,
    status: null,
    testDuration: null,
    startedAt: null,
    getStatus: async (code) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.get(`test/status/${code}`);
            const payload = response.data;
            set({
                status: typeof payload === "string" ? payload : payload.status,
                testDuration: typeof payload === "string" ? null : Number(payload.testDuration) || 30,
                startedAt: typeof payload === "string" ? null : Number(payload.startedAt) || null,
            });
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

