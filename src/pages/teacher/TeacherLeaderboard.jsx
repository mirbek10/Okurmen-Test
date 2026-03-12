"use client";
import React, { useEffect, useState } from "react";
import { axiosUser } from "@/shared/lib/api/axiosUser";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { Trophy, Star, Users, GraduationCap, ChevronRight } from "lucide-react";

const getInitial = (name = "") => {
  const safe = String(name || "").trim();
  return safe ? safe[0].toUpperCase() : "?";
};

// Темы для рейтинга: фон, текст и бордер
const getRatingTheme = (value) => {
  const num = Number(value);
  if (num >= 80) return { 
    text: "text-emerald-600", 
    bg: "bg-emerald-50", 
    border: "border-emerald-100",
    shadow: "shadow-emerald-100/50",
    label: "Мастер" 
  };
  if (num >= 50) return { 
    text: "text-blue-600", 
    bg: "bg-blue-50", 
    border: "border-blue-100",
    shadow: "shadow-blue-100/50",
    label: "Специалист" 
  };
  return { 
    text: "text-rose-500", 
    bg: "bg-rose-50", 
    border: "border-rose-100",
    shadow: "shadow-rose-100/50",
    label: "Начинающий" 
  };
};

const formatRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0,0";
  return numeric.toFixed(1).replace(".", ",");
};

export function TeacherLeaderboard() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosUser.get("/teachers/leaderboard");
        if (!mounted) return;
        setTeachers(response.data?.teachers || []);
      } catch (err) {
        if (!mounted) return;
        setError("Не удалось загрузить данные рейтинга");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6 bg-slate-50/50 min-h-screen">
      {/* Заголовок в светлом стиле */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Trophy size={14} /> Лидеры месяца
          </div> */}
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Рейтинг <span className="text-indigo-600">преподавателей</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Оценка формируется на основе успеваемости студентов</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-white border-l-4 border-rose-500 shadow-sm rounded-r-xl text-rose-600 font-bold text-sm">
          {error}
        </div>
      )}

      {/* Список преподавателей */}
      <div className="space-y-4">
        {teachers.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
            <GraduationCap className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-bold">Список пока пуст</p>
          </div>
        ) : (
          teachers.map((teacher, index) => {
            const theme = getRatingTheme(teacher.rating);
            const isTop3 = index < 3;

            return (
              <div
                key={teacher._id || teacher.id}
                className="group relative flex items-center justify-between p-5 bg-white rounded-[2rem] border border-white shadow-sm hover:shadow-xl hover:border-slate-100 transition-all duration-500"
              >
                <div className="flex items-center gap-5 min-w-0">
                  {/* Индикатор места */}
                  <div className={`flex flex-col items-center justify-center w-8 font-black ${isTop3 ? 'text-indigo-600' : 'text-slate-300'}`}>
                    <span className="text-xs uppercase opacity-50">№</span>
                    <span className="text-xl leading-none">{index + 1}</span>
                  </div>

                  {/* Аватар с цветным свечением */}
                  <div className={`relative shrink-0 w-16 h-16 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center text-2xl font-black border-2 ${theme.border} shadow-lg ${theme.shadow} transition-transform group-hover:scale-110`}>
                    {getInitial(teacher.name)}
                    {isTop3 && (
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                        </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-800 text-xl truncate group-hover:text-indigo-600 transition-colors">
                      {teacher.name || teacher.username}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                       <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                         <Star size={14} className="text-slate-300" /> {teacher.testsCount || 0}
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                         <Users size={14} className="text-slate-300" /> {teacher.studentsCount || 0}
                       </div>
                    </div>
                  </div>
                </div>

                {/* Блок рейтинга */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <div className={`text-3xl font-black tracking-tighter ${theme.text}`}>
                            {formatRating(teacher.rating)}%
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                            {theme.label}
                        </div>
                    </div>
                    <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}