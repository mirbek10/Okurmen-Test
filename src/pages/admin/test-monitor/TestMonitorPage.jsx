"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTestStore } from "@/app/stores/admin/getTsetById";
import { useAdminStartStore } from "@/app/stores/admin/startTest";
import { useAdminFinishTestStore } from "@/app/stores/admin/adminFinishTest";
import { useAdminDeleteStudentStore } from "@/app/stores/admin/adminDeleteStudent";
import { StudentAnswersModal } from "./ui/StudentAnswersModal"; // Импортируем новый компонент
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAdminArchiveTestStore } from "@/app/stores/admin/adminArchiveTest";

const categoryNames = {
  html: "HTML/CSS",
  "js-basic": "JavaScript начальный уровень",
  "js-advanced": "JavaScript продвинутый уровень",
  react: "React",
};

export default function TestMonitorPage() {
  const { id } = useParams();
  const testId = id;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null); // Для модалки

  // Получаем данные из Zustand
  const { getTestById, loading, error, test } = useTestStore();
  const { archive, loading: archiveLoading } = useAdminArchiveTestStore();
  const {
    start,
    loading: startLoading,
    error: startError,
    res,
  } = useAdminStartStore();
  const {
    finish,
    loading: finishLoading,
    error: finishError,
  } = useAdminFinishTestStore();
  const { deleteStudent, loading: deleteLoading } =
    useAdminDeleteStudentStore();

  // Загружаем тест при монтировании
  useEffect(() => {
    getTestById(testId);
  }, [testId]);

  // Инициализация таймера при загрузке теста
  // 1. Инициализация начального времени (только когда тест еще не запущен)
  useEffect(() => {
    if (test && !test.started && !timerStarted) {
      setTimeRemaining(test.testDuration * 60);
    }
  }, [test?.testDuration, test?.started]);

  // 2. Следим за изменением статуса теста (started: true/false)
  useEffect(() => {
    if (test?.started) {
      setTimerStarted(true);
      // Если время еще не было установлено или сбросилось, подтягиваем его
      if (timeRemaining === 0) {
        setTimeRemaining(test.testDuration * 60);
      }
    } else {
      setTimerStarted(false);
    }
  }, [test?.started]);

  // 3. Логика самого счетчика
  useEffect(() => {
    let timer;

    if (timerStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleEndTest(); // Автоматическое завершение
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerStarted, timeRemaining]);

  useEffect(() => {
    let interval;

    // Авто-обновление списка учеников каждые 5 секунд, если тест еще не запущен
    if (test && !test.started) {
      interval = setInterval(() => {
        getTestById(testId);
      }, 15000);
    }

    return () => clearInterval(interval);
  }, [test?.started, testId]);

  // Начать тест для всех учеников
  const handleStartTest = async () => {
    if (!test || test.students.length === 0) {
      toast.error("Нет учеников в тесте");
      return;
    }
    const testId = test.id;
    await start({ id: testId });
    getTestById(testId);
  };

  // Завершить тест
  const handleEndTest = async (isButton) => {
    if (isButton) {
      const result = await Swal.fire({
        title: "Завершить тест?",
        text: "Вы уверены, что хотите закончить тест прямо сейчас?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Да, завершить",
        cancelButtonText: "Отмена",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return; // Пользователь нажал отмену
      }

      toast.success("Тест завершен");
    }

    setTimerStarted(false);
    setTimeRemaining(0);
    finish(test.id);

    setTimeout(() => {
      getTestById(testId);
    }, 1000);
  };

  const handleArchiveResults = async () => {
    const result = await Swal.fire({
      title: "Сохранить в базу результатов?",
      text: "Данные будут перенесены в облако и удалены из активного монитора.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Сохранить",
      confirmButtonColor: "#8b5cf6",
    });

    if (result.isConfirmed) {
      try {
        await archive({ id: test.id });
        toast.success("Данные успешно заархивированы!");
        // Можно сделать редирект: window.location.href = '/admin/results';
      } catch (err) {
        toast.error("Ошибка при сохранении");
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await getTestById(testId);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Удалить ученика

  const handleDisconnect = async (studentId) => {
    const result = await Swal.fire({
      title: "Удалить ученика?",
      text: "Это действие нельзя будет отменить.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Удалить",
      cancelButtonText: "Отмена",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await deleteStudent({
        testId: test.id,
        studentId,
      });

      await getTestById(test.id);
    }
  };

  // Просмотреть ответы ученика
  const handleViewAnswers = (student) => {
    setSelectedStudent({
      id: student.id,
      name: student.name,
      testCode: test.code,
    });
  };

  // Закрыть модалку
  const handleCloseModal = () => {
    setSelectedStudent(null);
  };

  // Форматирование времени
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const finishedStudent =
    test?.students.filter((s) => s.status === "finished") || [];
  const waitingStudent =
    test?.students.filter((s) => s.status === "waiting") || [];
  const activeStudent =
    test?.students.filter((s) => s.status === "active") || [];
  const forceFinished =
    test?.students.filter((s) => s.status === "force-finished") || [];

  if (loading && !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-md p-8">
          <p className="text-red-600 text-lg mb-4 font-semibold">
            Тест не найден
          </p>
          <p className="text-gray-500 text-sm mb-2">ID: {testId}</p>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-10">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {test.category}
                  </h1>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {test.group}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Преподаватель:</span>{" "}
                    {test.teacher}
                  </p>
                  <p className="text-sm text-gray-500">
                    Код теста:{" "}
                    <span className="font-mono font-bold text-lg text-blue-600">
                      {test.code}
                    </span>
                  </p>
                </div>
              </div>
              {timerStarted && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Осталось времени</p>
                  <p
                    className={`text-4xl font-bold font-mono ${
                      timeRemaining < 60
                        ? "text-red-600 animate-pulse"
                        : timeRemaining < 300
                        ? "text-orange-600"
                        : "text-blue-600"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </p>
                </div>
              )}
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Максимум учеников</p>
                <p className="text-2xl font-bold text-blue-600">
                  {test.maxStudents}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Подключено</p>
                <p className="text-2xl font-bold text-green-600">
                  {test.students.length}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Длительность</p>
                <p className="text-2xl font-bold text-purple-600">
                  {test.testDuration} мин
                </p>
              </div>
            </div>
            <div className="bg-white mt-6 p-6 rounded-xl shadow-sm mb-6 flex justify-between items-center border-l-8 border-indigo-500">
              <div>
                <h2 className="text-xl font-bold">Управление состоянием</h2>
                <p className="text-gray-500 text-sm">
                  Текущий статус:{" "}
                  {test.started ? "🟢 Активен" : "🔴 Остановлен"}
                </p>
              </div>

              <div className="flex gap-4">
                {/* Кнопка Стоп - видна пока тест идет */}
                {test.started && (
                  <button
                    onClick={handleEndTest}
                    disabled={finishLoading}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    {finishLoading ? "Завершение..." : "🛑 Остановить тест"}
                  </button>
                )}

                {/* Кнопка Архив - видна ТОЛЬКО после остановки */}
                {!test.started && (
                  <button
                    onClick={handleArchiveResults}
                    disabled={archiveLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
                  >
                    {archiveLoading ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    ) : (
                      "📦 Сохранить результаты в БД"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Кнопка запуска теста */}
          {!test.started && !timerStarted && test.students.length > 0 && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-1">
                    Готовы начать тест?
                  </h3>
                  <p className="text-green-100">
                    Подключено учеников: {test.students.length}
                  </p>
                </div>
                <button
                  onClick={handleStartTest}
                  disabled={startLoading}
                  className="px-8 py-4 bg-white text-green-600 rounded-lg font-bold text-lg hover:bg-green-50 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {startLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></span>
                      Запуск...
                    </span>
                  ) : (
                    "🚀 Начать тест"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Ошибка старта */}
          {startError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 font-semibold">
                Ошибка запуска теста:
              </p>
              <p className="text-red-500 text-sm">{startError}</p>
            </div>
          )}

          {/* Статус теста */}
          {(test.started || timerStarted) && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-4 h-4 bg-white rounded-full animate-pulse"></span>
                    <h3 className="text-xl font-bold">Тест в процессе</h3>
                  </div>
                  <p className="text-blue-100">
                    Активных учеников: {activeStudent.length}
                  </p>
                  <p className="text-blue-100 text-sm">
                    Завершили: {finishedStudent.length} | Всего:{" "}
                    {test.students.length}
                  </p>
                </div>
                <button
                  onClick={() => handleEndTest(true)}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                >
                  Завершить тест
                </button>
              </div>
            </div>
          )}

          {/* Список учеников */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Ученики ({test.students.length}/{test.maxStudents})
              </h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Обновление...
                  </>
                ) : (
                  "Обновить"
                )}
              </button>
            </div>

            {test.students.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-2">
                  Ожидание подключения учеников...
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Ученики должны ввести код теста:{" "}
                  <span className="font-mono font-bold text-blue-600">
                    {test.code}
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Ожидающие */}
                {waitingStudent.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Ожидают начала ({waitingStudent.length})
                    </h3>
                    {waitingStudent.map((student) => {
                      const date = new Date(student.id).toLocaleString("ru-RU");
                      return (
                        <div
                          key={student.id}
                          className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-2"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Подключился: {date}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                              Ожидает
                            </span>
                            <button
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all"
                              onClick={() => handleDisconnect(student.id)}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Проходят тест */}
                {activeStudent.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Проходят тест ({activeStudent.length})
                    </h3>
                    {activeStudent.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg mb-2"
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">В процессе...</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center gap-2">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          Тестируется
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Завершили */}
                {finishedStudent.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Завершили тест ({finishedStudent.length})
                    </h3>
                    {finishedStudent.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg mb-2 hover:bg-green-100 cursor-pointer transition-colors"
                        onClick={() => handleViewAnswers(student)}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.score !== undefined
                              ? `Результат: ${student.score}%`
                              : "Завершено"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                            ✓ Готово
                          </span>
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnswers(student);
                            }}
                          >
                            Просмотр
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Принудительно завершили */}
                {forceFinished.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">
                      Принудительно завершили тест ({forceFinished.length})
                    </h3>
                    {forceFinished.map((student) => (
                      <div
                        key={student.id}
                        className="flex justify-between items-center p-4 bg-red-50 border border-red-200 rounded-lg mb-2 hover:bg-red-100 cursor-pointer transition-colors"
                        onClick={() => handleViewAnswers(student)}
                      >
                        <div>
                          <p className="font-semibold text-gray-800">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {student.score !== undefined
                              ? `Результат: ${student.score}%`
                              : "Завершено"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDisconnect(student.id);
                            }}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-all"
                          >
                            Удалить
                          </button>
                          <button
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewAnswers(student);
                            }}
                          >
                            Просмотр
                          </button>
                          <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-medium">
                            ✓ Готово
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модалка с ответами студента */}
      {selectedStudent && (
        <StudentAnswersModal
          studentId={selectedStudent.id}
          testCode={selectedStudent.testCode}
          studentName={selectedStudent.name}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
