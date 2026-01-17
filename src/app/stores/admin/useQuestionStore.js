import { create } from 'zustand';
import { axiosAdmin } from '@/shared/lib/api/axiosAdmin';

const cleanText = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\([^)]*\)/g, '').trim();
};

const cleanQuestions = (questions) => {
    return questions.map(q => ({
        ...q,
        question: cleanText(q.question),
        answer: cleanText(q.answer),
        options: Array.isArray(q.options) ? q.options.map(opt => cleanText(opt)) : []
    }));
};

export const useQuestionStore = create((set, get) => ({
    questions: [],
    loading: false,
    uploading: false,
    error: null,

    // Состояние фильтров
    search: '',
    category: '',
    sort: 'createdAt',
    order: 'desc',

    // Пагинация
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,

    fetchQuestions: async (params = {}) => {
        try {
            set({ loading: true });
            const state = get();

            const requestParams = {
                // Если вы грузите тест, лимит должен быть большим
                limit: params.limit || 20,
                page: params.page || state.page,
                search: params.search !== undefined ? params.search : state.search,
                category: params.category !== undefined ? params.category : state.category,
                sort: params.sort || state.sort,
                order: params.order || state.order,
            };

            const response = await axiosAdmin.get('/questions', { params: requestParams });

            const { questions, total, totalPages, hasMore, page } = response.data;

            // ИСПРАВЛЕНИЕ: Не фильтруйте строго по 4 опциям, 
            // если не уверены, что в базе их всегда 4.
            // Просто проверяем, что опции вообще есть.
            const validOnes = questions.filter(q => Array.isArray(q.options) && q.options.length > 0);

            // Очистку cleanQuestions лучше пока отключить или сделать мягче,
            // чтобы не поломать сравнение правильных ответов.
            const cleaned = cleanQuestions(validOnes);

            set({
                questions: cleaned,
                total,
                totalPages,
                hasMore,
                page,
                search: requestParams.search,
                category: requestParams.category,
                loading: false
            });
        } catch (error) {
            console.error("Fetch error:", error);
            set({ error: "Ошибка загрузки", loading: false });
        }
    },

    setPage: (page) => get().fetchQuestions({ page }),
    searchQuestions: (search) => get().fetchQuestions({ search, page: 1 }),
    filterByCategory: (category) => get().fetchQuestions({ category, page: 1 }),

    uploadXlsx: async (file) => {
        try {
            set({ uploading: true });

            // 1. ПРОВЕРКА: Что именно мы получили?
            if (!(file instanceof File)) {
                console.error("Передан не файл, а:", file);
                set({ uploading: false });
                return false;
            }

            const formData = new FormData();
            formData.append('file', file);

            await axiosAdmin.post('/questions/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await get().fetchQuestions({ page: 1 });
            set({ uploading: false });
            return true;
        } catch (e) {
            console.error("Ошибка при загрузке:", e.response?.data || e.message);
            set({ uploading: false });
            return false;
        }
    },
    clearError: () => set({ error: null })
}));