import { create } from "zustand";
import { axiosAdmin } from "../../../shared/lib/api/axiosAdmin";

interface AdminGetTestState {
    loading: boolean;
    error: string | null;
    tests: any[];
    getTests: () => Promise<void>;
}

export const useAdminGetTestStore = create<AdminGetTestState>((set) => ({
    loading: false,
    error: null,
    tests: [],
    getTests: async () => {
        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.get('/admin/getTest');
            const tests = response.data;
            set({ tests });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    }
}));