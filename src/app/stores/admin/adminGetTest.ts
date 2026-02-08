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
            set({ tests: response.data });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
    deleteTest: async (code: string | number) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosAdmin.delete(`/admin/tests/by-code/${code}`);

            if (response.data.success) {
                set((state) => ({
                    tests: state.tests.filter((test) =>
                        String(test.code) !== String(code)
                    )
                }));

            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
            set({ error: (error as any).response?.data?.message || (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
}));