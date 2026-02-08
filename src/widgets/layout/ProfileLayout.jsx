"use client";
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import {
  User,
  BookOpen,
  Trophy,
  LogOut,
  LayoutDashboard,
  History,
  Code2,
  Menu,
  X    
} from "lucide-react";
import Cookies from "js-cookie";

export default function ProfileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    setIsLoading(false);
    setIsMobileMenuOpen(false); 
  }, [location.pathname]);

  const menuItems = [
    { id: "profile", label: "Профиль", icon: <User size={20} />, href: "/user/profile" },
    { id: "test", label: "Тесты", icon: <BookOpen size={20} />, href: "/user/tests" },
    { id: "history", label: "История", icon: <History size={20} />, href: "/user/history" },
    { id: "leaderboard", label: "Рейтинг", icon: <Trophy size={20} />, href: "/user/leaderboard" },
    { id: "creator", label: "Создатель", icon: <Code2 size={20} />, href: "/user/creator" }
  ];

  const mainNavItems = menuItems.slice(0, 3);
  
  const activeTab = menuItems.find((item) => location.pathname.includes(item.href))?.id || "profile";

  const handleLogout = () => {
    navigate("/");
    Cookies.remove("userToken");
    Cookies.remove("user");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800">
      
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <LayoutDashboard size={24} />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Student Portal
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all ${
                activeTab === item.id ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item.icon}
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-black text-slate-800">Student Portal</span>
        </div>
      </header>

      <main className="flex-1 relative pb-24 md:pb-0 overflow-x-hidden">
        <div className="p-4 md:p-12 max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner /></div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"><Outlet /></div>
          )}
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 pt-10 animate-in slide-in-from-bottom-full duration-300"
            onClick={e => e.stopPropagation()}
          >
            <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-6 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500"
            >
                <X size={20} />
            </button>

            <div className="grid grid-cols-1 gap-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Навигация</p>
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.href}
                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl ${
                            activeTab === item.id ? "bg-indigo-50 text-indigo-600" : "text-slate-600"
                        }`}
                    >
                        {item.icon}
                        <span className="font-bold">{item.label}</span>
                    </Link>
                ))}
                <div className="h-px bg-slate-100 my-2" />
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50"
                >
                    <LogOut size={20} />
                    <span className="font-bold">Выйти из аккаунта</span>
                </button>
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                activeTab === item.id ? "text-indigo-600" : "text-slate-400"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === item.id ? "bg-indigo-50" : ""}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                isMobileMenuOpen ? "text-indigo-600" : "text-slate-400"
            }`}
          >
            <div className={`p-1.5 rounded-lg ${isMobileMenuOpen ? "bg-indigo-50" : ""}`}>
              <Menu size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">Меню</span>
          </button>
        </div>
      </nav>
    </div>
  );
}