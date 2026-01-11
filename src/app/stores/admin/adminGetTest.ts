import { create } from "zustand";
import { axiosAdmin } from "../../../shared/lib/api/axiosAdmin";

interface AdminGetTestState {
    loading: boolean;
    error: string | null;
    tests: any[];
    getTests: () => Promise<void>;
    deleteTest: (id: number) => Promise<void>;
}

export const useAdminGetTestStore = create<AdminGetTestState>((set) => ({
    loading: false,
    error: null,
    tests: [],
    getTests: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.get('/admin/results');
            const tests = response.data;
            set({ tests });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
    deleteTest: async (id: number) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.delete(`/admin/tests/${id}`);
            const tests = response.data;
            set({ tests });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
}));