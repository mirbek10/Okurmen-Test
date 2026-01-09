import { create } from "zustand"
import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';

interface adminData {
    category: string;
    maxStudents: number;
    testDuration: number
}

type useAdminPreviewStore = {
    loading: boolean;
    error: string | null;
    res: any;
    start: (data: adminData) => void;
}

export const useAdminPreviewStore = create<useAdminPreviewStore>((set, get) => ({
    loading: false,
    error: null,
    res: null,
    start: async (data: adminData) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.post('/admin/preview',
                data
            );
            const admin = response.data;
            set({ res: admin });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    }
}))