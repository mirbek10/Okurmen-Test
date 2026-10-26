import { create } from 'zustand';
import { axiosAdmin } from '@/shared/lib/api/axiosAdmin';

const errorMessage = (error, fallback) =>
    error?.response?.data?.error || error?.response?.data?.message || fallback;

export const useQuestionStore = create((set, get) => ({
    questions: [],
    categoryStats: [],
    allCategories: [],
    loading: false,
    uploading: false,
    saving: false,
    error: null,
    search: '',
    category: '',
    difficulty: '',
    sort: 'createdAt',
    order: 'desc',
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,

    fetchQuestions: async (params = {}) => {
        const state = get();
        const requestParams = {
            limit: params.limit || 20,
            page: params.page || state.page,
            search: params.search !== undefined ? params.search : state.search,
            category: params.category !== undefined ? params.category : state.category,
            difficulty: params.difficulty !== undefined ? params.difficulty : state.difficulty,
            sort: params.sort || state.sort,
            order: params.order || state.order,
        };

        try {
            set({ loading: true, error: null });
            const response = await axiosAdmin.get('/questions', { params: requestParams });
            const data = response.data;
            set({
                questions: Array.isArray(data.questions) ? data.questions : [],
                categoryStats: Array.isArray(data.categoryStats) ? data.categoryStats : [],
                allCategories: Array.isArray(data.allCategories) ? data.allCategories : [],
                total: data.total || 0,
                totalPages: data.totalPages || 1,
                hasMore: Boolean(data.hasMore),
                page: data.page || 1,
                search: requestParams.search,
                category: requestParams.category,
                difficulty: requestParams.difficulty,
                loading: false,
            });
        } catch (error) {
            set({ error: errorMessage(error, 'Ошибка загрузки вопросов'), loading: false });
        }
    },

    setPage: (page) => get().fetchQuestions({ page }),
    searchQuestions: (search) => get().fetchQuestions({ search, page: 1 }),
    filterByCategory: (category) => get().fetchQuestions({ category, page: 1 }),
    filterByDifficulty: (difficulty) => get().fetchQuestions({ difficulty, page: 1 }),

    uploadXlsx: async (file) => {
        try {
            set({ uploading: true, error: null });
            const formData = new FormData();
            formData.append('file', file);
            const response = await axiosAdmin.post('/questions/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await get().fetchQuestions({ page: 1, category: '', difficulty: '', search: '' });
            set({ uploading: false });
            return response.data;
        } catch (error) {
            const message = errorMessage(error, 'Не удалось загрузить файл');
            set({ uploading: false, error: message });
            throw new Error(message);
        }
    },

    importJson: async (questions) => {
        try {
            set({ uploading: true, error: null });
            const response = await axiosAdmin.post('/questions/import-json', { questions });
            await get().fetchQuestions({ page: 1, category: '', difficulty: '', search: '' });
            set({ uploading: false });
            return response.data;
        } catch (error) {
            const message = errorMessage(error, 'Не удалось импортировать JSON');
            set({ uploading: false, error: message });
            throw new Error(message);
        }
    },

    createQuestion: async (payload) => {
        try {
            set({ saving: true, error: null });
            await axiosAdmin.post('/questions', payload);
            await get().fetchQuestions({ page: 1 });
            set({ saving: false });
        } catch (error) {
            const message = errorMessage(error, 'Не удалось создать вопрос');
            set({ saving: false, error: message });
            throw new Error(message);
        }
    },

    updateQuestion: async (id, payload) => {
        try {
            set({ saving: true, error: null });
            await axiosAdmin.put(`/questions/${id}`, payload);
            await get().fetchQuestions();
            set({ saving: false });
        } catch (error) {
            const message = errorMessage(error, 'Не удалось изменить вопрос');
            set({ saving: false, error: message });
            throw new Error(message);
        }
    },

    renameCategory: async (oldCategory, newCategory) => {
        try {
            set({ saving: true, error: null });
            const response = await axiosAdmin.patch('/questions/categories/rename', {
                oldCategory,
                newCategory,
            });
            const selectedCategory = get().category;
            await get().fetchQuestions({
                page: 1,
                category: selectedCategory === oldCategory ? newCategory : selectedCategory,
            });
            set({ saving: false });
            return response.data;
        } catch (error) {
            const message = errorMessage(error, 'Не удалось изменить категорию');
            set({ saving: false, error: message });
            throw new Error(message);
        }
    },

    deleteQuestion: async (id) => {
        try {
            set({ saving: true, error: null });
            await axiosAdmin.delete(`/questions/${id}`);
            const nextPage = get().questions.length === 1 && get().page > 1 ? get().page - 1 : get().page;
            await get().fetchQuestions({ page: nextPage });
            set({ saving: false });
        } catch (error) {
            const message = errorMessage(error, 'Не удалось удалить вопрос');
            set({ saving: false, error: message });
            throw new Error(message);
        }
    },

    clearError: () => set({ error: null })
}));
