"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Code2,
  XCircle,
  X
} from "lucide-react";
import { axiosUser } from "@/shared/lib/api/axiosUser";
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
  const params = useParams();
  const [searchParams] = useSearchParams();
  const rawCategory = searchParams.get("category") || params.type || params["*"] || "";
  let selectedCategory = rawCategory;
  try {
    selectedCategory = decodeURIComponent(rawCategory);
  } catch {
    // Keep the original category if an old URL contains malformed escaping.
  }
  const category = selectedCategory.trim();

  const [testQuestions, setTestQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(1200);
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadQuestions = async () => {
      setQuestionsLoading(true);
      setError(null);
      setTestQuestions([]);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setIsFinished(false);
      try {
        const response = await axiosUser.get("/questions/practice", {
          params: { category },
          signal: controller.signal,
        });
        const selected = shuffleArray(response.data?.questions || []);
        if (selected.length === 0) {
          setError(`Вопросы по категории "${category}" не найдены`);
        } else {
          setTestQuestions(selected);
          setTimeLeft(selected.length * 60);
        }
      } catch {
        if (!controller.signal.aborted) setError("Ошибка загрузки вопросов. Попробуйте ещё раз.");
      } finally {
        if (!controller.signal.aborted) setQuestionsLoading(false);
      }
    };
    loadQuestions();
    return () => controller.abort();
  }, [category]);

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
        selectedAnswer,
        correctAnswer: q.answer,
        isCorrect,
        wasAnswered: selectedIdx !== undefined,
      };
    });

    const correctCount = detailedResults.filter((result) => result.isCorrect).length;
    const answeredCount = detailedResults.filter((result) => result.wasAnswered).length;
    const resultData = {
      id: Date.now(),
      category,
      total: testQuestions.length,
      correct: correctCount,
      answered: answeredCount,
      percent: Math.round((correctCount / testQuestions.length) * 100),
      date: new Date().toISOString(),
      timeSpent: (testQuestions.length * 60) - timeLeft,
      detailedResults,
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
      cancelButtonText: "В личный кабинет",
    }).then((result) => {
      navigate(result.isConfirmed ? "/user/history" : "/user/profile");
    });
  }, [testQuestions, answers, category, navigate, isFinished, timeLeft]);

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
  }, [timeLeft, isFinished, testQuestions.length, finishTest]);

  // Клавиатура: 1–4 — выбрать ответ, ← / → — предыдущий / следующий вопрос.
  useEffect(() => {
    if (isFinished || testQuestions.length === 0) return;
    const onKey = (event) => {
      if (event.target.closest?.("input, textarea, .swal2-container")) return;
      const question = testQuestions[currentQuestionIndex];
      const digit = Number(event.key);
      if (digit >= 1 && digit <= (question?.options.length || 0)) {
        setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: digit - 1 }));
      } else if (event.key === "ArrowRight") {
        setCurrentQuestionIndex((prev) => Math.min(testQuestions.length - 1, prev + 1));
      } else if (event.key === "ArrowLeft") {
        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentQuestionIndex, testQuestions, isFinished]);

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
      showDenyButton: answeredCount < testQuestions.length,
      confirmButtonText: "Да, завершить",
      denyButtonText: "К неотвеченному",
      cancelButtonText: "Отмена"
    });
    if (result.isConfirmed) finishTest();
    else if (result.isDenied) {
      const next = testQuestions.findIndex((_, index) => answers[index] === undefined);
      if (next >= 0) setCurrentQuestionIndex(next);
    }
  };

  const firstUnanswered = testQuestions.findIndex((_, index) => answers[index] === undefined);

  const handleExit = async () => {
    const result = await Swal.fire({
      title: "Выйти из тренировки?",
      text: "Ответы не сохранятся. Начать заново можно в любой момент.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Выйти",
      cancelButtonText: "Продолжить",
      reverseButtons: true,
    });
    if (result.isConfirmed) navigate("/user/tests");
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
        <p className="font-bold text-slate-500">Готовим вопросы по теме «{category}»…</p>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Не получилось начать тренировку</h2>
      <p className="text-slate-500 mb-6">{error}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Попробовать снова</button>
        <button onClick={() => navigate("/user/tests")} className="border border-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold">К списку тем</button>
      </div>
    </div>
  );

  const currentQuestion = testQuestions[currentQuestionIndex];
  const answeredTotal = Object.keys(answers).length;
  const progress = (answeredTotal / testQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      <header className="bg-white border-b sticky top-0 z-20 px-4 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={handleExit} aria-label="Выйти из тренировки" title="Выйти из тренировки" className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={22} />
            </button>
            <div className="hidden sm:block p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <Code2 size={24} />
            </div>
            <div>
              <h1 className="font-bold uppercase tracking-wider text-slate-700 text-sm md:text-base">
                Тест: {category}
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Вопрос {currentQuestionIndex + 1} из {testQuestions.length} · Отвечено {answeredTotal} из {testQuestions.length}
              </p>
            </div>
          </div>

          <div title="Осталось времени" className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 60
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
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setAnswers(prev => ({ ...prev, [currentQuestionIndex]: index }))}
                  className={`group w-full flex items-center p-5 rounded-2xl border-2 transition-all text-left ${isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-md shadow-indigo-100"
                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <div className={`w-8 h-8 shrink-0 rounded-full border-2 mr-4 flex items-center justify-center text-sm font-black transition-colors ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-slate-400 group-hover:border-slate-400"
                    }`}>
                    {index + 1}
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
            className="flex items-center gap-1 px-3 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-800 hover:bg-white disabled:invisible transition-all"
          >
            <ChevronLeft size={24} />
            <span>Назад</span>
          </button>

          <button
            onClick={handleManualSubmit}
            className="px-3 py-3 text-slate-500 hover:text-red-600 font-bold text-sm transition-colors"
          >
            Завершить
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">
              Все вопросы
            </h3>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded bg-green-200 border border-green-300" /> Отвечен</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> Без ответа</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded bg-indigo-600" /> Текущий</span>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {testQuestions.map((_, index) => {
              const isAnswered = answers[index] !== undefined;
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Вопрос ${index + 1}${isAnswered ? ", отвечен" : ", без ответа"}`}
                  aria-current={isCurrent ? "step" : undefined}
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
          {firstUnanswered >= 0 && answeredTotal > 0 && (
            <button type="button" onClick={() => setCurrentQuestionIndex(firstUnanswered)} className="mt-4 text-sm font-bold text-indigo-600 hover:underline">
              Перейти к первому вопросу без ответа (№{firstUnanswered + 1})
            </button>
          )}
          <p className="mt-4 hidden sm:block text-xs text-slate-400">Подсказка: клавиши 1–4 выбирают ответ, стрелки ← → листают вопросы.</p>
        </div>
      </main>
    </div>
  );
};

