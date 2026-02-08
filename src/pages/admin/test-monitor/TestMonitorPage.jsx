"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminPreviewStore } from "@/app/stores/admin/adminPreview";
import { useTestStatus } from "@/app/stores/user/getTestStatus";
import { useSetAnswere } from "@/app/stores/user/setAnswer";
import {
  Users,
  Timer,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Trash2,
  X,
  Play,
  RotateCcw,
  MonitorPlay,
  Clock,
  LayoutGrid,
} from "lucide-react";
import Swal from "sweetalert2";

export function TestMonitorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    test,
    loading,
    fetchTestById,
    monitorTest,
    deleteStudent,
    startTest,
    finishTest,
    updateTimer,
  } = useAdminPreviewStore();

  const { forcePostAnswere } = useSetAnswere();
  const { status, getStatus } = useTestStatus();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchTestById(id);
    }
  }, [id, fetchTestById]);

  useEffect(() => {
    let interval;
    if (test?.status === "started" || test?.status === "created") {
      monitorTest(id);
      interval = setInterval(() => {
        monitorTest(id);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [id, test?.status, monitorTest]);

  useEffect(() => {
    if (test && test.status === "started") {
      const endTime = new Date(test.startTime).getTime() + test.timeLimit * 60000;
      const now = Date.now();
      const diff = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(diff);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishTest(id);
            Swal.fire({
              icon: "info",
              title: "Время вышло",
              text: "Тестирование автоматически завершено",
              confirmButtonText: "Ок",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeLeft(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [test?.status, test?.startTime, test?.timeLimit, id, finishTest]);

  useEffect(() => {
    if (test?.status === "finished") {
      const activeStudents = test.students.filter(
        (s) => !s.endTime && (s.status === "started" || s.status === "active")
      );

      activeStudents.forEach((student) => {
        finishStudentTest(student);
      });
    }
  }, [test?.status]);

  const finishStudentTest = async (student) => {
    try {
      const payload = {
        testCode: test?.code,
        studentId: student.studentId,
        studentName: student.name,
        category: test?.category,
        answers: [],
        totalQuestions: test?.totalQuestions || 0,
        answeredQuestions: 0,
        testSessionId: `auto_finish_${Date.now()}`,
      };
      await forcePostAnswere(payload);
      console.log(`Forced finish for student ${student.name}`);
    } catch (e) {
      console.error(`Error finishing test for ${student.name}:`, e);
    }
  };

  const handleStart = async () => {
    try {
      await startTest(id);
      Swal.fire({
        icon: "success",
        title: "Тест запущен",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Ошибка запуска",
        text: "Не удалось начать тест",
      });
    }
  };

  const handleFinish = async () => {
    const result = await Swal.fire({
      title: "Завершить тест?",
      text: "Все активные сессии студентов будут закрыты принудительно",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Да, завершить",
      cancelButtonText: "Отмена",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      await finishTest(id);
      Swal.fire("Завершено!", "Тест был остановлен.", "success");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const result = await Swal.fire({
      title: "Удалить студента?",
      text: "Результаты будут потеряны безвозвратно",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Удалить",
      cancelButtonText: "Отмена",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      await deleteStudent(id, studentId);
      monitorTest(id);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-bold text-slate-400 tracking-wider">
          ЗАГРУЗКА ДАННЫХ...
        </p>
      </div>
    );
  }

  const waiting = test.students.filter((s) => s.status === "joined");
  const inProgress = test.students.filter(
    (s) => s.status === "started" || s.status === "active"
  );
  const finished = test.students.filter((s) => s.status === "finished");

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
              <MonitorPlay className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">
                {test.testName}
              </h1>
              <div className="flex items-center gap-3 mt-1 text-sm font-bold text-slate-400">
                <span className="px-3 py-1 bg-slate-100 rounded-lg">
                  КОД: <span className="text-indigo-600">{test.code}</span>
                </span>
                <span className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-lg">
                  <LayoutGrid className="w-3 h-3" />
                  {test.category}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Статус
              </p>
              <div
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2
                ${test.status === "started"
                    ? "bg-emerald-100 text-emerald-600 animate-pulse"
                    : test.status === "finished"
                      ? "bg-slate-200 text-slate-500"
                      : "bg-amber-100 text-amber-600"
                  }`}
              >
                {test.status === "started" && (
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                )}
                {test.status === "started"
                  ? "Идет экзамен"
                  : test.status === "finished"
                    ? "Завершен"
                    : "Ожидание"}
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                Таймер
              </p>
              <div
                className={`text-2xl font-black font-mono tabular-nums tracking-widest
                ${timeLeft < 60 && test.status === "started"
                    ? "text-rose-500 animate-pulse"
                    : "text-slate-700"
                  }`}
              >
                {test.status === "started" ? formatTime(timeLeft) : "--:--"}
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Всего
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {test.students.length}
                    <span className="text-slate-300 text-sm ml-1 font-medium">
                      / {test.maxStudents}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Сдали
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {finished.length}
                  </p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    В процессе
                  </p>
                  <p className="text-xl font-black text-slate-800">
                    {inProgress.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 min-h-[500px]">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Список студентов
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase font-black text-slate-400 tracking-wider">
                      <th className="py-4 pl-4">Студент</th>
                      <th className="py-4">Статус</th>
                      <th className="py-4">Прогресс</th>
                      <th className="py-4">Результат</th>
                      <th className="py-4 pr-4 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-600">
                    {test.students.map((student) => (
                      <tr
                        key={student._id}
                        className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-4 pl-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-black">
                              {student.name.charAt(0)}
                            </div>
                            <span>{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wide
                            ${student.status === "finished"
                                ? "bg-emerald-100 text-emerald-700"
                                : student.status === "started"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                          >
                            {student.status === "finished"
                              ? "Завершил"
                              : student.status === "started"
                                ? "В процессе"
                                : "Ожидает"}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${student.status === "finished"
                                ? "bg-emerald-500"
                                : "bg-indigo-500"
                                }`}
                              style={{
                                width: `${(student.score / test.totalQuestions) * 100
                                  }%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 font-mono text-slate-800">
                          {student.score !== undefined ? (
                            <span>
                              {student.score} / {test.totalQuestions}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Детали"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(student.studentId)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {test.students.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-20 text-center text-slate-300 font-bold"
                        >
                          Студенты пока не подключились
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-indigo-500" />
                Управление
              </h3>

              <div className="space-y-3">
                {test.status === "active" || test.status === "created" ? (
                  <button
                    onClick={handleStart}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg col-span-2 group transition-all active:scale-[0.98]"
                  >
                    <Play
                      fill="currentColor"
                      className="group-hover:scale-110 transition-transform"
                    />{" "}
                    Начать тест
                  </button>
                ) : null}

                {test.status === "started" && (
                  <button
                    onClick={handleFinish}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-200 group transition-all active:scale-[0.98]"
                  >
                    <AlertOctagon className="group-hover:scale-110 transition-transform" />{" "}
                    Завершить тест
                  </button>
                )}

                {test.status === "finished" && (
                  <button
                    onClick={() => navigate("/admin/archive")}
                    className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                  >
                    <RotateCcw size={18} /> Архив результатов
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedStudent(null)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-black">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 leading-none mb-1">
                    {selectedStudent.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    ID: {selectedStudent.studentId}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Результат
                  </p>
                  <p className="text-2xl font-black text-emerald-600">
                    {selectedStudent.score || 0}
                    <span className="text-sm text-slate-300 ml-1">
                      / {test.totalQuestions}
                    </span>
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Статус
                  </p>
                  <p
                    className={`text-sm font-black uppercase ${selectedStudent.status === "finished"
                      ? "text-emerald-600"
                      : "text-amber-600"
                      }`}
                  >
                    {selectedStudent.status === "finished"
                      ? "Завершен"
                      : "В процессе"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Закрыть окно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestMonitorPage;
