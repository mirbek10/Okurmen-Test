import { create } from 'zustand';
import { axiosUser } from '@/shared/lib/api/axiosUser';
import Cookies from 'js-cookie';

interface User {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    role?: string;
    name?: string;
    subjects?: string[];
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
    testsCount?: number;
    studentsCount?: number;
    teacherId?: string;
    teacherName?: string;
    teacherAvatar?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    response: any;

    register: (username: string, email: string, password: string) => Promise<{ email: string; expiresAt: string; adminApprovalToken?: string }>;
    verifyRegistration: (email: string, code: string) => Promise<User | null>;
    checkAdminRegistrationApproval: (token: string) => Promise<User | null>;
    login: (identifier: string, password: string) => Promise<User | null>;
    logout: () => void;
    clearError: () => void;
    fetchUserProfile: () => Promise<User | null>;
    updateAvatar: (avatarUrl: string) => Promise<void>;
    updateTeacher: (teacherId: string) => Promise<void>;
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

            set({ loading: false });
            return { email: response.data.email, expiresAt: response.data.expiresAt, adminApprovalToken: response.data.adminApprovalToken };
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed',
                loading: false
            });
            throw error;
        }
    },

    verifyRegistration: async (email, code) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.post('/auth/verify-registration', { email, code });
            set({ user: response.data.user || null, token: response.data.token || null, loading: false });
            if (response.data.token) Cookies.set('userToken', response.data.token, { expires: 7 });
            return response.data.user || null;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Не удалось подтвердить почту',
                loading: false
            });
            throw error;
        }
    },

    checkAdminRegistrationApproval: async (token) => {
        try {
            const response = await axiosUser.post('/auth/registration-admin-login', { token });
            if (response.status === 202 || !response.data?.token) return null;
            set({ user: response.data.user || null, token: response.data.token, loading: false, error: null });
            Cookies.set('userToken', response.data.token, { expires: 7 });
            return response.data.user || null;
        } catch {
            return null;
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
                user: response.data.user || null,
                token: response.data.token || null,
                loading: false
            });

            if (response.data.token) {
                Cookies.set('userToken', response.data.token, { expires: 7 });
            }
            return response.data.user || null;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed',
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
                user: response.data.user || null,
                loading: false,
                response: response
            });
            return response.data.user || null;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch user profile',
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
                user: prevState.user ? { ...prevState.user, avatar: response.data.avatarUrl || prevState.user.avatar } : null,
                loading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update avatar',
                loading: false
            });
            throw error;
        }
    },

    updateTeacher: async (teacherId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosUser.put('/auth/teacher', { teacherId });
            const teacher = response.data.teacher;
            set(prevState => ({
                user: prevState.user ? {
                    ...prevState.user,
                    teacherId: teacher?.id,
                    teacherName: teacher?.name,
                    teacherAvatar: teacher?.avatar,
                } : null,
                loading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to update teacher',
                loading: false
            });
            throw error;
        }
    },

    clearError: () => set({ error: null })
}));



