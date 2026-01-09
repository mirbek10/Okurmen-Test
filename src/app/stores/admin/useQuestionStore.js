// app/stores/admin/useQuestionStore.js
import { create } from 'zustand';
import { axiosAdmin } from '@/shared/lib/api/axiosAdmin';

export const useQuestionStore = create((set, get) => ({
    // Состояние
    questions: [],
    loading: false,
    uploading: false,
    error: null,

    // Метаданные для пагинации
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,

    // Действия

    // Получение вопросов с параметрами (GET /api/questions)
    fetchQuestions: async (params = {}) => {
        try {
            set({ loading: true, error: null });

            // Параметры по умолчанию
            const defaultParams = {
                limit: 9999,
                offset: 0,
                search: '',
                sort: 'id',
                order: 'asc',
                category: ''
            };

            // Объединяем параметры
            const requestParams = { ...defaultParams, ...params };

            const response = await axiosAdmin.get('/questions', {
                params: requestParams
            });

            let { questions, total, limit, offset, hasMore } = response.data;

            // ❗ Фильтр: показываем только вопросы с 4 вариантами
            const validQuestions = questions.filter(
                q => Array.isArray(q.options) && q.options.length === 4
            );

            if (validQuestions.length === 0) {
                throw new Error('Вопросы не найдены');
            }

            set({
                questions: validQuestions,
                total,
                limit,
                offset,
                hasMore,
                loading: false
            });


            return questions;
        } catch (error) {
            console.error('Ошибка при загрузке вопросов:', error);
            set({
                error: error.response?.data?.error || 'Ошибка при загрузке вопросов',
                loading: false
            });
            return [];
        }
    },

    // Загрузка Excel файла (POST /api/questions/upload)
    uploadXlsx: async (file) => {
        try {
            set({ uploading: true, error: null });

            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosAdmin.post('/questions/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { count, categories } = response.data;

            // После успешной загрузки обновляем список вопросов
            const currentParams = {
                limit: get().limit,
                offset: get().offset,
                search: '',
                sort: 'id',
                order: 'asc',
                category: ''
            };

            // Загружаем заново с текущими параметрами
            const questions = await get().fetchQuestions(currentParams);

            set({
                uploading: false,
                total: response.data.count || get().total + count
            });

            return true;
        } catch (error) {
            console.error('Ошибка при загрузке файла:', error);
            set({
                error: error.response?.data?.error || 'Ошибка при загрузке файла',
                uploading: false
            });
            return false;
        }
    },

    // Поиск вопросов (использует fetchQuestions с параметрами)
    searchQuestions: async (searchTerm) => {
        return get().fetchQuestions({
            search: searchTerm,
            offset: 0 // Сбрасываем пагинацию при поиске
        });
    },

    // Фильтрация по категории (использует fetchQuestions с параметрами)
    filterByCategory: async (category) => {
        return get().fetchQuestions({
            category,
            offset: 0
        });
    },

    // Сортировка (использует fetchQuestions с параметрами)
    sortQuestions: async (sort, order) => {
        return get().fetchQuestions({ sort, order });
    },

    // Следующая страница
    nextPage: async () => {
        const { offset, limit, hasMore } = get();
        if (hasMore) {
            const newOffset = offset + limit;
            return get().fetchQuestions({ offset: newOffset });
        }
        return get().questions;
    },

    // Предыдущая страница
    prevPage: async () => {
        const { offset, limit } = get();
        const newOffset = Math.max(0, offset - limit);
        return get().fetchQuestions({ offset: newOffset });
    },

    // Сброс фильтров
    resetFilters: async () => {
        return get().fetchQuestions({
            search: '',
            category: '',
            sort: 'id',
            order: 'asc',
            offset: 0
        });
    },

    // Получить детали вопроса по ID (локально из состояния)
    getQuestionById: (id) => {
        return get().questions.find(q => q.id === id);
    },

    // Установить лимит на странице
    setPageLimit: async (newLimit) => {
        return get().fetchQuestions({
            limit: newLimit,
            offset: 0
        });
    },

    // Сброс ошибки
    clearError: () => set({ error: null })
}));