import { create } from "zustand";
import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';

interface GetTestByIdState {
    loading: boolean;
    error: string | null;
    test: any;
    getTestById: (id: string) => Promise<void>;
}

export const useTestStore = create<GetTestByIdState>((set) => ({
    loading: false,
    error: null,
    test: null,
    getTestById: async (id: string) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.get(`admin/getTest/${id}`);
            const test = response.data;
            set({ test });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
}));