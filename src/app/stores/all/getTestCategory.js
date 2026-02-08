import { create } from "zustand";
import { axiosAdmin } from "../../../shared/lib/api/axiosAdmin";

export const useTestCategoryStore = create((set) => ({
    testCategories: [],
    loading: false,
    error: null,

    fetchTestCategories: async () => {
        try {
            set({ loading: true, error: null });

            const response = await axiosAdmin.get("questions/getCategory");
            set({
                testCategories: response.data,
                loading: false
            });
        } catch (error) {
            console.error("Ошибка при получении категорий:", error);
            set({
                error: error.response?.data?.message || "Ошибка сервера",
                loading: false
            });
        }
    }
}));