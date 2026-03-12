"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  Shuffle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSetAnswere } from "@/app/stores/user/setAnswer";
import { useTestStatus } from "@/app/stores/user/getTestStatus";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";
import { useTestCategoryStore } from "@/app/stores/all/getTestCategory";
import FocusGuard from "@/shared/lib/focusGuard/FocusGuard";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateTestSessionId = (categoryId, studentId) => {
  const timestamp = Date.now();
  return `${categoryId}-${studentId}-${timestamp}`;
};

export const StudentTestPage = () => {
  const navigate = useNavigate();
  const { id: categoryId } = useParams();

  const { postAnswe, forcePostAnswere } = useSetAnswere();
  const { status, getStatus } = useTestStatus();
  const {
    questions,
    fetchQuestions,
    loading: questionsLoading,
  } = useQuestionStore();
  const { testCategories, fetchTestCategories } = useTestCategoryStore();

  const [loading, setLoading] = useState(true);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [testSessionId, setTestSessionId] = useState(null);

  const code = useMemo(() => {
    try {
      const storedCode = localStorage.getItem("code");
      return storedCode ? JSON.parse(storedCode) : null;
    } catch (e) {
      console.error("Ошибка получения кода:", e);
      return null;
    }
  }, []);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchQuestions({
            category: categoryId === "mixed" ? "" : categoryId,
            limit: 9999,
          }),
          fetchTestCategories()
        ]);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не удалось загрузить данные теста");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadData();
    }
  }, [categoryId, fetchQuestions, fetchTestCategories]);

  useEffect(() => {
    if (questions.length === 0 || questionsLoading) return;

    try {
      let filteredQuestions = questions;
      if (categoryId !== "mixed") {
        filteredQuestions = questions.filter((q) => q.category === categoryId);
      }

      if (filteredQuestions.length === 0) {
        setError(`В категории "${categoryId}" нет доступных вопросов`);
        return;
      }

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
        sessionId = savedSessionId;
        selectedQuestions = savedSessionData.questions;

        if (savedSessionData.answers) {
          setSelectedAnswers(savedSessionData.answers);
        }
        if (savedSessionData.currentIndex !== undefined) {
          setCurrentQuestionIndex(savedSessionData.currentIndex);
        }
      } else {
        const maxQuestions = Math.min(20, filteredQuestions.length);
        const shuffled = shuffleArray(filteredQuestions);
        selectedQuestions = shuffled.slice(0, maxQuestions);

        sessionId = generateTestSessionId(
          categoryId,
          studentData?.studentId || "guest"
        );

        localStorage.setItem(`test_session_${categoryId}`, sessionId);
        localStorage.setItem(
          sessionId,
          JSON.stringify({
            studentId: studentData?.studentId || "guest",
            category: categoryId,
            questions: selectedQuestions,
            answers: {},
            createdAt: new Date().toISOString(),
          })
        );

        setSelectedAnswers({});
      }

      setTestQuestions(selectedQuestions);
      setTestSessionId(sessionId);
    } catch (err) {
      console.error("Ошибка формирования теста:", err);
      setError("Ошибка при создании теста");
    }
  }, [questions, questionsLoading, categoryId, studentData]);

  useEffect(() => {
    if (!testSessionId || !testQuestions.length) return;

    const saveProgress = () => {
      try {
        const sessionData = {
          studentId: studentData?.studentId || "guest",
          category: categoryId,
          questions: testQuestions,
          answers: selectedAnswers,
          currentIndex: currentQuestionIndex,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem(testSessionId, JSON.stringify(sessionData));
      } catch (err) {
        console.error("Ошибка сохранения прогресса:", err);
      }
    };

    saveProgress();
  }, [testSessionId, testQuestions, selectedAnswers, currentQuestionIndex, categoryId, studentData]);

  const submitTest = useCallback(
    async (finalAnswers, isAuto) => {
      if (isSubmitting || !testQuestions.length) return;

      setIsSubmitting(true);

      const formattedAnswers = testQuestions.map((question, index) => {
        const questionId = question._id || question.id || `q_${index}`;
        const selectedOptionId = finalAnswers[questionId];
        let selectedOptionText = null;
        let isCorrect = false;

        if (selectedOptionId !== undefined) {
          const selectedOptionIndex = parseInt(selectedOptionId);
          if (
            !isNaN(selectedOptionIndex) &&
            question.options[selectedOptionIndex]
          ) {
            selectedOptionText = question.options[selectedOptionIndex];
            isCorrect = selectedOptionText === question.answer;
          }
        }

        return {
          question: question.question,
          answer: selectedOptionText || "Нет ответа",
          isCorrect: isCorrect,
          questionId: questionId,
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

        localStorage.removeItem(`test_session_${categoryId}`);
        if (testSessionId) {
          localStorage.removeItem(testSessionId);
        }

        toast.success(
          "Ваш результат успешно отправлен! Спасибо за прохождение теста."
        );
        localStorage.removeItem("code");
        window.location.href = "/";
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
      forcePostAnswere,
      isSubmitting,
    ]
  );

  useEffect(() => {
    if (!code || isSubmitting) return;

    getStatus(String(code));

    const intervalId = setInterval(() => {
      getStatus(String(code));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [code, getStatus, isSubmitting]);

  useEffect(() => {
    if (status === "finished" && !isSubmitting) {
      console.log("Тест завершен удаленно. Авто-отправка ответов...");
      submitTest(selectedAnswers, "auto");
    }
  }, [status, selectedAnswers, submitTest, isSubmitting]);

  const handleAnswerChange = (questionId, optionIndex) => {
    setSelectedAnswers(prev => {
      const updated = { ...prev };
      updated[questionId] = optionIndex;
      return updated;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSubmit = async () => {
    const answeredCount = Object.keys(selectedAnswers).length;
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
      submitTest(selectedAnswers);
    }
  };

  const progressPercentage = testQuestions.length
    ? ((currentQuestionIndex + 1) / testQuestions.length) * 100
    : 0;

  const currentQuestion = testQuestions[currentQuestionIndex];
  const questionId = currentQuestion ? (currentQuestion._id || currentQuestion.id || `q_${currentQuestionIndex}`) : null;
  const currentAnswer = questionId ? selectedAnswers[questionId] : undefined;
  const isLastQuestion = currentQuestionIndex === testQuestions.length - 1;

  const getCategoryName = () => {
    if (!categoryId) return "Тест";
    if (categoryId === "mixed") return "Смешанный тест";
    return testCategories.find(c => c.category === categoryId)?.category || categoryId;
  };

  const categoryDisplayName = getCategoryName();

  const handleResetTest = useCallback(() => {
    localStorage.removeItem(`test_session_${categoryId}`);
    if (testSessionId) {
      localStorage.removeItem(testSessionId);
    }
  }, [categoryId, testSessionId]);

  if (loading || questionsLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-600 mb-4">Загрузка вопросов...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
          <div className="text-gray-800 font-semibold mb-2">{error}</div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-600 mb-4">Сохранение результатов...</div>
        </div>
      </div>
    );

  if (!testQuestions.length || !currentQuestion)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-600 mb-4">Тест не загружен</div>
          <p className="text-sm text-gray-500 mb-6">
            Попробуйте обновить страницу
          </p>
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
      <FocusGuard reload={() => handleResetTest()} isTestActive={!isSubmitting && testQuestions.length > 0} />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-800">
                {categoryDisplayName} | {testQuestions.length}{" "}
                вопросов
              </h1>
              <span
                className={`text-sm font-medium ${status === "started" ? "text-green-600" : "text-red-600"
                  }`}
              >
                {status === "started" ? "● АКТИВЕН" : "● ЗАВЕРШЕНИЕ..."}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">
                Вопрос {currentQuestionIndex + 1} из {testQuestions.length}
              </span>
              <span className="text-sm text-gray-600">
                Отвечено: {Object.keys(selectedAnswers).length} из{" "}
                {testQuestions.length}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    Вопрос {currentQuestionIndex + 1}
                  </span>
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
                    {currentQuestion.difficulty || "средний"}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {currentQuestion.question}
                </h3>
              </div>
              {currentAnswer !== undefined && (
                <CheckCircle
                  className="text-green-500 flex-shrink-0 ml-2"
                  size={24}
                />
              )}
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = currentAnswer === optionIndex;

                return (
                  <div
                    key={`${questionId}-option-${optionIndex}`}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAnswerChange(questionId, optionIndex);
                    }}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${isSelected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-400"
                          }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span
                        className={`flex-1 ${isSelected
                          ? "font-medium text-blue-900"
                          : "text-gray-700"
                          }`}
                      >
                        {option}
                      </span>
                      {isSelected && (
                        <CheckCircle className="text-blue-600 ml-2" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft size={20} />
              Назад
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Следующий
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Завершить тест
                <CheckCircle size={20} />
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">
              Навигация по вопросам:
            </h3>
            <div className="grid grid-cols-10 gap-2">
              {testQuestions.map((question, index) => {
                const qId = question._id || question.id || `q_${index}`;
                const isAnswered = selectedAnswers[qId] !== undefined;
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={qId}
                    onClick={() => goToQuestion(index)}
                    className={`h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isCurrent
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : isAnswered
                        ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-2">
              📝 Информация о тесте:
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Категория:{" "}
                <span className="font-medium">{categoryDisplayName}</span>
              </li>
              <li>
                • Всего вопросов:{" "}
                <span className="font-medium">{testQuestions.length}</span>
              </li>
              <li>
                • Ответов сохранено:{" "}
                <span className="font-medium">
                  {Object.keys(selectedAnswers).length}
                </span>
              </li>
              <li>• Прогресс автоматически сохраняется</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

