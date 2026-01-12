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
} from "lucide-react";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { Link } from "react-router-dom";

function Result() {
  const { tests, loading, error, getTests, deleteTest } = useAdminGetTestStore();
  // Состояние для модалки
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    getTests();
  }, [getTests]);

  const stats = useMemo(() => {
    if (!tests || tests.length === 0) return null;
    let totalStudents = 0;
    let finishedStudents = 0;
    let allScores = [];

    tests.forEach((test) => {
      test.students?.forEach((student) => {
        totalStudents++;
        if (student.status === "finished") {
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
      averageScore: averageScore.toFixed(1),
    };
  }, [tests]);

  const handleDeleteTest = (testId) => {
    deleteTest(testId);
  };

  const handleViewTestDetails = (test) => {
    setSelectedTest(test);
    setSelectedStudent(null);
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
        <button
          onClick={() => getTests()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-sm font-semibold"
        >
          Обновить данные
        </button>
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
        {tests?.map((test) => (
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
                onClick={() =>{

                  setSelectedTest(selectedTest?.code === test.code ? null : test);
                }
                }
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
                      {test.students?.filter((s) => s.status === "finished")
                        .length || 0}{" "}
                      / {test.students?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-100 flex gap-2">
                  <button
                    className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
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
                  <button onClick={() => handleDeleteTest(test.id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors">
                     Удалить
                  </button>
                </div>
              </div>
              <div onClick={() => setSelectedTest(null)} className="fixed inset-0 z-40"></div>
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
                      student.answers?.filter((a) => a.isCorrect).length || 0;
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
        ))}
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
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
