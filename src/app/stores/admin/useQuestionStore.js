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

            // Собираем параметры запроса
            const requestParams = {
                limit: 20,
                page: params.page || state.page,
                search: params.search !== undefined ? params.search : state.search,
                category: params.category !== undefined ? params.category : state.category,
                sort: params.sort || state.sort,
                order: params.order || state.order,
            };

            const response = await axiosAdmin.get('/questions', { params: requestParams });

            // Важно: деструктуризация должна соответствовать ответу твоего API
            const { questions, total, totalPages, hasMore, page } = response.data;

            // Фильтруем (только те, где есть 4 варианта) и очищаем
            const validOnes = questions.filter(q => q.options?.length === 4);
            const cleaned = cleanQuestions(validOnes);
            console.log(questions);


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
            // Имя 'file' должно СТРОГО совпадать с upload.single('file') на бэкенде
            formData.append('file', file);

            // 2. ОТПРАВКА: Используем axios БЕЗ ручных заголовков для этого запроса
            await axiosAdmin.post('/questions/upload', formData, {
                // Это ВАЖНО: оставляем headers пустыми или 
                // убеждаемся, что axiosAdmin не добавляет лишнего
                headers: {
                    'Content-Type': 'multipart/form-data' // В некоторых версиях axios лучше убрать вообще
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