"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Shuffle,
} from "lucide-react";
import { useSetAnswere } from "@/app/stores/user/setAnswer";
import { useTestStatus } from "@/app/stores/user/getTestStatus";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import FocusGuard from "@/shared/lib/focusGuard/FocusGuard";
import { toast } from "react-toastify";

// Функция для перемешивания массива (алгоритм Фишера-Йетса)
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Функция для генерации уникального ID теста на основе категории и студента
const generateTestSessionId = (categoryId, studentId) => {
  const timestamp = Date.now();
  return `${categoryId}-${studentId}-${timestamp}`;
};

export const StudentTestPage = () => {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();

  // Сторы
  const { postAnswe, forcePostAnswere } = useSetAnswere();
  const { status, getStatus } = useTestStatus();
  const {
    questions,
    fetchQuestions,
    loading: questionsLoading,
  } = useQuestionStore();

  // Состояния
  const [loading, setLoading] = useState(true);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [testSessionId, setTestSessionId] = useState(null);

  // Получаем код доступа из localStorage
  const code = useMemo(() => {
    try {
      const storedCode = localStorage.getItem("code");
      return storedCode ? JSON.parse(storedCode) : null;
    } catch (e) {
      console.error("Ошибка получения кода:", e);
      return null;
    }
  }, []);

  // 1. Получение данных студента
  useEffect(() => {
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        setStudentData(user.student || user);
      }
    } catch (e) {
      console.error("Ошибка парсинга данных студента:", e);
    }
  }, []);

  // 2. Загрузка вопросов для выбранной категории
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем вопросы для выбранной категории
        await fetchQuestions({
          category: categoryId === "mixed" ? "" : categoryId,
          limit: 9999, // Загружаем все вопросы категории
        });
      } catch (err) {
        console.error("Ошибка загрузки вопросов:", err);
        setError("Не удалось загрузить вопросы для теста");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadQuestions();
    }
  }, [categoryId, fetchQuestions]);

  // 3. Формирование теста из 20 случайных вопросов
  useEffect(() => {
    if (questions.length === 0 || questionsLoading) return;

    try {
      // Фильтруем вопросы по категории (если не mixed тест)
      let filteredQuestions = questions;
      if (categoryId !== "mixed") {
        filteredQuestions = questions.filter((q) => q.category === categoryId);
      }

      if (filteredQuestions.length === 0) {
        setError(`В категории "${categoryId}" нет доступных вопросов`);
        return;
      }

      // Проверяем, есть ли сохраненная сессия теста
      const savedSessionId = localStorage.getItem(`test_session_${categoryId}`);
      const savedSessionData = savedSessionId
        ? JSON.parse(localStorage.getItem(savedSessionId) || "{}")
        : null;

      let selectedQuestions;
      let sessionId;

      if (
        savedSessionData?.questions &&
        savedSessionData?.studentId === studentData?.studentId
      ) {
        // Используем сохраненную сессию
        sessionId = savedSessionId;
        selectedQuestions = savedSessionData.questions;
        setAnswers(savedSessionData.answers || {});
        setCurrentQuestionIndex(savedSessionData.currentIndex || 0);
      } else {
        const maxQuestions = Math.min(20, filteredQuestions.length);

        // Перемешиваем вопросы
        const shuffled = shuffleArray(filteredQuestions);

        // Берем первые maxQuestions вопросов
        selectedQuestions = shuffled.slice(0, maxQuestions);

        // Генерируем ID сессии
        sessionId = generateTestSessionId(
          categoryId,
          studentData?.studentId || "guest"
        );

        // Сохраняем сессию
        localStorage.setItem(`test_session_${categoryId}`, sessionId);
        localStorage.setItem(
          sessionId,
          JSON.stringify({
            studentId: studentData?.studentId || "guest",
            category: categoryId,
            questions: selectedQuestions,
            answers: {},
            currentIndex: 0,
            createdAt: new Date().toISOString(),
          })
        );
      }

      setTestQuestions(selectedQuestions);
      setTestSessionId(sessionId);
    } catch (err) {
      console.error("Ошибка формирования теста:", err);
      setError("Ошибка при создании теста");
    }
  }, [questions, questionsLoading, categoryId, studentData]);

  // 4. Сохранение прогресса теста в localStorage
  useEffect(() => {
    if (!testSessionId || !testQuestions.length) return;

    const saveProgress = () => {
      try {
        const sessionData = {
          studentId: studentData?.studentId || "guest",
          category: categoryId,
          questions: testQuestions,
          answers,
          currentIndex: currentQuestionIndex,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(testSessionId, JSON.stringify(sessionData));
      } catch (err) {
        console.error("Ошибка сохранения прогресса:", err);
      }
    };

    // Сохраняем при изменении ответов или текущего вопроса
    saveProgress();
  }, [
    testSessionId,
    testQuestions,
    answers,
    currentQuestionIndex,
    categoryId,
    studentData,
  ]);

  // 5. ФУНКЦИЯ ОТПРАВКИ (сборка payload и запрос)
  const submitTest = useCallback(
    async (finalAnswers, isAuto) => {
      if (isSubmitting || !testQuestions.length) return;
      setIsSubmitting(true);

      const formattedAnswers = testQuestions.map((question, index) => {
        const selectedOptionId = finalAnswers[question.id];
        let selectedOptionText = null;
        let isCorrect = false;

        if (selectedOptionId !== undefined) {
          // Находим выбранный вариант
          const selectedOptionIndex = parseInt(selectedOptionId);
          if (
            !isNaN(selectedOptionIndex) &&
            question.options[selectedOptionIndex]
          ) {
            selectedOptionText = question.options[selectedOptionIndex];
            // Сравнение выбранного варианта с правильным ответом
            isCorrect = selectedOptionText === question.answer;
          }
        }

        return {
          question: question.question,
          answer: selectedOptionText || "Нет ответа",
          isCorrect: isCorrect,
          questionId: question.id,
          questionIndex: index + 1,
        };
      });

      const payload = {
        testCode: String(code || ""),
        studentId: studentData?.studentId || 0,
        studentName: studentData?.name || "Анонимный студент",
        category: categoryId,
        answers: formattedAnswers,
        totalQuestions: testQuestions.length,
        answeredQuestions: Object.keys(finalAnswers).length,
        testSessionId: testSessionId,
      };

      try {
        if (isAuto) {
          await forcePostAnswere(payload);
        } else {
          await postAnswe(payload);
        }

        // Очищаем сохраненную сессию
        localStorage.removeItem(`test_session_${categoryId}`);
        if (testSessionId) {
          localStorage.removeItem(testSessionId);
        }

        toast.success(
          "Ваш результат успешно отправлен! Спасибо за прохождение теста."
        );

        localStorage.removeItem("code");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Ошибка при отправке ответов:", err);
        setError("Ошибка при отправке результатов. Попробуйте еще раз.");
        setIsSubmitting(false);
      }
    },
    [
      testQuestions,
      code,
      studentData,
      categoryId,
      testSessionId,
      navigate,
      postAnswe,
      isSubmitting,
    ]
  );

  // 6. ПОЛЛИНГ СТАТУСА (Проверка завершения теста сервером)
  useEffect(() => {
    if (!code || isSubmitting) return;

    // Сразу проверяем статус при входе
    getStatus(String(code));

    // Опрос каждые 5 секунд
    const intervalId = setInterval(() => {
      getStatus(String(code));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [code, getStatus, isSubmitting]);

  // 7. РЕАКЦИЯ НА ИЗМЕНЕНИЕ СТАТУСА (Авто-отправка)
  useEffect(() => {
    if (status === "finished" && !isSubmitting) {
      console.log("Тест завершен удаленно. Авто-отправка ответов...");
      submitTest(answers, "auto");
    }
  }, [status, answers, submitTest, isSubmitting]);

  // Обработчики интерфейса
  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleManualSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const totalCount = testQuestions.length;

    let message = "Вы уверены, что хотите завершить тест?";

    if (answeredCount < totalCount) {
      message = `Вы ответили на ${answeredCount} из ${totalCount} вопросов. Всё равно завершить?`;
    }

    const result = await Swal.fire({
      title: "Завершить тест?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да, завершить",
      cancelButtonText: "Отмена",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      submitTest(answers);
    }
  };

  // Функция для перегенерации теста (новые случайные вопросы)
  const regenerateTest = () => {
    if (!testQuestions.length || isSubmitting) return;

    // Очищаем сохраненную сессию
    localStorage.removeItem(`test_session_${categoryId}`);
    if (testSessionId) {
      localStorage.removeItem(testSessionId);
    }

    // Сбрасываем состояние
    setTestQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTestSessionId(null);

    // Формируем новый тест
    const filteredQuestions =
      categoryId !== "mixed"
        ? questions.filter((q) => q.category === categoryId)
        : questions;

    const maxQuestions = Math.min(20, filteredQuestions.length);
    const shuffled = shuffleArray(filteredQuestions);
    const newQuestions = shuffled.slice(0, maxQuestions);

    // Создаем новую сессию
    const newSessionId = generateTestSessionId(
      categoryId,
      studentData?.studentId || "guest"
    );
    localStorage.setItem(`test_session_${categoryId}`, newSessionId);
    localStorage.setItem(
      newSessionId,
      JSON.stringify({
        studentId: studentData?.studentId || "guest",
        category: categoryId,
        questions: newQuestions,
        answers: {},
        currentIndex: 0,
        createdAt: new Date().toISOString(),
      })
    );

    setTestQuestions(newQuestions);
    setTestSessionId(newSessionId);
  };

  // Вычисляемые данные для текущего экрана
  const currentQuestion = testQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testQuestions.length - 1;
  const progressPercentage = testQuestions.length
    ? ((currentQuestionIndex + 1) / testQuestions.length) * 100
    : 0;

  // Названия категорий для отображения
  const categoryNames = {
    html: "HTML/CSS",
    javascript: "JavaScript",
    react: "React/Redux",
    typescript: "TypeScript",
    mixed: "Смешанный тест",
  };

  if (loading || questionsLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center animate-pulse gap-4">
          <HelpCircle className="w-12 h-12 text-blue-400" />
          <p className="text-gray-600 font-medium">Загрузка вопросов...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">{error}</h2>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            На главную
          </button>
        </div>
      </div>
    );

  if (isSubmitting)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold">Сохранение результатов...</h2>
        </div>
      </div>
    );

  if (!currentQuestion)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Тест не загружен</h2>
          <p className="text-gray-600 mb-6">Попробуйте обновить страницу</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Обновить
          </button>
        </div>
      </div>
    );

  return (
    <>
      <FocusGuard reload={regenerateTest} />
      <div className="min-h-screen bg-gray-50 pb-10 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h1 className="text-lg font-bold text-gray-800">
                  {categoryNames[categoryId] || "Тест"} | {testQuestions.length}{" "}
                  вопросов
                </h1>
                <p className="text-sm text-gray-500">
                  Вопрос {currentQuestionIndex + 1} из {testQuestions.length}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* <button
                onClick={regenerateTest}
                disabled={isSubmitting}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
                title="Новый набор вопросов"
              >
                <Shuffle className="w-4 h-4" />
                Новый тест
              </button> */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    status === "started"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {status === "started" ? "● АКТИВЕН" : "● ЗАВЕРШЕНИЕ..."}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </header>

        <main className="flex-grow max-w-3xl w-full mx-auto px-4 py-8 sm:px-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            <div className="p-6 sm:p-8">
              {/* Индикатор сложности */}
              <div className="mb-4 flex justify-between items-center">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    currentQuestion.difficulty === "легкий"
                      ? "bg-green-100 text-green-700"
                      : currentQuestion.difficulty === "средний"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {currentQuestion.difficulty || "средний"}
                </span>
                <span className="text-sm text-gray-500">
                  Ответов: {Object.keys(answers).length}/{testQuestions.length}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-8 leading-relaxed">
                {currentQuestion.question}
              </h2>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = answers[currentQuestion.id] === index;
                  return (
                    <label
                      key={index}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        className="hidden"
                        checked={isSelected}
                        onChange={() =>
                          handleSelectOption(currentQuestion.id, index)
                        }
                      />
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 mr-4 flex items-center justify-center ${
                          isSelected
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={`text-base sm:text-lg ${
                          isSelected
                            ? "text-blue-800 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-4 sm:px-8 sm:py-6 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                    currentQuestionIndex === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" /> Назад
                </button>

                <div className="flex items-center gap-3">
                  {!isLastQuestion && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow"
                    >
                      Следующий <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  <button
                    onClick={handleManualSubmit}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" /> Завершить тест
                  </button>
                </div>
              </div>

              {/* Навигация по вопросам */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Навигация по вопросам:
                </p>
                <div className="flex flex-wrap gap-2">
                  {testQuestions.map((_, index) => {
                    const isAnswered =
                      answers[testQuestions[index].id] !== undefined;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-2 ring-blue-300"
                            : isAnswered
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Информация о тесте */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-medium mb-1">📝 Информация о тесте:</p>
            <ul className="space-y-1">
              <li>
                • Категория:{" "}
                <span className="font-medium">{categoryNames[categoryId]}</span>
              </li>
              <li>
                • Всего вопросов:{" "}
                <span className="font-medium">{testQuestions.length}</span>
              </li>
              <li>
                • Ответов сохранено:{" "}
                <span className="font-medium">
                  {Object.keys(answers).length}
                </span>
              </li>
              <li>• Прогресс автоматически сохраняется</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
};
