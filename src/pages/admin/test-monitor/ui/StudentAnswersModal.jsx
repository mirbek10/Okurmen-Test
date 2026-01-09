"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import { axiosAdmin } from "@/shared/lib/api/axiosAdmin";

export const StudentAnswersModal = ({ 
  studentId, 
  testCode, 
  onClose,
  studentName 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    if (studentId && testCode) {
      fetchStudentAnswers();
    }
  }, [studentId, testCode]);

  const fetchStudentAnswers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Сначала получаем информацию о студенте
      const studentResponse = await axiosAdmin.get(
        `/admin/getStudent/${testCode}/${studentId}`
      );

      const studentData = studentResponse.data.student;
      setStudentInfo(studentData);

      // Если у студента есть ответы, отображаем их
      if (studentData.answers && Array.isArray(studentData.answers)) {
        setAnswers(studentData.answers);
      } else {
        setAnswers([]);
        setError("Ответы студента не найдены или еще не обработаны");
      }

    } catch (err) {
      console.error("Ошибка при загрузке ответов студента:", err);
      setError(err.response?.data?.message || "Не удалось загрузить ответы студента");
    } finally {
      setLoading(false);
    }
  };

  // Функция для определения стиля ответа
  const getAnswerStyle = (isCorrect) => {
    return isCorrect 
      ? "bg-green-50 border-green-200 text-green-700"
      : "bg-red-50 border-red-200 text-red-700";
  };

  // Подсчет статистики
  const stats = {
    total: answers.length,
    correct: answers.filter(a => a.isCorrect).length,
    incorrect: answers.filter(a => !a.isCorrect).length,
    percentage: answers.length > 0 
      ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100)
      : 0
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0000009c] bg-opacity-50">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок модалки */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Ответы студента
              </h2>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-600">
                  Студент: <span className="font-semibold">{studentName || studentInfo?.name || "Неизвестно"}</span>
                </p>
                <p className="text-gray-600">
                  ID: <span className="font-mono">{studentId}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Контент модалки */}
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Загрузка ответов студента...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchStudentAnswers}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Попробовать снова
              </button>
            </div>
          ) : answers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">Ответы студента не найдены</p>
              <p className="text-gray-400 text-sm mt-2">
                Возможно, студент не завершил тест или ответы еще не сохранены
              </p>
            </div>
          ) : (
            <>
              {/* Статистика */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Всего вопросов</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Правильных</p>
                  <p className="text-3xl font-bold text-green-600">{stats.correct}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Неправильных</p>
                  <p className="text-3xl font-bold text-red-600">{stats.incorrect}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Результат</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
                </div>
              </div>

              {/* Список ответов */}
              <div className="space-y-6">
                {answers.map((answer, index) => (
                  <div 
                    key={index}
                    className={`border rounded-xl p-5 transition-all hover:shadow-md ${getAnswerStyle(answer.isCorrect)}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${answer.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                          {answer.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm text-gray-500 mb-1 block">
                            Вопрос #{index + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                            {answer.question}
                          </h3>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        answer.isCorrect 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {answer.isCorrect ? 'Правильно' : 'Неправильно'}
                      </span>
                    </div>

                    <div className="ml-11">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Ответ студента:</p>
                        <p className={`text-base p-3 rounded-lg ${
                          answer.isCorrect 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {answer.answer}
                        </p>
                      </div>

                      {/* Дополнительная информация */}
                      {answer.questionId && (
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>ID вопроса: {answer.questionId}</span>
                          {answer.questionIndex && (
                            <span>№ в тесте: {answer.questionIndex}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Футер модалки */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};