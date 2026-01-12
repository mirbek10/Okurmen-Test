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
    deleteTest: async (id: string | number) => { // id может быть и строкой (ObjectId)
        try {
            set({ loading: true, error: null });
            
            // Отправляем запрос на удаление
            const response = await axiosAdmin.delete(`/admin/tests/${id}`);
            
            if (response.data.success) {
                // ОБНОВЛЯЕМ СОСТОЯНИЕ ПРАВИЛЬНО:
                // Оставляем в массиве только те тесты, id которых НЕ совпадает с удаленным
                set((state) => ({
                    tests: state.tests.filter((test) => 
                        test.id !== id && test._id !== id
                    )
                }));
            }
        } catch (error) {
            console.error("Ошибка при удалении:", error);
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
}));