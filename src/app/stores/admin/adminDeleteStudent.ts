import { create } from "zustand";
import { axiosAdmin } from "../../../shared/lib/api/axiosAdmin";

type AdminDeleteStudentState = {
    loading: boolean;
    error: string | null;
    res: any;
    // Изменили название на более логичное и уточнили типы
    deleteStudent: ({ testId, studentId }: { testId: string | number, studentId: string | number }) => Promise<void>;
}

export const useAdminDeleteStudentStore = create<AdminDeleteStudentState>((set) => ({
    loading: false,
    error: null,
    res: null,
    deleteStudent: async ({ testId, studentId }) => {
        try {
            set({ loading: true, error: null });

            // Axios передает body в DELETE именно через ключ data
            const response = await axiosAdmin.delete('admin/delete/student', {
                data: {
                    testId: Number(testId), // Принудительно приводим к числу, если бэк строгий
                    studentId: Number(studentId)
                }
            });

            set({ res: response.data });
        } catch (err: any) {
            set({
                error: err.response?.data?.message || err.message || "Unknown error",
            });
        } finally {
            set({ loading: false });
        }
    }
}))