"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Monitor,
  Database,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart2,
  Filter,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useTestCategoryStore } from "@/app/stores/all/getTestCategory";

export function PracticeHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedTest, setSelectedTest] = useState(null);
    const { testCategories, fetchTestCategories, loading } = useTestCategoryStore();

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("practice_history") || "[]",
    );
    setHistory(savedHistory);
    fetchTestCategories();
  }, []);

  const clearHistory = () => {
    if (window.confirm("Вы уверены, что хотите полностью очистить историю тренировок?")) {
      localStorage.removeItem("practice_history");
      setHistory([]);
    }
  };  

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    return item.category === filter || item.type === filter;
  });

  const stats = {
    total: history.length,
    avgScore: history.length
      ? Math.round(history.reduce((acc, curr) => acc + curr.percent, 0) / history.length)
      : 0,
    bestScore: history.length ? Math.max(...history.map((h) => h.percent)) : 0,
  };

  console.log(testCategories);
  

  if(loading && !testCategories){
    return <div className="min-h-screen bg-slate-50 py-4 md:py-12 px-3 md:px-4">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 py-4 md:py-12 px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              История
            </h1>
            <p className="text-slate-500 text-sm font-medium">Ваши результаты</p>
          </div>

          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline text-sm">Очистить всё</span>
            </button>
          )}
        </div>

        {/* Статистика - Улучшенная сетка */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <StatCard icon={<Clock size={16} />} label="Тестов" value={stats.total} />
          <StatCard icon={<BarChart2 size={16} />} label="Средний" value={`${stats.avgScore}%`} color="text-indigo-600" />
          <StatCard
            icon={<CheckCircle2 size={16} />}
            label="Лучший"
            value={`${stats.bestScore}%`}
            color="text-emerald-500"
            className="col-span-2 md:col-span-1"
          />
        </div>

        {/* Фильтры - Плавный скролл */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 scrollbar-hide">
          <div className="p-2.5 bg-slate-200/50 rounded-xl text-slate-500 shrink-0">
            <Filter size={18} />
          </div>
          {["all", ...testCategories]?.map((el, i) => (
            <button
              key={i}
              onClick={() => setFilter(el.category)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap border ${filter === el.category
                  ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                  : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                }`}
            >
              {el === "all" ? "Все" : el.category.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Список результатов */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <EmptyState navigate={navigate} />
          ) : (
            filteredHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTest(item)}
                className="bg-white border border-slate-100 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-between gap-3 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer group"
              >
                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                  <div className={`p-3 md:p-4 rounded-2xl shrink-0 ${item.type === "front" || item.category === "front"
                      ? "bg-blue-50 text-blue-500"
                      : "bg-emerald-50 text-emerald-500"
                    }`}>
                    {item.type === "front" || item.category === "front" ? <Monitor size={22} /> : <Database size={22} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 uppercase text-xs md:text-sm tracking-wider truncate">
                      {item.category || item.type}
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px] md:text-sm mt-0.5">
                      <span className="flex items-center gap-1 font-medium italic">
                        {new Date(item.date).toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit' })}
                      </span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full" />
                      <span className="font-bold text-slate-600">{item.correct}/{item.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-6 shrink-0">
                  <div className="text-right">
                    <div className={`text-xl md:text-2xl font-black ${item.percent >= 80 ? "text-emerald-500" : item.percent >= 50 ? "text-amber-500" : "text-red-500"
                      }`}>
                      {item.percent}%
                    </div>
                  </div>
                  <div className="p-2 md:p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Eye size={20} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedTest && (
        <TestDetailsModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
}

function TestDetailsModal({ test, onClose }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}м ${secs}с`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-start md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-[2rem] md:rounded-[2.5rem] w-full max-w-3xl max-h-[92vh] md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom md:slide-in-from-bottom-0 md:zoom-in-95 duration-300"
      >
        {/* Хедер модалки */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="min-w-0">
            <h2 className="text-xl font-black text-slate-800 truncate">Результаты</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{test.category || test.type}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Сетка статы в модалке - 2x2 на мобилках */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 p-4 md:p-6 bg-slate-50/50">
          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-black text-indigo-600">{test.percent}%</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Успех</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-black text-emerald-500">{test.correct}/{test.total}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Верно</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-black text-blue-500">{test.answered || test.total}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Ответов</div>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center">
            <div className="text-xl font-black text-orange-500">{formatTime(test.timeSpent || 0)}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Время</div>
          </div>
        </div>

        {/* Список вопросов */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
          {test.detailedResults && test.detailedResults.length > 0 ? (
            test.detailedResults.map((item, index) => (
              <QuestionCard key={index} item={item} />
            ))
          ) : (
            <div className="text-center py-10">
              <AlertCircle className="mx-auto text-slate-200 mb-2" size={40} />
              <p className="text-slate-400 text-sm font-medium">Детали отсутствуют</p>
            </div>
          )}
        </div>

        {/* Футер модалки */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-[0.98] transition-all"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({ item }) {
  const statusConfig = item.isCorrect
    ? { border: 'border-emerald-100', bg: 'bg-emerald-50/30', text: 'text-emerald-700', icon: <CheckCircle size={16} />, label: 'Верно' }
    : item.wasAnswered
      ? { border: 'border-red-100', bg: 'bg-red-50/30', text: 'text-red-700', icon: <XCircle size={16} />, label: 'Ошибка' }
      : { border: 'border-orange-100', bg: 'bg-orange-50/30', text: 'text-orange-700', icon: <AlertCircle size={16} />, label: 'Пропуск' };

  return (
    <div className={`rounded-3xl p-4 border-2 ${statusConfig.border} ${statusConfig.bg} `}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Вопрос {item.questionNumber}</span>
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusConfig.text} bg-white border border-current/10`}>
          {statusConfig.icon} {statusConfig.label}
        </span>
      </div>
      <h3 className="text-sm md:text-base font-bold text-slate-800 leading-snug mb-4">{item.question}</h3>

      {item.wasAnswered && item.selectedAnswer && (
        <div className={`p-3 rounded-xl border ${item.isCorrect ? 'border-emerald-200 bg-white' : 'border-red-200 bg-white'}`}>
          <p className={`text-[10px] font-bold uppercase mb-1 ${item.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>Ваш выбор:</p>
          <p className="text-sm font-bold text-slate-700">{item.selectedAnswer}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color = "text-slate-800", className = "" }) {
  return (
    <div className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center ${className}`}>
      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter mb-1 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className={`text-xl md:text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}

function EmptyState({ navigate }) {
  return (
    <div className="bg-white rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-100">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <History className="text-slate-200" size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">Пусто</h3>
      <p className="text-slate-400 text-xs mb-6 px-4">Вы еще не проходили тесты. Самое время начать!</p>
      <button
        onClick={() => navigate("/user/tests")}
        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-transform active:scale-95"
      >
        К тестам
      </button>
    </div>
  );
}

function History({ className, size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}