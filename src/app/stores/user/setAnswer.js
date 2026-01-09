import { create } from "zustand";
import { axiosUser } from "@/shared/lib/api/axiosUser";

export const useSetAnswere = create((set, get) => ({
    loading: false,
    error: null,
    answere:null,
    postAnswe: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.post(`/test/answer`, data);
            const user = response.data;
            set({ answere: user });
        } catch (error) {
            set({ error: (error).message });
        } finally {
            set({ loading: false });
        }
    },
}));