import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';
import { create } from "zustand";
import Cookies from "js-cookie";

interface AdminLoginState {
        loading: boolean;
        error: string | null;
        admin: any;
        login: (name: string, code: string) => Promise<void>;
        logout: () => void;
    }
    
    export const useAdminLoginStore = create<AdminLoginState>((set, get) => ({
        loading: false,
        error: null,
        admin: null,
        login: async (name: string, code: string) => {
            try {
                set({ loading: true, error: null });
                const response = await axiosAdmin.post('/admin/login', { name, code });
                const admin = response.data;
                Cookies.set('adminToken', admin.token);
                set({ admin });
            } catch (error) {
                set({ error: (error as Error).message });
            } finally {
                set({ loading: false });
            }
        },
        logout: () => {
            Cookies.remove('adminToken');
            set({ admin: null });
        }
    }));