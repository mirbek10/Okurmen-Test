"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAdminGetTestStore } from "@/app/stores/admin/adminGetTest";
import {
  Users,
  CheckCircle2,
  BarChart3,
  GraduationCap,
  User as UserIcon,
  X,
  Check,
  CircleX,
  Activity,
  Clock3,
  ArrowRight,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link, useNavigate } from "react-router-dom";
import { axiosAdmin } from "@/shared/lib/api/axiosAdmin";

function Result() {
  const { tests, loading, error, getTests, deleteTest } =
    useAdminGetTestStore();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [activeTests, setActiveTests] = useState([]);
  const [activeTestsOpen, setActiveTestsOpen] = useState(false);
  const [activeTestsLoading, setActiveTestsLoading] = useState(false);
  const [activeTestsError, setActiveTestsError] = useState("");
  const [activeTestsNotice, setActiveTestsNotice] = useState("");
  const [deletingActiveTestId, setDeletingActiveTestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTests();
  }, [getTests]);

  const stats = useMemo(() => {
    if (!tests || !Array.isArray(tests) || tests.length === 0) return null;

    let totalStudents = 0;
    let finishedStudents = 0;
    let allScores = [];

    tests.forEach((test) => {
      test.students?.forEach((student) => {
        totalStudents++;
        if (student.status === "finished" || student.status === "force-finished") {
          finishedStudents++;
          const correct =  
            student.answers?.filter((a) => a.isCorrect).length || 0;
          const total = student.answers?.length || 0;
          const score = total > 0 ? (correct / total) * 100 : 0;
          allScores.push(score);
        }
      });
    });

    const averageScore =
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0;

    return {
      totalTests: tests.length,
      totalStudents,
      finishedStudents,
      averageScore: averageScore.toFixed(2),
    };
  }, [tests]);

  const handleDeleteTest = (code) => {
    deleteTest(code);
    setSelectedTest(null);
    getTests();
  };

  const handleViewTestDetails = (test) => {
    setSelectedTest(test);
    setSelectedStudent(null);
  };

  const openActiveTests = async () => {
    setActiveTestsOpen(true);
    setActiveTestsLoading(true);
    setActiveTestsError("");
    setActiveTestsNotice("");
    try {
      const response = await axiosAdmin.get("/admin/getTest");
      const currentTests = Array.isArray(response.data) ? response.data : [];
      setActiveTests(currentTests.filter((test) => !test.finishedAt));
    } catch (requestError) {
      setActiveTestsError(
        requestError?.response?.data?.message ||
          "Не удалось загрузить текущие мониторинги. Попробуйте обновить список."
      );
    } finally {
      setActiveTestsLoading(false);
    }
  };

  const handleDeleteActiveTest = async (test) => {
    const confirmed = window.confirm(
      `Полностью удалить мониторинг «${test.category || test.code}»? Участники будут отключены, а тест не будет сохранён в результатах или базе данных.`
    );
    if (!confirmed) return;

    setDeletingActiveTestId(test.id);
    setActiveTestsError("");
    setActiveTestsNotice("");
    try {
      await axiosAdmin.delete(`/admin/monitorings/${test.id}`);
      setActiveTests((currentTests) =>
        currentTests.filter((currentTest) => currentTest.id !== test.id)
      );
      setActiveTestsNotice("Мониторинг удалён без сохранения в результатах.");
    } catch (requestError) {
      setActiveTestsError(
        requestError?.response?.data?.message || "Не удалось удалить мониторинг. Попробуйте ещё раз."
      );
    } finally {
      setDeletingActiveTestId(null);
    }
  };

  if (loading && !tests) {
    return (
      <div className="flex h-screen items-center justify-center font-medium">
        Загрузка данных...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Шапка */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Аналитика тестов
          </h1>
          <p className="text-slate-500 mt-1">
            Нажмите на студента, чтобы посмотреть детали
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openActiveTests}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Activity size={18} />
            Активные мониторинги
          </button>
          <button
            onClick={() => getTests()}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold"
          >
            Обновить данные
          </button>
        </div>
      </div>

      {/* Карточки статистики */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            icon={<BarChart3 className="text-blue-600" />}
            label="Всего тестов"
            value={stats.totalTests}
            color="bg-blue-50"
          />
          <StatCard
            icon={<Users className="text-purple-600" />}
            label="Студентов"
            value={stats.totalStudents}
            color="bg-purple-50"
          />
          <StatCard
            icon={<GraduationCap className="text-green-600" />}
            label="Средний балл"
            value={`${stats.averageScore}%`}
            color="bg-green-50"
          />
          <StatCard
            icon={<CheckCircle2 className="text-orange-600" />}
            label="Завершили"
            value={stats.finishedStudents}
            color="bg-orange-50"
          />
        </div>
      )}

      {/* Список тестов */}
      <div className="space-y-8">
        {Array.isArray(tests) &&
          tests?.map((test) => {
            const groupScores =
              test.students?.map((student) => {
                const correctCount =
                  student.answers?.filter((a) => a.isCorrect).length || 0;
                const totalCount = student.answers?.length || 0;
                return totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
              }) || [];

            const averageScoreValue = groupScores.length > 0
              ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
              : 0;
            const averageScore = averageScoreValue.toFixed(1);
            return (
              <div
                key={test.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 relative"
              >
                <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm font-bold text-indigo-600 border border-slate-100 uppercase">
                      {test.category}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">
                        Группа: {test.group}
                      </h2>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <UserIcon size={14} /> Преподаватель: {test.teacher}
                      </p>
                    </div>
                  </div>
                  <div className="text-center flex flex-col border-x border-slate-200 px-6">
                    <p className="text-slate-400 uppercase text-[10px] font-bold">
                      Ср. балл группы
                    </p>
                    <span
                      title={`${averageScoreValue.toFixed(6)}%`}
                      className="font-bold text-indigo-600 text-lg cursor-help"
                    >
                      {averageScore}%
                    </span>
                  </div>
                  <div className="text-center flex flex-col">
                    <p className="text-slate-400 uppercase text-[10px] font-bold">
                      Статус
                    </p>
                    <span
                      className={`font-bold ${
                        test.finishedAt ? "text-green-500" : "text-yellow-500"
                      }`}
                    >
                      {test.finishedAt ? "Завершен" : "В процессе"}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTest(
                        selectedTest?.code === test.code ? null : test
                      );
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <HiOutlineDotsVertical />
                  </button>
                </div>

                {/* Окно просмотра теста */}
                {selectedTest && selectedTest.code === test.code && (
                  <>
                    <div className="absolute top-[60px] right-4 bg-white rounded-lg shadow-lg border border-slate-200 z-50 h-full w-64 overflow-y-scroll scrollbar-none">
                      <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-700">
                          Информация о тесте
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {/* <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">
                      Дисциплина
                    </p>
                    <p className="font-medium">
                      {test.subject || "Не указано"}
                    </p>
                  </div> */}
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">
                            Дата создания
                          </p>
                          <p className="font-medium">
                            {new Date(test.startedAt).toLocaleString("ru-RU")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">
                            Дата завершения
                          </p>
                          <p className="font-medium">
                            {test.finishedAt
                              ? new Date(test.finishedAt).toLocaleDateString()
                              : "Не завершен"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-bold">
                            Студентов прошло
                          </p>
                          <p className="font-medium">
                            {test.students?.filter(
                              (s) => s.status === "finished"
                            ).length || 0}{" "}
                            / {test.students?.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 border-t border-slate-100 flex gap-2">
                        <button className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded-lg text-sm font-medium transition-colors">
                          <Link to={`/admin/test-monitor/${test.id}`}>
                            Подробнее
                          </Link>
                        </button>
                        {/* <button
                    onClick={() => setSelectedTest(null)}
                    className="flex-1 bg-slate-50 text-slate-600 hover:bg-slate-100 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Закрыть
                  </button> */}
                        <button
                          onClick={() => handleDeleteTest(test.code)}
                          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <div
                      onClick={() => setSelectedTest(null)}
                      className="fixed inset-0 z-40"
                    ></div>
                  </>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white text-slate-400 text-xs uppercase font-bold border-b">
                        <th className="px-6 py-4">Студент</th>
                        <th className="px-6 py-4">Прогресс</th>
                        <th className="px-6 py-4">Балл</th>
                        <th className="px-6 py-4">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {test.students?.map((student) => {
                        const correctCount =
                          student.answers?.filter((a) => a.isCorrect).length ||
                          0;
                        const totalCount = student.answers?.length || 0;
                        const score =
                          totalCount > 0
                            ? ((correctCount / totalCount) * 100).toFixed(0)
                            : 0;

                        return (
                          <tr
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className="hover:bg-indigo-50/50 cursor-pointer transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-700 group-hover:text-indigo-600">
                                {student.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ID: {student.id}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-500 h-full"
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-700">
                              {score}%
                            </td>
                            <td className="px-6 py-4 text-xs font-medium uppercase text-slate-500">
                              {student.status === "finished"
                                ? "✅ Готов"
                                : "⏳ В процессе"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {activeTestsOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            aria-label="Закрыть список мониторингов"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setActiveTestsOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-monitorings-title"
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-7">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  Сейчас доступны
                </div>
                <h2 id="active-monitorings-title" className="text-2xl font-extrabold text-slate-900">
                  Активные мониторинги
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Выберите тест, чтобы открыть его мониторинг.
                </p>
              </div>
              <button
                onClick={() => setActiveTestsOpen(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Закрыть"
              >
                <X size={22} />
              </button>
            </header>

            <div className="space-y-3 overflow-y-auto p-5 sm:p-6">
              {activeTestsNotice && (
                <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  {activeTestsNotice}
                </div>
              )}
              {activeTestsLoading ? (
                <div className="flex items-center justify-center gap-3 py-14 text-slate-500">
                  <LoaderCircle className="animate-spin" size={20} />
                  Загружаем мониторинги...
                </div>
              ) : activeTestsError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
                  <p>{activeTestsError}</p>
                  <button onClick={openActiveTests} className="mt-3 font-bold underline underline-offset-2">
                    Обновить список
                  </button>
                </div>
              ) : activeTests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
                  <Activity className="mx-auto mb-3 text-slate-300" size={32} />
                  <p className="font-bold text-slate-700">Сейчас нет активных мониторингов</p>
                  <p className="mt-1 text-sm text-slate-500">Созданные и не завершённые тесты появятся здесь.</p>
                </div>
              ) : (
                activeTests.map((test) => {
                  const isStarted = Boolean(test.started);
                  const participantCount = test.students?.length || 0;
                  return (
                    <div
                      key={test.id}
                      className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md sm:gap-3 sm:p-4"
                    >
                      <button
                        onClick={() => {
                          setActiveTestsOpen(false);
                          navigate(`/admin/test-monitor/${test.id}`);
                        }}
                        className="group flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
                      >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isStarted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {isStarted ? <Activity size={22} /> : <Clock3 size={22} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900">{test.category || "Тест"}</span>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isStarted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                              {isStarted ? "Идёт тест" : "Ожидает запуска"}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-600">
                            Группа: {test.group || "Не указана"} · {test.teacher || "Преподаватель не указан"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Код {test.code || "—"} · Участников: {participantCount}{test.maxStudents ? ` / ${test.maxStudents}` : ""}
                          </p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-bold text-white transition group-hover:bg-indigo-700">
                          Открыть <ArrowRight size={16} />
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteActiveTest(test)}
                        disabled={deletingActiveTestId === test.id}
                        aria-label={`Удалить мониторинг ${test.code || test.id}`}
                        title="Удалить без сохранения"
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-50 sm:px-4"
                      >
                        {deletingActiveTestId === test.id ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                        <span className="hidden sm:inline">Удалить</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Фон */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          />

          {/* Контент */}
          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {selectedStudent.name}
                </h2>
                <p className="text-slate-500 text-sm">Детализация ответов</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {selectedStudent.answers && selectedStudent.answers.length > 0 ? (
                selectedStudent.answers.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          item.isCorrect
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.isCorrect ? (
                          <Check size={14} />
                        ) : (
                          <CircleX size={14} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          Вопрос {idx + 1}
                        </p>
                        <p className="text-slate-800 font-medium mb-3">
                          {item.question}
                        </p>

                        <div
                          className={`p-3 rounded-xl border ${
                            item.isCorrect
                              ? "bg-green-50 border-green-100"
                              : "bg-red-50 border-red-100"
                          }`}
                        >
                          <p className="text-xs text-slate-500 mb-1">
                            Ответ студента:
                          </p>
                          <p
                            className={`font-bold ${
                              item.isCorrect ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  Ответов пока нет
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-white flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`${color} p-4 rounded-xl`}>{icon}</div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default Result;


