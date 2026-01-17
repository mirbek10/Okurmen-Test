"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Layout,
  Database
} from "lucide-react";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import FocusGuard from "@/shared/lib/focusGuard/FocusGuard";
import Swal from "sweetalert2";

// Перемешивание
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const PracticeTestPage = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // 'front' или 'back'

  const { questions, fetchQuestions, loading: questionsLoading } = useQuestionStore();

  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 минут по умолчанию (в секундах)
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  // 1. Загрузка данных
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        await fetchQuestions({ limit: 9999 });
      } catch (err) {
        setError("Ошибка загрузки вопросов");
      }
    };
    loadQuestions();
  }, [fetchQuestions]);

  // 2. Формирование теста
  useEffect(() => {
    if (questions.length === 0 || questionsLoading) return;

    // Список категорий для фильтрации
    const frontCategories = ["html", "javascript", "react", "typescript", "mixed"];
    const backCategories = ["nodejs", "mongodb", "postgresql", "python", "backend"]; // пример

    let filtered;
    if (type === "front") {
      filtered = questions.filter(q => frontCategories.includes(q.category.toLowerCase()));
    } else if (type === "back") {
      filtered = questions.filter(q => backCategories.includes(q.category.toLowerCase()));
    } else {
      filtered = questions;
    }

    if (filtered.length === 0) {
      setError("Вопросы для данного направления не найдены");
      return;
    }

    const shuffled = shuffleArray(filtered).slice(0, 20);
    setTestQuestions(shuffled);
    // Можно задать время динамически: например 1 минута на вопрос
    setTimeLeft(shuffled.length * 60); 
  }, [questions, questionsLoading, type]);

  // 3. Таймер обратного отсчета
  useEffect(() => {
    if (timeLeft <= 0 || isFinished) {
      if (timeLeft === 0) finishTest();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished]);

  // 4. Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 5. Завершение теста (Локальное)
  const finishTest = useCallback(() => {
    setIsFinished(true);
    
    // Рассчитываем результат локально
    let correctCount = 0;
    testQuestions.forEach(q => {
      const selectedIdx = answers[q.id];
      if (selectedIdx !== undefined && q.options[selectedIdx] === q.answer) {
        correctCount++;
      }
    });

    const resultData = {
      type,
      total: testQuestions.length,
      correct: correctCount,
      percent: Math.round((correctCount / testQuestions.length) * 100),
      date: new Date().toISOString()
    };

    // Сохраняем в историю локально
    const history = JSON.parse(localStorage.getItem("practice_history") || "[]");
    localStorage.setItem("practice_history", JSON.stringify([resultData, ...history]));

    Swal.fire({
      title: "Тест завершен!",
      html: `Ваш результат: <b>${resultData.percent}%</b> (${correctCount} из ${testQuestions.length})`,
      icon: "success",
      confirmButtonText: "В личный кабинет"
    }).then(() => navigate("/user/profile"));
  }, [testQuestions, answers, type, navigate]);

  const handleManualSubmit = async () => {
    const result = await Swal.fire({
      title: "Завершить?",
      text: "Вы хотите закончить тест и узнать результат?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Да",
      cancelButtonText: "Нет"
    });
    if (result.isConfirmed) finishTest();
  };

  if (questionsLoading || testQuestions.length === 0) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка {type} теста...</div>;
  }

  if (error) return <div className="p-10 text-center">{error}</div>;

  const currentQuestion = testQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <FocusGuard reload={() => window.location.reload()} />
      
      {/* Header с таймером */}
      <header className="bg-white border-b sticky top-0 z-20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {type === 'front' ? <Layout className="text-blue-500" /> : <Database className="text-emerald-500" />}
            <div>
              <h1 className="font-bold uppercase tracking-wider text-slate-700">
                {type === 'front' ? 'Frontend' : 'Backend'} Практика
              </h1>
              <p className="text-xs text-slate-400">Вопрос {currentQuestionIndex + 1} из {testQuestions.length}</p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="flex-grow max-w-3xl w-full mx-auto p-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              return (
                <button
                  key={index}
                  onClick={() => setAnswers({ ...answers, [currentQuestion.id]: index })}
                  className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected ? "border-indigo-500 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-lg ${isSelected ? "text-indigo-900 font-medium" : "text-slate-600"}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Навигация */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="p-4 text-slate-400 disabled:opacity-0"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={handleManualSubmit}
            className="bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-900 transition-transform active:scale-95 shadow-lg"
          >
            Завершить досрочно
          </button>

          <button
            onClick={() => {
              if (currentQuestionIndex < testQuestions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
              } else {
                handleManualSubmit();
              }
            }}
            className="p-4 text-indigo-600 bg-white rounded-full shadow-md"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      </main>
    </div>
  );
};