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
  Filter,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

export function PracticeHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    const savedHistory = JSON.parse(
      localStorage.getItem("practice_history") || "[]",
    );
    setHistory(savedHistory);
  }, []);

  const clearHistory = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите полностью очистить историю тренировок?",
      )
    ) {
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
      ? Math.round(
          history.reduce((acc, curr) => acc + curr.percent, 0) / history.length,
        )
      : 0,
    bestScore: history.length ? Math.max(...history.map((h) => h.percent)) : 0,
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Кнопка назад и заголовок */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">
                  История практик
                </h1>
                <p className="text-slate-500 text-xs md:text-base font-medium mt-1">
                  Ваши результаты
                </p>
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

        {/* Мини-статистика */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          <StatCard
            icon={<Clock size={14} />}
            label="Всего тестов"
            value={stats.total}
          />
          <StatCard
            icon={<BarChart2 size={14} />}
            label="Средний балл"
            value={`${stats.avgScore}%`}
            color="text-indigo-600"
          />
          <StatCard
            icon={<CheckCircle2 size={14} />}
            label="Лучший балл"
            value={`${stats.bestScore}%`}
            color="text-emerald-500"
            className="xs:col-span-2 md:col-span-1"
          />
        </div>

        {/* Фильтры */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          <div className="p-2 bg-slate-200/50 rounded-lg text-slate-500 shrink-0">
            <Filter size={16} />
          </div>
          {[
            { id: "all", label: "Все" },
            { id: "html", label: "HTML" },
            { id: "react", label: "React" },
            { id: "javascript", label: "JavaScript" },
            { id: "typescript", label: "TypeScript" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
                filter === btn.id
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-100"
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
                onClick={() => setSelectedTest(item)}
                className="bg-white shadow cursor-pointer border border-slate-100 p-4 md:p-6 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div
                    className={`p-3 md:p-5 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 shrink-0 ${
                      item.type === "front" || item.category === "front"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-emerald-50 text-emerald-500"
                    }`}
                  >
                    {item.type === "front" || item.category === "front" ? (
                      <Monitor size={24} />
                    ) : (
                      <Database size={24} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-slate-800 uppercase text-xs md:text-sm tracking-wider truncate">
                      {item.category || item.type}
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-sm mt-0.5 md:mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-medium whitespace-nowrap">
                        <Calendar size={12} />
                        {new Date(item.date).toLocaleDateString("ru-RU")}
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0" />
                      <span className="flex items-center gap-1 font-medium text-slate-500 whitespace-nowrap">
                        <CheckCircle2 size={12} />
                        {item.correct}/{item.total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div
                      className={`text-2xl md:text-3xl font-black leading-none ${
                        item.percent >= 80
                          ? "text-emerald-500"
                          : item.percent >= 50
                            ? "text-amber-500"
                            : "text-red-500"
                      }`}
                    >
                      {item.percent}%
                    </div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      Результат
                    </p>
                  </div>

                  {/* Кнопка просмотра детализации */}
                  <button
                    onClick={() => setSelectedTest(item)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-bold text-sm"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модалка с детальными результатами */}
      {selectedTest && (
        <TestDetailsModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
}

// Модальное окно с детальными результатами
function TestDetailsModal({ test, onClose }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} мин ${secs} сек`;
  };

  return (
    <div 
    onClick={()=>{
      onClose()
    }}
    className="fixed cursor-pointer inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Заголовок модалки */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              Детальные результаты
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {test.category || test.type} •{" "}
              {new Date(test.date).toLocaleDateString("ru-RU")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-4 gap-3 p-6 bg-slate-50 border-b border-slate-200">
          <div className="text-center">
            <div className="text-2xl font-black text-indigo-600">
              {test.percent}%
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Процент</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-green-600">
              {test.correct}/{test.total}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">
              Правильно
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-blue-600">
              {test.answered || test.total}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">
              Отвечено
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-orange-600">
              {formatTime(test.timeSpent || 0)}
            </div>
            <div className="text-xs text-slate-500 font-bold mt-1">Время</div>
          </div>
        </div>

        {/* Список вопросов */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {test.detailedResults && test.detailedResults.length > 0 ? (
            test.detailedResults.map((item, index) => (
              <QuestionCard key={index} item={item} />
            ))
          ) : (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="mx-auto mb-3" size={48} />
              <p>Детальная информация о вопросах недоступна</p>
              <p className="text-sm mt-2">
                Этот тест был пройден до обновления системы
              </p>
            </div>
          )}
        </div>

        {/* Подвал модалки */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

// Карточка вопроса
function QuestionCard({ item }) {
  return (
    <div
      className={`rounded-2xl p-5 border-2 ${
        item.isCorrect
          ? "border-green-200 bg-green-50/50"
          : item.wasAnswered
            ? "border-red-200 bg-red-50/50"
            : "border-orange-200 bg-orange-50/50"
      }`}
    >
      {/* Заголовок вопроса */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
            Вопрос {item.questionNumber}
          </span>
          {item.isCorrect && (
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle size={14} />
              Правильно
            </span>
          )}
          {!item.isCorrect && item.wasAnswered && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <XCircle size={14} />
              Неправильно
            </span>
          )}
          {!item.wasAnswered && (
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <AlertCircle size={14} />
              Не отвечено
            </span>
          )}
        </div>
        <h3 className="text-base font-bold text-slate-800">{item.question}</h3>
      </div>

      {/* Ваш ответ или статус */}
      <div className="space-y-3">
        {/* Если ответил правильно - показываем зеленую карточку */}
        {item.isCorrect && item.selectedAnswer && (
          <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div className="flex-1">
                <div className="text-xs text-green-600 font-bold mb-1">
                  Ваш ответ
                </div>
                <div className="font-bold text-green-900">
                  {item.selectedAnswer}
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                Правильно
              </span>
            </div>
          </div>
        )}

        {/* Если ответил неправильно - показываем красную карточку с вашим ответом */}
        {!item.isCorrect && item.wasAnswered && item.selectedAnswer && (
          <div className="p-4 rounded-xl border-2 border-red-500 bg-red-50">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600 flex-shrink-0" size={20} />
              <div className="flex-1">
                <div className="text-xs text-red-600 font-bold mb-1">
                  Ваш ответ
                </div>
                <div className="font-bold text-red-900">
                  {item.selectedAnswer}
                </div>
              </div>
              <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">
                Неправильно
              </span>
            </div>
          </div>
        )}

        {/* Если не отвечал - показываем предупреждение */}
        {!item.wasAnswered && (
          <div className="p-4 rounded-xl border-2 border-orange-300 bg-orange-50">
            <div className="flex items-center gap-3">
              <AlertCircle
                className="text-orange-600 flex-shrink-0"
                size={20}
              />
              <div className="flex-1">
                <div className="font-bold text-orange-900">
                  Вы не ответили на этот вопрос
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент карточки статистики
function StatCard({
  icon,
  label,
  value,
  color = "text-slate-800",
  className = "",
}) {
  return (
    <div
      className={`bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm ${className}`}
    >
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
      <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">
        Записей нет
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
        Вы еще не проходили тесты в этой категории.
      </p>
      <button
        onClick={() => navigate("/user/tests")}
        className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all text-sm"
      >
        Начать практику
      </button>
    </div>
  );
}

// Иконка History
function History({ className, size }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
