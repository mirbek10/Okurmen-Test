"use client";
import React, { useEffect } from 'react';
import { useLeaderboardStore } from '@/app/stores/admin/leaderboardStore';
import { 
  Loader, 
  Search, 
  RefreshCw, 
  Trophy, 
  Medal, 
  Star, 
  CheckCircle2, 
  TrendingUp,
  Mail
} from 'lucide-react';

export function Lider() {
  const { 
    topUsers, 
    users, 
    loading, 
    error, 
    pagination, 
    filters,
    fetchTopUsers, 
    fetchUsers,
    setFilters,
    setPage,
    refreshData,
  } = useLeaderboardStore();

  useEffect(() => {
    fetchTopUsers(10);
    fetchUsers();
  }, [fetchTopUsers, fetchUsers]);

  const handleSearchChange = (e) => setFilters({ search: e.target.value });
  const handleSortChange = (sortBy) => setFilters({ sortBy });
  const handlePageChange = (page) => setPage(page);

  const getRankStyles = (rank) => {
    switch(rank) {
      case 1: return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', icon: '🥇' };
      case 2: return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-500', icon: '🥈' };
      case 3: return { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-500', icon: '🥉' };
      default: return { bg: 'bg-slate-50/50', border: 'border-slate-100', text: 'text-slate-400', icon: rank };
    }
  };

  if (error) return (
    <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-xl font-bold text-red-800 mb-2">Ошибка загрузки</h3>
      <p className="text-red-600/80 mb-6">{error}</p>
      <button onClick={refreshData} className="px-6 py-3 bg-red-100 text-red-700 rounded-2xl font-bold hover:bg-red-200 transition-all">
        Попробовать снова
      </button>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 shadow-inner">
            <Trophy size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Лидерборд</h2>
            <p className="text-sm text-slate-400 font-medium">Общий рейтинг среди {pagination.totalUsers} студентов</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 md:min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700"
            />
          </div>
          
          <select
            value={filters.sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-600 text-sm cursor-pointer"
          >
            <option value="rating">🏆 По рейтингу</option>
            <option value="username">👤 По имени</option>
            <option value="createdAt">📅 Новички</option>
          </select>

          <button
            onClick={refreshData}
            disabled={loading}
            className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* TOP 3 CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {topUsers.slice(0, 3).map((user) => {
          const style = getRankStyles(user.rank);
          return (
            <div key={user._id} className={`relative bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl transition-all hover:-translate-y-2 group`}>
              {/* Место */}
              <div className={`absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-2xl border-4 border-white ${style.bg} ${style.text}`}>
                {style.icon}
              </div>

              <div className="flex flex-col items-center mt-4">
                {/* Аватар */}
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-full p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                    <img 
                      src={user.avatar} 
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>
                  <div className="absolute -bottom-2 right-0 bg-white px-3 py-1 rounded-full shadow-md border border-slate-50">
                    <span className="text-sm font-black text-indigo-600">{user.rating} <span className="text-[10px] text-slate-400">PTS</span></span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-1 truncate w-full text-center px-4">{user.username}</h3>
                <p className="text-xs text-slate-400 font-medium mb-6 flex items-center gap-1">
                  <Mail size={12} /> {user.email}
                </p>

                {/* Статистика из предоставленных данных */}
                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Тесты</div>
                    <div className="text-lg font-black text-slate-700">{user.testsCompleted || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1">Ср. Балл</div>
                    <div className="text-lg font-black text-slate-700">{user.totalScore || 0}%</div>
                  </div>
                </div>

                {/* Прогресс */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase px-1">
                    <span>Ranking Progress</span>
                    <span>{Math.min(user.rating, 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                      style={{ width: `${Math.min((user.rating / 1000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL RANKING TABLE */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-black text-slate-800">Все участники</h3>
          <span className="bg-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black">
            СЕЗОН 2026
          </span>
        </div>
        
        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-400 font-bold animate-pulse">Синхронизация данных...</p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => {
              const style = getRankStyles(user.rank);
              return (
                <div key={user._id} className="p-6 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    {/* Место */}
                    <div className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-2xl font-black text-lg border-2 ${style.border} ${style.bg} ${style.text}`}>
                      {user.rank}
                    </div>
                    
                    {/* Инфо */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md transition-transform group-hover:scale-110"
                          alt="" 
                        />
                        {user.rank === 1 && <span className="absolute -top-2 -right-2 text-lg">👑</span>}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 flex items-center gap-2">
                          {user.username}
                          {user.testsCompleted > 5 && <CheckCircle2 size={14} className="text-blue-500" />}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Статы в строке */}
                  <div className="flex items-center justify-between w-full md:w-auto gap-8">
                    <div className="hidden sm:block text-center">
                      <div className="text-[10px] text-slate-300 font-black uppercase mb-1">Регистрация</div>
                      <div className="text-xs font-bold text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-[10px] text-slate-300 font-black uppercase mb-1">Баллы</div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-indigo-400" />
                        <span className="text-lg font-black text-slate-700">{user.rating}</span>
                      </div>
                    </div>

                    <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden hidden lg:block">
                      <div 
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min((user.rating / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center">
              <div className="text-6xl mb-4 opacity-20">🔍</div>
              <p className="text-slate-400 font-bold">Участники по вашему запросу не найдены</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-400">
                Страница <span className="text-slate-800">{pagination.page}</span> из {pagination.totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev || loading}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  Назад
                </button>
                
                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                        pagination.page === i + 1 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                          : 'bg-white text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext || loading}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                >
                  Вперед
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}