"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Code2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import FocusGuard from "@/shared/lib/focusGuard/FocusGuard";
import Swal from "sweetalert2";

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
  const { type } = useParams();

  const { questions, fetchQuestions, loading: questionsLoading } = useQuestionStore();

  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    if (questions.length === 0 || questionsLoading) return;

    const frontCategories = ["html", "javascript", "react", "typescript", "mixed"];
    const backCategories = ["Django", "python", "backend", "Spring", "Java основы", "Java продвинутый", "Основа", "Продвинутый"];
    const javaCategories = ["Java основы", "Java продвинутый", "Spring"];

    let filtered;

    if (type === "front") {
      filtered = questions.filter(q => frontCategories.some(cat => cat.toLowerCase() === q.category.toLowerCase()));
    } else if (type === "back") {
      filtered = questions.filter(q => backCategories.some(cat => cat.toLowerCase() === q.category.toLowerCase()));
    } else {
      filtered = questions.filter(q => q.category.toLowerCase() === type.toLowerCase());
    }

    if (filtered.length === 0) {
      setError(`Вопросы по категории "${type}" не найдены`);
      return;
    }

    const countToTake = Math.min(filtered.length, 20);
    const shuffled = shuffleArray(filtered).slice(0, countToTake);

    setTestQuestions(shuffled);
    setTimeLeft(shuffled.length * 60);
  }, [questions, questionsLoading, type]);

  useEffect(() => {
    if (isFinished || testQuestions.length === 0) return;

    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isFinished, testQuestions.length]);

  const finishTest = useCallback(() => {
    if (isFinished) return;

    setIsFinished(true);

    const detailedResults = testQuestions.map((q, index) => {
      const selectedIdx = answers[index];
      const selectedAnswer = selectedIdx !== undefined ? q.options[selectedIdx] : null;
      const isCorrect = selectedAnswer === q.answer;

      return {
        questionNumber: index + 1,
        question: q.question,
        options: q.options,
        selectedAnswer: selectedAnswer,
        correctAnswer: q.answer,
        isCorrect: isCorrect,
        wasAnswered: selectedIdx !== undefined
      };
    });

    const correctCount = detailedResults.filter(r => r.isCorrect).length;
    const answeredCount = detailedResults.filter(r => r.wasAnswered).length;

    const resultData = {
      id: Date.now(),
      category: type,
      total: testQuestions.length,
      correct: correctCount,
      answered: answeredCount,
      percent: Math.round((correctCount / testQuestions.length) * 100),
      date: new Date().toISOString(),
      timeSpent: (testQuestions.length * 60) - timeLeft,
      detailedResults: detailedResults
    };

    const history = JSON.parse(localStorage.getItem("practice_history") || "[]");
    localStorage.setItem("practice_history", JSON.stringify([resultData, ...history]));

    Swal.fire({
      title: "Тест завершен!",
      html: `
        <div class="text-left">
          <p class="mb-2">Правильных ответов: <b>${correctCount}</b> из <b>${testQuestions.length}</b></p>
          <p class="mb-2">Процент: <b>${resultData.percent}%</b></p>
          <p class="mb-2">Отвечено: <b>${answeredCount}</b> из <b>${testQuestions.length}</b></p>
          <p class="text-sm text-gray-500 mt-4">Детальные результаты сохранены в вашем профиле</p>
        </div>
      `,
      icon: resultData.percent >= 70 ? "success" : "warning",
      confirmButtonText: "Посмотреть результаты",
      showCancelButton: true,
      cancelButtonText: "В личный кабинет"
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/user/history`);
      } else {
        navigate("/user/profile");
      }
    });
  }, [testQuestions, answers, type, navigate, isFinished, timeLeft]);

  const handleManualSubmit = async () => {
    const answeredCount = Object.keys(answers).length;

    const result = await Swal.fire({
      title: "Завершить тест?",
      html: `
        <p>Вы ответили на <b>${answeredCount}</b> из <b>${testQuestions.length}</b> вопросов.</p>
        <p class="text-sm text-gray-500 mt-2">Неотвеченные вопросы будут засчитаны как неправильные.</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Да, завершить",
      cancelButtonText: "Отмена"
    });
    if (result.isConfirmed) finishTest();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (questionsLoading || (testQuestions.length === 0 && !error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-slate-500">Подготовка вопросов: {type}...</p>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Упс!</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Назад</button>
    </div>
  );

  const currentQuestion = testQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <FocusGuard reload={() => window.location.reload()} />

      <header className="bg-white border-b sticky top-0 z-20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Code2 size={24} />
            </div>
            <div>
              <h1 className="font-bold uppercase tracking-wider text-slate-700 text-sm md:text-base">
                Тест: {type}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Вопрос {currentQuestionIndex + 1} из {testQuestions.length} |
                Отвечено: {Object.keys(answers).length}
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 60
            ? 'bg-red-50 text-red-600 animate-pulse'
            : timeLeft < 300
              ? 'bg-orange-50 text-orange-600'
              : 'bg-slate-50 text-slate-600'
            }`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="flex-grow max-w-3xl w-full mx-auto p-4 py-8">
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-12">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            Вопрос #{currentQuestionIndex + 1}
          </span>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-10 leading-tight">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestionIndex] === index;
              return (
                <button
                  key={index}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }))}
                  className={`group w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100"
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300 group-hover:border-slate-400"
                    }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className={`text-base md:text-lg font-bold ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                    {option}
                  </span>
                  {isSelected && <CheckCircle className="text-indigo-600 ml-auto" size={20} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-2">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={24} />
            <span className="hidden md:inline">Назад</span>
          </button>

          <button
            onClick={handleManualSubmit}
            className="px-6 py-3 text-slate-400 hover:text-red-500 font-bold text-sm transition-colors"
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
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <span className="md:inline">
              {currentQuestionIndex === testQuestions.length - 1 ? 'Завершить' : 'Далее'}
            </span>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200">
          <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">
            Прогресс теста
          </h3>
          <div className="grid grid-cols-10 gap-2">
            {testQuestions.map((_, index) => {
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${isCurrent
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-300"
                    : isAnswered
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                    }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};