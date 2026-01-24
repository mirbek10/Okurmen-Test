"use client";
import React, { useEffect } from "react";
import { useLeaderboardStore } from "@/app/stores/admin/leaderboardStore";
import {
  Loader,
  Search,
  RefreshCw,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Mail,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

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

  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const getRankStyles = (rank) => {
    switch (rank) {
      case 1:
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-600",
          icon: "🥇",
        };
      case 2:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-500",
          icon: "🥈",
        };
      case 3:
        return {
          bg: "bg-orange-50",
          border: "border-orange-200",
          text: "text-orange-500",
          icon: "🥉",
        };
      default:
        return {
          bg: "bg-slate-50/50",
          border: "border-slate-100",
          text: "text-slate-400",
          icon: rank,
        };
    }
  };

  if (error)
    return (
      <div className="p-6 md:p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
        <div className="text-3xl mb-4">⚠️</div>
        <h3 className="text-lg font-bold text-red-800 mb-2">Ошибка загрузки</h3>
        <p className="text-red-600/80 mb-6 text-sm">{error}</p>
        <button
          onClick={refreshData}
          className="w-full sm:w-auto px-6 py-3 bg-red-100 text-red-700 rounded-xl font-bold hover:bg-red-200 transition-all"
        >
          Попробовать снова
        </button>
      </div>
    );

  return (
    <div className="space-y-6 md:space-y-10 pb-20 px-1">
      {/* HEADER & FILTERS */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex items-center justify-between md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 md:p-4 bg-amber-50 rounded-2xl text-amber-500 shrink-0">
            <Trophy size={24} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Лидерборд
            </h2>
            <p className="text-[10px] md:text-sm text-slate-400 font-medium">
              Общий рейтинг студентов
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* TOP 3 CARDS - Адаптивная сетка */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
        {users.slice(0, 3).map((user) => {
          const style = getRankStyles(user.rank);
          return (
            <div
              key={user._id}
              className="relative bg-white rounded-[2rem] p-5 md:p-8 border border-slate-100 shadow-lg group"
            >
              {/* Место */}
              <div
                className={`absolute -top-3 left-6 w-10 h-10 rounded-xl shadow-md flex items-center justify-center text-xl border-4 border-white ${style.bg} ${style.text}`}
              >
                {style.icon}
              </div>

              <div className="flex flex-row sm:flex-col items-center gap-4 sm:mt-4">
                {/* Аватар */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-pink-500 shadow-md">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                </div>

                <div className="min-w-0 flex-1 sm:text-center">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 truncate mb-1">
                    {user.username}
                  </h3>
                  <div className="inline-flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                    <span className="text-xs font-black text-indigo-600">
                      {user.rating}{" "}
                      <span className="text-[10px] opacity-60 uppercase">
                        pts
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Мини-статы для мобилок в карточке */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                <div className="text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Тесты
                  </div>
                  <div className="text-sm font-black text-slate-700">
                    {user.testsCompleted || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] uppercase font-bold text-slate-400">
                    Балл
                  </div>
                  <div className="text-sm font-black text-slate-700">
                    {user.totalScore || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL RANKING TABLE */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-sm md:text-lg font-black text-slate-800">
            Все участники
          </h3>
          <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-[9px] md:text-xs font-black">
            СЕЗОН 2026
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
              <p className="text-xs text-slate-400 font-bold">
                Синхронизация...
              </p>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => {
              const style = getRankStyles(user.globalRank);
              const isYou = user._id === userData._id;
              return (
                <div
                  key={user._id}
                  className={`p-4 md:p-6 transition-all flex items-center justify-between gap-3 group relative overflow-hidden ${
                    isYou
                      ? "bg-indigo-50/40 shadow-[inset_4px_0_0_0_#4f46e5]" // Синяя полоска слева для "тебя"
                      : "hover:bg-slate-50"
                  }`}
                >
                  {/* Декоративный эффект для "тебя" (легкое свечение на фоне) */}
                  {isYou && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
                  )}

                  <div className="flex items-center gap-3 md:gap-6 min-w-0 relative z-10">
                    {/* Место */}
                    <div
                      className={`
      w-8 h-8 md:w-12 md:h-12 shrink-0 flex items-center justify-center rounded-lg md:rounded-2xl font-black text-xs md:text-lg border transition-transform
      ${isYou ? "scale-110 shadow-lg shadow-indigo-100 border-indigo-200" : `${style.border} ${style.bg}`}
      ${style.text}
    `}
                    >
                      {user.globalRank}
                    </div>

                    {/* Инфо */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={user.avatar}
                          className={`w-10 h-10 md:w-13 md:h-13 rounded-xl object-cover shadow-sm ${isYou ? "ring-2 ring-indigo-500 ring-offset-2" : ""}`}
                          alt=""
                        />
                        {isYou && (
                          <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm border border-white uppercase tracking-tighter">
                            You
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-black text-slate-800 text-xs md:text-base flex items-center gap-1.5">
                          <span
                            className={`truncate ${isYou ? "text-indigo-700" : ""}`}
                          >
                            {user.username}
                          </span>
                          {user.testsCompleted > 5 && (
                            <CheckCircle2
                              size={14}
                              className="text-blue-500 shrink-0"
                            />
                          )}
                          {isYou && (
                            <span className="hidden md:inline-block animate-pulse w-2 h-2 rounded-full bg-indigo-500" />
                          )}
                        </div>
                        <div
                          className={`text-[10px] md:text-xs truncate hidden xs:block ${isYou ? "text-indigo-400 font-medium" : "text-slate-400"}`}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Баллы */}
                  <div
                    className={`flex flex-col items-end shrink-0 relative z-10 ${isYou ? "scale-105" : ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <TrendingUp
                        size={14}
                        className={
                          isYou ? "text-indigo-600" : "text-indigo-400"
                        }
                      />
                      <span
                        className={`text-sm md:text-xl font-black ${isYou ? "text-indigo-700" : "text-slate-700"}`}
                      >
                        {user.rating}
                      </span>
                    </div>
                    <div
                      className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest ${isYou ? "text-indigo-400" : "text-slate-300"}`}
                    >
                      pts
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 font-bold text-sm">
              Участники не найдены
            </div>
          )}
        </div>

        {/* PAGINATION - Упрощенная для мобилок */}
        {pagination.totalPages > 1 && (
          <div className="p-4 md:p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev || loading}
                className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40"
              >
               <ChevronLeft size={16} />
              </button>

              <span className="text-[10px] font-bold text-slate-400 mx-2">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext || loading}
                className="p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
