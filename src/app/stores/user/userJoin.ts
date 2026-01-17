import { axiosUser } from './../../../shared/lib/api/axiosUser';
import { create } from "zustand";
import Cookies from "js-cookie";

interface userJoinState {
    loading: boolean;
    error: string | null;
    user: any;
    join: (name: string, code: string, email: string) => Promise<void>;
    logout: () => void;
}

export const useUserJoinStore = create<userJoinState>((set, get) => ({
    loading: false,
    error: null,
    user: null,
    join: async (name: string, code: string, email: string) => {
        try {
            set({ loading: true, error: null });
            const response = await axiosUser.post('/test/join', { name, code, email });
            const user = response.data;
            Cookies.set("user", user)
            set({ user });
        } catch (error) {
            set({ error: (error as Error).message });
        } finally {
            set({ loading: false });
        }
    },
    logout: () => {
        Cookies.remove("user")
        set({ user: null });
    }
}));