import { create } from "zustand";
import { axiosAdmin } from "../../../shared/lib/api/axiosAdmin";

interface AdminFinishTestState {
    loading: boolean;
    error: string | null;
    res: any;
    finish: (id: number) => Promise<void>
}

export const useAdminFinishTestStore = create<AdminFinishTestState>((set) => ({
    loading: false,
    error: null,
    res: null,
    finish: async (id) => {
        try {
            set({ loading: true });
            const res = await axiosAdmin.post(`admin/finish`, { id });
            set({ loading: false, res: res.data });
        } catch (error: any) {
            set({ loading: false, error: error.message });
        }
    }
}));