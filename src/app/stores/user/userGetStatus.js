import { create } from "zustand";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export const useUserGetStatus = create((set, get) => ({
    loading: false,
    error: null,
    user: null,
    getStatus   : async (id, code) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.get(`student/status/${code}/${id}`);
            const user = response.data;
            
            set({ user });
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