import { create } from "zustand";
import { axiosUser } from "@/shared/lib/api/axiosUser";

const getErrorMessage = (error) =>
    error.response?.data?.message || error.message || 'Не удалось сохранить ответы';

export const useSetAnswere = create((set) => ({
    loading: false,
    error: null,
    answere:null,
    postAnswe: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.post(`/test/answer`, data);
            const user = response.data;
            set({ answere: user });
            return user;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ error: message });
            throw new Error(message);
        } finally {
            set({ loading: false });
        }
    },
    forcePostAnswere: async (data) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.post(`/test/forceAnswers`, data);
            const user = response.data;
            set({ answere: user });
            return user;
        } catch (error) {
            const message = getErrorMessage(error);
            set({ error: message });
            throw new Error(message);
        } finally {
            set({ loading: false });
        }
    }
}));

