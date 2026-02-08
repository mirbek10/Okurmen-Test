import { create } from 'zustand';
import { axiosUser } from '@/shared/lib/api/axiosUser';
import { axiosAdmin } from '@/shared/lib/api/axiosAdmin';
import Cookies from 'js-cookie';

interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
    testFinished: number;
    testPassed: number;
    totalScore: number;
    lastTest?: {
        id: number;
        code: string;
        category: string;
        group: string;
        teacher: string;
        score: number;
        correctAnswers: number;
        totalQuestions: number;
        completedAt: string;
        status: string;
        rating: number;
    };
    testHistory?: Array<{
        testId: number;
        code: string;
        category: string;
        score: number;
        completedAt: string;
    }>;
    testsCompleted: number;
    lastLogin: string;
    rating: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    response: any;

    register: (username: string, email: string, password: string) => Promise<void>;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    fetchUserProfile: () => Promise<void>;
    updateAvatar: (avatarUrl: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    response: [],

    register: async (username, email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.post('/auth/register', {
                username,
                email,
                password
            });

            set({
                user: response.data.success ? response.data.user : null,
                token: response.data.token || null,
                loading: false,
            });

            if (response.data.token) {
                Cookies.set('userToken', response.data.token, { expires: 7 });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                loading: false
            });
            throw error;
        }
    },

    login: async (identifier, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.post('/auth/login', {
                identifier,
                password
            });

            set({
                user: response.data.success ? response.data.user : null,
                token: response.data.token || null,
                loading: false
            });

            if (response.data.token) {
                Cookies.set('userToken', response.data.token, { expires: 7 });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Login failed',
                loading: false
            });
            throw error;
        }
    },

    logout: () => {
        set({ user: null, token: null });
        Cookies.remove('userToken');
    },

    fetchUserProfile: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.get('/auth/me');

            set({
                user: response.data.success ? response.data.user : null,
                loading: false,
                response: response
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch user profile',
                loading: false
            });
            throw error;
        }
    },

    updateAvatar: async (avatarUrl) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.put('/auth/set-avatar-url', {
                avatarUrl
            });

            set(prevState => ({
                user: prevState.user ? { ...prevState.user, avatar: response.data.success ? response.data.user?.avatar : prevState.user.avatar } : null,
                loading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update avatar',
                loading: false
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));