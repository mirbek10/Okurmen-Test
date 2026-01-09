import { create } from "zustand";
import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';

interface AdminStartPayload {
    id: number;
}

type UseAdminStartStore = {
    loading: boolean;
    error: string | null;
    res: any;
    start: (data: AdminStartPayload) => Promise<void>;
};

export const useAdminStartStore = create<UseAdminStartStore>((set) => ({
    loading: false,
    error: null,
    res: null,

    start: async ({ id }) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosAdmin.post('/admin/start', {
                id, // ⬅️ гарантированно number
            });

            set({ res: response.data });
        } catch (err) {
            set({
                error: err instanceof Error
                    ? err.message
                    : "Unknown error",
            });
        } finally {
            set({ loading: false });
        }
    },
}));
