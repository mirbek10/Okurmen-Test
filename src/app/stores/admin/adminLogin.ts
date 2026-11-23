import { axiosAdmin } from './../../../shared/lib/api/axiosAdmin';
import { create } from "zustand";
import { saveSession, clearSession } from '@/shared/lib/api/session';

interface AdminLoginState {
        loading: boolean;
        error: string | null;
        admin: any;
        login: (email: string, password: string) => Promise<void>;
        clearError: () => void;
        logout: () => void;
    }

    export const useAdminLoginStore = create<AdminLoginState>((set) => ({
        loading: false,
        error: null,
        admin: null,
        clearError: () => set({ error: null }),
        login: async (email: string, password: string) => {
            try {
                set({ loading: true, error: null });
                const response = await axiosAdmin.post('/admin/login', { email, password });
                const admin = response.data;
                saveSession('admin', admin);
                set({ admin });
            } catch (error) {
                const status = (error as any).response?.status;
                const message = status === 401
                    ? 'Неверный email или пароль администратора'
                    : (error as any).response?.data?.error || (error as any).response?.data?.message || 'Не удалось войти. Проверьте интернет и попробуйте снова.';
                set({ error: message });
            } finally {
                set({ loading: false });
            }
        },
        logout: () => {
            clearSession('admin');
            set({ admin: null });
        }
    }));
