"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Trash2, 
  Monitor, 
  Database, 
  Calendar, 
  CheckCircle2, 
  Clock,
  BarChart2,
  Filter
} from "lucide-react";

export function PracticeHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("practice_history") || "[]");
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Вы уверены, что хотите полностью очистить историю тренировок?")) {
      localStorage.removeItem("practice_history");
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const stats = {
    total: history.length,
    avgScore: history.length 
      ? Math.round(history.reduce((acc, curr) => acc + curr.percent, 0) / history.length) 
      : 0,
    bestScore: history.length 
      ? Math.max(...history.map(h => h.percent)) 
      : 0
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Кнопка назад и заголовок */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2.5 md:p-3 bg-white rounded-xl md:rounded-2xl shadow-sm hover:bg-slate-50 transition-colors text-slate-600"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">История практик</h1>
                <p className="text-slate-500 text-xs md:text-base font-medium mt-1">Ваши результаты</p>
              </div>
            </div>

            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="flex items-center gap-1.5 px-3 py-2 text-red-500 font-bold text-[10px] md:text-sm hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
                <span className="hidden xs:inline text-xs">Очистить всё</span>
              </button>
            )}
          </div>
        </div>

        {/* Мини-статистика: адаптивная сетка */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          <StatCard icon={<Clock size={14}/>} label="Всего тестов" value={stats.total} />
          <StatCard icon={<BarChart2 size={14}/>} label="Средний балл" value={`${stats.avgScore}%`} color="text-indigo-600" />
          <StatCard icon={<CheckCircle2 size={14}/>} label="Лучший балл" value={`${stats.bestScore}%`} color="text-emerald-500" className="xs:col-span-2 md:col-span-1" />
        </div>

        {/* Фильтры: горизонтальный скролл на мобильных */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="p-2 bg-slate-200/50 rounded-lg text-slate-500 shrink-0">
            <Filter size={16} />
          </div>
          {[
            { id: 'all', label: 'Все' },
            { id: 'front', label: 'Frontend' },
            { id: 'back', label: 'Backend' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                filter === btn.id 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Список результатов */}
        <div className="space-y-3 md:space-y-4">
          {filteredHistory.length === 0 ? (
            <EmptyState navigate={navigate} />
          ) : (
            filteredHistory.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className={`p-3 md:p-5 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 shrink-0 ${
                    item.type === 'front' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                    {item.type === 'front' ? <Monitor size={24} /> : <Database size={24} />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 uppercase text-[10px] md:text-sm tracking-wider truncate">
                      {item.type === 'front' ? 'Frontend' : 'Backend'} Developer
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-sm mt-0.5 md:mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString('ru-RU')}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                      <span className="flex items-center gap-1 font-medium text-slate-500 whitespace-nowrap">
                        <CheckCircle2 size={12} />
                        {item.correct}/{item.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className={`text-2xl md:text-3xl font-black leading-none ${
                      item.percent >= 80 ? 'text-emerald-500' : 
                      item.percent >= 50 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {item.percent}%
                    </div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      Результат
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/practice-test/${item.type}`)}
                    className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm shrink-0"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Компонент карточки статистики для чистоты кода
function StatCard({ icon, label, value, color = "text-slate-800", className = "" }) {
  return (
    <div className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm ${className}`}>
      <div className="text-slate-400 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className={`text-xl md:text-3xl font-black ${color}`}>{value}</div>
    </div>
  );
}

// Пустое состояние
function EmptyState({ navigate }) {
  return (
    <div className="bg-white rounded-3xl md:rounded-[2.5rem] p-8 md:p-12 text-center border-2 border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <History className="text-slate-300" size={32} />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Записей нет</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Вы еще не проходили тесты в этой категории.</p>
      <button 
        onClick={() => navigate('/practice')}
        className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
      >
        Начать практику
      </button>
    </div>
  );
}

// Иконки (остаются без изменений)
function History({ className, size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
    </svg>
  );
}

function ArrowRight({ className, size }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}