"use client";
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { 
  User, 
  BookOpen, 
  Trophy, 
  LogOut, 
  LayoutDashboard,
  History
} from "lucide-react";

export default function ProfileLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [location.pathname]);

  const menuItems = [
    { id: "profile", label: "Мой профиль", icon: <User size={20} />, href: "/user/profile" },
    { id: "test", label: "Тренировка", icon: <BookOpen size={20} />, href: "/user/tests" },
    { id: "history", label: "История", icon: <History size={20} />, href: "/user/history" },
    { id: "leaderboard", label: "Лидерборд", icon: <Trophy size={20} />, href: "/user/leaderboard" },
  ];

  const activeTab = menuItems.find(item => location.pathname.includes(item.href))?.id || "profile";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-20 md:w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen transition-all duration-300">
        
        {/* Логотип */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent hidden md:block">
            Student Portal
          </span>
        </div>

        {/* Навигация */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => {
                if (location.pathname !== item.href) setIsLoading(true);
              }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group ${
                activeTab === item.id
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className={`${activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                {item.icon}
              </div>
              <span className="font-bold text-sm hidden md:block">
                {item.label}
              </span>
              
              {/* Активный индикатор для десктопа */}
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full hidden md:block" />
              )}
            </Link>
          ))}
        </nav>

        {/* Футер сайдбара */}
        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm">
            <LogOut size={20} />
            <span className="hidden md:block">Выйти</span>
          </button>
        </div>
      </aside>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Хедер контентной части */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center md:hidden">
            <span className="text-lg font-bold text-indigo-600">Portal</span>
            {/* Здесь можно добавить мобильное меню (бургер) */}
        </header>

        <div className="p-4 md:p-12 max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Outlet />
            </div>
          )}
        </div>

        {/* Декоративные пятна фона */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px]" />
      </main>
    </div>
  );
}