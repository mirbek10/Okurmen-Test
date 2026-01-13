import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminPreviewStore } from "@/app/stores/admin/adminPreview";
import { useQuestionStore } from "@/app/stores/admin/useQuestionStore";

export function Dashboard() {
  const {
    res,
    loading: previewLoading,
    error: previewError,
    start,
    clearRes, // ⬅️ ДОБАВИТЬ ЭТОТ МЕТОД В STORE
  } = useAdminPreviewStore();

  const {
    questions,
    total,
    fetchQuestions,
    loading: questionsLoading,
  } = useQuestionStore();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [maxStudents, setMaxStudents] = useState(30);
  const [duration, setDuration] = useState(60);
  const [group, setGroup] = useState("");
  const [teacher, setTeacher] = useState("");
  const [error, setError] = useState("");
  const [tests, setTests] = useState([]);
  const [isCreatingTest, setIsCreatingTest] = useState(false); // ⬅️ новый стейт

  const navigate = useNavigate();
  const redirectRef = useRef(false); // ⬅️ используем ref вместо hasRun

  // Загружаем вопросы при монтировании
  useEffect(() => {
    fetchQuestions();

    // Очищаем состояние при монтировании компонента
    return () => {
      if (redirectRef.current) {
        // Если был редирект, очищаем res при размонтировании
        clearRes();
      }
    };
  }, [fetchQuestions]);

  // Создаем тесты на основе полученных вопросов
  useEffect(() => {
    if (questions.length > 0) {
      createTestsFromQuestions();
    }
  }, [questions]);

  const createTestsFromQuestions = useCallback(() => {
    if (questions.length === 0) return;

    // Считаем вопросы по всем категориям, включая python
    const categoryCounts = {
      html: 0,
      javascript: 0,
      react: 0,
      typescript: 0,
      python: 0, // Добавили Python
    };

    questions.forEach((q) => {
      const cat = q.category?.toLowerCase();
      if (categoryCounts.hasOwnProperty(cat)) {
        categoryCounts[cat]++;
      }
    });

    // 1. Одиночные тесты
    const availableTests = [
      {
        id: "html",
        name: "HTML/CSS",
        questionsCount: categoryCounts.html,
        category: "html",
        icon: "🔵",
        description: "Основы верстки",
      },
      {
        id: "javascript",
        name: "JavaScript",
        questionsCount: categoryCounts.javascript,
        category: "javascript",
        icon: "🟡",
        description: "Deep Dive JS",
      },
      {
        id: "react",
        name: "React/Redux",
        questionsCount: categoryCounts.react,
        category: "react",
        icon: "🔷",
        description: "Frontend Frameworks",
      },
      {
        id: "typescript",
        name: "TypeScript",
        questionsCount: categoryCounts.typescript,
        category: "typescript",
        icon: "🟣",
        description: "Static Typing",
      },
      {
        id: "python",
        name: "Python Core",
        questionsCount: categoryCounts.python,
        category: "python",
        icon: "🐍",
        description: "Backend & Data Science",
      },
    ];

    // 2. Логика для Смешанного FRONTEND (HTML + JS + React + TS)
    const frontCategories = ["html", "javascript", "react", "typescript"];
    const hasEnoughFront = frontCategories.every(
      (cat) => categoryCounts[cat] >= 3
    ); // например, минимум по 3 вопроса

    if (hasEnoughFront) {
      availableTests.push({
        id: "mixed_frontend",
        name: "Смешанный FRONTEND",
        description: "Комплексный тест: HTML, JS, React и TS",
        questionsCount: 20, // Суммарно сколько будет в тесте
        category: "frontend", // Эту категорию должен уметь обрабатывать бэкенд
        difficulty: "mixed",
        icon: "🚀",
      });
    }

    // 3. Логика для Смешанного PYTHON (если у вас внутри python есть подкатегории или просто общий тест)
    // Если Python просто одна категория, он уже есть в списке выше.
    // Но если нужно пометить его именно как "Смешанный Python" (например, основы + django):
    if (categoryCounts.python >= 10) {
      availableTests.push({
        id: "mixed_python",
        name: "Смешанный PYTHON",
        description: "Core Python, Алгоритмы и ООП",
        questionsCount: Math.min(categoryCounts.python, 25),
        category: "python",
        difficulty: "advanced",
        icon: "🔥",
      });
    }

    const filteredTests = availableTests.filter(
      (test) => test.questionsCount > 0
    );
    setTests(filteredTests);
  }, [questions]);

  // Обработка редиректа после успешного создания теста
  useEffect(() => {
    // Проверяем, что:
    // 1. Есть результат (res)
    // 2. Мы в процессе создания теста (isCreatingTest)
    // 3. Редирект еще не был выполнен
    if (res?.id && isCreatingTest && !redirectRef.current) {
      redirectRef.current = true; // Устанавливаем флаг редиректа

      // Навигация с небольшей задержкой для плавности
      setTimeout(() => {
        navigate(`/admin/test-monitor/${res.id}`);

        // Сбрасываем состояния
        setIsCreatingTest(false);
        setShowSettingsModal(false);
        setSelectedTest(null);

        // Очищаем форму
        setGroup("");
        setTeacher("");
        setError("");

        // Очищаем результат в сторе
        clearRes();
      }, 100);
    }
  }, [res, isCreatingTest, navigate, clearRes]);

  const handleSelectTest = (test) => {
    setSelectedTest(test);
    setShowSettingsModal(true);
    setError(""); // Очищаем ошибки при открытии модалки
  };

  const handleStartTest = async () => {
    if (!selectedTest) return;

    if (!group.trim() || !teacher.trim()) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    // Сбрасываем флаг редиректа перед началом
    redirectRef.current = false;
    setIsCreatingTest(true);

    const testSettings = {
      category: selectedTest.category,
      group: group.trim(),
      teacher: teacher.trim(),
      maxStudents: parseInt(maxStudents),
      testDuration: parseInt(duration),
      testName: selectedTest.name,
      totalQuestions: selectedTest.questionsCount,
    };

    try {
      await start(testSettings);
    } catch (error) {
      console.error(error);
      setError("Произошла ошибка при запуске теста");
      setIsCreatingTest(false); // Сбрасываем флаг при ошибке
    }
  };

  const handleCloseModal = () => {
    setShowSettingsModal(false);
    setSelectedTest(null);
    setMaxStudents(30);
    setDuration(60);
    setGroup("");
    setTeacher("");
    setError("");
    setIsCreatingTest(false); // ⬅️ Сбрасываем флаг создания
  };

  // Обработчик нажатия клавиши Esc для закрытия модального окна
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && showSettingsModal) {
        handleCloseModal();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [showSettingsModal]);
  // Статистика по всем вопросам
  const getStats = () => {
    const stats = {
      totalQuestions: total,
      categories: tests.reduce((acc, test) => {
        acc[test.name] = test.questionsCount;
        return acc;
      }, {}),
    };
    return stats;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок и статистика */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Панель администратора
          </h1>
          <p className="text-gray-600 mb-4">Выберите тест для начала</p>

          {/* Статистика */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    База вопросов
                  </h3>
                  <p className="text-gray-600">
                    {questionsLoading ? (
                      <span className="animate-pulse">Загрузка...</span>
                    ) : (
                      <span>
                        Всего вопросов:{" "}
                        <span className="font-bold">{total}</span>
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/admin/questions")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Управление вопросами
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Список доступных тестов */}
        {questionsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка тестов...</p>
            </div>
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Тесты не найдены
            </h3>
            <p className="text-gray-600 mb-6">
              Загрузите вопросы через раздел "Управление вопросами"
            </p>
            <button
              onClick={() => navigate("/admin/questions")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Перейти к вопросам
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group border border-gray-200"
              >
                {/* Заголовок теста */}
                <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                        <span className="text-2xl">{test.icon}</span>
                        {test.name}
                      </h3>
                      <p className="text-sm opacity-90">{test.description}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        test.category === "html"
                          ? "bg-blue-400"
                          : test.category === "javascript"
                          ? "bg-yellow-400"
                          : test.category === "react"
                          ? "bg-cyan-400"
                          : test.category === "typescript"
                          ? "bg-purple-400"
                          : test.category === "python"
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-pink-400 to-orange-400"
                      }`}
                    >
                      {test.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {test.questionsCount} вопросов
                    </div>
                    <div className="text-sm">
                      {test.difficulty === "mixed"
                        ? "Разная сложность"
                        : test.difficulty}
                    </div>
                  </div>
                </div>

                {/* Кнопка действия */}
                <div className="p-6 pt-4">
                  <button
                    onClick={() => handleSelectTest(test)}
                    disabled={test.questionsCount === 0}
                    className={`w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center group cursor-pointer ${
                      test.questionsCount === 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <span>Начать тест</span>
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </button>

                  {test.questionsCount === 0 && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      Недостаточно вопросов для этого теста
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Модальное окно настроек теста */}
        {showSettingsModal && selectedTest && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-[#0000009c] bg-opacity-50 z-40"
              onClick={handleCloseModal}
            ></div>

            {/* Модальное окно */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-fade-in transition-all duration-300 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                    Настройки теста
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Закрыть"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-gray-700 font-medium">
                    {selectedTest.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTest.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    📊 Вопросов: {selectedTest.questionsCount}
                  </p>
                </div>

                {/* Информация о группе */}
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Информация о группе
                </h3>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название группы
                    </label>
                    <input
                      placeholder="Например: A-10"
                      type="text"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Преподаватель
                    </label>
                    <input
                      placeholder="ФИО преподавателя"
                      type="text"
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                </div>

                {/* Количество учеников */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Количество учеников
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxStudents}
                      onChange={(e) => {
                        const value = Math.min(
                          100,
                          Math.max(1, parseInt(e.target.value))
                        );
                        setMaxStudents(value);
                      }}
                      placeholder="Максимум 100 учеников"
                      max="100"
                      className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                </div>

                {/* Длительность теста */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Длительность теста (минуты)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => {
                        const value = Math.min(
                          180,
                          Math.max(1, parseInt(e.target.value))
                        );
                        setDuration(value);
                      }}
                      placeholder="От 1 до 180 минут"
                      max="180"
                      className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                    />
                  </div>
                </div>

                {/* Предпросмотр настроек */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Предпросмотр настроек:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Тест:</span>
                      <p className="font-medium truncate">
                        {selectedTest.name}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Вопросов:</span>
                      <p className="font-medium">
                        {selectedTest.questionsCount}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Группа:</span>
                      <p className="font-medium">{group || "Не указано"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Преподаватель:</span>
                      <p className="font-medium">{teacher || "Не указано"}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Учеников:</span>
                      <p className="font-medium">{maxStudents}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Время:</span>
                      <p className="font-medium">{duration} мин</p>
                    </div>
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Отмена
                  </button>
                  <button
                    onClick={handleStartTest}
                    disabled={
                      previewLoading || !group.trim() || !teacher.trim()
                    }
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 shadow-md flex items-center justify-center
                      ${
                        previewLoading || !group.trim() || !teacher.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg"
                      }
                    `}
                  >
                    {previewLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Создание теста...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Начать тест
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-500 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
