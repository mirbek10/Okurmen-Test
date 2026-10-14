import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';
import { create } from "zustand";
import Cookies from "js-cookie";

interface AdminLoginState {
        loading: boolean;
        error: string | null;
        admin: any;
        login: (email: string, password: string) => Promise<void>;
        clearError: () => void;
        logout: () => void;
    }
    
    export const useAdminLoginStore = create<AdminLoginState>((set, get) => ({
        loading: false,
        error: null,
        admin: null,
        clearError: () => set({ error: null }),
        login: async (email: string, password: string) => {
            try {
                set({ loading: true, error: null });
                const response = await axiosAdmin.post('/admin/login', { email, password });
                const admin = response.data;
                Cookies.set('adminToken', admin.token);
                set({ admin });
            } catch (error) {
                set({ error: (error as any).response?.data?.error || (error as any).response?.data?.message || (error as Error).message });
            } finally {
                set({ loading: false });
            }
        },
        logout: () => {
            Cookies.remove('adminToken');
            set({ admin: null });
        }
    }));
