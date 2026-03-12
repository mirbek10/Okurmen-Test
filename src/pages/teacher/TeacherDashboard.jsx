"use client";
import React, { useEffect, useMemo, useState } from "react";
import { axiosUser } from "@/shared/lib/api/axiosUser";
import { useAuthStore } from "@/app/stores/auth/authStore";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import { 
  ClipboardList, Users, Trophy, Calendar, 
  ChevronDown, ChevronUp, Star, Search, 
  GraduationCap, CheckCircle2 
} from "lucide-react";

// Вспомогательная функция для цветовой индикации баллов
const getScoreColor = (score) => {
  if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
  if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-100";
  return "text-rose-500 bg-rose-50 border-rose-100";
};

const getStudentScore = (student) => {
  const answers = Array.isArray(student?.answers) ? student.answers : [];
  const total = answers.length;
  const correct = answers.filter((item) => Boolean(item?.isCorrect)).length;
  return total > 0 ? Math.round((correct / total) * 100) : 0;
};

const getResultSummary = (result) => {
  const students = Array.isArray(result?.students) ? result.students : [];
  const studentsCount = students.length;
  const totalScore = students.reduce((acc, student) => acc + getStudentScore(student), 0);
  const avgScore = studentsCount > 0 ? Math.round(totalScore / studentsCount) : 0;
  return { studentsCount, avgScore };
};

const formatRating = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0,0";
  return numeric.toFixed(1).replace(".", ",");
};

const getStudentKey = (student) => {
  const email = String(student?.email || "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const name = String(student?.name || "").trim().toLowerCase();
  return name ? `name:${name}` : `id:${student?.id || "unknown"}`;
};

const buildStudentsSummary = (results) => {
  const summaryMap = new Map();
  results.forEach((result) => {
    const students = Array.isArray(result?.students) ? result.students : [];
    students.forEach((student) => {
      const key = getStudentKey(student);
      const score = getStudentScore(student);
      const existing = summaryMap.get(key) || {
        key,
        name: student?.name || "Без имени",
        email: student?.email || "",
        testsCount: 0,
        totalScore: 0
      };
      existing.testsCount += 1;
      existing.totalScore += score;
      summaryMap.set(key, existing);
    });
  });

  return Array.from(summaryMap.values())
    .map((item) => ({ 
      ...item, 
      avgScore: item.testsCount > 0 ? Math.trunc((item.totalScore / item.testsCount) * 10) / 10 : 0 
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
};

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedResultId, setExpandedResultId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [testsResp, resultsResp] = await Promise.all([
          axiosUser.get("/teacher/tests"),
          axiosUser.get("/teacher/results"),
        ]);
        if (!mounted) return;
        setTests(testsResp.data?.tests || []);
        setResults(resultsResp.data?.results || []);
      } catch (err) {
        if (mounted) setError("Ошибка загрузки данных");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const stats = useMemo(() => {
    const studentsTotal = results.reduce((acc, r) => acc + getResultSummary(r).studentsCount, 0);
    const scoreSum = results.reduce((acc, r) => acc + (getResultSummary(r).avgScore * getResultSummary(r).studentsCount), 0);
    const rating = studentsTotal > 0 ? Math.trunc((scoreSum / studentsTotal) * 10) / 10 : 0;
    return {
      testsCount: user?.testsCount || tests.length,
      studentsCount: user?.studentsCount || studentsTotal,
      rating: user?.rating ?? rating,
    };
  }, [results, tests, user]);

  const studentsSummary = useMemo(() => buildStudentsSummary(results), [results]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8 bg-slate-50/30 min-h-screen">
      
      {/* Приветствие */}
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Привет, <span className="text-indigo-600">{user?.name || "Преподаватель"}</span> 👋
            </h1>
            <p className="text-slate-500 font-medium max-w-md">
              Ваша панель управления тестами и аналитика успеваемости студентов в реальном времени.
            </p>
          </div>
          {error && (
            <div className="px-4 py-2 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-pulse">
              {error}
            </div>
          )}
        </div>
        {/* Декор */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Тестов создано", val: stats.testsCount, icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-100/50" },
          { label: "Всего студентов", val: stats.studentsCount, icon: Users, color: "text-blue-600", bg: "bg-blue-100/50" },
          { label: "Общий рейтинг", val: `${formatRating(stats.rating)}%`, icon: Trophy, color: "text-amber-600", bg: "bg-amber-100/50" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform">
            <div className={`p-4 ${item.bg} ${item.color} rounded-2xl`}>
              <item.icon size={28} />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-800 tracking-tight">{item.val}</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-extrabold">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Список тестов */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Активные тесты</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{tests.length}</span>
          </div>
          <div className="space-y-4">
            {tests.length === 0 ? (
              <EmptyState text="Нет созданных тестов" />
            ) : (
              tests.map((test) => (
                <div key={test.id} className="group p-4 rounded-2xl border border-slate-50 bg-slate-50/30 hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all cursor-default">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{test.category}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                         <span className="font-semibold px-2 py-0.5 bg-white rounded-md border border-slate-100">Группа {test.group || "—"}</span>
                         <span className="font-semibold text-indigo-400 uppercase tracking-wider">{test.code}</span>
                      </div>
                    </div>
                    <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${test.started ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      {test.started ? "Активен" : "Ожидание"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Лучшие студенты */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Топ студентов</h2>
            <Star className="text-amber-400 fill-amber-400" size={20} />
          </div>
          <div className="space-y-4">
            {studentsSummary.length === 0 ? (
              <EmptyState text="Данные появятся после тестов" />
            ) : (
              studentsSummary.slice(0, 5).map((student, idx) => (
                <div key={student.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 shadow-sm'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{student.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${getScoreColor(student.avgScore).split(' ')[0]}`}>
                      {formatRating(student.avgScore)}%
                    </div>
                    <div className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">Ср. балл</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Детальные результаты */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-8">
        <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
          История тестирований
        </h2>
        <div className="space-y-4">
          {results.map((result) => {
            const { studentsCount, avgScore } = getResultSummary(result);
            const rId = result._id || result.id || `${result.category}-${result.finishedAt}`;
            const isOpen = expandedResultId === rId;
            const students = result?.students || [];

            return (
              <div key={rId} className={`overflow-hidden rounded-3xl border transition-all duration-300 ${isOpen ? 'border-indigo-200 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}>
                <button
                  onClick={() => setExpandedResultId(isOpen ? null : rId)}
                  className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 text-left bg-white transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <div className="font-black text-slate-800">{result.category || "Общий тест"}</div>
                      <div className="text-xs text-slate-400 font-semibold italic">
                        {result.finishedAt ? new Date(result.finishedAt).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="text-center">
                      <div className="text-sm font-black text-slate-800">{studentsCount}</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Студентов</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-black ${getScoreColor(avgScore).split(' ')[0]}`}>{formatRating(avgScore)}%</div>
                      <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ср. балл</div>
                    </div>
                    <div className={`p-2 rounded-full ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="bg-slate-50/50 p-5 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {students.map((s, idx) => {
                        const score = getStudentScore(s);
                        const theme = getScoreColor(score);
                        return (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${theme.split(' ')[0].replace('text', 'bg')}`} />
                              <div className="font-bold text-slate-700 text-sm truncate max-w-[150px]">{s.name || "Без имени"}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">
                                {s.answers?.filter(a => a.isCorrect).length || 0} из {s.answers?.length || 0}
                              </span>
                              <div className={`px-3 py-1 rounded-lg text-xs font-black border ${theme}`}>
                                {score}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
    <Search size={40} strokeWidth={1.5} className="mb-2" />
    <p className="text-sm font-bold uppercase tracking-widest">{text}</p>
  </div>
);