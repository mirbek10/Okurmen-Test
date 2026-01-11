import { create } from 'zustand';
import { axiosAdmin } from '@/shared/lib/api/axiosAdmin';

export const useAdminArchiveTestStore = create((set) => ({
    loading: false,
    error: null,
    archive: async (data) => {
        set({ loading: true, error: null });
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axiosAdmin.post('/admin/archive', data)
            set({ loading: false });
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Ошибка архивации';
            set({ error: errorMsg, loading: false });
            throw new Error(errorMsg);
        }
    }
}));