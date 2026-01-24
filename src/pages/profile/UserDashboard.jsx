"use client";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/app/stores/auth/authStore";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { 
  User, 
  Mail, 
  Trophy, 
  BarChart3, 
  History, 
  Monitor, 
  Database, 
  ChevronRight,
  Camera
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export function UserDashboard() {
  const { user, fetchUserProfile, updateAvatar, loading, response, error } = useAuthStore();
  
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const navigate = useNavigate()

  // Загрузка профиля и локальной истории
  useEffect(() => {
    if (!user || Object.keys(user).length === 0) {
      fetchUserProfile();
    }
    
    // Получаем историю из localStorage
    const savedHistory = JSON.parse(localStorage.getItem("practice_history") || "[]");
    setPracticeHistory(savedHistory);
    console.log(response);
    

    if(response.status === 404 || error) {
      toast.error("Пользователь не найден. Пожалуйста, войдите снова.");
      window.location.href = "/auth/login"
      Cookies.remove("userToken")
    }

    if(response.status === 200) {
      localStorage.setItem("user", JSON.stringify(user));
    }

  }, [user, fetchUserProfile, response, error]);

  const handleAvatarUrlUpdate = async (e) => {
    e.preventDefault();
    const url = e.target.avatarUrl.value.trim();
    if (!url) return;

    setIsUpdating(true);
    try {
      await updateAvatar(url);
      setShowAvatarModal(false);
      e.target.reset();
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };



  const clearHistory = () => {
    localStorage.removeItem("practice_history");
    setPracticeHistory([]);
  };

  if (loading) return <LoadingSpinner />;

  const userName = user?.username || user?.name || "Студент";
  const userEmail = user?.email || "mail@example.com";
  const displayAvatar = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  return (
    <div className="relative w-full max-w-4xl mx-auto pb-20">
      {/* Декоративный фон */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-100/40 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 -left-24 w-64 h-64 bg-violet-100/30 rounded-full blur-3xl -z-10"></div>

      {/* ОСНОВНАЯ КАРТОЧКА ПРОФИЛЯ */}
      <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex flex-col items-center">
          {/* Аватар */}
          <div className="relative">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full p-1.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden">
              <img
                src={displayAvatar}
                alt="Profile"
                className={`w-full h-full rounded-full object-cover border-4 border-white transition-all duration-500 ${
                  isUpdating ? "opacity-30 scale-90" : "opacity-100 scale-100"
                }`}
              />
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-2 right-2 bg-white text-indigo-600 p-3 rounded-full shadow-xl hover:bg-indigo-50 transition-all active:scale-90 border border-slate-100"
            >
              <Camera size={20} />
            </button>
          </div>

          {/* Имя и почта */}
          <h2 className="text-4xl font-black mt-8 text-slate-800 tracking-tight">{userName}</h2>
          <div className="flex items-center gap-2 text-slate-400 font-medium mt-2">
            <Mail size={16} />
            <span>{userEmail}</span>
          </div>

          {/* Статистика из БД */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-10">
            {[
              { label: "Пройдено тестов", val: user?.testsCompleted || 0, icon: <History className="text-indigo-500" /> },
              { label: "Средний балл", val: `${user?.totalScore || 0}`, icon: <BarChart3 className="text-violet-500" /> },
              { label: "Points", val: `${user?.rating || 0}`, icon: <Trophy className="text-amber-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 flex flex-col items-center group hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="mb-3 p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-2xl font-black text-slate-800">{stat.val}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* СЕКЦИЯ ИСТОРИИ ТРЕНИРОВОК (LOCAL STORAGE) */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8 px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
              <History size={20} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">История тренировок</h3>
          </div>
          {practiceHistory.length > 0 && (
            <button 
              onClick={clearHistory}
              className="text-xs font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Очистить историю
            </button>
          )}
        </div>

        <div className="space-y-4 px-2">
          {practiceHistory.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-slate-400 font-medium">Здесь появятся результаты ваших тренировочных тестов</p>
            </div>
          ) : (
            practiceHistory.map((item, idx) => (
              <div 
                key={idx}
                className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl ${item.type === 'front' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {item.type === 'front' ? <Monitor size={24} /> : <Database size={24} />}
                  </div>
                  <div>
                    <div className="font-black text-slate-700 uppercase text-xs tracking-widest mb-1">
                      {item.type === 'front' ? 'Frontend' : 
                      item.type === 'back' ? 'Backend' : item.category} Practice
                    </div>
                    <div className="text-sm text-slate-400 font-medium">
                      {new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className={`text-2xl font-black ${
                      item.percent >= 80 ? 'text-emerald-500' : 
                      item.percent >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {item.percent}%
                    </div>
                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">
                      Правильных: {item.correct} / {item.total}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* МОДАЛКА АВАТАРА */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-md border border-slate-100 animate-in fade-in zoom-in duration-300">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Обновить фото</h3>
            <p className="text-slate-400 text-sm mb-8">Вставьте прямую ссылку на изображение (JPG, PNG или SVG)</p>
            
            <form onSubmit={handleAvatarUrlUpdate} className="space-y-5">
              <input
                type="url"
                name="avatarUrl"
                placeholder="https://images.com/my-photo.jpg"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-700"
                required
              />
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isUpdating ? "Загрузка..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}