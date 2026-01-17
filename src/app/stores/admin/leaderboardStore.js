import { create } from 'zustand';
import { axiosUser } from '@/shared/lib/api/axiosUser';


export const useLeaderboardStore = create((set, get) => ({
  // Состояние
  users: [],
  topUsers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    totalUsers: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  filters: {
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  },

  // Действия
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
    // Автоматически обновляем данные при изменении фильтров
    get().fetchUsers();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchUsers();
  },

  // Получение всех пользователей с пагинацией
  fetchUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      const { page, limit } = get().pagination;
      const { search, sortBy, sortOrder } = get().filters;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(search && { search }),
      }).toString();

      const response = await axiosUser.get(`users?${params}`);
      
      if (response.data.success) {
        set({
          users: response.data.users,
          pagination: response.data.pagination,
          loading: false,
        });
      } else {
        set({
          error: response.data.error || 'Ошибка при загрузке данных',
          loading: false,
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error);
      set({
        error: error.response?.data?.error || 'Ошибка подключения к серверу',
        loading: false,
        users: [],
      });
    }
  },

  // Получение топ пользователей
  fetchTopUsers: async (limit = 10) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axiosUser.get(`users/top?limit=${limit}`);
      
      if (response.data.success) {
        set({
          topUsers: response.data.users,
          loading: false,
        });
      } else {
        set({
          error: response.data.error || 'Ошибка при загрузке топ-пользователей',
          loading: false,
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке топ-пользователей:', error);
      set({
        error: error.response?.data?.error || 'Ошибка подключения к серверу',
        loading: false,
        topUsers: [],
      });
    }
  },

  // Сброс фильтров
  resetFilters: () => {
    set({
      filters: {
        search: '',
        sortBy: 'rating',
        sortOrder: 'desc',
      },
      pagination: {
        ...get().pagination,
        page: 1,
      },
    });
    get().fetchUsers();
  },

  // Обновление данных (для polling или при действиях пользователя)
  refreshData: () => {
    get().fetchUsers();
    get().fetchTopUsers();
  },
}));